@echo off
title Media Pembelajaran Interaktif Siswa SD
color 0B
echo ======================================================================
echo    MEMULAI MEDIA PEMBELAJARAN INTERAKTIF SISWA SD
echo ======================================================================
echo.
echo Memeriksa file aplikasi...
cd /d "%~dp0"

echo Menjalankan server aplikasi di port 8000...
python app.py

pause
