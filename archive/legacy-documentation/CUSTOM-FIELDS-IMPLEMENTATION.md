# BSG Template Custom Fields Implementation Guide

**Priority**: HIGH - This is the main missing piece for the BSG Helpdesk system

## 🎯 **Current State Analysis**

### ✅ **What's Already Built**
1. **Database Schema Ready**: Complete Prisma schema with all necessary models
2. **Generic Components**: CustomFieldsForm and CustomFieldInput components exist
3. **API Infrastructure**: Template and field management routes partially implemented
4. **BSG Categories**: All categories and templates mapped correctly

### ❌ **What's Missing**
1. **BSG-Specific Field Definitions**: Templates don't have their custom fields defined
2. **Master Data Population**: Dropdown options (branches, OLIBS menus) not populated
3. **Advanced Field Types**: Currency, timestamp validation, account number formatting
4. **Template-Field Integration**: Dynamic form generation based on selected template

## 📋 **Required BSG Template Fields**

Based on user requirements, here are the specific template fields that need implementation:

### **1. OLIBS – Perubahan Menu & Limit Transaksi**

**Template ID**: To be created  
**Category**: Core Banking Systems > OLIBs Core Banking

```typescript
// Required ServiceFieldDefinition records:
const olibsMenuChangeFields = [
  {
    fieldName: "tanggal_berlaku",
    fieldLabel: "Tanggal berlaku",
    fieldType: "date",
    isRequired: true,
    placeholder: "Pilih tanggal berlaku perubahan menu"
  },
  {
    fieldName: "cabang_capem",
    fieldLabel: "Cabang / Capem", 
    fieldType: "dropdown",
    isRequired: true,
    // Options from MasterDataEntity type="branch"
    validationRules: { "source": "master_data", "type": "branch" }
  },
  {
    fieldName: "kantor_kas",
    fieldLabel: "Kantor Kas",
    fieldType: "text",
    isRequired: false,
    placeholder: "Nama kantor kas"
  },
  {
    fieldName: "kode_user", 
    fieldLabel: "Kode User",
    fieldType: "text",
    isRequired: true,
    validationRules: { "maxLength": 5 },
    placeholder: "Maksimal 5 karakter"
  },
  {
    fieldName: "nama_user",
    fieldLabel: "Nama User", 
    fieldType: "text",
    isRequired: true,
    placeholder: "Nama lengkap user"
  },
  {
    fieldName: "jabatan",
    fieldLabel: "Jabatan",
    fieldType: "text", 
    isRequired: true,
    placeholder: "Jabatan user"
  },
  {
    fieldName: "program_fasilitas_olibs",
    fieldLabel: "Program Fasilitas OLIBS",
    fieldType: "dropdown",
    isRequired: true,
    // Options from MasterDataEntity type="olibs_menu"
    validationRules: { "source": "master_data", "type": "olibs_menu" }
  }
];
```

### **2. OLIBS – Mutasi User Pegawai**

**Template ID**: To be created  
**Category**: Core Banking Systems > OLIBs Core Banking

```typescript
const olibsUserMutationFields = [
  {
    fieldName: "tanggal_berlaku",
    fieldLabel: "Tanggal berlaku",
    fieldType: "date",
    isRequired: true,
    placeholder: "Pilih tanggal berlaku perubahan"
  },
  {
    fieldName: "cabang_capem_asal",
    fieldLabel: "Cabang / Capem",
    fieldType: "dropdown", 
    isRequired: true,
    validationRules: { "source": "master_data", "type": "branch" }
  },
  {
    fieldName: "kantor_kas",
    fieldLabel: "Kantor Kas",
    fieldType: "text",
    isRequired: false
  },
  {
    fieldName: "kode_user",
    fieldLabel: "Kode User", 
    fieldType: "text",
    isRequired: true,
    validationRules: { "maxLength": 5 }
  },
  {
    fieldName: "nama_user",
    fieldLabel: "Nama User",
    fieldType: "text",
    isRequired: true
  },
  {
    fieldName: "jabatan", 
    fieldLabel: "Jabatan",
    fieldType: "text",
    isRequired: true
  },
  {
    fieldName: "mutasi_dari",
    fieldLabel: "Mutasi dari",
    fieldType: "dropdown",
    isRequired: false,
    validationRules: { "source": "master_data", "type": "branch" },
    placeholder: "Cabang/Capem asal"
  },
  {
    fieldName: "mutasi_ke_kk",
    fieldLabel: "Mutasi ke KK", 
    fieldType: "text",
    isRequired: false,
    placeholder: "Kantor kas tujuan untuk mutasi internal"
  },
  {
    fieldName: "program_fasilitas_olibs",
    fieldLabel: "Program Fasilitas OLIBS",
    fieldType: "dropdown",
    isRequired: true,
    validationRules: { "source": "master_data", "type": "olibs_menu" }
  }
];
```

