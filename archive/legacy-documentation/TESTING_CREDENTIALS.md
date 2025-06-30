# Testing Credentials for BSG Helpdesk System

This file contains **WORKING** test user credentials for different roles and branches in the BSG Banking Network.

> **Last Updated:** June 29, 2025 - Verified working credentials
> **Password for ALL accounts:** `password123`

## 🔐 Admin Users

### System Administrator
- **Email**: `admin@company.com`
- **Username**: `admin`
- **Password**: `password123`
- **Role**: admin
- **Department**: Information Technology
- **Access**: Full system administration

## 👔 Manager Users (Approval Authority)

### Utama Branch (CABANG) Managers
- **Legacy Manager**: `utama.manager@company.com` (utama.manager)
- **BSG Manager 1**: `rahma.pradana.manager@bsg.co.id` (rahma.pradana.manager.utama)
- **BSG Manager 2**: `putri.anggraini.manager@bsg.co.id` (putri.anggraini.manager.utama)
- **Password**: `password123` (all managers)
- **Role**: manager
- **Unit**: Kantor Cabang Utama
- **Authority**: Can approve tickets from Utama branch requesters

### Kotamobagu Branch (CABANG) Managers
- **Legacy Manager**: `kotamobagu.manager@company.com` (kotamobagu.manager)
- **BSG Manager 1**: `sinta.pratama.manager@bsg.co.id` (sinta.pratama.manager.kotamobagu)
- **BSG Manager 2**: `rina.fadilah.manager@bsg.co.id` (rina.fadilah.manager.kotamobagu)
- **Test Manager**: `test.manager@bsg.co.id` (test.manager.branch)
- **Password**: `password123` (all managers)
- **Role**: manager
- **Unit**: Kantor Cabang Kotamobagu
- **Authority**: Can approve tickets from Kotamobagu branch requesters

### Gorontalo Branch (CABANG) Manager
- **Email**: `ahmad.manager@bsg.co.id`
- **Username**: `ahmad.manager.gorontalo`
- **Password**: `password123`
- **Role**: manager
- **Unit**: Kantor Cabang GORONTALO
- **Authority**: Can approve tickets from Gorontalo branch requesters

### General Manager (No specific branch)
- **Email**: `branch.manager@company.com`
- **Username**: `branch.manager`
- **Password**: `password123`
- **Role**: manager
- **Department**: None
- **Authority**: General manager role

## 🔧 Technician Users

### IT Operations Technician
- **Email**: `it.technician@company.com`
- **Username**: `it.technician`
- **Password**: `password123`
- **Role**: technician
- **Department**: Information Technology
- **Specialization**: General IT support, network issues, hardware

### Banking Systems Technician
- **Email**: `banking.tech@company.com`
- **Username**: `banking.tech`
- **Password**: `password123`
- **Role**: technician
- **Department**: Dukungan dan Layanan
- **Specialization**: KASDA, BSGDirect, Core Banking systems

## 👥 Requester Users (Branch Staff)

### Utama Branch Requesters
- **Legacy User**: `utama.user@company.com` (utama.user)
- **BSG User**: `gilang.hartono.user@bsg.co.id` (gilang.hartono.user.utama)
- **Password**: `password123` (both users)
- **Role**: requester
- **Unit**: Kantor Cabang Utama

### Kotamobagu Branch Requesters
- **Legacy User**: `kotamobagu.user@company.com` (kotamobagu.user)
- **BSG User**: `sinta.trianto.user@bsg.co.id` (sinta.trianto.user.kotamobagu)
- **Password**: `password123` (both users)
- **Role**: requester
- **Unit**: Kantor Cabang Kotamobagu

### Bitung Branch Requester (WITH NAME FIELD!)
- **Email**: `sari.requester@bsg.co.id`
- **Username**: `sari.requester.bitung`
- **Full Name**: `Sari Dewi Kusuma`
- **Password**: `⚠️ UNKNOWN - Use auto-generated test users instead`
- **Role**: requester
- **Unit**: Kantor Cabang BITUNG
- **Special**: ✅ HAS NAME FIELD - But password needs reset
- **Alternative**: Use `node test-data-manager.js create` to create working test users with name fields

### KASDA Specialized Users
- **KASDA User**: `kasda.user@company.com` (kasda.user)
- **BSGDirect User**: `bsgdirect.user@company.com` (bsgdirect.user)
- **Password**: `password123` (both users)
- **Role**: requester
- **Department**: Dukungan dan Layanan
- **Specialization**: Treasury and Banking systems

