@echo off
SETLOCAL

:: Change to the directory where this script is located
cd /d %~dp0

:: Add Oracle Instant Client to PATH (NO quotes!)
set PATH=C:\Users\ankit\Downloads\instantclient-basiclite-windows.x64-19.20.0.0.0dbru\instantclient_19_20;%PATH%

:: Start Node application
node server.js

ENDLOCAL
exit /b 0
