@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Anatolian Dawn - Fix Rubicon Cooldowns and Redeploy

echo ==========================================================
echo Anatolian Dawn - Rubicon cooldown validation repair

echo ==========================================================
echo.
echo Fix: government cards use 3 months in Rubicon mode,
echo      6 months in normal mode. Tests cover both modes.
echo The script builds, tests, commits and pushes only on success.
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

git diff --quiet
if errorlevel 1 (
  echo [ERROR] There are existing uncommitted edits to tracked files.
  echo         Commit or stash those edits before using this script.
  goto :failed
)
git diff --cached --quiet
if errorlevel 1 (
  echo [ERROR] There are already staged changes. Please address them first.
  goto :failed
)

echo [1/7] Synchronizing local main with GitHub...
git fetch origin main
if errorlevel 1 goto :failed
git pull --ff-only origin main
if errorlevel 1 goto :failed
for /f "delims=" %%H in ('git rev-parse HEAD') do set "LOCAL_HEAD=%%H"
for /f "delims=" %%H in ('git rev-parse origin/main') do set "REMOTE_HEAD=%%H"
if /i not "%LOCAL_HEAD%"=="%REMOTE_HEAD%" (
  echo [ERROR] Local main contains commits not on origin/main.
  echo         Stopping rather than pushing unrelated commits.
  goto :failed
)

echo [2/7] Applying targeted Rubicon patch and regression tests...
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
git commit -m "Fix Rubicon government-card cooldown validation"
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

for (const [file, content] of changes) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated:', file);
}
console.log('Ready: 3 months in Rubicon, 6 months normally; separate tests for both.');
