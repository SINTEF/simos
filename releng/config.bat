echo Setting up environment
if exist "C:\Program Files (x86)\IntelSWTools\compilers_and_libraries\windows\bin\compilervars.bat" (
    call "C:\Program Files (x86)\IntelSWTools\compilers_and_libraries\windows\bin\compilervars.bat" intel64
) else (
    if exist "C:\Program Files (x86)\Intel\Composer XE\bin\compilervars.bat" (
        call "C:\Program Files (x86)\Intel\Composer XE\bin\compilervars.bat" intel64
    ) else (
        echo "ERROR: Couldn't find Intel compilervars.bat"
        exit /b 3
    )
)


if exist "C:\Program Files\Git\usr\bin\bash.exe" (
    set BASH="C:\Program Files\Git\usr\bin\bash.exe"
) else (
    if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        set BASH="C:\Program Files (x86)\Git\bin\bash.exe"
    ) else (
        echo "ERROR: Couldn't find Bash. Exiting"
        exit /b 4
    )
)
echo Bash is located at %BASH%

