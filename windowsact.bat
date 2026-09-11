```bat
@echo off
color 0C
title Windows System Restart
cls

echo.
echo ==================================================
echo             WINDOWS SYSTEM WARNING
echo ==================================================
echo.
echo Unauthorized code execution detected.
timeout /t 2 /nobreak >nul
echo.
echo System integrity verification failed.
timeout /t 2 /nobreak >nul
echo.
echo Emergency restart initiated...
timeout /t 2 /nobreak >nul
echo.
echo Saving system state...
timeout /t 2 /nobreak >nul
echo.
echo [####################] 100%%
echo.
echo Restart scheduled.
echo.
echo Press any key to continue...
pause >nul
exit
```
