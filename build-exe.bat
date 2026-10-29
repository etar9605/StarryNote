@echo off
chcp 65001 >nul
echo ===================================================
echo   Đang đóng gói Notes Stary Sea thành file .EXE...
echo ===================================================
echo.

call npm install
call npm install --save-dev electron electron-builder
call npm run exe

echo.
echo ===================================================
echo   Hoàn tất! File .exe nằm trong thư mục "release"
echo ===================================================
if exist "release" explorer "release"
pause
