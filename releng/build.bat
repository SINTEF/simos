@echo off

call releng\config.bat

echo Building...
%BASH% --login -c './releng/build.sh'
set Err=%ERRORLEVEL%
exit /b %Err%

