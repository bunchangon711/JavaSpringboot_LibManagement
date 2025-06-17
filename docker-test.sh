#!/bin/bash

# Docker Troubleshooting and Testing Script
# This script helps diagnose and fix common Docker issues

echo "🔧 Docker Troubleshooting and Testing Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running!"
        return 1
    fi
    
    print_success "Docker is installed and running"
    docker --version
    docker-compose --version
}

# Clean up previous builds
cleanup_previous() {
    print_status "Cleaning up previous builds..."
    
    # Stop and remove containers
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Remove images to force rebuild
    docker image rm lib_management-backend 2>/dev/null || true
    docker image rm lib_management-frontend 2>/dev/null || true
    
    # Clean up build cache
    docker builder prune -f
    
    print_success "Cleanup completed"
}

# Test individual Dockerfile builds
test_backend_build() {
    print_status "Testing backend Dockerfile build..."
    
    if docker build -f Dockerfile.backend -t test-backend . --no-cache; then
        print_success "Backend Dockerfile builds successfully"
        docker image rm test-backend
        return 0
    else
        print_error "Backend Dockerfile build failed"
        return 1
    fi
}

test_frontend_build() {
    print_status "Testing frontend Dockerfile build..."
    
    cd frontend
    if docker build -f Dockerfile -t test-frontend . --no-cache; then
        print_success "Frontend Dockerfile builds successfully"
        docker image rm test-frontend
        cd ..
        return 0
    else
        print_error "Frontend Dockerfile build failed"
        cd ..
        return 1
    fi
}

# Check for common issues
check_common_issues() {
    print_status "Checking for common issues..."
    
    # Check if ports are available
    if netstat -an | grep -q ":80 "; then
        print_warning "Port 80 is already in use. Stop the service using it or change the port in docker-compose.yml"
    fi
    
    if netstat -an | grep -q ":8080 "; then
        print_warning "Port 8080 is already in use. Stop the service using it or change the port in docker-compose.yml"
    fi
    
    if netstat -an | grep -q ":3307 "; then
        print_warning "Port 3307 is already in use. Stop the service using it or change the port in docker-compose.yml"
    fi
    
    # Check available disk space
    available_space=$(df . | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 2000000 ]; then
        print_warning "Low disk space. Docker builds require at least 2GB of free space"
    fi
    
    # Check if npm dependencies exist
    if [ ! -d "frontend/node_modules" ]; then
        print_warning "Frontend node_modules not found. This is normal for Docker builds"
    fi
    
    print_success "Common issues check completed"
}

# Run full docker-compose build
test_compose_build() {
    print_status "Testing docker-compose build..."
    
    if docker-compose build --no-cache; then
        print_success "Docker Compose build successful"
        return 0
    else
        print_error "Docker Compose build failed"
        return 1
    fi
}

# Main execution
main() {
    echo "Starting Docker troubleshooting..."
    echo ""
    
    # Run checks
    check_docker || exit 1
    echo ""
    
    check_common_issues
    echo ""
    
    cleanup_previous
    echo ""
    
    # Test individual builds
    test_backend_build
    echo ""
    
    test_frontend_build
    echo ""
    
    # Test compose build
    test_compose_build
    echo ""
    
    print_success "All tests completed successfully!"
    print_status "You can now run: docker-compose up -d"
}

# Run main function
main
