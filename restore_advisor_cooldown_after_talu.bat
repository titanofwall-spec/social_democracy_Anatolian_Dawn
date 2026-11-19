@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Anatolian Dawn - Restore advisor cooldown after Talu
echo ==========================================================
echo Anatolian Dawn - Advisor cooldown after Talu government
echo ==========================================================
echo.
if not exist "package.json" (
  echo Run this BAT from the root of your Anatolian Dawn repository.
  echo The folder must contain package.json and scripts.
  pause
  exit /b 1
)
if not exist "out\html\card-actions.js" (
  echo ERROR: out\html\card-actions.js not found.
  pause
  exit /b 1
)
where node >nul 2>&1 || (echo ERROR: Node.js not found.& pause & exit /b 1)
where git >nul 2>&1 || (echo ERROR: Git not found.& pause & exit /b 1)
for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if /I not "%BRANCH%"=="main" (echo ERROR: Switch to main branch first.& pause & exit /b 1)
git diff --quiet && git diff --cached --quiet
if errorlevel 1 (echo ERROR: Uncommitted changes. Commit or stash them first.& pause & exit /b 1)
echo [1/5] Applying exact advisor cooldown patch...
node -e "const fs=require('fs'),p='out/html/card-actions.js';let s=fs.readFileSync(p,'utf8');const old='Q.advisor_action_timer=Q.rubicon_mode?1:months;';const next='Q.advisor_action_timer=(Q.rubicon_mode && (Q.year<1973 || (Q.year===1973 && (Q.month<4 || (Q.month===4 && (Q.rubicon_week||1)<3)))))?1:months;';if(!s.includes(old)&&!s.includes(next))throw Error('Unexpected card-actions.js contents: aborting');if(s.includes(old)){s=s.replace(old,next);fs.writeFileSync(p,s)}console.log('Advisor cooldown: 1 month before April 1973 week 3, 3 months thereafter.');"
if errorlevel 1 goto fail
echo [2/5] Checking source syntax and cooldown boundary...
node --check out\html\card-actions.js
if errorlevel 1 goto fail
node -e "const a=require('./out/html/card-actions.js');for(const [year,month,week,mode,expected] of [[1972,4,2,1,1],[1973,4,2,1,1],[1973,4,3,1,3],[1973,5,1,1,3],[1973,4,3,0,3]]){const q={year,month,rubicon_week:week,rubicon_mode:mode,month_actions:0};a.startAdvisorCooldown(q);if(q.advisor_action_timer!==expected||q.month_actions!==1)throw Error('Wrong cooldown for '+JSON.stringify(q));}console.log('PASS: advisor cooldown returns to 3 months at Talu transition');"
if errorlevel 1 goto fail
echo [3/5] Running full test suite...
call npm run build
if errorlevel 1 goto fail
call npm test
if errorlevel 1 goto fail
echo [4/5] Checking changes...
git status --short
echo.
choice /C YN /M "Commit and push this tested fix to GitHub main"
if errorlevel 2 goto done
git add -u
git commit -m "Restore standard advisor cooldown after Talu transition"
if errorlevel 1 goto fail
echo [5/5] Pushing to GitHub to trigger deployment...
git push origin main
if errorlevel 1 goto fail
echo SUCCESS: Pushed. Check GitHub Actions for deployment status.
goto done
:fail
echo.
echo ERROR: A step failed. No automatic push was made for this failed step.
:done
echo.
pause
endlocal