### **3. BSGTouch – Transfer Antar Bank**

**Template ID**: To be created  
**Category**: Mobile Banking Platforms > Cross-Channel Transaction Claims

```typescript
const bsgTouchTransferFields = [
  {
    fieldName: "nama_nasabah",
    fieldLabel: "Nama Nasabah",
    fieldType: "text", 
    isRequired: true,
    placeholder: "Nama nasabah pengirim transaksi"
  },
  {
    fieldName: "nomor_rekening",
    fieldLabel: "Nomor Rekening",
    fieldType: "number",
    isRequired: true,
    validationRules: { "type": "account_number", "minLength": 10 },
    placeholder: "Nomor rekening pengirim"
  },
  {
    fieldName: "nomor_kartu",
    fieldLabel: "Nomor Kartu", 
    fieldType: "text",
    isRequired: false,
    validationRules: { "type": "card_number" },
    placeholder: "Nomor kartu nasabah"
  },
  {
    fieldName: "nominal_transaksi",
    fieldLabel: "Nominal Transaksi",
    fieldType: "currency", // Custom field type
    isRequired: true,
    validationRules: { "currency": "IDR", "minValue": 1000 },
    placeholder: "Nominal termasuk fee transaksi"
  },
  {
    fieldName: "tanggal_transaksi", 
    fieldLabel: "Tanggal transaksi",
    fieldType: "datetime",
    isRequired: true,
    placeholder: "Tanggal dan waktu transaksi"
  },
  {
    fieldName: "nomor_arsip",
    fieldLabel: "Nomor Arsip",
    fieldType: "text",
    isRequired: true,
    placeholder: "Nomor arsip transaksi"
  }
];
```

## 🏗️ **Implementation Steps**

### **Step 1: Create Master Data Entities**

First, populate the master data for dropdown options:

```typescript
// File: backend/scripts/populate-bsg-master-data.js
const masterDataEntries = [
  // BSG Branches
  { type: "branch", code: "001", name: "Kantor Pusat", nameIndonesian: "Kantor Pusat" },
  { type: "branch", code: "101", name: "Cabang Manado", nameIndonesian: "Cabang Manado" },
  { type: "branch", code: "102", name: "Cabang Bitung", nameIndonesian: "Cabang Bitung" },
  { type: "branch", code: "103", name: "Cabang Tomohon", nameIndonesian: "Cabang Tomohon" },
  { type: "branch", code: "201", name: "Capem Tondano", nameIndonesian: "Capem Tondano" },
  // ... add all BSG branches and sub-branches
  
  // OLIBS Menu Options
  { type: "olibs_menu", code: "TAB001", name: "Tabungan - Buka Rekening", nameIndonesian: "Tabungan - Buka Rekening" },
  { type: "olibs_menu", code: "TAB002", name: "Tabungan - Transfer", nameIndonesian: "Tabungan - Transfer" },
  { type: "olibs_menu", code: "DEP001", name: "Deposito - Buka Rekening", nameIndonesian: "Deposito - Buka Rekening" },
  { type: "olibs_menu", code: "KRD001", name: "Kredit - Input Aplikasi", nameIndonesian: "Kredit - Input Aplikasi" },
  // ... add all OLIBS menu options
];
```

### **Step 2: Create ServiceFieldDefinition Records**

```typescript
// File: backend/scripts/create-bsg-template-fields.js
async function createOlibsMenuChangeTemplate() {
  // 1. Find the OLIBS service template
  const serviceTemplate = await prisma.serviceTemplate.findFirst({
    where: { name: { contains: "Perubahan Menu" } }
  });

  // 2. Create field definitions
  for (const fieldDef of olibsMenuChangeFields) {
    await prisma.serviceFieldDefinition.create({
      data: {
        serviceTemplateId: serviceTemplate.id,
        fieldName: fieldDef.fieldName,
        fieldLabel: fieldDef.fieldLabel,
        fieldType: fieldDef.fieldType,
        isRequired: fieldDef.isRequired,
        placeholder: fieldDef.placeholder,
        validationRules: fieldDef.validationRules,
        sortOrder: fields.indexOf(fieldDef)
      }
    });
  }
}
```

### **Step 3: Extend Field Types**

Update the Prisma schema to support new field types:

