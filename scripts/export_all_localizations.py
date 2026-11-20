#!/usr/bin/env python3
"""Export every text-bearing tracked Anatolian Dawn file into a traceable localization ZIP.

Does not edit any existing game file. Designed for the temporary localization-export branch.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from io import StringIO
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Anatolian_Dawn_All_Localizations_2026-11-20.zip"
TEXT_SUFFIXES = {
    ".dry", ".js", ".cjs", ".ts", ".json", ".html", ".htm", ".css", ".svg",
    ".md", ".txt", ".bat", ".ps1", ".py", ".sh", ".yaml", ".yml", ".xml",
    ".csv", ".ini", ".cfg", ".conf", ".toml", ".log", ".jshintrc", ".gitignore",
}
LITERAL_QUOTE = chr(96)
CODE_SUFFIXES = {".js", ".cjs", ".ts", ".css", ".py", ".sh", ".bat", ".ps1", ".svg"}
PATHS_WITH_EXACT_SOURCE_MIRROR = "SOURCE_MIRROR/"
SKIP_STRINGS_FROM_EMPTY = True

def category(path: str) -> str:
    p = path.lower()
    if p.startswith("source/scenes/events/"):
        return "ACTIVE_EVENTS"
    if p.startswith("source/scenes/advisors/"):
        return "ACTIVE_ADVISORS"
    if p.startswith("source/"):
        return "ACTIVE_MECHANICS_AND_SCENES"
    if p.startswith("out/html/") and not re.search(r"/(?:jquery-|d3\.v)", p):
        return "ACTIVE_RUNTIME"
    if "backup" in p or "_patch_backups" in p:
        return "ARCHIVED_BACKUP"
    if p.startswith("scripts/"):
        return "DEVELOPMENT_ONLY"
    if p.startswith("docs/") or p.endswith((".md", ".txt")):
        return "AUTHORING_REFERENCE"
    return "SUPPORTING_SOURCE"

def is_text_source(path: str) -> bool:
    p = Path(path)
    return p.suffix.lower() in TEXT_SUFFIXES or p.name in {"LICENSE", ".gitignore", ".jshintrc"}

def line_numbered(text: str) -> str:
    # The prefix is a location marker. Source content on the right is never paraphrased.
    return "".join(f"L{i:06d} | {line}\n" for i, line in enumerate(text.splitlines(), start=1))

def section_header(path: str, category_name: str, kind: str) -> str:
    return (
        "\n" + "=" * 88 + "\n"
        + f"ORIGINAL REPOSITORY PATH: {path}\n"
        + f"CLASSIFICATION: {category_name}\n"
        + f"EXTRACTION: {kind}\n"
        + "=" * 88 + "\n"
    )

def json_string_values(value, pointer="$"):
    if isinstance(value, str):
        if value or not SKIP_STRINGS_FROM_EMPTY:
            yield pointer, value
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from json_string_values(v, f"{pointer}[{i}]")
    elif isinstance(value, dict):
        for key, v in value.items():
            yield from json_string_values(v, f"{pointer}[{json.dumps(key, ensure_ascii=False)}]")

def quoted_tokens(source: str):
    """Conservatively enumerate raw JS/CSS string/template literals with original line numbers.

    This is intentionally an over-inclusive lexical pass rather than a claim of static
    execution. Anything missed by unusual syntax is still in SOURCE_MIRROR.
    """
    i, line, length = 0, 1, len(source)
    while i < length:
        c = source[i]
        nxt = source[i + 1] if i + 1 < length else ""
        if c == "\n":
            line += 1
            i += 1
            continue
        if c == "/" and nxt == "/":
            i += 2
            while i < length and source[i] not in "\r\n":
                i += 1
            continue
        if c == "/" and nxt == "*":
            i += 2
            while i < length:
                if source[i] == "\n":
                    line += 1
                if source[i] == "*" and i + 1 < length and source[i + 1] == "/":
                    i += 2
                    break
                i += 1
            continue
        if c in ("'", '"', LITERAL_QUOTE):
            start = i
            start_line = line
            quote = c
            i += 1
            escape = False
            while i < length:
                cur = source[i]
                i += 1
                if cur == "\n":
                    line += 1
                if escape:
                    escape = False
                elif cur == "\\":
                    escape = True
                elif cur == quote:
                    break
            yield start_line, source[start:i]
            continue
        i += 1

class VisibleHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.entries = []

    def handle_data(self, data):
        if data.strip():
            self.entries.append((self.getpos()[0], "VISIBLE_TEXT", data))

    def handle_starttag(self, tag, attrs):
        for key, val in attrs:
            if val is not None and key in {
                "title", "alt", "placeholder", "aria-label", "aria-description",
                "data-tooltip", "data-title", "data-label",
            }:
                self.entries.append((self.getpos()[0], f"ATTRIBUTE {tag}[{key}]", val))

def runtime_section(path: str) -> str:
    if re.search(r"tooltip|government_tooltip", path, re.I):
        return "06_TOOLTIPS_AND_GOVERNMENTS.txt"
    if re.search(
        r"card|coalition|cyprus|econom|election|province|municipal|national|senate|"
        r"rubicon|party|social|peoples|kurdish|rule|macro|demograph|campaign",
        path, re.I,
    ):
        return "07_RUNTIME_MECHANICS_EVENTS_AND_CARDS.txt"
    return "08_RUNTIME_UI_HTML_CSS_AND_OTHER.txt"

def use_group(groups, name: str):
    if name not in groups:
        groups[name] = StringIO()
    return groups[name]

def write_loc(groups, file_name: str, text: str):
    use_group(groups, file_name).write(text)

def git_tracked_files():
    staged = subprocess.check_output(["git", "ls-files", "--stage", "-z"], cwd=ROOT)
    files = []
    sha_map = {}
    for rec in staged.split(b"\0"):
        if not rec:
            continue
        meta, relpath = rec.split(b"\t", 1)
        path = relpath.decode("utf-8", errors="surrogateescape")
        sha_map[path] = meta.split()[1].decode("ascii")
        files.append(path)
    return sorted(set(files)), sha_map

def from_xlsx(path: Path):
    """Inspect Office OpenXML strings in tracked .xlsx files as an extra source audit."""
    out = []
    try:
        with zipfile.ZipFile(path, "r") as inp:
            for name in inp.namelist():
                if name.startswith("xl/") and name.endswith(".xml") and (
                    "sharedStrings" in name or "worksheets/" in name or "workbook.xml" in name
                ):
                    xml = inp.read(name)
                    try:
                        root = ET.fromstring(xml)
                    except ET.ParseError:
                        continue
                    i = 0
                    for node in root.iter():
                        if node.tag.rsplit("}", 1)[-1] == "t" and node.text:
                            out.append((name, i, node.text))
                            i += 1
    except (OSError, zipfile.BadZipFile) as e:
        return [], str(e)
    return out, None

def main():
    tracked, blob_shas = git_tracked_files()
    snapshot = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
    groups = {}
    manifest = [
        "ORIGINAL_REPOSITORY_PATH\tCLASS\tUTF8_OR_BINARY_BYTES\tSOURCE_LINES\t"
        "EXTRACTED_ENTRIES\tGIT_BLOB_SHA\tSHA256\tEXACT_MIRROR_PATH"
    ]
    binary_manifest = ["ORIGINAL_PATH\tBYTES\tGIT_BLOB_SHA\tREASON"]
    warnings = []
    counts = Counter()
    mirrored_count = 0
    js_lit_count = 0
    json_value_count = 0
    dry_count = 0
    xlsx_text_count = 0
    total_files = 0

    with zipfile.ZipFile(OUTPUT, mode="w", compression=zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as archive:
        for relative in tracked:
            full = ROOT / relative
            if not full.is_file():
                warnings.append(f"Missing tracked file during export: {relative}")
                continue
            raw = full.read_bytes()
            total_files += 1
            size = len(raw)
            blob_sha = blob_shas.get(relative, "")
            sha256 = hashlib.sha256(raw).hexdigest()

            if relative.lower().endswith(".xlsx"):
                values, error = from_xlsx(full)
                if error:
                    warnings.append(f"Could not inspect XLSX {relative}: {error}")
                if values:
                    target = "12_SPREADSHEET_TEXT_IF_ANY.txt"
                    write_loc(groups, target, section_header(relative, "STRUCTURED_WORKBOOK", "xlsx XML textual cells"))
                    for part, i, val in values:
                        write_loc(groups, target, f"\nXLSX_MEMBER: {part}\nTEXT_NODE_INDEX: {i}\nTEXT: {json.dumps(val, ensure_ascii=False)}\n")
                    xlsx_text_count += len(values)
                binary_manifest.append(f"{relative}\t{size}\t{blob_sha}\tOffice workbook (extracts, if any, in 12_SPREADSHEET_TEXT_IF_ANY.txt)")
                continue

            if not is_text_source(relative):
                binary_manifest.append(f"{relative}\t{size}\t{blob_sha}\tNon-text asset (image/audio/other)")
                continue

            try:
                source = raw.decode("utf-8-sig")
            except UnicodeDecodeError as e:
                source = raw.decode("utf-8-sig", errors="replace")
                warnings.append(f"Invalid UTF-8 bytes represented with replacement characters: {relative}: {e}")

            cat = category(relative)
            counts[cat] += 1
            source_lines = len(source.splitlines())
            mirror_path = PATHS_WITH_EXACT_SOURCE_MIRROR + relative + ".txt"
            header = (
                "ANATOLIAN DAWN — SOURCE TEXT MIRROR\n"
                f"ORIGINAL REPOSITORY PATH: {relative}\n"
                f"ORIGINAL GIT BLOB SHA: {blob_sha}\n"
                f"ORIGINAL SOURCE SHA256: {sha256}\n"
                f"SOURCE SNAPSHOT COMMIT: {snapshot}\n"
                f"CLASSIFICATION: {cat}\n"
                "Each L###### prefix is the corresponding ORIGINAL source line number.\n"
                "The original characters on each line are retained without rewriting.\n"
                + "-" * 88 + "\n"
            )
            archive.writestr(mirror_path, header + line_numbered(source))
            mirrored_count += 1
            extracted = 0

            if relative.endswith(".dry"):
                dry_count += 1
                if cat == "ACTIVE_EVENTS":
                    target = "01_EVENTS_AND_HISTORICAL_NARRATIVES.txt"
                elif cat == "ACTIVE_ADVISORS":
                    target = "02_ADVISOR_DIALOGUES.txt"
                else:
                    target = "03_ACTIONS_CARDS_MECHANICS_QDISPLAYS.txt"
                write_loc(groups, target, section_header(relative, cat, "Entire .dry file, original lines"))
                write_loc(groups, target, line_numbered(source))
                extracted = source_lines

            elif relative.endswith(".json"):
                try:
                    json_data = json.loads(source)
                    values = list(json_string_values(json_data))
                    if relative == "out/html/game.json":
                        target = "04_COMPILED_GAME_SCENES_QUALITIES_UI.txt"
                    elif cat == "ACTIVE_RUNTIME":
                        target = "05_RUNTIME_JSON_DATA_STRINGS.txt"
                    else:
                        target = "09_BACKUPS_DEVELOPMENT_AND_REFERENCE_STRINGS.txt"
                    write_loc(groups, target, section_header(relative, cat, "Every JSON string value; exact JSON path"))
                    for pointer, value in values:
                        write_loc(groups, target, f"\nJSON_PATH: {pointer}\nTEXT: {json.dumps(value, ensure_ascii=False)}\n")
                    extracted = len(values)
                    json_value_count += extracted
                except (ValueError, RecursionError) as e:
                    warnings.append(f"JSON parsing failure; complete mirror is still included: {relative}: {e}")

            elif full.suffix.lower() in CODE_SUFFIXES or relative.endswith((".yaml", ".yml", ".htm", ".html")):
                if relative.startswith("out/html/"):
                    target = runtime_section(relative)
                else:
                    target = "09_BACKUPS_DEVELOPMENT_AND_REFERENCE_STRINGS.txt"
                write_loc(groups, target, section_header(relative, cat, "All quoted/template literals, original line"))
                for line, literal in quoted_tokens(source):
                    write_loc(
                        groups, target,
                        f"\nORIGINAL_LOCATION: {relative}:L{line}\n"
                        f"LITERAL_EXACT_SOURCE_FORM: {literal}\n",
                    )
                    extracted += 1
                    js_lit_count += 1

                if full.suffix.lower() in {".html", ".htm"}:
                    parser = VisibleHTML()
                    try:
                        parser.feed(source)
                    except Exception as e:
                        warnings.append(f"HTML parser warning for {relative}: {e}")
                    for line, etype, val in parser.entries:
                        write_loc(
                            groups, target,
                            f"\nORIGINAL_LOCATION: {relative}:L{line}\n"
                            f"HTML_{etype}: {json.dumps(val, ensure_ascii=False)}\n",
                        )
                        extracted += 1

            elif full.suffix.lower() in {".md", ".txt"} and (
                relative.startswith("docs/") or relative.startswith("CYPRUS")
                or relative.startswith("data/")
            ):
                target = "10_AUTHORING_NOTES_AND_NON_RUNTIME_REFERENCES.txt"
                write_loc(groups, target, section_header(relative, cat, "Complete authoring text, original lines"))
                write_loc(groups, target, line_numbered(source))
                extracted = source_lines

            manifest.append(
                f"{relative}\t{cat}\t{size}\t{source_lines}\t{extracted}\t"
                f"{blob_sha}\t{sha256}\t{mirror_path}"
            )

        for filename in sorted(groups):
            archive.writestr("LOCALIZATIONS/" + filename, groups[filename].getvalue())

        manifest_text = "\n".join(manifest) + "\n"
        binary_text = "\n".join(binary_manifest) + "\n"
        audit = {
            "repository": "titanofwall-spec/social_democracy_Anatolian_Dawn",
            "source_commit": snapshot,
            "export_date_utc": datetime.now(timezone.utc).isoformat(),
            "tracked_file_count": len(tracked),
            "processed_file_count": total_files,
            "text_sources_mirrored": mirrored_count,
            "dry_source_files": dry_count,
            "JSON_string_values": json_value_count,
            "JS_CSS_HTML_etc_quoted_literals": js_lit_count,
            "XLSX_text_values": xlsx_text_count,
            "binary_or_non_text_assets": len(binary_manifest) - 1,
            "files_by_category": dict(counts),
            "localization_text_files": sorted(groups),
            "warnings": warnings,
        }
        archive.writestr("00_MANIFEST.tsv", manifest_text)
        archive.writestr("00_NON_TEXT_ASSETS.tsv", binary_text)
        archive.writestr("00_AUDIT.json", json.dumps(audit, ensure_ascii=False, indent=2) + "\n")

        readme = f"""ANATOLIAN DAWN — COMPLETE LOCALIZATION SOURCE EXPORT
