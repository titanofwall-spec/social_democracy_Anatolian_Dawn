@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Anatolian Dawn - Repair Windows Tests and Redeploy

echo ==========================================================
echo Anatolian Dawn - Windows validation repair and redeploy

echo ==========================================================
echo.
echo Fix: government cards use 3 months in Rubicon mode,
echo      6 months in normal mode. Tests cover both modes.
echo Fixes Windows CRLF-sensitive Cyprus regression test without changing event text.
echo Keeps pending Rubicon cooldown fixes, then builds, tests and pushes on success.
echo.

rem Find the local project. You can also drag the project folder onto this BAT.
set "REPO="
if not "%~1"=="" if exist "%~1\.git" set "REPO=%~1"
if not defined REPO if exist "%~dp0.git" set "REPO=%~dp0"
if not defined REPO if exist "%~dp0social_democracy_Anatolian_Dawn\.git" set "REPO=%~dp0social_democracy_Anatolian_Dawn"
if not defined REPO if exist "%USERPROFILE%\Downloads\social_democracy_Anatolian_Dawn\.git" set "REPO=%USERPROFILE%\Downloads\social_democracy_Anatolian_Dawn"
if not defined REPO (
  echo Could not find the local repository automatically.
  set /p "REPO=Enter its full Windows folder path: "
)
if not exist "%REPO%\.git" (
  echo [ERROR] This folder does not contain a .git repository.
  goto :failed
)

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git is not installed or not on PATH.
  goto :failed
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not on PATH.
  goto :failed
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not installed or not on PATH.
  goto :failed
)
where powershell >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows PowerShell is not available.
  goto :failed
)

cd /d "%REPO%"
if errorlevel 1 goto :failed
if not exist "scripts\test-government-card-cadence.js" (
  echo [ERROR] This does not appear to be the expected Anatolian Dawn checkout.
  goto :failed
)

