# 🐳 Docker Setup for Library Management System

This document provides comprehensive instructions for setting up and running the Library Management System using Docker.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0 or later
- At least **4GB RAM** available for containers
- **8GB disk space** for images and volumes

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: React TypeScript application served by Nginx
- **Backend**: Spring Boot REST API
- **Database**: MySQL 8.0
- **Cache**: Redis (optional)
- **Reverse Proxy**: Nginx (optional, for load balancing)

## 🚀 Quick Start

### Option 1: Using Scripts (Recommended)

#### Windows:
```cmd
# Production environment
docker-setup.bat prod

# Development environment
docker-setup.bat dev
```

#### Linux/Mac:
```bash
# Make script executable
chmod +x docker-setup.sh

# Production environment
./docker-setup.sh prod

# Development environment
./docker-setup.sh dev
```

### Option 2: Using Docker Compose Directly

#### Production Environment:
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development Environment:
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Access Points

### Production Mode:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8080
- **Database**: localhost:3307 (external access)
- **Load Balancer**: http://localhost:8081 (if enabled)

### Development Mode:
- **Frontend**: http://localhost:3000 (with hot reload)
- **Backend API**: http://localhost:8080
- **Backend Debug**: localhost:5005 (Java debug port)
- **Database**: localhost:3307

## 📁 Docker Files Structure

```
lib_management/
├── docker-compose.yml          # Production environment
├── docker-compose.dev.yml      # Development environment
├── Dockerfile.backend          # Spring Boot application
├── .dockerignore              # Backend ignore file
├── docker-setup.sh            # Linux/Mac setup script
├── docker-setup.bat           # Windows setup script
├── docker/
│   ├── mysql/
│   │   └── init.sql           # Database initialization
│   └── nginx/
│       └── nginx.conf         # Load balancer configuration
└── frontend/
    ├── Dockerfile             # Production React build
    ├── Dockerfile.dev         # Development React build
    ├── nginx.conf             # Frontend nginx configuration
    └── .dockerignore          # Frontend ignore file
```

### Volumes

Persistent data is stored in Docker volumes:
- `mysql_data`: Database files
- `redis_data`: Redis cache data
- `backend_logs`: Application logs

## 🔧 Management Commands

### Using the Setup Scripts:

```bash
# Check status and health
./docker-setup.sh status

# View logs (all services)
./docker-setup.sh logs

# View specific service logs
./docker-setup.sh logs backend
./docker-setup.sh logs frontend
./docker-setup.sh logs database

# Restart in production mode
./docker-setup.sh restart

# Stop all services
./docker-setup.sh stop

# Clean up everything (removes all data)
./docker-setup.sh clean
```

### Using Docker Compose Directly:

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# View resource usage
docker-compose top

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec database mysql -u root -p

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull
```

## 🏥 Health Checks

The application includes comprehensive health checks:

### Backend Health Check:
```bash
curl http://localhost:8080/actuator/health
```

### Frontend Health Check:
```bash
curl http://localhost/
```

### Database Health Check:
```bash
docker-compose exec database mysqladmin ping -h localhost
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. Port Conflicts
If ports 80, 3000, 8080, or 3307 are already in use:
```bash
# Check what's using the port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Stop the service or change ports in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs database

# Verify database is running
docker-compose exec database mysqladmin ping -h localhost

# Reset database
docker-compose down -v
docker volume rm lib_management_mysql_data
docker-compose up -d
```

#### 3. Frontend Build Issues
```bash
# Clear node_modules and rebuild
docker-compose exec frontend-dev rm -rf node_modules
docker-compose restart frontend-dev

# Check frontend logs
docker-compose logs frontend
```

#### 4. Memory Issues
```bash
# Check container resource usage
docker stats

# Increase Docker Desktop memory limit to 4GB+
# Restart Docker Desktop
```

### Viewing Logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend

# Follow logs since specific time
docker-compose logs -f --since="2025-01-01T00:00:00"
```

## 🚀 Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use `.env` files or external secret management
2. **SSL/HTTPS**: Configure SSL certificates in nginx
3. **Database**: Use external managed database service
4. **Monitoring**: Add application monitoring (Prometheus, Grafana)
5. **Backup**: Implement database backup strategy
6. **Security**: Review and harden security configurations

### Sample .env file:
```env
# Database
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_PASSWORD=your-secure-password

# Backend
SPRING_PROFILES_ACTIVE=production

# Frontend
NODE_ENV=production
```

## 📊 Monitoring

### Container Metrics:
```bash
# Resource usage
docker stats

# System info
docker system df

# Container processes
docker-compose top
```

### Application Metrics:
- Backend health: http://localhost:8080/actuator/health
- Backend info: http://localhost:8080/actuator/info

## 🔄 Updates and Maintenance

### Updating the Application:
```bash
# Pull latest code
git pull

# Rebuild and restart
./docker-setup.sh restart

# Or manually
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Backup:
```bash
# Backup
docker-compose exec database mysqldump -u root -p librarydb > backup.sql

# Restore
docker-compose exec -T database mysql -u root -p librarydb < backup.sql
```

## 📝 Notes

- The development environment includes hot reload for both frontend and backend
- Database data persists between container restarts
- The application uses Spring Security with default credentials (admin/admin)
- Redis is included for future caching needs
- Nginx configuration includes security headers and gzip compression

## 🆘 Support

If you encounter issues:
1. Check the logs: `./docker-setup.sh logs`
2. Verify all containers are running: `./docker-setup.sh status`
3. Try restarting: `./docker-setup.sh restart`
4. Clean and rebuild: `./docker-setup.sh clean` then `./docker-setup.sh prod`
