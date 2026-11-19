@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Anatolian Dawn - Restore advisor cooldown when Ecevit leads CHP

echo =============================================================
echo  ANATOLIAN DAWN - ECEVIT LEADERSHIP ADVISOR COOLDOWN FIX
echo =============================================================
echo.
echo Rubicon + Inonu leading CHP: 1 month.
echo After Ecevit becomes CHP leader: normal 3 months.
echo Existing cooldown progress is not reset or changed.
echo.

rem Accept a repo path dragged onto the BAT; otherwise look near this file.
set "REPO="
if not "%~1"=="" if exist "%~1\.git" set "REPO=%~1"
if not defined REPO if exist "%~dp0.git" set "REPO=%~dp0"
if not defined REPO if exist "%~dp0social_democracy_Anatolian_Dawn\.git" set "REPO=%~dp0social_democracy_Anatolian_Dawn"
if not defined REPO if exist "%USERPROFILE%\Downloads\social_democracy_Anatolian_Dawn\.git" set "REPO=%USERPROFILE%\Downloads\social_democracy_Anatolian_Dawn"
if not defined REPO set /p "REPO=Enter the FULL path to the Anatolian Dawn repository: "
if not exist "%REPO%\.git" (
  echo ERROR: Not a Git repository: "%REPO%"
  goto :failed
)
cd /d "%REPO%"
if errorlevel 1 goto :failed
if not exist "out\html\card-actions.js" goto :missing
if not exist "scripts\test-advisor-cooldowns.js" goto :missing
if not exist "source\scenes\events\chp_fifth_congress.scene.dry" goto :missing
where node >nul 2>&1
if errorlevel 1 (echo ERROR: Node.js is required.& goto :failed)
where npm >nul 2>&1
if errorlevel 1 (echo ERROR: npm is required.& goto :failed)
where git >nul 2>&1
if errorlevel 1 (echo ERROR: Git is required.& goto :failed)
where powershell >nul 2>&1
if errorlevel 1 (echo ERROR: Windows PowerShell is required.& goto :failed)