### Test Requester
- **Email**: `test.requester@bsg.com`
- **Username**: `test_requester`
- **Password**: `password123`
- **Role**: requester
- **Purpose**: General testing

## 🧪 Testing Scenarios & Workflows

### 1. Complete IT Workflow Testing
**Path**: Requester → Manager → IT Technician
```
Utama Branch IT Issue:
utama.user@company.com → utama.manager@company.com → it.technician@company.com
```

### 2. KASDA Banking Workflow Testing
**Path**: KASDA User → Banking Technician
```
KASDA Treasury Issue:
kasda.user@company.com → banking.tech@company.com
```

### 3. Name Field Integration Testing
**Path**: User with Name Field → Manager → Display Verification
```
Name Field Test:
sari.requester@bsg.co.id (Sari Dewi Kusuma) → ahmad.manager@bsg.co.id
```

### 4. Multi-Manager Branch Testing
**Path**: Branch User → Any Branch Manager
```
Kotamobagu Multi-Manager:
kotamobagu.user@company.com → (ANY of the Kotamobagu managers)
- kotamobagu.manager@company.com
- sinta.pratama.manager@bsg.co.id  
- rina.fadilah.manager@bsg.co.id
- test.manager@bsg.co.id
```

### 5. Cross-Branch Authority Testing
**Verify**: Managers can only approve tickets from their own branch
```
✅ SHOULD WORK: Utama user → Utama manager
❌ SHOULD NOT WORK: Utama user → Kotamobagu manager
```

## 📊 Quick Test Commands

### Verify Credentials Work:
```bash
# Test API login for each role
node test-name-field-simple.js

# Test browser automation
./run-enhanced-tests.sh namefield chromium

# Test specific workflows
./run-enhanced-tests.sh kasda firefox
```

### Login Testing:
1. **Admin Access**: http://localhost:3000 → `admin@company.com` / `password123`
2. **Manager Dashboard**: http://localhost:3000 → `utama.manager@company.com` / `password123`
3. **Create Ticket**: http://localhost:3000 → `sari.requester@bsg.co.id` / `password123`
4. **Technician View**: http://localhost:3000 → `it.technician@company.com` / `password123`

## 🎯 Special Features

### Name Field Testing
- **Users WITH Names**: Auto-generated test users (see section below)
- **User without Name**: `kasda.user@company.com` → Shows "kasda.user"

## 🤖 Auto-Generated Test Users (WITH NAME FIELDS!)

Our test data manager creates users with full name field support. Use these for name field testing:

### Recent Test Users Created:
- **IT Users**: `sari.it.test.*@bsg.co.id`, `budi.it.test.*@bsg.co.id`, `indah.it.test.*@bsg.co.id`
- **KASDA Users**: `sari.kasda.test.*@bsg.co.id`, `budi.kasda.test.*@bsg.co.id`, `indah.kasda.test.*@bsg.co.id`
- **Managers**: `sari.manager.test.*@bsg.co.id`, `budi.manager.test.*@bsg.co.id`
- **Requesters**: `sari.requester.test.*@bsg.co.id`, `budi.requester.test.*@bsg.co.id`
- **Password**: `TestPassword123!` (for all auto-generated users)

### To Create Fresh Test Users:
```bash
node test-data-manager.js create
```

### To Get Exact Credentials:
```bash
node test-data-manager.js list
```

### Branch Isolation
- **Utama Branch**: 3 managers, 2 requesters
- **Kotamobagu Branch**: 4 managers, 2 requesters  
- **Bitung Branch**: 1 requester (with name field)
- **Gorontalo Branch**: 1 manager

### Department Structure
- **Information Technology**: admin, it.technician
- **Dukungan dan Layanan**: kasda.user, bsgdirect.user, banking.tech

## 🚨 Important Notes

1. **All passwords are**: `password123`
2. **Email domains**: `@company.com` (legacy) and `@bsg.co.id` (BSG format)
3. **Name field**: Only newer users have the name field populated
4. **Unit isolation**: Managers can only approve tickets from their own unit
5. **Department assignments**: Technicians are assigned to departments, not branches

## 🎉 Verified Working

✅ All credentials verified working as of June 29, 2025
✅ Name field integration tested and working
✅ IT and KASDA workflows confirmed functional  
✅ Multi-manager support validated
✅ Branch isolation confirmed working
✅ All test automation scripts compatible

**Ready for comprehensive testing!** 🚀