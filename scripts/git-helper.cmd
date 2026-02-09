@echo off
REM ============================================================================
REM Git Helper Script - Ensures all changes are properly committed
REM Usage: git-helper.cmd "Your commit message here"
REM ============================================================================

if "%~1"=="" (
    echo ERROR: Please provide a commit message.
    echo Usage: git-helper.cmd "Your commit message here"
    exit /b 1
)

echo ============================================================================
echo Git Helper - Ensuring all changes are committed properly
echo ============================================================================

REM Change to script directory
cd /d "%~dp0.."

echo.
echo [1/4] Current Git Status:
echo ---------------------------------------------------------------------------
git status

echo.
echo [2/4] Saving all open files in VSCode...
echo ---------------------------------------------------------------------------
echo IMPORTANT: If you have unsaved files in VSCode:
echo   - Press Ctrl+K Ctrl+S to open Keyboard Shortcuts
echo   - Or manually save each file with Ctrl+S
echo   - Look for files with a dot (●) in the tab bar - these are unsaved
echo.
echo After saving your files, press any key to continue...
pause >nul

echo.
echo [3/4] Staging all changes...
echo ---------------------------------------------------------------------------
git add -A

echo Staged files:
git diff --cached --name-only

echo.
echo [4/4] Committing with message: "%~1"
echo ------------------------------------------------------------------------===
git commit -m "%~1"

echo.
echo ============================================================================
echo Final Status:
echo ============================================================================
git status

echo.
echo SUCCESS! All changes have been committed.
echo Don't forget to push: git push
echo ============================================================================
