# BSG Helpdesk Test Credentials

This document contains all test user credentials for BSG Helpdesk system testing, including Playwright automation and manual testing.

## Default Password

**All users use the same default password**: `password123`

## Test Users by Role

### 1. ADMIN USERS (1 user)
**System Administrator**
- **Email**: `admin@bsg.co.id`
- **Name**: System Administrator
- **Role**: admin
- **Department**: Information Technology
- **Access**: Full system access, analytics dashboard, user management

### 2. MANAGER USERS (4 users)

**Manager #1: Utama Branch**
- **Email**: `utama.manager@bsg.co.id`
- **Name**: Manager Kantor Cabang Utama
- **Role**: manager
- **Unit**: Kantor Cabang Utama (UTAMA)
- **Department**: Dukungan dan Layanan
- **Access**: Approval dashboard, ticket approval authority

**Manager #2: Gorontalo Branch**
- **Email**: `gorontalo.manager@bsg.co.id`
- **Name**: Manager Kantor Cabang Gorontalo
- **Role**: manager
- **Unit**: Kantor Cabang GORONTALO (GORONTALO)
- **Department**: Dukungan dan Layanan
- **Access**: Approval dashboard, ticket approval authority

**Manager #3: Jakarta Branch**
- **Email**: `jakarta.manager@bsg.co.id`
- **Name**: Jakarta Manager
- **Role**: manager
- **Unit**: Kantor Cabang JAKARTA (JAKARTA)
- **Department**: No Department
- **Access**: Approval dashboard, ticket approval authority

**Manager #4: Cabang Utama (Legacy)**
- **Email**: `cabang.utama.manager@bsg.co.id`
- **Name**: null
- **Role**: manager
- **Unit**: No Unit
- **Department**: Cabang Manado
- **Access**: Approval dashboard, ticket approval authority

### 3. TECHNICIAN USERS (2 users)

**Technician #1: Banking Systems**
- **Email**: `banking.tech@bsg.co.id`
- **Name**: Banking Systems Technician
- **Role**: technician
- **Department**: Dukungan dan Layanan
- **Access**: Technician portal, ticket assignment, BSGDirect/KASDA support

**Technician #2: IT Support**
- **Email**: `it.technician@bsg.co.id`
- **Name**: IT Support Technician
- **Role**: technician
- **Department**: Information Technology
- **Access**: Technician portal, ticket assignment, IT infrastructure support

### 4. REQUESTER USERS (6 users)

**Requester #1: Test Support**
- **Email**: `test.requester@bsg.co.id`
- **Name**: Test Support Requester
- **Role**: requester
- **Unit**: Kantor Cabang Utama (UTAMA)
- **Department**: Dukungan dan Layanan
- **Access**: Customer portal, ticket creation (requires approval)

**Requester #2: Customer Portal Test**
- **Email**: `customer.test@bsg.co.id`
- **Name**: Customer Portal Test
- **Role**: requester
- **Unit**: Kantor Cabang Utama (UTAMA)
- **Department**: No Department
- **Access**: Customer portal, ticket creation (requires approval)

**Requester #3: KASDA User**
- **Email**: `kasda.user@bsg.co.id`
- **Name**: KASDA User Pemerintah
- **Role**: requester
- **Department**: Dukungan dan Layanan
- **Access**: Customer portal, KASDA-specific support requests

**Requester #4: Jakarta Branch User**
- **Email**: `budi.santoso@bsg.co.id`
- **Name**: Budi Santoso
- **Role**: requester
- **Unit**: Kantor Cabang JAKARTA (JAKARTA)
- **Access**: Customer portal, ticket creation (requires approval)

**Requester #5: Cabang Utama User (Legacy)**
- **Email**: `cabang.utama.user@bsg.co.id`
- **Name**: null
- **Role**: requester
- **Department**: Cabang Manado
- **Access**: Customer portal, ticket creation (requires approval)

## Testing Scenarios

### Approval Workflow Testing

**Test 1: Manager Creates Ticket (Should Skip Approval)**
- Login as: `utama.manager@bsg.co.id`
- Expected: Ticket created with status "new" (bypasses approval)
- Workflow: Create → Direct to New → Assignment

**Test 2: Regular User Creates Ticket (Requires Approval)**
- Login as: `test.requester@bsg.co.id`
- Expected: Ticket created with status "pending_approval"
- Workflow: Create → Pending Approval → Manager Approval → New → Assignment

**Test 3: Cross-Branch Approval**
- Create ticket as: `budi.santoso@bsg.co.id` (Jakarta user)
- Approve as: `jakarta.manager@bsg.co.id` (Jakarta manager)
- Expected: Successful branch-based approval workflow

### Service Catalog Testing

**BSGDirect Support Tickets**
- Use: `customer.test@bsg.co.id` or `test.requester@bsg.co.id`
- Service: BSGDirect Support → User Account Management
- Routes to: Dukungan dan Layanan department

**KASDA System Tickets**
- Use: `kasda.user@bsg.co.id`
- Service: KASDA Support → User Account Management
- Routes to: Dukungan dan Layanan department

**IT Infrastructure Tickets**
- Use: `test.requester@bsg.co.id`
- Service: IT Infrastructure → Network Connectivity
- Routes to: Information Technology department

### Analytics Dashboard Testing

**Admin Analytics Access**
- Login as: `admin@bsg.co.id`
- Access: Full analytics dashboard with comprehensive reports
- URL: `/admin/analytics`

**Manager Dashboard Access**
- Login as: `utama.manager@bsg.co.id`
- Access: Approval dashboard (managers don't have analytics access)
- URL: `/manager/approvals`

### Technician Portal Testing

**Banking Technician Portal**
- Login as: `banking.tech@bsg.co.id`
- Access: Technician portal with BSGDirect/KASDA tickets
- URL: `/technician/portal`

**IT Technician Portal**
- Login as: `it.technician@bsg.co.id`
- Access: Technician portal with IT infrastructure tickets
- URL: `/technician/portal`

## Playwright Automation Scripts

### Quick Login Functions
```javascript
// Admin login
async function loginAsAdmin(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'admin@bsg.co.id');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
}

// Manager login
async function loginAsManager(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'utama.manager@bsg.co.id');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
}

// Requester login
async function loginAsRequester(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'test.requester@bsg.co.id');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
}
```

## Role-Based Access Summary

| Role | Users | Primary Access | Key Features |
|------|--------|---------------|--------------|
| Admin | 1 | Full system | Analytics, user management, system config |
| Manager | 4 | Approval dashboard | Ticket approval, branch management |
| Technician | 2 | Technician portal | Ticket assignment, technical work |
| Requester | 6 | Customer portal | Ticket creation, status tracking |

## Branch Coverage

- **Utama Branch**: Manager + Requesters available
- **Gorontalo Branch**: Manager available
- **Jakarta Branch**: Manager + Requester available
- **Multi-branch**: Technicians can serve all branches

## Notes

1. **Password Policy**: All accounts use `password123` for testing
2. **Approval Authority**: Each branch manager can only approve tickets from their unit
3. **Department Routing**: BSGDirect/KASDA → Dukungan dan Layanan, IT → Information Technology
4. **Equal Authority**: CABANG and CAPEM managers have equal approval rights
5. **Cross-Branch**: Department technicians can handle tickets from any branch

## Security Considerations

- Change default passwords in production
- Implement password complexity requirements
- Enable account lockout after failed attempts
- Add multi-factor authentication for admin accounts

---

**Last Updated**: 2025-07-06  
**Total Test Accounts**: 13 users (1 admin, 4 managers, 2 technicians, 6 requesters)