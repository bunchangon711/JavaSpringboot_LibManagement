@echo off
REM Library Management System - Docker Setup Scripts for Windows

setlocal enabledelayedexpansion

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

if "%1"=="prod" goto :production
if "%1"=="production" goto :production
if "%1"=="dev" goto :development
if "%1"=="development" goto :development
if "%1"=="stop" goto :stop
if "%1"=="clean" goto :cleanup
if "%1"=="cleanup" goto :cleanup
if "%1"=="logs" goto :logs
if "%1"=="status" goto :status
if "%1"=="restart" goto :restart
goto :help

:production
echo [INFO] Starting Library Management System in production mode...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo [SUCCESS] Application started in production mode!
echo [INFO] Frontend: http://localhost
echo [INFO] Backend API: http://localhost:8080
echo [INFO] Database: localhost:3307
goto :end

:development
echo [INFO] Starting Library Management System in development mode...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
echo [SUCCESS] Application started in development mode!
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend API: http://localhost:8080
echo [INFO] Database: localhost:3307
goto :end

:stop
echo [INFO] Stopping Library Management System...
docker-compose down
docker-compose -f docker-compose.dev.yml down
echo [SUCCESS] Application stopped.
goto :end

:cleanup
echo [WARNING] This will remove all containers, images, and volumes. Are you sure? (y/N)
set /p response=
if /i "!response!"=="y" (
    echo [INFO] Cleaning up...
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    docker system prune -f
    echo [SUCCESS] Cleanup completed.
) else (
    echo [INFO] Cleanup cancelled.
)
goto :end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto :end

:status
echo [INFO] Docker containers status:
docker-compose ps
echo.
echo [INFO] Health checks:
docker-compose exec backend curl -f http://localhost:8080/actuator/health 2>nul || echo [WARNING] Backend health check failed
docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost/ 2>nul || echo [WARNING] Frontend health check failed
goto :end

:restart
call :stop
call :production
goto :end

:help
echo Library Management System - Docker Management Script
echo.
echo Usage: %0 {prod^|dev^|stop^|clean^|logs^|status^|restart}
echo.
echo Commands:
echo   prod, production  - Start in production mode
echo   dev, development  - Start in development mode
echo   stop             - Stop all services
echo   clean, cleanup   - Remove all containers, images, and volumes
echo   logs [service]   - Show logs (optionally for specific service)
echo   status           - Show container status and health
echo   restart          - Restart in production mode
echo.
echo Examples:
echo   %0 prod          # Start production environment
echo   %0 dev           # Start development environment
echo   %0 logs backend  # Show backend logs
echo   %0 status        # Show status

:end
endlocal
