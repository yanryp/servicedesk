# BSG Helpdesk - Deployment Guide

## 🚀 Deployment Overview

BSG Helpdesk is an enterprise ticketing system with department-based access control, designed to replace ManageEngine ServiceDesk Plus with unlimited technician support.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher (for session management and caching)
- **Docker** (optional): For containerized deployment
- **Git**: For source code management

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Production**: 8+ CPU cores, 16GB+ RAM, 100GB+ storage

## 🛠️ Installation Methods

### Method 1: Direct Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yanryp/servicedesk.git
cd servicedesk
```

#### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### 3. Database Setup
```bash
# Create PostgreSQL database
createdb ticketing_system_db

# Run Prisma migrations
cd ../backend
npx prisma migrate deploy
npx prisma generate

# Seed initial data (optional)
npm run db:seed
```

#### 4. Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment (if needed)
cp frontend/.env.example frontend/.env
```

#### 5. Build Applications
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

#### 6. Start Services
```bash
# Start backend (production)
cd backend
npm start

# Serve frontend (using serve or nginx)
cd ../frontend
npx serve -s build -p 3000
```

### Method 2: Docker Deployment

#### 1. Using Docker Compose
```bash
# Clone repository
git clone https://github.com/yanryp/servicedesk.git
cd servicedesk

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
```

#### 2. Individual Docker Containers
```bash
# Build backend image
cd backend
docker build -t bsg-helpdesk-backend .

# Build frontend image
cd ../frontend
docker build -t bsg-helpdesk-frontend .

# Run containers
docker run -d --name bsg-backend -p 3001:3001 bsg-helpdesk-backend
docker run -d --name bsg-frontend -p 3000:3000 bsg-helpdesk-frontend
```

## 🔧 Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ticketing_system_db"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="1h"

# Server Configuration
PORT=3001
NODE_ENV="production"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@company.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="BSG Helpdesk <noreply@company.com>"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH="uploads/"

# Application URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"

# Security
CORS_ORIGINS="http://localhost:3000,https://helpdesk.company.com"
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
# API Configuration
REACT_APP_API_URL="http://localhost:3001/api"

# Application Configuration
REACT_APP_APP_NAME="BSG Helpdesk"
REACT_APP_COMPANY_NAME="BSG Company"

# Feature Flags
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Docker Environment Variables

Create `.env` file in root directory:

```env
# Application
APP_NAME="BSG Helpdesk"
APP_VERSION="1.0.0"

# Database
POSTGRES_DB=ticketing_system_db
POSTGRES_USER=helpdesk_user
POSTGRES_PASSWORD=secure_password_here
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

# Backend
BACKEND_PORT=3001
JWT_SECRET="your-super-secure-jwt-secret-for-production"

# Frontend
FRONTEND_PORT=3000

# Redis
REDIS_PORT=6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
```

## 🗄️ Database Migration

### Initial Setup
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial departments and admin user
npm run db:seed
```

### Creating Migrations
```bash
# After schema changes
npx prisma migrate dev --name your_migration_name

# For production
npx prisma migrate deploy
```

## 🌐 Web Server Configuration

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/bsg-helpdesk
server {
    listen 80;
    server_name helpdesk.company.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name helpdesk.company.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Frontend (React build)
    location / {
        root /var/www/bsg-helpdesk/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        root /var/www/bsg-helpdesk/backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName helpdesk.company.com
    Redirect permanent / https://helpdesk.company.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName helpdesk.company.com
    
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    
    DocumentRoot /var/www/bsg-helpdesk/frontend/build
    
    <Directory "/var/www/bsg-helpdesk/frontend/build">
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
    
    ProxyRequests Off
    ProxyPass /api/ http://localhost:3001/
    ProxyPassReverse /api/ http://localhost:3001/
</VirtualHost>
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Using Let's Encrypt
sudo certbot --nginx -d helpdesk.company.com

# Or using custom certificates
sudo mkdir -p /etc/ssl/bsg-helpdesk
sudo cp your-certificate.crt /etc/ssl/bsg-helpdesk/
sudo cp your-private.key /etc/ssl/bsg-helpdesk/
```

### Firewall Configuration
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (if needed)
sudo ufw allow 22

# Database (restrict to localhost)
sudo ufw deny 5432

# Enable firewall
sudo ufw enable
```

## 📊 Monitoring & Logging

### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start dist/index.js --name "bsg-helpdesk-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Log Management
```bash
# Backend logs
tail -f backend/logs/app.log

# PM2 logs
pm2 logs bsg-helpdesk-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔧 Maintenance

### Database Backup
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/var/backups/bsg-helpdesk"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump ticketing_system_db > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Application Updates
```bash
# 1. Backup database
./backup-database.sh

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Run migrations
cd backend && npx prisma migrate deploy

# 5. Build applications
npm run build

# 6. Restart services
pm2 restart bsg-helpdesk-backend
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U username -d ticketing_system_db
```

#### Email Sending Issues
```bash
# Test SMTP configuration
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'your-email', pass: 'your-password' }
});
transport.verify(console.log);
"
```

#### File Upload Problems
```bash
# Check upload directory permissions
chmod 755 backend/uploads
chown www-data:www-data backend/uploads
```

## 📞 Support

For deployment issues or questions:
- Create an issue on [GitHub Repository](https://github.com/yanryp/servicedesk/issues)
- Check the troubleshooting section above
- Review application logs for error details

## 🔄 Scaling

### Horizontal Scaling
- Use load balancer (nginx/HAProxy) for multiple backend instances
- Implement Redis for session storage across instances
- Use CDN for static assets
- Database read replicas for better performance

### Performance Optimization
- Enable Redis caching
- Optimize database queries
- Compress static assets
- Implement proper logging levels in production