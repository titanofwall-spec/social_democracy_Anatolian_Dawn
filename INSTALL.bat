@echo off
setlocal DisableDelayedExpansion
set "TARGET=C:\Program Files (x86)\social_democracy_Anatolian_Dawn"
set "PATCH_DIR=%~dp0"
echo Anatolian Dawn - Cold War Tooltip Layout Fix
echo Target: "%TARGET%"
if not exist "%TARGET%\" (
  echo ERROR: Game folder not found.
  pause
  exit /b 1
)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%PATCH_DIR%patch\apply_patch.py" --root "%TARGET%" --resource "%PATCH_DIR%resources\governments.json"
) else (
  where python >nul 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python 3 required.
    pause
    exit /b 1
  )
  python "%PATCH_DIR%patch\apply_patch.py" --root "%TARGET%" --resource "%PATCH_DIR%resources\governments.json"
)
set "RESULT=%ERRORLEVEL%"
if not "%RESULT%"=="0" echo Fix was not installed. See errors above.
if "%RESULT%"=="0" echo Tooltip adapter updated. Restart the game or reload the page.
pause
exit /b %RESULT%
