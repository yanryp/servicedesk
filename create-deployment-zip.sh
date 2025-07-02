#!/bin/bash

# BSG Enterprise Ticketing System - Deployment Package Creator
# Creates a production-ready ZIP file for deployment

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                    BSG ENTERPRISE TICKETING SYSTEM                                  ║"
echo "║                        Production Deployment Package                                ║"
echo "║                                Version 1.0                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Package info
PACKAGE_NAME="bsg-helpdesk-production-v1.0"
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
PACKAGE_DIR="${PACKAGE_NAME}"
ZIP_FILE="${PACKAGE_NAME}-${TIMESTAMP}.zip"

log "Creating deployment package: $ZIP_FILE"

# Clean up any existing package directory
if [ -d "$PACKAGE_DIR" ]; then
    rm -rf "$PACKAGE_DIR"
fi

# Create package directory
mkdir -p "$PACKAGE_DIR"

info "Copying core application files..."

# Copy essential files
cp -r frontend "$PACKAGE_DIR/"
cp -r backend "$PACKAGE_DIR/"
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/"
cp .env.example "$PACKAGE_DIR/"
cp DEPLOYMENT.md "$PACKAGE_DIR/"
cp deploy.sh "$PACKAGE_DIR/"
cp CLAUDE.md "$PACKAGE_DIR/"

# Copy documentation
if [ -d "docs" ]; then
    cp -r docs "$PACKAGE_DIR/"
fi

# Create deployment-specific files
log "Creating deployment-specific files..."

# Create README for deployment
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# BSG Enterprise Ticketing System - Production Deployment

## 🚀 Quick Start

1. **Extract & Setup**:
   ```bash
   unzip bsg-helpdesk-production-v1.0-*.zip
   cd bsg-helpdesk-production-v1.0
   ```

2. **Automated Deployment**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access System**:
   - URL: http://localhost:3000
   - Admin: admin@bsg.co.id / password123

## 📋 What's Included

✅ **Complete SLA Workflow** - Approval-based timer with business hours
✅ **53 BSG Branch Network** - Complete banking infrastructure  
✅ **159 Indonesian Users** - Realistic production data
✅ **Enterprise Service Catalog** - 24+ banking templates
✅ **Advanced Reporting** - Real-time SLA analytics
✅ **Role-Based Access** - Admin/Manager/Technician/User roles

## 🔧 Manual Setup (Alternative)

If automated deployment fails:

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:setup
npm run db:seed:production

# 4. Start system
npm run dev
```

## 📚 Documentation

- **Deployment Guide**: `./DEPLOYMENT.md`
- **System Overview**: `./CLAUDE.md`
- **User Manual**: `./docs/USER_GUIDE.md`

## 🔐 Security

**IMPORTANT**: Change all default passwords immediately after deployment!

- Admin: admin@bsg.co.id
- Manager: utama.manager@bsg.co.id  
- Technician: it.technician@bsg.co.id
- User: utama.user@bsg.co.id

Default password for all: `password123`

## 📞 Support

For technical support and questions:
- Email: support@bsg.co.id
- Documentation: See DEPLOYMENT.md

---

**BSG Enterprise Ticketing System v1.0**  
*Production-Ready Enterprise Solution*
EOF

# Create VERSION file
cat > "$PACKAGE_DIR/VERSION.txt" << EOF
BSG Enterprise Ticketing System
Version: 1.0.0
Build Date: $(date +'%Y-%m-%d %H:%M:%S %Z')
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Branch: $(git branch --show-current 2>/dev/null || echo "Unknown")

Features Included:
- Complete SLA Workflow with Business Hours
- 53 BSG Branch Network Integration
- 159 Indonesian Users with Realistic Data
- Enterprise Service Catalog (24+ Templates)
- Role-Based Access Control System
- Real-time Approval Workflow
- Comprehensive Reporting Dashboard
- Production-Ready Deployment Scripts

Package Contents:
- Frontend Application (React + TypeScript)
- Backend API (Node.js + Express + Prisma)
- Database Schema and Migrations
- Production Seed Data (BSG Banking Network)
- Automated Deployment Scripts
- Comprehensive Documentation

System Requirements:
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional)
- 4GB RAM minimum
- 10GB disk space

Support: support@bsg.co.id
EOF

# Remove development-only files from package
log "Cleaning up development files..."

# Remove node_modules
find "$PACKAGE_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove development caches and logs
find "$PACKAGE_DIR" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.log" -type f -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name ".DS_Store" -type f -delete 2>/dev/null || true

# Remove sensitive files
rm -f "$PACKAGE_DIR/.env" 2>/dev/null || true
rm -f "$PACKAGE_DIR/backend/.env" 2>/dev/null || true

# Remove test files and results
rm -rf "$PACKAGE_DIR/test-results" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/e2e-tests" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/playwright-report" 2>/dev/null || true

# Remove development scripts that aren't needed in production
rm -rf "$PACKAGE_DIR/backend/scripts" 2>/dev/null || true

# Create simplified scripts directory with only production essentials
mkdir -p "$PACKAGE_DIR/backend/scripts"
cp backend/scripts/seed-production-data.ts "$PACKAGE_DIR/backend/scripts/" 2>/dev/null || true
cp backend/scripts/create-admin.ts "$PACKAGE_DIR/backend/scripts/" 2>/dev/null || true

# Make scripts executable
chmod +x "$PACKAGE_DIR/deploy.sh"

# Create the ZIP file
log "Creating ZIP package..."
zip -r "$ZIP_FILE" "$PACKAGE_DIR" -x "*.DS_Store" "*/node_modules/*" "*/.git/*" "*/test-results/*"

# Clean up temporary directory
rm -rf "$PACKAGE_DIR"

# Get file size
FILE_SIZE=$(ls -lh "$ZIP_FILE" | awk '{print $5}')

log "Deployment package created successfully!"
echo ""
info "📦 Package Details:"
echo "  File: $ZIP_FILE"
echo "  Size: $FILE_SIZE"
echo "  Location: $(pwd)/$ZIP_FILE"
echo ""

info "📋 Package Contents:"
echo "  ✅ Complete application source code"
echo "  ✅ Production database schema and migrations"
echo "  ✅ BSG branch network and user data"
echo "  ✅ Enterprise service catalog templates"
echo "  ✅ Automated deployment scripts"
echo "  ✅ Comprehensive documentation"
echo "  ✅ Environment configuration templates"
echo ""

info "🚀 Deployment Instructions:"
echo "  1. Transfer $ZIP_FILE to production server"
echo "  2. Extract: unzip $ZIP_FILE"
echo "  3. Deploy: cd $PACKAGE_NAME && ./deploy.sh"
echo "  4. Access: http://localhost:3000"
echo ""

warn "🔐 Security Reminders:"
echo "  - Change all default passwords immediately"
echo "  - Configure SMTP for email notifications"
echo "  - Set up SSL/TLS certificates"
echo "  - Review firewall and security settings"
echo ""

log "BSG Enterprise Ticketing System deployment package ready!"
echo "Package: $ZIP_FILE"