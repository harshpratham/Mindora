@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\tsx\dist\cli.mjs" (
  echo [error] node_modules missing. In this folder run: npm.cmd install
  pause
  exit /b 1
)
echo Starting API server (PostgreSQL + .env)...
node "node_modules\tsx\dist\cli.mjs" "server\index.ts"
if errorlevel 1 pause
