@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo [error] node_modules missing. In this folder run: npm.cmd install
  pause
  exit /b 1
)
echo Starting Vite dev server (browser)...
node "node_modules\vite\bin\vite.js"
if errorlevel 1 pause
