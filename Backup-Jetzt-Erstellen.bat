@echo off
setlocal
set "source=%~dp0Website"
set "backup_root=%~dp0Backups"

:: Hole aktuelles Datum und Uhrzeit im Format YYYY-MM-DD_HH-MM-SS
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "dest=%backup_root%\Website_Backup_%timestamp%"

echo ===================================================
echo Starte manuelles Backup der Website...
echo ===================================================
echo Quelle: %source%
echo Ziel:   %dest%
echo.

xcopy "%source%" "%dest%" /E /I /H /C /Y /Q

:: Chat-Verlauf sichern
set "chat_source=C:\Users\43670\.gemini\antigravity\brain\57931a7e-c242-47d7-8fd9-6bb26971ff12\.system_generated\logs\transcript.jsonl"
set "chat_dest=%dest%\Chat_History"
mkdir "%chat_dest%" 2>nul
copy "%chat_source%" "%chat_dest%\" /Y >nul

echo.
echo ===================================================
echo Backup erfolgreich erstellt!
echo Du findest es im Ordner "Backups".
echo ===================================================
pause
