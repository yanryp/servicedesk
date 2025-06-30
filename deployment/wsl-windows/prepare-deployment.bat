@echo off
REM BSG Helpdesk - Deployment Preparation Script
REM This script prepares a complete deployment package

echo.
echo ============================================
echo BSG Helpdesk - Deployment Package Creation
echo ============================================
echo.

set SOURCE_DIR=..\..\
set DEPLOY_DIR=.\

echo [INFO] Preparing deployment package...

REM Create directory structure
echo [INFO] Creating directory structure...
if not exist "backend" mkdir backend
if not exist "frontend" mkdir frontend
if not exist "database" mkdir database
if not exist "scripts" mkdir scripts

REM Copy backend files
echo [INFO] Copying backend files...
xcopy /E /I /Y "%SOURCE_DIR%backend\src" "backend\src\"
xcopy /E /I /Y "%SOURCE_DIR%backend\prisma" "backend\prisma\"
copy "%SOURCE_DIR%backend\package*.json" "backend\"
copy "%SOURCE_DIR%backend\tsconfig.json" "backend\"
if exist "%SOURCE_DIR%backend\.env.example" copy "%SOURCE_DIR%backend\.env.example" "backend\"

REM Copy frontend files
echo [INFO] Copying frontend files...
xcopy /E /I /Y "%SOURCE_DIR%frontend\src" "frontend\src\"
xcopy /E /I /Y "%SOURCE_DIR%frontend\public" "frontend\public\"
copy "%SOURCE_DIR%frontend\package*.json" "frontend\"
copy "%SOURCE_DIR%frontend\tsconfig.json" "frontend\"
copy "%SOURCE_DIR%frontend\tailwind.config.js" "frontend\"
copy "%SOURCE_DIR%frontend\postcss.config.js" "frontend\"

REM Copy database files
echo [INFO] Copying database files...
if exist "%SOURCE_DIR%backend\prisma\schema.prisma" copy "%SOURCE_DIR%backend\prisma\schema.prisma" "database\"

REM Copy documentation
echo [INFO] Copying documentation...
if exist "%SOURCE_DIR%README.md" copy "%SOURCE_DIR%README.md" "README-Original.md"
if exist "%SOURCE_DIR%DEPLOYMENT.md" copy "%SOURCE_DIR%DEPLOYMENT.md" "DEPLOYMENT-Original.md"

REM Create startup script
echo [INFO] Creating startup scripts...
echo @echo off > start-services.bat
echo echo Starting BSG Helpdesk services... >> start-services.bat
echo docker-compose -f docker-compose.wsl.yml up -d >> start-services.bat
echo echo Services started successfully! >> start-services.bat
echo echo Frontend: http://localhost:3000 >> start-services.bat
echo echo Backend: http://localhost:3001 >> start-services.bat
echo pause >> start-services.bat

echo @echo off > stop-services.bat
echo echo Stopping BSG Helpdesk services... >> stop-services.bat
echo docker-compose -f docker-compose.wsl.yml down >> stop-services.bat
echo echo Services stopped successfully! >> stop-services.bat
echo pause >> stop-services.bat

echo @echo off > view-logs.bat
echo echo Viewing BSG Helpdesk logs... >> view-logs.bat
echo docker-compose -f docker-compose.wsl.yml logs -f >> view-logs.bat

REM Create service management script
echo [INFO] Creating service management tools...
echo @echo off > manage-services.bat
echo :menu >> manage-services.bat
echo cls >> manage-services.bat
echo echo ============================================ >> manage-services.bat
echo echo BSG Helpdesk - Service Management >> manage-services.bat
echo echo ============================================ >> manage-services.bat
echo echo. >> manage-services.bat
echo echo 1. Start Services >> manage-services.bat
echo echo 2. Stop Services >> manage-services.bat
echo echo 3. Restart Services >> manage-services.bat
echo echo 4. View Logs >> manage-services.bat
echo echo 5. Check Status >> manage-services.bat
echo echo 6. Exit >> manage-services.bat
echo echo. >> manage-services.bat
echo set /p choice=Choose an option (1-6): >> manage-services.bat
echo. >> manage-services.bat
echo if "%choice%"=="1" goto start >> manage-services.bat
echo if "%choice%"=="2" goto stop >> manage-services.bat
echo if "%choice%"=="3" goto restart >> manage-services.bat
echo if "%choice%"=="4" goto logs >> manage-services.bat
echo if "%choice%"=="5" goto status >> manage-services.bat
echo if "%choice%"=="6" exit >> manage-services.bat
echo goto menu >> manage-services.bat
echo. >> manage-services.bat
echo :start >> manage-services.bat
echo docker-compose -f docker-compose.wsl.yml up -d >> manage-services.bat
echo echo Services started! >> manage-services.bat
echo pause >> manage-services.bat
echo goto menu >> manage-services.bat
echo. >> manage-services.bat
echo :stop >> manage-services.bat
echo docker-compose -f docker-compose.wsl.yml down >> manage-services.bat
echo echo Services stopped! >> manage-services.bat
echo pause >> manage-services.bat
echo goto menu >> manage-services.bat
echo. >> manage-services.bat
echo :restart >> manage-services.bat
echo docker-compose -f docker-compose.wsl.yml restart >> manage-services.bat
echo echo Services restarted! >> manage-services.bat
echo pause >> manage-services.bat
echo goto menu >> manage-services.bat
echo. >> manage-services.bat
echo :logs >> manage-services.bat
echo docker-compose -f docker-compose.wsl.yml logs -f >> manage-services.bat
echo goto menu >> manage-services.bat
echo. >> manage-services.bat
echo :status >> manage-services.bat
echo docker-compose -f docker-compose.wsl.yml ps >> manage-services.bat
echo pause >> manage-services.bat
echo goto menu >> manage-services.bat

echo.
echo [SUCCESS] Deployment package prepared successfully!
echo.
echo Next steps:
echo 1. Review and edit .env.template with your configuration
echo 2. Run deploy-wsl.bat to start the deployment
echo.
pause