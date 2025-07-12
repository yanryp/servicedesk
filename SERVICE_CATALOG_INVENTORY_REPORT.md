# Comprehensive Service Catalog Inventory Report

## Executive Summary

Total Services in System: **245 services** across 7 categories

### Service Distribution by Category:

1. **ATM, EDC & Branch Hardware** - 21 services (8.6%)
2. **Claims & Disputes** - 57 services (23.3%)
3. **Core Banking & Financial Systems** - 58 services (23.7%)
4. **Corporate IT & Employee Support** - 75 services (30.6%)
5. **Digital Channels & Customer Applications** - 26 services (10.6%)
6. **General & Default Services** - 2 services (0.8%)
7. **User Account Management** - 1 service (0.4%)

### Department Breakdown:
- **Information Technology**: 117 services (47.8%)
  - Categories: 5
  - Templates: 100
- **Dukungan dan Layanan**: 128 services (52.2%)
  - Categories: 6
  - Templates: 283

## Services with Dynamic Fields (hasTemplate: true)

Total Services with Dynamic Fields: **21 services** (8.6% of all services)

### Detailed List of Services with Dynamic Fields:

1. **ATM-Permasalahan Teknis** (Category: ATM, EDC & Branch Hardware)
   - Fields: 7

2. **BSG QRIS - Klaim Gagal Transaksi** (Category: Claims & Disputes)
   - Fields: 6

3. **OLIBs - Mutasi User Pegawai** (Category: Core Banking & Financial Systems)
   - Fields: 9

4. **OLIBs - Non Aktif User** (Category: Core Banking & Financial Systems)
   - Fields: 4

5. **OLIBs - Override Password** (Category: Core Banking & Financial Systems)
   - Fields: 4

6. **OLIBs - Pendaftaran User Baru** (Category: Core Banking & Financial Systems)
   - Fields: 4

7. **OLIBs - Selisih Pembukuan** (Category: Core Banking & Financial Systems)
   - Fields: 7

8. **XMonitoring ATM - Perubahan User** (Category: Corporate IT & Employee Support)
   - Fields: 4

9. **BSGTouch (Android) - Mutasi User** (Category: Digital Channels & Customer Applications)
   - Fields: 6

10. **BSGTouch (Android) - Pendaftaran User Baru** (Category: Digital Channels & Customer Applications)
    - Fields: 4

11. **BSGTouch (Android) - Perpanjang Masa Berlaku** (Category: Digital Channels & Customer Applications)
    - Fields: 4

12. **BSGTouch (Android) - Perubahan User** (Category: Digital Channels & Customer Applications)
    - Fields: 4

13. **SMS Banking - Mutasi user** (Category: Digital Channels & Customer Applications)
    - Fields: 6

14. **SMS Banking - Pendaftaran User** (Category: Digital Channels & Customer Applications)
    - Fields: 4

15. **SMS Banking - Perubahan User** (Category: Digital Channels & Customer Applications)
    - Fields: 4

16. **BSG QRIS - Buka Blokir & Reset Password** (Category: Digital Channels & Customer Applications)
    - Fields: 4

17. **BSG QRIS - Pendaftaran User** (Category: Digital Channels & Customer Applications)
    - Fields: 4

18. **BSG QRIS - Perpanjang Masa Berlaku** (Category: Digital Channels & Customer Applications)
    - Fields: 4

19. **XCARD - Buka Blokir dan Reset Password** (Category: User Account Management)
    - Fields: 5

20. **XCARD - Pendaftaran User Baru** (Category: User Account Management)
    - Fields: 7

21. **XMonitoring ATM - Pendaftaran User** (Category: User Account Management)
    - Fields: 4

## Testing Results

### Dynamic Fields Display Issue

**Finding**: Dynamic fields are NOT displaying in the customer portal for services that have templates with fields.

**Test Case**: 
- Tested "OLIBs - Pendaftaran User Baru" which has 4 dynamic fields
- Expected: Should display 4 additional form fields after selecting the service
- Actual: Only standard fields are shown (Priority, Subject, Description, Issue Classification, Attachments)

**Impact**: Customers cannot provide required information for 21 services (8.6% of all services) that require specific dynamic fields.

## Category Details

### 1. ATM, EDC & Branch Hardware (21 services)
Services related to physical endpoints and hardware in branches and at customer locations.

Sample Services:
- ATM - ATMB Error Transfer Antar Bank
- ATM - Cash Handler
- ATM - Cassette Supply/Persediaan Kaset
- ATM - Communication Offline
- ATM - Door Contact Sensor Abnormal
- ATM - Gagal Cash in/Cash out
- ATM - MCRW Fatal
- ATM - Receipt Paper Media Out
- ATM-Pendaftaran Terminal Baru
- ATM-Pengiriman Log Jurnal
- ATM-Permasalahan Teknis (HAS DYNAMIC FIELDS - 7 fields)
- ATM-Permintaan Log Switching
- ATM-Perubahan IP
- ATM-Perubahan Profil
- Penggantian Mesin
- Perubahan Denom
- BSGDebit/EDC - Permintaan Salinan Bukti Transaksi
- Error Pinpad
- Maintenance Printer
- Pendaftaran Terminal Komputer Baru
- Formulir Serah Terima Komputer

### 2. Claims & Disputes (57 services)
A dedicated category for all transaction-related claims, disputes, and reconciliations.
*Note: List too extensive to show all - includes various claim types and dispute resolution services*

### 3. Core Banking & Financial Systems (58 services)
Services for core financial platforms and specialized financial applications.

Notable Services with Dynamic Fields:
- OLIBs - Mutasi User Pegawai (9 fields)
- OLIBs - Non Aktif User (4 fields)
- OLIBs - Override Password (4 fields)
- OLIBs - Pendaftaran User Baru (4 fields)
- OLIBs - Selisih Pembukuan (7 fields)

### 4. Corporate IT & Employee Support (75 services)
Internal IT services that support employees and corporate functions.
*Largest category with extensive IT support services*

### 5. Digital Channels & Customer Applications (26 services)
Services for all customer-facing digital applications.

Services with Dynamic Fields:
- BSGTouch (Android) series - 4 services
- SMS Banking series - 3 services
- BSG QRIS series - 3 services

### 6. General & Default Services (2 services)
Catch-all services for requests that do not fit into other categories.

### 7. User Account Management (1 service)
Services for managing user accounts and access.
*Note: Despite showing 1 service in the portal, actually contains 3 services with dynamic fields in the backend*

## Recommendations

1. **Fix Dynamic Fields Display**: The customer portal is not rendering dynamic fields for services that have templates. This affects 21 services and prevents customers from providing required information.

2. **Data Consistency**: The User Account Management category shows 1 service in the portal but actually has 3 services with dynamic fields in the backend. This discrepancy should be investigated.

3. **Service Distribution**: Consider redistributing services more evenly across categories. Corporate IT & Employee Support has 75 services (30.6%) while some categories have very few.

4. **Template Coverage**: Only 8.6% of services have dynamic fields. Consider whether more services would benefit from structured data collection via templates.

5. **Category Descriptions**: All categories have clear descriptions which helps with navigation and service selection.

## Technical Notes

- Total templates in system: 383
- Total fields defined: 111
- Services are properly distributed between departments
- The portal UI correctly shows service counts and allows navigation
- The issue is specifically with rendering dynamic form fields from templates