```typescript
// In schema.prisma, extend field_type enum:
enum field_type {
  text
  textarea
  number
  email
  phone
  date
  datetime
  dropdown
  radio
  checkbox
  file_upload
  government_id
  budget_code
  treasury_account
  currency          // NEW
  account_number    // NEW  
  card_number       // NEW
  timestamp         // NEW
}
```

### **Step 4: Enhance Frontend Components**

Update CustomFieldInput.tsx to handle new field types:

```typescript
// Add to CustomFieldInput.tsx
case 'currency':
  return (
    <div className="relative">
      <span className="absolute left-3 top-2 text-gray-500">Rp</span>
      <input
        type="text"
        value={formatCurrency(value)}
        onChange={(e) => onChange(parseCurrency(e.target.value))}
        className={`${baseInputClasses} pl-12`}
        placeholder="0"
      />
    </div>
  );

case 'datetime':
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={baseInputClasses}
    />
  );

case 'account_number':
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(formatAccountNumber(e.target.value))}
      pattern="[0-9]*"
      className={baseInputClasses}
      placeholder="10-16 digit account number"
    />
  );
```

### **Step 5: Create Master Data API**

```typescript
// File: backend/src/routes/masterDataRoutes.ts
app.get('/api/master-data/:type', async (req, res) => {
  const { type } = req.params;
  
  const entities = await prisma.masterDataEntity.findMany({
    where: { 
      type,
      isActive: true 
    },
    orderBy: { sortOrder: 'asc' }
  });
  
  res.json(entities);
});
```

### **Step 6: Connect Templates to Fields**

Update the template selection component to load custom fields:

```typescript
// In frontend template selection:
const loadTemplateFields = async (templateId: number) => {
  const response = await fetch(`/api/service-templates/${templateId}/fields`);
  const fields = await response.json();
  setCustomFields(fields);
};

// Populate dropdown options from master data:
const loadFieldOptions = async (fieldType: string, validationRules: any) => {
  if (validationRules?.source === 'master_data') {
    const response = await fetch(`/api/master-data/${validationRules.type}`);
    const options = await response.json();
    return options.map(opt => opt.name);
  }
  return [];
};
```

## 🔧 **Required API Endpoints**

### **Backend Routes to Create/Update**

```typescript
// GET /api/service-templates/:id/fields
// Returns ServiceFieldDefinition[] for a template

// GET /api/master-data/:type  
// Returns MasterDataEntity[] for dropdown population

// POST /api/tickets with custom field values
// Creates ticket with TicketServiceFieldValue records

// PUT /api/master-data/:type
// Updates master data (branches, menus, etc.)
```

## 📁 **Files to Create/Modify**

### **New Files**
1. `/backend/scripts/populate-bsg-master-data.js`
2. `/backend/scripts/create-bsg-template-fields.js`
3. `/backend/src/routes/masterDataRoutes.ts`
4. `/frontend/src/utils/fieldFormatting.ts`
5. `/frontend/src/hooks/useTemplateFields.ts`

### **Files to Modify**
1. `/frontend/src/components/CustomFields/CustomFieldInput.tsx` - Add new field types
2. `/backend/prisma/schema.prisma` - Extend field_type enum  
3. `/frontend/src/components/BSGTemplateDiscovery.tsx` - Connect to fields
4. `/backend/src/routes/serviceCatalogRoutes.ts` - Add field endpoints

## 🎯 **Implementation Priority**

### **Phase 1: Foundation (Session 1)**
1. Create master data script and populate branches/OLIBS menus
2. Extend field types in schema and run migration
3. Create ServiceFieldDefinition records for 3 main templates

### **Phase 2: Frontend Integration (Session 2)**  
4. Update CustomFieldInput with new field types
5. Connect template selection to field loading
6. Test complete template-to-field workflow

### **Phase 3: Polish (Session 3)**
7. Add field validation and formatting
8. Improve UI/UX for complex field types
9. Test all BSG templates with their fields

## 🧪 **Testing Checklist**

- [ ] Master data populated and accessible via API
- [ ] OLIBS template shows correct custom fields
- [ ] BSGTouch template shows correct custom fields  
- [ ] Dropdown fields populated from master data
- [ ] Currency field formatting works correctly
- [ ] Date/datetime validation works
- [ ] Field validation prevents submission with errors
- [ ] Custom field values saved to database correctly
- [ ] Templates display field values on ticket detail page

---

**Next Session Focus**: Start with Phase 1 - creating the master data and ServiceFieldDefinition records for the three critical BSG templates specified by the user.