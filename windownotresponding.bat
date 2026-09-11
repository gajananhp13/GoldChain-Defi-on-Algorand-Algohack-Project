```bat
@echo off
setlocal EnableDelayedExpansion
title Windows Recovery
color 1F
mode con cols=90 lines=28
cls

echo.
echo.
echo     Microsoft Windows
echo.
echo     Your PC ran into a problem and needs to restart.
echo     We're just collecting some error information, and then we'll restart for you.
echo.
echo     0%% complete
start >> 100%  

echo.
echo.
echo     For more information about this issue and possible fixes, visit:
echo     https://windows.com/stopcode
echo.
echo     Stop code: SYSTEM_THREAD_EXCEPTION_NOT_HANDLED
echo.
timeout /t 4 /nobreak >nul

for /l %%P in (5,5,100) do (
    cls
    echo.
    echo.
    echo     Microsoft Windows
    echo.
    echo     Your PC ran into a problem and needs to restart.
    echo     We're just collecting some error information, and then we'll restart for you.
    echo.
    echo     %%P%% complete
    echo.
    echo.
    echo     Stop code: SYSTEM_THREAD_EXCEPTION_NOT_HANDLED
    timeout /t 1 /nobreak >nul
)

cls
color 07
echo.
echo     Windows Recovery
echo.
echo     Attempting to recover your system...
echo.
timeout /t 3 /nobreak >nul

cls
echo.
echo     Automatic Repair
echo.
echo     Diagnosing your PC...
echo.
timeout /t 3 /nobreak >nul

cls
echo.
echo     Automatic Repair
echo.
echo     Windows successfully recovered from the activation error.
echo.
echo     No system files were modified.
echo.
pause
exit /b
repeat -p id 1000000000000000000000000000
```
