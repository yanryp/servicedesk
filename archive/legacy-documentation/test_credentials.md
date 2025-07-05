# Test User Credentials

Here is a list of the test users and their credentials for this application, as defined in the current database.

**Note**: All users have the default password `password123` unless specified otherwise.

## Current Test Users (Updated: July 2025)

### Administrative Users

| Role               | Email                           | Username                | Department               | Unit                     | Business Reviewer |
| ------------------ | ------------------------------- | ----------------------- | ------------------------ | ------------------------ | ----------------- |
| **Admin**          | `admin@bsg.co.id`              | `admin`                 | Information Technology   | No Unit                  | No                |

### Managers (Business Reviewers)

| Role               | Email                           | Username                | Department               | Unit                     | Business Reviewer |
| ------------------ | ------------------------------- | ----------------------- | ------------------------ | ------------------------ | ----------------- |
| **Branch Manager** | `utama.manager@bsg.co.id`      | `utama.manager`         | Dukungan dan Layanan     | Kantor Cabang Utama      | ✅ Yes            |
| **Branch Manager** | `gorontalo.manager@bsg.co.id`  | `gorontalo.manager`     | Dukungan dan Layanan     | Kantor Cabang GORONTALO  | ✅ Yes            |
| **Branch Manager** | `jakarta.manager@bsg.co.id`    | `jakarta.manager`       | No Department            | Kantor Cabang JAKARTA    | ✅ Yes            |
| **Branch Manager** | `cabang.utama.manager@bsg.co.id` | `cabang.utama.manager` | Cabang Manado           | No Unit                  | No                |

### Technicians

| Role               | Email                           | Username                | Department               | Unit                     | Business Reviewer |
| ------------------ | ------------------------------- | ----------------------- | ------------------------ | ------------------------ | ----------------- |
| **IT Technician**  | `it.technician@bsg.co.id`      | `it.technician`         | Information Technology   | No Unit                  | No                |
| **Banking Tech**   | `banking.tech@bsg.co.id`       | `banking.tech`          | Dukungan dan Layanan     | No Unit                  | No                |

### Requesters/End Users

| Role               | Email                           | Username                | Department               | Unit                     | Business Reviewer |
| ------------------ | ------------------------------- | ----------------------- | ------------------------ | ------------------------ | ----------------- |
| **Branch User**    | `utama.user@bsg.co.id`         | `utama.user`            | Dukungan dan Layanan     | Kantor Cabang Utama      | No                |
| **KASDA User**     | `kasda.user@bsg.co.id`         | `kasda.user`            | Dukungan dan Layanan     | No Unit                  | No                |
| **Test Requester** | `test.requester@bsg.co.id`     | `test.requester.support`| Dukungan dan Layanan     | Kantor Cabang Utama      | No                |
| **Jakarta User**   | `budi.santoso@bsg.co.id`       | `budi.santoso`          | No Department            | Kantor Cabang JAKARTA    | No                |
| **Customer Test**  | `customer.test@bsg.co.id`      | `customer.test`         | No Department            | Kantor Cabang Utama      | No                |
| **Cabang User**    | `cabang.utama.user@bsg.co.id`  | `cabang.utama.user`     | Cabang Manado           | No Unit                  | No                |

## Usage Guidelines

### For Testing Customer Portal
- **Primary Test User**: `test.requester@bsg.co.id` / `password123`
  - Associated with Kantor Cabang Utama
  - Has business reviewer: `utama.manager@bsg.co.id`
  - Ideal for testing approval workflows

### For Testing Approval Workflows
- **Manager Account**: `utama.manager@bsg.co.id` / `password123`
  - Can approve tickets from Kantor Cabang Utama users
  - Business reviewer with approval authority

### For Testing Technician Workflows
- **IT Support**: `it.technician@bsg.co.id` / `password123`
  - Handles Information Technology department tickets
- **Banking Support**: `banking.tech@bsg.co.id` / `password123`
  - Handles Dukungan dan Layanan department tickets

### For Testing Administrative Functions
- **System Admin**: `admin@bsg.co.id` / `password123`
  - Full system access
  - Can manage users, departments, and system settings

## Testing Scenarios

### Complete Workflow Testing
1. **Submit Ticket**: Login as `test.requester@bsg.co.id`
2. **Approve Ticket**: Login as `utama.manager@bsg.co.id` 
3. **Process Ticket**: Login as `banking.tech@bsg.co.id` (for banking services) or `it.technician@bsg.co.id` (for IT services)

### Branch-Based Testing
- **Utama Branch**: Use `test.requester@bsg.co.id` → `utama.manager@bsg.co.id`
- **Gorontalo Branch**: Use `gorontalo.manager@bsg.co.id`
- **Jakarta Branch**: Use `budi.santoso@bsg.co.id` → `jakarta.manager@bsg.co.id`

## Current Database Status
- **Total Users**: 13
- **Business Reviewers**: 3 (managers with approval authority)
- **Active Tickets**: 15 tickets created
- **Pending Approvals**: Multiple tickets awaiting manager approval

## Notes
- All passwords are set to `password123` for consistency
- Users are associated with realistic BSG branch structures
- Business reviewers have unit-based approval authority
- Approval workflows follow branch hierarchy (same unit only)
- Last updated: July 2025 based on current database state