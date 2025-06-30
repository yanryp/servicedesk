# BSG Helpdesk - WSL Windows Deployment Guide

## Overview

This deployment package is specifically designed for Windows Subsystem for Linux (WSL) environments, providing an optimized setup for running the BSG Helpdesk system on Windows machines.

## Prerequisites

### System Requirements
- **Windows 10 version 1903** or higher with WSL2 enabled
- **Docker Desktop for Windows** with WSL2 backend
- **Minimum 8GB RAM** (16GB recommended)
- **5GB free disk space** (10GB recommended)

### Software Requirements
1. **WSL2** - Windows Subsystem for Linux 2
2. **Docker Desktop** - With WSL2 integration enabled
3. **Git for Windows** (optional, for updates)

## Quick Start

### 1. Enable WSL2 (if not already enabled)

Open PowerShell as Administrator and run:
```powershell
wsl --install
```

Or manually:
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Restart your computer, then set WSL2 as default:
```powershell
wsl --set-default-version 2
```

### 2. Install Docker Desktop

1. Download Docker Desktop from [docker.com](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
2. Install with WSL2 backend enabled
3. Start Docker Desktop
4. Ensure WSL integration is enabled in Docker settings

### 3. Deploy BSG Helpdesk

1. Extract the deployment package to a folder (e.g., `C:\BSG-Helpdesk`)
2. Open Command Prompt as Administrator
3. Navigate to the deployment folder
4. Run the deployment script:

```cmd
cd C:\BSG-Helpdesk
deploy-wsl.bat
```

### 4. Initial Configuration

The deployment script will:
- Create a `.env` file from the template
- Prompt you to configure settings
- Build and start all services
- Run database migrations
- Optionally seed initial data

## Configuration

### Environment Variables

Edit the `.env` file created during deployment:

```env
# Database
POSTGRES_PASSWORD=YourSecurePassword123!

# JWT Security
JWT_SECRET=YourVerySecureJWTSecret

# Email (Optional)
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
```

### Database Configuration

The system uses PostgreSQL with these default settings:
- **Host**: localhost
- **Port**: 5432
- **Database**: ticketing_system_db
- **Username**: helpdesk_user

### Default Admin Account

After deployment, login with:
- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default password immediately after first login!

## Service Management

### Starting Services
```cmd
docker-compose -f docker-compose.wsl.yml up -d
```

### Stopping Services
```cmd
docker-compose -f docker-compose.wsl.yml down
```

### Viewing Logs
```cmd
docker-compose -f docker-compose.wsl.yml logs -f
```

### Restarting Services
```cmd
docker-compose -f docker-compose.wsl.yml restart
```

## Accessing the Application

Once deployed, access the system at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432 (for external tools)

## WSL-Specific Optimizations

This deployment includes several WSL-optimized configurations:

### Resource Limits
- **PostgreSQL**: 512MB RAM limit
- **Redis**: 128MB RAM limit
- **Backend**: 1GB RAM limit
- **Frontend**: 512MB RAM limit

### Network Configuration
- Optimized MTU size (1460) for WSL networking
- Automatic WSL host IP detection
- Container-to-container communication optimization

### Performance Tuning
- Reduced memory usage for development environments
- Optimized Docker layer caching
- Fast startup times

## Troubleshooting

### Common Issues

#### 1. Docker Not Starting
```
Error: Docker is not running or not installed.
```
**Solution**: 
- Ensure Docker Desktop is installed and running
- Check Docker Desktop settings for WSL2 integration

#### 2. Port Already in Use
```
Error: Port 3000 is already allocated
```
**Solution**:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

#### 3. Database Connection Failed
```
Error: Database connection failed
```
**Solution**:
- Check if PostgreSQL container is running: `docker ps`
- Verify database credentials in `.env` file
- Restart database service: `docker-compose restart postgres`

#### 4. WSL Memory Issues
If experiencing high memory usage:

Create or edit `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Then restart WSL:
```cmd
wsl --shutdown
```

### Log Locations

- **Application Logs**: `./backend/logs/`
- **Docker Logs**: `docker-compose logs [service-name]`
- **WSL Logs**: Windows Event Viewer → Applications and Services Logs

## Updates and Maintenance

### Updating the Application
1. Stop services: `docker-compose -f docker-compose.wsl.yml down`
2. Extract new deployment package
3. Backup your `.env` file
4. Run deployment script again

### Database Backup
```cmd
docker-compose exec postgres pg_dump -U helpdesk_user ticketing_system_db > backup.sql
```

### Database Restore
```cmd
docker-compose exec -T postgres psql -U helpdesk_user ticketing_system_db < backup.sql
```

## Security Considerations

### Network Security
- Services are bound to localhost only
- Use Windows Firewall to restrict access if needed
- Consider VPN for remote access

### Data Security
- Change default passwords immediately
- Use strong JWT secrets
- Enable HTTPS in production environments
- Regularly backup database

## Performance Monitoring

### Resource Usage
Monitor system resources:
```cmd
docker stats
```

### Service Health
Check service health:
```cmd
docker-compose -f docker-compose.wsl.yml ps
```

## Support and Documentation

### Additional Resources
- **Main Documentation**: See included documentation files
- **API Documentation**: http://localhost:3001/api/docs (when running)
- **WSL Documentation**: https://docs.microsoft.com/en-us/windows/wsl/
- **Docker Documentation**: https://docs.docker.com/desktop/windows/wsl/

### Getting Help
1. Check the troubleshooting section above
2. Review Docker and WSL logs
3. Ensure all prerequisites are met
4. Check GitHub issues for known problems

## License and Credits

BSG Helpdesk - Enterprise Ticketing System
Designed for banking and financial institutions
Built with React, Node.js, PostgreSQL, and Docker