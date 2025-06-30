# BSG Helpdesk Database Setup Guide

This guide explains how to set up the complete BSG Helpdesk database with proper seed data.

## 🚨 **Critical Update: New BSG Complete Seed Script**

The original seed script was **severely outdated** and only covered ~20% of the production schema. We've created a new comprehensive seed script that matches the current database schema.

## 📊 **Database Schema Coverage**

| Component | Legacy Seed | New BSG Seed | Status |
|-----------|-------------|--------------|---------|
| **Departments** | ✅ Basic (2) | ✅ Complete (3) | Updated |
| **BSG Branch Network** | ❌ Missing | ✅ 53 Branches | **NEW** |
| **Users with Branch Assignment** | ❌ Basic | ✅ Full BSG Users | **NEW** |
| **Service Catalog System** | ❌ Missing | ✅ Complete | **NEW** |
| **BSG Template System** | ❌ Missing | ✅ Complete | **NEW** |
| **Government Entities** | ❌ Missing | ✅ KASDA Integration | **NEW** |
| **SLA Policies** | ❌ Missing | ✅ Department SLAs | **NEW** |
| **Master Data** | ❌ Missing | ✅ BSG Master Data | **NEW** |
| **Approval Workflow** | ❌ Missing | ✅ Business Reviewers | **NEW** |
| **Legacy Categories** | ✅ Basic | ✅ Backward Compatible | Maintained |

## 🛠️ **Setup Commands**

### **Option 1: Quick BSG Setup (Recommended)**
```bash
# Complete setup: reset database + seed with BSG data
npm run setup:bsg
```

### **Option 2: Manual Step-by-Step**
```bash
# Reset database (WARNING: Deletes all data)
npm run db:reset

# Seed with comprehensive BSG data
npm run db:seed:bsg
```

### **Option 3: Legacy Seed (Minimal)**
```bash
# Use old seed script (not recommended for production)
npm run db:seed:legacy
```

## 🏦 **BSG Branch Network (53 Branches)**

The new seed script creates the complete BSG banking network:

### **CABANG Branches (27 Main Branches)**
- Kantor Cabang Utama (UTAMA)
- Kantor Cabang JAKARTA (JAKARTA)
- Kantor Cabang GORONTALO (GORONTALO)
- Kantor Cabang KOTAMOBAGU (KOTAMOBAGU)
- Kantor Cabang BITUNG (BITUNG)
- Kantor Cabang AIRMADIDI (AIRMADIDI)
- Kantor Cabang TOMOHON (TOMOHON)
- Kantor Cabang TONDANO (TONDANO)
- *[Additional branches as configured]*

### **CAPEM Branches (24 Sub-Branches)**
- Kantor Cabang Pembantu KELAPA GADING
- Kantor Cabang Pembantu TUMINTING
- Kantor Cabang Pembantu WENANG
- Kantor Cabang Pembantu WANEA
- Kantor Cabang Pembantu MALALAYANG
- *[Additional CAPEM branches as configured]*

### **Geographic Distribution**
- **Sulawesi Utara**: 34 branches
- **Gorontalo**: 13 branches  
- **DKI Jakarta**: 4 branches
- **Jawa Timur**: 2 branches

## 👥 **User Accounts Created**

### **System Administration**
- **Admin**: `admin@bsg.co.id` / `password123`
  - Role: admin
  - Access: Full system administration

### **Branch Managers (Business Reviewers)**
- **Utama Manager**: `utama.manager@bsg.co.id` / `password123`
  - Role: manager
  - Unit: Kantor Cabang Utama
  - Authority: Can approve tickets from Utama branch

- **Gorontalo Manager**: `gorontalo.manager@bsg.co.id` / `password123`
  - Role: manager  
  - Unit: Kantor Cabang Gorontalo
  - Authority: Can approve tickets from Gorontalo branch

### **Technicians**
- **IT Technician**: `it.technician@bsg.co.id` / `password123`
  - Role: technician
  - Department: Information Technology
  - Skills: Network infrastructure, Windows Server, VMware

- **Banking Technician**: `banking.tech@bsg.co.id` / `password123`
  - Role: technician
  - Department: Dukungan dan Layanan
  - Skills: OLIBS, BSGDirect, Core Banking, Payment Systems

### **Requesters**
- **Utama User**: `utama.user@bsg.co.id` / `password123`
  - Role: requester
  - Unit: Kantor Cabang Utama
  - Manager: Utama Manager

- **KASDA User**: `kasda.user@bsg.co.id` / `password123`
  - Role: requester
  - Type: Government user (isKasdaUser: true)
  - Department: Dukungan dan Layanan

## 📋 **Service Catalog Structure**

### **1. Information Technology Services**
- Hardware Support
- Network Connectivity
- *Department: IT*

### **2. Banking Support Services**  
- OLIBS Support
- BSGDirect Support
- *Department: Dukungan dan Layanan*

### **3. Government Banking Services**
- KASDA Account Management (requires government approval)
- Government Banking Integration (requires government approval)
- *Department: Dukungan dan Layanan*

## 🏛️ **Government Entities**

### **Provincial Government**
- Pemerintah Provinsi Sulawesi Utara
- Pemerintah Provinsi Gorontalo

### **Municipal Government**
- Pemerintah Kota Manado

## ⏰ **SLA Policies**

### **IT Department**
- **Urgent**: 1h response, 4h resolution
- **High**: 4h response, 24h resolution

### **Support Department**
- **Urgent**: 2h response, 8h resolution  
- **Medium**: 8h response, 48h resolution

## 📊 **Master Data**

### **OLIBS System**
- Program Fasilitas OLIBS
- Aplikasi OLIBS

### **Government Entities**
- Pemerintah Provinsi Sulawesi Utara
- Pemerintah Kota Manado

### **Access Levels**
- Admin
- User

## 🔧 **BSG Template System**

### **Template Categories**
- IT Support Templates
- Banking Operations Templates
- Government Services Templates

### **Field Types**
- Text Input
- Dropdown Selection
- Text Area
- Checkbox
- Number Input

## 📝 **Testing the Setup**

After seeding, verify the setup:

```bash
# Open Prisma Studio to browse data
npm run db:studio
```

**Check these tables have data:**
- ✅ departments (3 entries)
- ✅ units (15+ BSG branches)
- ✅ users (7 test users)
- ✅ service_catalog (3 service categories)
- ✅ service_items (6 service offerings)
- ✅ government_entities (3 government organizations)
- ✅ department_sla_policies (4 SLA rules)
- ✅ bsg_master_data (6+ master data entries)

## 🚀 **Production Deployment**

For production deployment:

```bash
# 1. Run database migrations
npm run db:migrate

# 2. Seed production data
npm run db:seed:bsg

# 3. Start the application
npm run dev
```

## ⚠️ **Important Notes**

1. **Data Loss Warning**: `npm run db:reset` will delete ALL existing data
2. **Production Safety**: Always backup production databases before seeding
3. **Password Security**: Change all default passwords (`password123`) in production
4. **Branch Configuration**: Extend the branch list in the seed script as needed
5. **Master Data**: Add additional master data entries for your specific use case

## 🔍 **Troubleshooting**

### **Seed Script Fails**
```bash
# Check database connection
npm run db:studio

# Try manual reset and seed
cd backend
npx prisma migrate reset --force
npx ts-node scripts/seed-bsg-complete.ts
```

### **Missing Dependencies**
```bash
# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### **TypeScript Errors**
```bash
# Regenerate Prisma client
cd backend
npx prisma generate
```

The new BSG seed script provides a **production-ready foundation** with the complete BSG banking network, proper user hierarchies, service catalog, and approval workflows.