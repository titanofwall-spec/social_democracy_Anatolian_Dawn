@echo off
setlocal EnableExtensions
set "REPO=C:\Program Files (x86)\social_democracy_Anatolian_Dawn"
set "SOURCE=%~dp0"
if not exist "%REPO%\" (
  echo ERROR: Expected repository not found:
  echo   %REPO%
  echo Edit REPO in this BAT if your repository has moved.
  pause
  exit /b 1
)
if not exist "%SOURCE%data\cold_war_governments_1972_1981.json" (
  echo ERROR: Package data missing. Extract the entire ZIP before running.
  pause
  exit /b 2
)
set "TARGET=%REPO%\cold-war-gui-data"
if exist "%TARGET%\" (
  echo ERROR: Existing cold-war-gui-data directory found.
  echo Review/back up the directory before replacing. Nothing changed.
  pause
  exit /b 3
)
mkdir "%TARGET%\data" || exit /b 4
mkdir "%TARGET%\scripts" || exit /b 4
copy /Y "%SOURCE%data\cold_war_governments_1972_1981.json" "%TARGET%\data\" >nul || exit /b 5
copy /Y "%SOURCE%data\historical_coverage_report.md" "%TARGET%\data\" >nul || exit /b 5
copy /Y "%SOURCE%scripts\cold-war-government-data.js" "%TARGET%\scripts\" >nul || exit /b 5
copy /Y "%SOURCE%scripts\cold-war-tooltip-scroll.css" "%TARGET%\scripts\" >nul || exit /b 5
copy /Y "%SOURCE%INTEGRATION_NOTES.txt" "%TARGET%\" >nul || exit /b 5
echo.
echo Installed the historical data and helper files at:
echo %TARGET%
echo.
echo IMPORTANT: This is a safe staging installer, NOT a finished UI patch.
echo It does not edit your game's existing code and does not push to GitHub.
echo Read INTEGRATION_NOTES.txt; game-specific integration needs repository source.
echo.
pause
exit /b 0
