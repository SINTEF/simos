@echo off

call releng\config.bat

echo Testing...
%BASH% --login -c './releng/test.sh'
set Err=%ERRORLEVEL%
exit /b %Err%

