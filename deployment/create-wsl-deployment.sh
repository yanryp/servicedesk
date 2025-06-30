#!/bin/bash
# BSG Helpdesk - WSL Deployment Package Creation Script
# This script creates a complete deployment package for Windows WSL

echo "============================================"
echo "BSG Helpdesk - WSL Deployment Package Creation"
echo "============================================"
echo

# Set directories
SOURCE_DIR=".."
DEPLOY_DIR="./wsl-windows"
PACKAGE_NAME="BSG-Helpdesk-WSL-Windows-$(date +%Y%m%d)"

echo "[INFO] Creating deployment package: $PACKAGE_NAME"
echo

# Ensure deployment directory exists
mkdir -p "$DEPLOY_DIR"

# Copy documentation
echo "[INFO] Copying documentation..."
cp "$SOURCE_DIR/README.md" "$DEPLOY_DIR/README-Original.md" 2>/dev/null || true
cp "$SOURCE_DIR/DEPLOYMENT.md" "$DEPLOY_DIR/DEPLOYMENT-Original.md" 2>/dev/null || true
cp "$SOURCE_DIR/CLAUDE.md" "$DEPLOY_DIR/PROJECT-GUIDE.md" 2>/dev/null || true

# Create backend directory and copy files
echo "[INFO] Copying backend files..."
mkdir -p "$DEPLOY_DIR/backend"
cp -r "$SOURCE_DIR/backend/src" "$DEPLOY_DIR/backend/" 2>/dev/null || true
cp -r "$SOURCE_DIR/backend/prisma" "$DEPLOY_DIR/backend/" 2>/dev/null || true
cp "$SOURCE_DIR/backend/package"*.json "$DEPLOY_DIR/backend/" 2>/dev/null || true
cp "$SOURCE_DIR/backend/tsconfig.json" "$DEPLOY_DIR/backend/" 2>/dev/null || true

# Create frontend directory and copy files
echo "[INFO] Copying frontend files..."
mkdir -p "$DEPLOY_DIR/frontend"
cp -r "$SOURCE_DIR/frontend/src" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp -r "$SOURCE_DIR/frontend/public" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp "$SOURCE_DIR/frontend/package"*.json "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp "$SOURCE_DIR/frontend/tsconfig.json" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp "$SOURCE_DIR/frontend/tailwind.config.js" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp "$SOURCE_DIR/frontend/postcss.config.js" "$DEPLOY_DIR/frontend/" 2>/dev/null || true

# Copy Docker configurations
echo "[INFO] Copying Docker configurations..."
cp "$SOURCE_DIR/docker-compose.yml" "$DEPLOY_DIR/docker-compose.original.yml" 2>/dev/null || true

# Create database directory and copy schema
echo "[INFO] Copying database files..."
mkdir -p "$DEPLOY_DIR/database"
cp "$SOURCE_DIR/backend/prisma/schema.prisma" "$DEPLOY_DIR/database/" 2>/dev/null || true

# Create scripts directory
mkdir -p "$DEPLOY_DIR/scripts"

# Copy any additional scripts
cp "$SOURCE_DIR"/*.md "$DEPLOY_DIR/docs/" 2>/dev/null || true

# Create version info
echo "[INFO] Creating version information..."
cat > "$DEPLOY_DIR/VERSION.txt" << EOF
BSG Helpdesk - WSL Windows Deployment Package
Created: $(date)
Version: 1.0.0
Package: $PACKAGE_NAME

Contents:
- Complete application source code
- WSL-optimized Docker configuration
- Windows deployment scripts
- Comprehensive documentation
- Environment configuration templates

System Requirements:
- Windows 10/11 with WSL2
- Docker Desktop with WSL2 backend
- 8GB RAM minimum (16GB recommended)
- 5GB free disk space

Quick Start:
1. Extract this package to C:\BSG-Helpdesk\
2. Open Command Prompt as Administrator
3. Navigate to the folder: cd C:\BSG-Helpdesk
4. Run: deploy-wsl.bat
5. Follow the prompts for configuration
6. Access the application at http://localhost:3000

For detailed instructions, see README-WSL-Deployment.md
EOF

# Create deployment summary
echo "[INFO] Creating deployment summary..."
cat > "$DEPLOY_DIR/DEPLOYMENT-SUMMARY.md" << 'EOF'
# BSG Helpdesk - WSL Windows Deployment Summary

## Package Contents

### Application Files
- `backend/` - Node.js/Express backend application
- `frontend/` - React frontend application  
- `database/` - PostgreSQL schema and migrations

### Configuration Files
- `docker-compose.wsl.yml` - WSL-optimized Docker configuration
- `.env.template` - Environment configuration template
- `nginx.wsl.conf` - Nginx configuration for frontend

### Deployment Scripts
- `deploy-wsl.bat` - Main deployment script
- `manage-services.bat` - Service management utility
- `start-services.bat` - Quick start script
- `stop-services.bat` - Quick stop script

### Documentation
- `README-WSL-Deployment.md` - Complete deployment guide
- `VERSION.txt` - Package version information
- `PROJECT-GUIDE.md` - Project development guide

## Features Included

### Icon Improvements ✅
- ATM services now use CreditCardIcon (better representation)
- Core Banking/OLIB systems use ServerStackIcon (better than database icons)
- Enhanced category icons for all 7 service categories
- Banking-specific icon mapping with bilingual support

### WSL Optimizations ✅
- Memory-optimized container configurations
- WSL-specific networking settings
- Fast startup and reduced resource usage
- Windows-compatible deployment scripts

### Complete Application ✅
- Full ticketing system with approval workflows
- Service catalog with 24+ banking templates
- User management and role-based access
- Real-time notifications and updates
- Comprehensive reporting and analytics

## Deployment Process

1. **Prerequisites Check** - Verify WSL2 and Docker Desktop
2. **Environment Setup** - Create and configure .env file
3. **Service Deployment** - Build and start all containers
4. **Database Migration** - Run Prisma migrations
5. **Data Seeding** - Optional initial data setup
6. **Health Check** - Verify all services are running

## Default Access

- **Application**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Database**: localhost:5432
- **Admin Login**: admin / admin123

## Support

For deployment issues:
1. Check README-WSL-Deployment.md troubleshooting section
2. Review Docker logs: `docker-compose -f docker-compose.wsl.yml logs`
3. Verify WSL2 and Docker Desktop configuration
EOF

# Create ZIP file
echo "[INFO] Creating ZIP package..."
cd "$(dirname "$DEPLOY_DIR")"
zip -r "${PACKAGE_NAME}.zip" "$(basename "$DEPLOY_DIR")" -x "*/node_modules/*" "*/.git/*" "*/build/*" "*/dist/*"

echo
echo "============================================"
echo "Deployment package created successfully!"
echo "============================================"
echo
echo "Package: ${PACKAGE_NAME}.zip"
echo "Size: $(du -h "${PACKAGE_NAME}.zip" | cut -f1)"
echo "Location: $(pwd)/${PACKAGE_NAME}.zip"
echo
echo "Package contents:"
echo "- Complete BSG Helpdesk application"
echo "- WSL-optimized Docker configuration"
echo "- Windows deployment scripts"
echo "- Comprehensive documentation"
echo "- Icon improvements (ATM & OLIB)"
echo
echo "Ready for deployment to Windows WSL environment!"
echo