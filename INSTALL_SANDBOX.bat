@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo Anatolian Dawn - Sandbox Menu installer
echo.
where node >nul 2>nul || (echo Node.js 24 is required. & pause & exit /b 1)
where npm >nul 2>nul || (echo npm is missing. & pause & exit /b 1)
if not exist package.json (echo Run this file from the extracted repository directory. & pause & exit /b 1)
call npm ci || (echo Dependency installation failed. & pause & exit /b 1)
call npm run build || (echo Build failed. & pause & exit /b 1)
call npm test || (echo Tests failed. & pause & exit /b 1)
echo.
echo Build and validation completed.
echo Playable folder: "%CD%\out\html"
echo.
if "%~1"=="" (
  echo To install a copy into your game folder, drag the game folder onto this BAT file
  echo or run INSTALL_SANDBOX.bat "C:\path\to\your\game\folder"
  pause
  exit /b 0
)
set "DEST=%~1"
if not exist "%DEST%" (echo Game destination does not exist: "%DEST%" & pause & exit /b 1)
if exist "%DEST%\index.html" (
  set "BACKUP=%DEST%\sandbox-backup-%RANDOM%"
  mkdir "%BACKUP%" >nul 2>nul
  copy /Y "%DEST%\index.html" "%BACKUP%\" >nul
  if exist "%DEST%\game.js" copy /Y "%DEST%\game.js" "%BACKUP%\" >nul
  if exist "%DEST%\game.css" copy /Y "%DEST%\game.css" "%BACKUP%\" >nul
  if exist "%DEST%\game.json" copy /Y "%DEST%\game.json" "%BACKUP%\" >nul
)
xcopy /E /I /Y /Q "out\html\*" "%DEST%\" || (echo Copy failed. & pause & exit /b 1)
echo Installed sandbox build into "%DEST%"
pause
