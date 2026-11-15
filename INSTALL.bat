@echo off
setlocal DisableDelayedExpansion
set "TARGET=C:\Program Files (x86)\social_democracy_Anatolian_Dawn"
set "PATCH_DIR=%~dp0"
echo.
echo  Anatolian Dawn - Cold War Governments Installer
 echo Target: "%TARGET%"
echo.
if not exist "%TARGET%\" (
  echo ERROR: Game repository does not exist at this location.
  pause
  exit /b 1
)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%PATCH_DIR%patch\apply_patch.py" --root "%TARGET%" --resource "%PATCH_DIR%resources\governments.json"
) else (
  where python >nul 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python 3 is required to run this batch installer.
    echo Install Python 3 and retry.
    pause
    exit /b 1
  )
  python "%PATCH_DIR%patch\apply_patch.py" --root "%TARGET%" --resource "%PATCH_DIR%resources\governments.json"
)
set "RESULT=%ERRORLEVEL%"
if not "%RESULT%"=="0" (
  echo.
  echo Patch failed or was not applied. See the error above.
  echo If this is an access denied error, run the batch file as administrator.
) else (
  echo.
  echo Installation files written. Launch the game and test several country tooltips.
  echo If the layout is not recognized, the runtime adapter may need adjustment.
)
pause
exit /b %RESULT%
