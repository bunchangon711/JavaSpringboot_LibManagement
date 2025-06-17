@echo off
REM Docker Troubleshooting and Testing Script for Windows
REM This script helps diagnose and fix common Docker issues

echo 🔧 Docker Troubleshooting and Testing Script
echo =============================================

REM Check Docker installation
echo [INFO] Checking Docker installation...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed!
    exit /b 1
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    exit /b 1
)

echo [SUCCESS] Docker is installed and running
docker --version
docker-compose --version
echo.

REM Clean up previous builds
echo [INFO] Cleaning up previous builds...
docker-compose down >nul 2>nul
docker-compose -f docker-compose.dev.yml down >nul 2>nul
docker image rm lib_management-backend >nul 2>nul
docker image rm lib_management-frontend >nul 2>nul
docker builder prune -f >nul 2>nul
echo [SUCCESS] Cleanup completed
echo.

REM Check for common issues
echo [INFO] Checking for common issues...

REM Check if ports are available
netstat -an | findstr ":80 " >nul 2>nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 80 is already in use
)

netstat -an | findstr ":8080 " >nul 2>nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 8080 is already in use
)

netstat -an | findstr ":3307 " >nul 2>nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3307 is already in use
)

echo [SUCCESS] Common issues check completed
echo.

REM Test backend build
echo [INFO] Testing backend Dockerfile build...
docker build -f Dockerfile.backend -t test-backend . --no-cache
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend Dockerfile builds successfully
    docker image rm test-backend >nul 2>nul
) else (
    echo [ERROR] Backend Dockerfile build failed
    exit /b 1
)
echo.

REM Test frontend build
echo [INFO] Testing frontend Dockerfile build...
cd frontend
docker build -f Dockerfile -t test-frontend . --no-cache
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend Dockerfile builds successfully
    docker image rm test-frontend >nul 2>nul
    cd ..
) else (
    echo [ERROR] Frontend Dockerfile build failed
    cd ..
    exit /b 1
)
echo.

REM Test compose build
echo [INFO] Testing docker-compose build...
docker-compose build --no-cache
if %errorlevel% equ 0 (
    echo [SUCCESS] Docker Compose build successful
) else (
    echo [ERROR] Docker Compose build failed
    exit /b 1
)
echo.

echo [SUCCESS] All tests completed successfully!
echo [INFO] You can now run: docker-compose up -d
echo.
echo Quick commands:
echo   docker-compose up -d          - Start all services
echo   docker-compose logs -f        - View logs
echo   docker-compose down           - Stop all services
echo   .\docker-setup.bat status     - Check service health