for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "ORIGIN=%%R"
if not defined ORIGIN (
  echo [ERROR] Git remote 'origin' is not configured.
  goto :failed
)
echo(%ORIGIN% | findstr /i /c:"titanofwall-spec/social_democracy_Anatolian_Dawn" >nul
if errorlevel 1 (
  echo [ERROR] Origin does not point to the intended Anatolian Dawn repository.
  echo         %ORIGIN%
  goto :failed
)

for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if /i not "%BRANCH%"=="main" (
  echo [ERROR] You must run this on the 'main' branch. Current: %BRANCH%
  goto :failed
)

rem First repair script left intentional unstaged Rubicon edits in place.
rem The embedded patch will check that no unrelated tracked file is dirty.
git diff --cached --quiet
if errorlevel 1 (
  echo [ERROR] There are already staged changes. Please unstage or review them first.
  goto :failed
)

echo [1/7] Checking the local checkout against GitHub...
git fetch origin main
if errorlevel 1 goto :failed
for /f "delims=" %%H in ('git rev-parse HEAD') do set "LOCAL_HEAD=%%H"
for /f "delims=" %%H in ('git rev-parse origin/main') do set "REMOTE_HEAD=%%H"
if /i not "%LOCAL_HEAD%"=="%REMOTE_HEAD%" (
  echo [ERROR] Local main differs from origin/main.
  echo         Do not pull over pending changes: back up or resolve divergence first.
  goto :failed
)

echo [2/7] Preserving Rubicon patch and fixing the Windows newline-sensitive test...
set "BAT_SELF=%~f0"
set "PATCH_TMP=%TEMP%\anatolian_rubicon_fix_%RANDOM%_%RANDOM%.js"
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$s=[System.IO.File]::ReadAllText($env:BAT_SELF); $m='::RUBICON_JS_PAYLOAD'; $i=$s.LastIndexOf($m); if($i -lt 0) {exit 2}; $code=$s.Substring($i+$m.Length).TrimStart([char]13,[char]10); [System.IO.File]::WriteAllText($env:PATCH_TMP,$code,(New-Object System.Text.UTF8Encoding($false)))"
if errorlevel 1 (
  echo [ERROR] Could not extract the embedded patch.
  goto :failed
)
node "%PATCH_TMP%"
set "PATCH_RESULT=%ERRORLEVEL%"
del /q "%PATCH_TMP%" >nul 2>&1
if not "%PATCH_RESULT%"=="0" goto :failed

echo [3/7] Installing dependencies...
if exist "package-lock.json" (
  call npm ci
) else (
  call npm install
)
if errorlevel 1 goto :failed

echo [4/7] Building game...
call npm run build
if errorlevel 1 goto :failed

echo [5/7] Running targeted and full regression tests...
node scripts\test-government-card-cadence.js
if errorlevel 1 goto :failed
node scripts\test-cyprus-roadmap.js
if errorlevel 1 goto :failed
call npm test
if errorlevel 1 goto :failed

echo [6/7] Preparing and committing validated repair...
rem Only tracked files are staged. Untracked files (including this BAT) are untouched.
git add -u
if errorlevel 1 goto :failed
git diff --cached --check
if errorlevel 1 goto :failed
git diff --cached --quiet
if not errorlevel 1 (
  echo [ERROR] Nothing changed; no new deployment commit was created.
  goto :failed
)
git diff --cached --stat
git commit -m "Fix Rubicon cooldowns and Windows Cyprus validation"
if errorlevel 1 goto :failed

echo [7/7] Pushing fix commit to trigger GitHub Pages deployment...
git push origin main
if errorlevel 1 (
  echo [ERROR] Commit was created locally but push failed.
  echo         Fix Git authentication and run: git push origin main
  goto :failed
)

echo.
echo [SUCCESS] Fix pushed. GitHub Actions should deploy automatically.
git log -1 --format="Commit: %%h %%s"
echo Actions: https://github.com/titanofwall-spec/social_democracy_Anatolian_Dawn/actions
echo.
pause
exit /b 0

:failed
echo.
echo [STOPPED] Deployment was not successfully completed.
echo Review the error above. No force-push or history rewriting was used.
echo.
pause
exit /b 1

::RUBICON_JS_PAYLOAD
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// Only the unfinished first repair and generated build outputs may already be dirty.
// Stop rather than accidentally packaging unrelated edits into the deployment.
const allowedDirty = new Set([
  'source/scenes/government_affairs/economic_democracy.scene.dry',
  'source/scenes/government_affairs/religious_affairs_directorate.scene.dry',
  'source/scenes/government_affairs/kurdish_issue.scene.dry',
  'scripts/test-government-card-cadence.js',
  'scripts/test-cyprus-roadmap.js'
]);
const dirty = cp.execFileSync('git', ['diff', '--name-only'], {encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const unexpected = dirty.filter(f => !allowedDirty.has(f) && !f.startsWith('out/'));
if (unexpected.length) throw new Error('Unrelated tracked changes detected. Not modifying or committing:\n' + unexpected.join('\n'));

const cards = [
  'economic_democracy',
  'religious_affairs_directorate',
  'kurdish_issue'
];

// Validate EVERY input before touching a file. No unrelated card is changed.
const changes = new Map();
for (const id of cards) {
  const file = path.join('source', 'scenes', 'government_affairs', id + '.scene.dry');
  const original = fs.readFileSync(file, 'utf8');
  const oldAssignment = id + '_timer=3;';
  const newAssignment = id + '_timer=(Q.rubicon_mode ? 3 : 6);';
  if (original.includes(newAssignment)) {
    console.log('Already conditional:', file);
    continue;
  }
  const pieces = original.split(oldAssignment);
  if (pieces.length !== 2) {
    throw new Error('Expected exactly one 3-month cooldown in ' + file + '. Found ' + (pieces.length - 1) + '. Stop: source has changed.');
  }
  changes.set(file, pieces.join(newAssignment));
}

const testPath = path.join('scripts', 'test-government-card-cadence.js');
let test = fs.readFileSync(testPath, 'utf8');
const oldFresh = 'week:1,CHP_in_government:1';
const newFresh = 'week:1,rubicon_mode:0,rubicon_week:1,CHP_in_government:1';
if (!test.includes(newFresh)) {
  if (!test.includes(oldFresh)) throw new Error('Could not locate fresh() test setup; test layout changed.');
  test = test.replace(oldFresh, newFresh);
}

const newTestName = 'Rubicon three-month government cooldowns expire after twelve weekly turns';
if (!test.includes(newTestName)) {
  const anchor = "test('Pre-update saves acquire missing timer registration when opening a new card'";
  if (!test.includes(anchor)) throw new Error('Could not locate test insertion point.');
  const newTest = `test('${newTestName}',()=>{
 for(const id of ['economic_democracy','religious_affairs_directorate','kurdish_issue']){
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{rubicon_mode:1,rubicon_week:1,year:1972,month:1,week:1,difficulty:-1,tsk_pacified:1});
  const available=scene=>e._compileChoices(game.scenes[scene]).some(c=>c.id===id);
  assert(available('main.govt'));
  assert(available('cabinet'));
  e.goToScene(id);
  assert.equal(Q[id+'_timer'],3);
  for(let i=0;i<11;i++){
   Q.month_actions=1;
   e.goToScene('post_event');
   assert(Q[id+'_timer']>0,id+' became available before three months elapsed');
  }
  Q.month_actions=1;
  e.goToScene('post_event');
  assert.equal(Q[id+'_timer'],0);
  assert(available('main.govt'));
  assert(available('cabinet'));
 }
});
`;
  test = test.replace(anchor, newTest + anchor);
}
changes.set(testPath, test);

// The Cyprus scene is correct; the original test assumes Unix LF line endings.
// Windows Git checkouts may convert the file to CRLF, causing a false failure.
// Accept either line ending in the test without modifying the event or its prose.
const cyprusTestPath = path.join('scripts', 'test-cyprus-roadmap.js');
let cyprusTest = fs.readFileSync(cyprusTestPath, 'utf8');
const oldCyprusAssertion = String.raw`assert(source.startsWith('title: The Price Of Independence\n'),id);`;
const newCyprusAssertion = String.raw`assert(/^title: The Price Of Independence\r?\n/.test(source),id);`;
if (!cyprusTest.includes(newCyprusAssertion)) {
  const parts = cyprusTest.split(oldCyprusAssertion);
  if (parts.length !== 2) throw new Error('Cyprus test changed unexpectedly. Refusing to patch an unknown assertion.');
  cyprusTest = parts.join(newCyprusAssertion);
}
changes.set(cyprusTestPath, cyprusTest);

for (const [file, content] of changes) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated:', file);
}
console.log('Ready: 3 months in Rubicon, 6 months normally; separate tests for both.');
