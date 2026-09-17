@echo off
echo ===================================================
echo   MANI G? - Pushing to GitHub (Live Deployment)
echo ===================================================
echo Repository: https://github.com/Kvnzky/mani-g-github.io
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Your site will be live at: https://kvnzky.github.io/mani-g-github.io/
) else (
    echo [NOTICE] If a browser window opened, please approve the GitHub login.
)
echo.
pause
