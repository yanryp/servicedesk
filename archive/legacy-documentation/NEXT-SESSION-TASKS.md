# Next Session Priority Tasks - BSG Template Custom Fields

**Critical Missing Feature**: Template-specific custom fields for OLIBS and BSGTouch templates

## 🎯 **Session Goal**
Implement dynamic custom fields that appear when users select specific BSG templates, with dropdown options populated from master data.

## ⏰ **Time Estimate: 2-3 hours**

## 📋 **Task Breakdown**

### **1. Create BSG Master Data (30 min)**
**File**: `/backend/scripts/populate-bsg-master-data.js`

Populate branches and OLIBS menus for dropdown fields:
- BSG branch hierarchy (Cabang Manado, Capem Tondano, etc.)
- OLIBS menu options (Tabungan, Deposito, Kredit operations)

### **2. Create Template Field Definitions (45 min)**  
**File**: `/backend/scripts/create-bsg-template-fields.js`

Define custom fields for priority templates:
- OLIBS – Perubahan Menu & Limit Transaksi (7 fields)
- OLIBS – Mutasi User Pegawai (9 fields)  
- BSGTouch – Transfer Antar Bank (6 fields)

### **3. Create Master Data API (15 min)**
**File**: `/backend/src/routes/masterDataRoutes.ts`

API endpoint: `GET /api/master-data/:type`

### **4. Create Template Fields API (15 min)**
**File**: `/backend/src/routes/templateFieldsRoutes.ts`

API endpoint: `GET /api/service-templates/:id/fields`

### **5. Frontend Template Fields Hook (30 min)**
**File**: `/frontend/src/hooks/useTemplateFields.ts`

Load template fields and populate dropdown options from master data.

### **6. Update Create Ticket Page (20 min)**
**File**: `/frontend/src/pages/CreateTicketPage.tsx`

Integrate dynamic custom fields based on selected template.

## ✅ **Testing Checklist**

1. **Backend Tests**:
   ```bash
   # Test master data API
   curl "http://localhost:3001/api/master-data/branch" -H "Authorization: Bearer $TOKEN"
   
   # Test template fields API  
   curl "http://localhost:3001/api/service-templates/1/fields" -H "Authorization: Bearer $TOKEN"
   ```

2. **Frontend Tests**:
   - Select OLIBS template → custom fields appear
   - Dropdown fields show branch/menu options
   - Create ticket with custom field values
   - Verify data saved in database

## 🎯 **Success Criteria**

Session complete when:
- [ ] OLIBS template shows: date, branch dropdown, user fields, OLIBS menu dropdown
- [ ] BSGTouch template shows: customer name, account number, currency, datetime
- [ ] Dropdown fields populated with real BSG data
- [ ] Ticket creation saves custom field values to database
- [ ] No compilation errors, all systems running

## 📁 **Files Ready to Copy**

All implementation code is documented in:
- `CUSTOM-FIELDS-IMPLEMENTATION.md` - Detailed technical specs
- `BSG-TEMPLATE-SPECIFICATIONS.md` - Exact field requirements
- `CONTINUATION-GUIDE.md` - Complete code examples

**Database & Frontend**: Already built and ready for this integration!

---

**Start Here**: Create the master data script first, then work through tasks sequentially. Each task builds on the previous one.