for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if /I not "%BRANCH%"=="main" (
  echo ERROR: Please use the main branch. Current branch: %BRANCH%
  goto :failed
)
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "ORIGIN=%%R"
if not defined ORIGIN (echo ERROR: No origin remote found.& goto :failed)
echo(%ORIGIN% | findstr /i /c:"titanofwall-spec/social_democracy_Anatolian_Dawn" >nul
if errorlevel 1 (
  echo ERROR: Git origin does not point to the expected repository.
  echo %ORIGIN%
  goto :failed
)
git diff --quiet
if errorlevel 1 (echo ERROR: Uncommitted tracked changes detected. Commit or stash them first.& goto :failed)
git diff --cached --quiet
if errorlevel 1 (echo ERROR: Already-staged changes detected. Commit or unstage them first.& goto :failed)

echo [1/6] Updating local main safely...
git pull --ff-only origin main
if errorlevel 1 goto :failed

echo [2/6] Applying leadership-dependent advisor cooldown patch...
set "BAT_SELF=%~f0"
set "PATCH_TMP=%TEMP%\anatolian_ecevit_cooldown_%RANDOM%_%RANDOM%.js"
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$src=[IO.File]::ReadAllText($env:BAT_SELF); $marker='::ECEVIT_ADVISOR_JS_PAYLOAD'; $i=$src.LastIndexOf($marker); if($i -lt 0){exit 2}; $js=$src.Substring($i+$marker.Length).TrimStart([char]13,[char]10); [IO.File]::WriteAllText($env:PATCH_TMP,$js,(New-Object System.Text.UTF8Encoding($false)))"
if errorlevel 1 (echo ERROR: Could not extract the patch.& goto :failed)
node "%PATCH_TMP%"
if errorlevel 1 (
  del /q "%PATCH_TMP%" >nul 2>&1
  goto :failed
)
del /q "%PATCH_TMP%" >nul 2>&1

echo [3/6] Checking patch integrity...
node --check out\html\card-actions.js
if errorlevel 1 goto :failed
node --check scripts\test-advisor-cooldowns.js
if errorlevel 1 goto :failed
git diff --check
if errorlevel 1 goto :failed

echo [4/6] Building the game...
if not exist "node_modules" (
  call npm ci
  if errorlevel 1 goto :failed
)
call npm run build
if errorlevel 1 goto :failed

echo [5/6] Running targeted and full regression tests...
node scripts\test-advisor-cooldowns.js
if errorlevel 1 goto :failed
call npm test
if errorlevel 1 goto :failed

echo [6/6] Reviewing changes...
git diff --stat -- out/html/card-actions.js scripts/test-advisor-cooldowns.js
git diff --check
if errorlevel 1 goto :failed

git diff --quiet -- out/html/card-actions.js scripts/test-advisor-cooldowns.js
if not errorlevel 1 (
  echo No additional changes are needed. Tests passed; nothing to commit.
  goto :done
)
echo.
choice /C YN /M "Commit and push the tested fix to GitHub main"
if errorlevel 2 (
  echo Changes are saved locally but were not pushed.
  goto :done
)
git add -- out/html/card-actions.js scripts/test-advisor-cooldowns.js
if errorlevel 1 goto :failed
git diff --cached --check
if errorlevel 1 goto :failed
git commit -m "Restore advisor cooldown when Ecevit becomes CHP leader"
if errorlevel 1 goto :failed
git push origin main
if errorlevel 1 (
  echo ERROR: Local commit succeeded but GitHub push failed.
  echo Retry after fixing authentication: git push origin main
  goto :failed
)
echo.
echo SUCCESS: Pushed. GitHub Actions will build, test and attempt deployment.
echo The GitHub Pages deployment step is separate and may still fail.
goto :done

:missing
echo ERROR: Expected Anatolian Dawn project files were not found.
:failed
echo.
echo STOPPED. No successful deployment was claimed.
echo Review the error above. No force-push was attempted.
echo.
pause
exit /b 1
:done
echo.
pause
exit /b 0

::ECEVIT_ADVISOR_JS_PAYLOAD
'use strict';
const fs = require('fs');
const path = require('path');

const advisorPath = path.join('out','html','card-actions.js');
const testPath = path.join('scripts','test-advisor-cooldowns.js');
const congressPath = path.join('source','scenes','events','chp_fifth_congress.scene.dry');
const advisor = fs.readFileSync(advisorPath,'utf8');
const tests = fs.readFileSync(testPath,'utf8');
const congress = fs.readFileSync(congressPath,'utf8');

// Verify the game's genuine transition, not a presumed date or Talu's accession.
if (!/Q\.CHP_party_leader\s*=\s*"Ecevit"\s*;/.test(congress) ||
    !/Q\.party_leader_id\s*=\s*"ecevit"\s*;/.test(congress) ||
    !/^@inonu_resigns\s*$/m.test(congress)) {
  throw Error('The congress scene no longer matches the known Ecevit leadership transition. Nothing changed.');
}

const oldCooldown = 'Q.advisor_action_timer=Q.rubicon_mode?1:months;';
const newCooldown = 'Q.advisor_action_timer=(Q.rubicon_mode && Q.CHP_party_leader !== "Ecevit")?1:months;';
const oldMatrix = 'for(const [rubiconMode,months] of [[0,3],[1,1]]) {';
const newMatrix = "for(const [rubiconMode,leader,months] of [[0,'\u0130n\u00f6n\u00fc',3],[1,'\u0130n\u00f6n\u00fc',1],[1,'Ecevit',3],[0,'Ecevit',3]]) {";
const oldSetup = 'Q.rubicon_mode=rubiconMode;';
const newSetup = 'Q.rubicon_mode=rubiconMode; Q.CHP_party_leader=leader;';
const oldTestName = "test('Talu cabinet formation restores normal advisor cooldown at the event, not the date',()=>{";
const newTestName = "test('Ecevit becoming CHP leader restores advisor cooldown immediately',()=>{";
const nextTest = "test('Actual advisor policy effects survive returning to main'";

function replaceExactlyOnce(source, before, after, label) {
  if (source.includes(after)) {
    if (source.replace(after,'').includes(before)) throw Error('Both original and patched '+label+' found. Nothing changed.');
    return source;
  }
  const count = source.split(before).length - 1;
  if (count !== 1) throw Error('Unexpected '+label+' layout ('+count+' matches). Nothing changed.');
  return source.replace(before, after);
}

let patchedAdvisor = replaceExactlyOnce(advisor,oldCooldown,newCooldown,'advisor implementation');
let patchedTests = replaceExactlyOnce(tests,oldMatrix,newMatrix,'advisor test matrix');
patchedTests = replaceExactlyOnce(patchedTests,oldSetup,newSetup,'advisor test leader setup');

const eol = tests.includes('\r\n') ? '\r\n' : '\n';
const newTransitionTest = `test('Ecevit becoming CHP leader restores advisor cooldown immediately',()=>{
 const e=fresh(),Q=e.state.qualities;
 Object.assign(Q,{year:1972,month:5,rubicon_week:1,rubicon_mode:1,CHP_party_leader:'\u0130n\u00f6n\u00fc',advisor_action_timer:0});
 A.startAdvisorCooldown(Q);assert.equal(Q.advisor_action_timer,1,'pre-leadership Rubicon cooldown');
 // The actual congress event is the trigger; calendar and Rubicon mode remain unchanged.
 e.goToScene('chp_fifth_congress.inonu_resigns');
 assert.equal(Q.CHP_party_leader,'Ecevit');
 assert.equal(Q.rubicon_mode,1,'Memorandum Rubicon is still active');
 assert.equal(Q.advisor_action_timer,1,'do not rewrite an existing cooldown');
 Q.advisor_action_timer=0;
 A.startAdvisorCooldown(Q);assert.equal(Q.advisor_action_timer,3,'new advisor action after Ecevit victory');
 A.startAdvisorCooldown(Q,4);assert.equal(Q.advisor_action_timer,4,'preserve actions with custom cooldown lengths');
});
`;
if (patchedTests.includes(oldTestName)) {
  const from = patchedTests.indexOf(oldTestName);
  const to = patchedTests.indexOf(nextTest,from);
  if (to < 0) throw Error('Could not find next advisor test. Nothing changed.');
  patchedTests = patchedTests.slice(0,from) + newTransitionTest.replace(/\n/g,eol) + patchedTests.slice(to);
} else if (!patchedTests.includes(newTestName)) {
  throw Error('Could not locate the old or new transition regression test. Nothing changed.');
}

// All checks above must complete before any on-disk change is made.
if (patchedAdvisor !== advisor) fs.writeFileSync(advisorPath,patchedAdvisor,'utf8');
if (patchedTests !== tests) fs.writeFileSync(testPath,patchedTests,'utf8');
console.log('Patched advisor cooldown: one month only while Rubicon is active AND Ecevit is not CHP leader.');
console.log('Normal/custom advisor cooldowns resume immediately on Ecevit leadership.');
console.log('Updated all-advisor test matrix and real congress-event transition regression test.');
console.log('Existing save countdown values are not modified.');
