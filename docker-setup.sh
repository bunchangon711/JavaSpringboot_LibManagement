#!/bin/bash

# Library Management System - Docker Setup Scripts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Build and start the application
start_production() {
    print_status "Starting Library Management System in production mode..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Application started in production mode!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:8080"
    print_status "Database: localhost:3307"
}

# Start development environment
start_development() {
    print_status "Starting Library Management System in development mode..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Application started in development mode!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8080"
    print_status "Database: localhost:3307"
}

# Stop the application
stop_app() {
    print_status "Stopping Library Management System..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "Application stopped."
}

# Clean up everything
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.dev.yml down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed."
    else
        print_status "Cleanup cancelled."
    fi
}

# Show logs
show_logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Show status
show_status() {
    print_status "Docker containers status:"
    docker-compose ps
    echo ""
    print_status "Health checks:"
    docker-compose exec backend curl -f http://localhost:8080/actuator/health 2>/dev/null || print_warning "Backend health check failed"
    docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost/ 2>/dev/null || print_warning "Frontend health check failed"
}

# Main menu
case "$1" in
    "prod"|"production")
        check_docker
        start_production
        ;;
    "dev"|"development")
        check_docker
        start_development
        ;;
    "stop")
        stop_app
        ;;
    "clean"|"cleanup")
        cleanup
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_app
        start_production
        ;;
    *)
        echo "Library Management System - Docker Management Script"
        echo ""
        echo "Usage: $0 {prod|dev|stop|clean|logs|status|restart}"
        echo ""
        echo "Commands:"
        echo "  prod, production  - Start in production mode"
        echo "  dev, development  - Start in development mode"
        echo "  stop             - Stop all services"
        echo "  clean, cleanup   - Remove all containers, images, and volumes"
        echo "  logs [service]   - Show logs (optionally for specific service)"
        echo "  status           - Show container status and health"
        echo "  restart          - Restart in production mode"
        echo ""
        echo "Examples:"
        echo "  $0 prod          # Start production environment"
        echo "  $0 dev           # Start development environment"
        echo "  $0 logs backend  # Show backend logs"
        echo "  $0 status        # Show status"
        exit 1
        ;;
esac