===================================================

GAME REPOSITORY
https://github.com/titanofwall-spec/social_democracy_Anatolian_Dawn

EXACT SOURCE COMMIT
{snapshot}

READ THIS FIRST
This ZIP inventories EVERY Git-tracked text-bearing source file in the checkout.
It is designed to make omissions auditable, not merely to list the game's
dedicated localization keys.

LOCALIZATIONS/
    01: Every original event scene and historical narrative (.dry).
    02: Advisor dialogue and advisor scenes.
    03: Card/action/mechanics/coalition scene material and qdisplays.
    04: All strings from the compiled out/html/game.json, with JSON key paths.
    05: Other active runtime JSON data.
    06: Tooltips and government display strings from active JavaScript.
    07: Mechanics, elections, Cyprus, coalitions, action cards and systems UI.
    08: Remaining active runtime UI strings, HTML visible text and attributes.
    09: Non-current backups, test scripts, and supporting source strings.
    10: Reference/authoring notes, clearly marked as not necessarily deployed.
    12: Textual values from any tracked Excel workbook, if found.

SOURCE_MIRROR/
    Separate UTF-8 TXT mirror of EVERY tracked text/code file, including
    unusual/dynamic text a static extractor could overlook. Each one names
    its exact repository-relative path, commit, Git blob SHA, SHA256, class,
    and ORIGINAL 1-based line numbers. The mirror is the completeness audit.

