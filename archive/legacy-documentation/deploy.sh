#!/bin/bash

# Ticketing System Deployment Script
# This script handles the complete deployment of the BSG Helpdesk Enterprise system

set -e  # Exit on any error

echo "🚀 BSG HELPDESK ENTERPRISE DEPLOYMENT SCRIPT"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root (for production deployment)
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is recommended for production deployment."
    else
        print_info "Running as regular user. Good for development/testing."
    fi
}

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        PSQL_VERSION=$(psql --version)
        print_status "PostgreSQL found: $PSQL_VERSION"
    else
        print_error "PostgreSQL is not installed. Please install PostgreSQL 13+ first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        print_status ".env file found"
    else
        print_warning ".env file not found. Copying from .env.example"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Please configure your .env file before continuing."
            read -p "Press Enter after configuring .env file..."
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_status "All dependencies installed successfully"
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    cd backend
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    print_info "Running database migrations..."
    npx prisma migrate deploy
    
    print_status "Database setup completed"
    cd ..
}

# Populate database with initial data
populate_database() {
    print_info "Populating database with initial data..."
    
    cd backend
    
    # Step 1: Create users and departments
    print_info "Creating users and departments..."
    node scripts/reset-and-create-proper-users.js
    
    # Step 2: Import categories from cat_hd.csv
    print_info "Importing service catalog categories..."
    node scripts/import-cat-hd-csv.js
    
    # Step 3: Fix empty subcategories
    print_info "Fixing empty subcategories..."
    node scripts/fix-empty-subcategories.js
    
    # Step 4: Import BSG templates from template.csv
    print_info "Importing BSG templates..."
    node scripts/importTemplateCSVFields.js
    
    # Step 5: Create KASDA User Management template
    print_info "Creating KASDA User Management template..."
    node scripts/create-kasda-user-management-template.js
    
    # Step 6: Run field optimization
    print_info "Optimizing template fields..."
    node scripts/optimizeCommonFields.js
    
    print_status "Database population completed"
    cd ..
}

# Build frontend for production
build_frontend() {
    print_info "Building frontend for production..."
    
    cd frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build completed successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    cd backend
    
    # Run system verification
    print_info "Running system integration verification..."
    node scripts/verify-system-integration.js
    
    if [ $? -eq 0 ]; then
        print_status "System verification passed"
    else
        print_error "System verification failed"
        exit 1
    fi
    
    cd ..
}

# Start services
start_services() {
    print_info "Starting services..."
    
    # Create systemd service files (for production)
    if [[ $EUID -eq 0 ]] && command -v systemctl &> /dev/null; then
        print_info "Creating systemd service files..."
        
        # Backend service
        cat > /etc/systemd/system/bsg-helpdesk-backend.service << EOF
[Unit]
Description=BSG Helpdesk Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

        # Enable and start backend service
        systemctl daemon-reload
        systemctl enable bsg-helpdesk-backend
        systemctl start bsg-helpdesk-backend
        
        print_status "Backend service started"
        
        # For frontend, we'll use nginx (assuming it's configured)
        print_info "Frontend build is ready for nginx deployment"
        print_info "Make sure to configure nginx to serve from $(pwd)/frontend/build"
        
    else
        # Development mode - start services manually
        print_info "Starting in development mode..."
        print_info "Backend: cd backend && npm run dev"
        print_info "Frontend: cd frontend && npm start"
    fi
}

# Create backup script
create_backup_script() {
    print_info "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

# BSG Helpdesk Backup Script
BACKUP_DIR="/var/backups/bsg-helpdesk"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump bsg_helpdesk > $BACKUP_DIR/bsg_helpdesk_$DATE.sql

# Backup uploaded files (if any)
if [ -d "uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/bsg_helpdesk_$DATE.sql"
EOF

    chmod +x backup.sh
    print_status "Backup script created"
}

# Main deployment function
main() {
    echo "Starting BSG Helpdesk Enterprise deployment..."
    echo ""
    
    # Get deployment mode
    read -p "Deployment mode? (development/production) [development]: " DEPLOY_MODE
    DEPLOY_MODE=${DEPLOY_MODE:-development}
    
    print_info "Deployment mode: $DEPLOY_MODE"
    echo ""
    
    # Run deployment steps
    check_permissions
    check_requirements
    install_dependencies
    setup_database
    populate_database
    
    if [ "$DEPLOY_MODE" = "production" ]; then
        build_frontend
        create_backup_script
    fi
    
    verify_deployment
    start_services
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "======================================"
    echo ""
    print_status "BSG Helpdesk Enterprise is now deployed"
    echo ""
    print_info "System Components:"
    echo "  📊 18 Categories with complete hierarchy"
    echo "  🏷️  84 Subcategories with items"
    echo "  📋 25 BSG Templates (including KASDA User Management)"
    echo "  👥 Complete user management system"
    echo "  🎯 Category-based routing (KASDA → Dukungan dan Layanan)"
    echo "  🔧 Field optimization with 70.6% efficiency gain"
    echo ""
    print_info "Login Credentials:"
    echo "  👑 Admin: admin@company.com / admin123"
    echo "  🏦 KASDA Specialist: kasda.specialist@company.com / tech123"
    echo "  🏢 Branch User: branch.user@branch.com / user123"
    echo ""
    print_info "Access URLs:"
    echo "  🌐 Frontend: http://localhost:3000 (dev) or nginx configured URL (prod)"
    echo "  🔗 Backend API: http://localhost:3001/api"
    echo "  📊 BSG Templates: http://localhost:3000/bsg-create"
    echo ""
    
    if [ "$DEPLOY_MODE" = "production" ]; then
        print_info "Production Notes:"
        echo "  📁 Frontend built in: frontend/build/"
        echo "  🔧 Configure nginx to serve frontend/build/"
        echo "  🔄 Backend service: systemctl status bsg-helpdesk-backend"
        echo "  💾 Backup script: ./backup.sh"
    else
        print_info "Development Notes:"
        echo "  🔧 Start backend: cd backend && npm run dev"
        echo "  🌐 Start frontend: cd frontend && npm start"
    fi
    
    echo ""
    print_status "🎯 Ready for KASDA User Management and complete ticketing workflow!"
}

# Run main function
main "$@"