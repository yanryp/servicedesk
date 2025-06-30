@echo off
REM BSG Helpdesk - Windows WSL Deployment Script
REM This script deploys the BSG Helpdesk system to WSL environment

echo.
echo ============================================
echo BSG Helpdesk - WSL Windows Deployment
echo ============================================
echo.

REM Check if running in Windows
if not exist "%WINDIR%" (
    echo ERROR: This script is designed for Windows environments only.
    pause
    exit /b 1
)

REM Check if WSL is installed
wsl --list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: WSL is not installed or not available.
    echo Please install WSL2 first: https://docs.microsoft.com/en-us/windows/wsl/install
    pause
    exit /b 1
)

REM Check if Docker Desktop is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo Please install and start Docker Desktop for Windows.
    pause
    exit /b 1
)

echo [INFO] WSL and Docker detected successfully.
echo.

REM Create necessary directories
echo [INFO] Creating deployment directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\logs" mkdir backend\logs
if not exist "frontend\build" mkdir frontend\build

REM Copy environment template if .env doesn't exist
if not exist ".env" (
    echo [INFO] Creating environment configuration from template...
    copy ".env.template" ".env"
    echo [WARNING] Please edit .env file with your configuration before continuing.
    echo Press any key when you've configured the .env file...
    pause >nul
)

REM Get WSL host IP for proper networking
echo [INFO] Configuring WSL networking...
for /f "tokens=2 delims=:" %%a in ('wsl hostname -I') do set WSL_HOST_IP=%%a
set WSL_HOST_IP=%WSL_HOST_IP: =%
echo WSL_HOST_IP=%WSL_HOST_IP%>>.env.local

echo [INFO] Starting BSG Helpdesk services...
echo.

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose -f docker-compose.wsl.yml down

REM Build and start services
echo [INFO] Building and starting services (this may take a few minutes)...
docker-compose -f docker-compose.wsl.yml up --build -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check service health
echo [INFO] Checking service health...
docker-compose -f docker-compose.wsl.yml ps

REM Run database migrations
echo [INFO] Running database migrations...
docker-compose -f docker-compose.wsl.yml exec -T backend npx prisma migrate deploy

REM Seed initial data (optional)
set /p SEED_DATA="Do you want to seed initial data? (y/N): "
if /i "%SEED_DATA%"=="y" (
    echo [INFO] Seeding initial data...
    docker-compose -f docker-compose.wsl.yml exec -T backend npm run db:seed
)

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo Services are now running:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Database: localhost:5432
echo - Redis: localhost:6379
echo.
echo To stop services: docker-compose -f docker-compose.wsl.yml down
echo To view logs: docker-compose -f docker-compose.wsl.yml logs -f
echo.
echo Default admin credentials:
echo Username: admin
echo Password: admin123
echo.
echo Please change the default password after first login!
echo.

REM Open browser to application
set /p OPEN_BROWSER="Open browser to application? (Y/n): "
if /i not "%OPEN_BROWSER%"=="n" (
    start http://localhost:3000
)

echo Press any key to exit...
pause >nul