00_MANIFEST.tsv
    Full index of source paths, category, byte length, original line count,
    extraction count, Git SHA, SHA256, and corresponding mirror document.
00_NON_TEXT_ASSETS.tsv
    All omitted media/binary files and their exact source paths.
00_AUDIT.json
    Full file counts and any parsing/encoding warnings.

EXACT IN-GAME LOCATIONS
Every location is repository-relative: 'out/html/foo.js:L52' means line 52
of the deployed file; 'source/scenes/events/foo.scene.dry:L22' means line 22
of the source file. JSON_PATH records identify the exact nested JSON key
or array index, and the source mirror gives its original file lines too.

CURRENT VS OLD
ACTIVE_* paths under source/ and out/html/ are current sources/runtime.
ARCHIVED_BACKUP and DEVELOPMENT_ONLY entries are labeled separately so
historical copies cannot be confused with the deployed text.

TEMPLATES AND GENERATED TEXT
Conditional phrases and JS templates are exported in source form, including
their branches and interpolations. Rendering every possible runtime variable
combination is not feasible without executing all game states. Source code
mirrors preserve the logic and source fragments for all such combinations.

SCOPE OF THE WORD 'EVERY'
The source and exact strings from every tracked readable text/code file are
included; localizations represented ONLY as pixels in images, audible speech
in music, or untracked/private files are not interpretable as code strings.
Those media files are listed, not silently omitted. Source files are never
modified during this export.

COUNTS
Tracked files: {len(tracked)}
Text files mirrored: {mirrored_count}
Original .dry files: {dry_count}
JSON string values: {json_value_count}
JS/HTML/CSS/etc quoted literal tokens: {js_lit_count}
XLSX string values: {xlsx_text_count}
Warnings: {len(warnings)}

If a parser misses unusual markup, find the original exact contents in
SOURCE_MIRROR/ and locate its exact path using 00_MANIFEST.tsv.
"""
        archive.writestr("00_READ_ME_FIRST.txt", readme)

    print(json.dumps({
        "zip": str(OUTPUT),
        "size_bytes": OUTPUT.stat().st_size,
        "tracked_files": len(tracked),
        "mirrored_files": mirrored_count,
        "dry_files": dry_count,
        "json_values": json_value_count,
        "quoted_literals": js_lit_count,
        "warnings": warnings[:20],
    }, indent=2))
    if warnings:
        print("Warnings were recorded in 00_AUDIT.json", file=sys.stderr)


if __name__ == "__main__":
    main()
