@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
echo Aura At Ciftligi yerel sunucusu baslatiliyor...
echo.
npx --yes serve -l 3000
pause
