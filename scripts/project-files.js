const fs = require('node:fs');
const path = require('node:path');
const manifest = require('./feature-files.json');

function readGameSources(root) {
    const files = [];
    function walk(relative) {
        for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
            const name = relative + '/' + entry.name;
            if (entry.isDirectory()) walk(name);
            else if (entry.name.endsWith('.dry')) add(name, name);
        }
    }
    function add(source, name) {
        files.push({ name, contents: fs.readFileSync(path.join(root, source), 'utf8') });
    }

    walk('source');
    for (const [source, originalName] of Object.entries(manifest.scenes)) add(source, originalName);
    // Preserve the compiler's original directory walk order and scene names.
    files.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    return files;
}

function copyBrowserFiles(root) {
    for (const [source, destination] of Object.entries(manifest.browser)) {
        const target = path.join(root, 'out', 'html', destination);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(path.join(root, source), target);
    }
}

const sceneLocations = new Map(Object.entries(manifest.scenes).map(([source, name]) => [name, source]));

function sceneSourcePath(root, name) {
    return path.join(root, sceneLocations.get(name) ?? name);
}

module.exports = { readGameSources, copyBrowserFiles, sceneSourcePath };
