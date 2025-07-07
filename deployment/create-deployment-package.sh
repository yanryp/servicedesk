#!/bin/bash

# BSG Helpdesk Deployment Package Creator
# Creates a complete deployment package for Windows clients

echo "🚀 Creating BSG Helpdesk Deployment Package..."

# Create deployment directory structure
DEPLOY_DIR="bsg-helpdesk-deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"/{frontend,backend,database,docs,scripts}

echo "📁 Created deployment directory: $DEPLOY_DIR"

# Copy frontend (built version)
echo "📦 Packaging frontend..."
cp -r ../frontend/dist/* "$DEPLOY_DIR/frontend/" 2>/dev/null || echo "⚠️  Frontend dist not found - run 'npm run build' first"
cp ../frontend/package.json "$DEPLOY_DIR/frontend/"
cp ../frontend/.env.example "$DEPLOY_DIR/frontend/.env"

# Copy backend
echo "📦 Packaging backend..."
cp -r ../backend/src "$DEPLOY_DIR/backend/"
cp -r ../backend/prisma "$DEPLOY_DIR/backend/"
cp ../backend/package.json "$DEPLOY_DIR/backend/"
cp ../backend/.env.example "$DEPLOY_DIR/backend/.env"
cp ../backend/tsconfig.json "$DEPLOY_DIR/backend/"

# Copy database dump
echo "🗄️  Including database dump..."
cp bsg-helpdesk-db-dump.sql "$DEPLOY_DIR/database/"

# Copy documentation
echo "📚 Including documentation..."
cp ../README.md "$DEPLOY_DIR/docs/"
cp ../CLAUDE.md "$DEPLOY_DIR/docs/"
cp ../TEST-CREDENTIALS.md "$DEPLOY_DIR/docs/" 2>/dev/null || echo "⚠️  TEST-CREDENTIALS.md not found"

# Create deployment scripts
echo "📝 Creating deployment scripts..."

# Windows deployment script
cat > "$DEPLOY_DIR/scripts/deploy-windows.bat" << 'EOF'
@echo off
echo Starting BSG Helpdesk Deployment for Windows...

echo Installing Node.js dependencies...
cd backend
call npm install
cd ../frontend
call npm install

echo Setting up database...
echo Please ensure PostgreSQL is installed and running
echo Run the following commands in PostgreSQL:
echo 1. CREATE DATABASE ticketing_system_db;
echo 2. Run the database dump: psql -U postgres -d ticketing_system_db -f ../database/bsg-helpdesk-db-dump.sql

echo Starting services...
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000

pause
EOF

# Linux/macOS deployment script
cat > "$DEPLOY_DIR/scripts/deploy-unix.sh" << 'EOF'
#!/bin/bash
echo "🚀 Starting BSG Helpdesk Deployment for Unix/Linux/macOS..."

echo "📦 Installing Node.js dependencies..."
cd backend && npm install
cd ../frontend && npm install

echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is installed and running"
echo "Run the following commands:"
echo "1. createdb ticketing_system_db"
echo "2. psql -d ticketing_system_db -f ../database/bsg-helpdesk-db-dump.sql"

echo "🔧 Generating Prisma client..."
cd ../backend && npx prisma generate

echo "🚀 Starting services..."
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:3000"

read -p "Press Enter to continue..."
EOF

chmod +x "$DEPLOY_DIR/scripts/deploy-unix.sh"

# Create README for deployment
cat > "$DEPLOY_DIR/README-DEPLOYMENT.md" << 'EOF'
# BSG Helpdesk Deployment Package

## 🚀 Quick Start

### Windows Users:
1. Ensure Node.js (v18+) and PostgreSQL are installed
2. Run `scripts/deploy-windows.bat`
3. Follow the on-screen instructions

### Linux/macOS Users:
1. Ensure Node.js (v18+) and PostgreSQL are installed
2. Run `scripts/deploy-unix.sh`
3. Follow the on-screen instructions

## 📁 Package Contents

- **frontend/**: React frontend application
- **backend/**: Node.js backend API
- **database/**: PostgreSQL database dump with sample data
- **docs/**: Complete documentation and user credentials
- **scripts/**: Deployment automation scripts

## 🔧 Manual Setup

### 1. Database Setup
```bash
# Create database
createdb ticketing_system_db

# Import data
psql -d ticketing_system_db -f database/bsg-helpdesk-db-dump.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm start
```

## 🔑 Default Credentials

See `docs/TEST-CREDENTIALS.md` for complete user accounts.

**Quick Access:**
- Admin: `admin@bsg.co.id` / `password123`
- Manager: `utama.manager@bsg.co.id` / `password123`
- Technician: `banking.tech@bsg.co.id` / `password123`

## 🏦 Features Included

✅ Complete BSG Banking Branch Network (53 branches)
✅ 159 Realistic Indonesian Users
✅ Comprehensive Service Catalog (221 services)
✅ Advanced Approval Workflows
✅ Real-time Analytics Dashboard
✅ Technician Self-Service Portal
✅ Knowledge Base System
✅ Multi-language Support

## 📞 Support

For technical support, refer to the documentation in the `docs/` folder.
EOF

# Create version info
cat > "$DEPLOY_DIR/VERSION.txt" << EOF
BSG Helpdesk System - Deployment Package
Version: $(date +%Y.%m.%d)
Build Date: $(date)
Database Records: $(grep -c "INSERT INTO" bsg-helpdesk-db-dump.sql || echo "N/A")
Git Commit: $(cd .. && git rev-parse --short HEAD 2>/dev/null || echo "N/A")

Features:
- Complete BSG branch network implementation
- Advanced service catalog with 221 services
- Technician portal with comprehensive functionality
- Real-time analytics and reporting
- Knowledge base system
- Multi-role authentication system

Components:
- Frontend: React 18+ with TypeScript
- Backend: Node.js with Express and Prisma ORM
- Database: PostgreSQL with complete sample data
- Authentication: JWT-based with role-based access control
EOF

# Create the zip file
echo "🗜️  Creating deployment zip file..."
zip -r "${DEPLOY_DIR}.zip" "$DEPLOY_DIR" -x "*.DS_Store*" "*/node_modules/*" "*/.git/*"

# Clean up
rm -rf "$DEPLOY_DIR"

echo "✅ Deployment package created: ${DEPLOY_DIR}.zip"
echo "📊 Package size: $(du -h "${DEPLOY_DIR}.zip" | cut -f1)"
echo "🎯 Ready for deployment to Windows clients!"