# AI Coding Guide - BSG Enterprise Ticketing System

## 🎯 **QUICK START FOR AI CODING SESSIONS**

### **Current Status**: Core BSG template system OPERATIONAL ✅
### **Last Updated**: June 22, 2025
### **Ready For**: Ticket workflow completion and advanced features

---

## 🔥 **IMMEDIATE PRIORITIES**

### 1. **Complete BSG Ticket Creation** (CRITICAL)
```typescript
// MISSING: Backend API endpoint
File: backend/src/routes/enhancedTicketRoutes.ts
Need: POST /api/bsg-tickets endpoint

// PARTIALLY DONE: Frontend form
File: frontend/src/pages/BSGCreateTicketPage.tsx  
Status: Form working, needs API integration (line 164-169)
```

### 2. **Approval Workflow** (HIGH)
```typescript
// MISSING: Manager approval logic
Files: backend/src/routes/enhancedTicketRoutes.ts
Need: Department routing for KASDA/BSGDirect → Dukungan dan Layanan
```

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Tech Stack**
- **Backend**: Node.js + TypeScript + Prisma + PostgreSQL
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Auth**: JWT tokens with localStorage
- **Testing**: Playwright E2E testing

### **Key Directories**
```
backend/src/
├── routes/bsgTemplateRoutes.ts    # ✅ BSG template APIs (working)
├── routes/enhancedTicketRoutes.ts # ❌ Needs BSG ticket creation
├── services/autoAssignmentService.ts # ⚠️ Needs BSG routing logic
└── middleware/authMiddleware.ts   # ✅ Auth working

frontend/src/
├── pages/BSGCreateTicketPage.tsx  # ⚠️ Form ready, needs API connection
├── components/BSGTemplateSelector.tsx # ✅ Working perfectly
├── components/BSGDynamicFieldRenderer.tsx # ✅ Working perfectly
└── services/bsgTemplate.ts       # ✅ API service working
```

---

## 🗄️ **DATABASE STATUS**

### **BSG Tables** (All populated ✅)
```sql
bsg_template_categories     # 9 categories (OLIBS, KLAIM, etc.)
bsg_templates              # 24 banking templates
bsg_template_fields        # 119+ dynamic fields
bsg_field_types           # 7 field types (text, dropdown, etc.)
bsg_field_options         # Dropdown values
bsg_global_field_definitions # 13 optimized common fields
```

### **User Tables** (Working ✅)
```sql
users                     # 21 users including test accounts
departments              # IT, Dukungan dan Layanan, branches
tickets                  # Structure ready, workflow incomplete
```

---

## 🔐 **AUTHENTICATION**

### **Working Test Credentials**
```bash
REQUESTER  | cabang.utama.user@bsg.co.id      | CabangUtama123!
MANAGER    | cabang.utama.manager@bsg.co.id   | ManagerCabang123!
TECHNICIAN | it.technician@bsg.co.id          | ITTechnician123!
```

### **API Auth Pattern**
```typescript
// All API calls need this header
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
}
```

---

## 🌐 **API ENDPOINTS**

### **Working APIs** ✅
```bash
POST /api/auth/login                           # User authentication
GET  /api/bsg-templates/categories             # 9 BSG categories  
GET  /api/bsg-templates/templates?categoryId=X # Templates by category
GET  /api/bsg-templates/:templateId/fields     # Dynamic fields
```

### **Missing APIs** ❌ (HIGH PRIORITY)
```bash
POST /api/bsg-tickets                          # Create BSG ticket
PUT  /api/tickets/:id/approve                  # Manager approval
GET  /api/bsg-analytics                        # Usage analytics
```

---

## 💻 **DEVELOPMENT ENVIRONMENT**

### **URLs**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001  
- **BSG Page**: http://localhost:3000/bsg-create

### **Start Commands**
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm start

# Test BSG System
node test-bsg-simple.js
```

---

## 🧪 **TESTING STATUS**

### **Working Tests** ✅
```bash
✅ Authentication flow
✅ BSG template loading (all 9 categories)
✅ Dynamic field rendering
✅ Template selection workflow
```

### **Test Files**
```bash
test-bsg-simple.js           # Main E2E test (Playwright)
backend/scripts/create-bsg-test-users.js # User creation
```

---

## 📋 **NEXT IMMEDIATE TASKS**

### **Task 1: Complete Ticket Creation API** (2-3 hours)
```typescript
// File: backend/src/routes/enhancedTicketRoutes.ts
// Add this endpoint:

router.post('/bsg-tickets', protect, async (req: AuthenticatedRequest, res) => {
  const { templateId, templateNumber, title, description, customFields } = req.body;
  
  // Create ticket with BSG template data
  const ticket = await prisma.tickets.create({
    data: {
      title,
      description,
      templateId, 
      customFields: JSON.stringify(customFields),
      submittedById: req.user.id,
      departmentId: req.user.departmentId,
      status: 'pending_approval', // BSG tickets need approval
      priority: 'medium'
    }
  });
  
  res.json({ success: true, ticket });
});
```

### **Task 2: Connect Frontend Form** (1 hour)
```typescript
// File: frontend/src/pages/BSGCreateTicketPage.tsx
// Replace line 164-169 with:

const response = await fetch(`${baseUrl}/bsg-tickets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(ticketData)
});

if (response.ok) {
  const result = await response.json();
  toast.success('BSG ticket created successfully!');
  navigate(`/tickets/${result.ticket.id}`);
}
```

### **Task 3: Department Routing** (2-3 hours)
```typescript
// File: backend/src/services/autoAssignmentService.ts
// Add BSG routing logic:

if (ticket.templateId) {
  // BSG ticket - route to Dukungan dan Layanan for KASDA/BSGDirect
  const userProfile = JSON.parse(ticket.submittedBy.profile || '{}');
  if (userProfile.systemType === 'KASDA' || userProfile.systemType === 'BSGDirect') {
    return assignToDukunganDanLayanan(ticket);
  }
}
```

---

## 🔧 **COMMON DEVELOPMENT PATTERNS**

### **API Service Pattern**
```typescript
// frontend/src/services/bsgTemplate.ts
export const bsgTemplateService = {
  createTicket: async (ticketData: BSGTicketData) => {
    return api.post('/bsg-tickets', ticketData);
  }
};
```

### **React Component Pattern**
```typescript
// Use existing BSG components as reference
// frontend/src/components/BSGTemplateSelector.tsx - excellent example
// frontend/src/components/BSGDynamicFieldRenderer.tsx - field rendering
```

### **Database Query Pattern**
```typescript
// Use Prisma ORM (not raw SQL)
const templates = await prisma.bSGTemplate.findMany({
  where: { categoryId: parseInt(categoryId) },
  include: { category: true, fields: true }
});
```

---

## 🚨 **IMPORTANT NOTES**

### **DO NOT BREAK** ✅
- Authentication system (working perfectly)
- BSG template loading (working perfectly)  
- Dynamic field rendering (working perfectly)
- Database schema (all tables populated)

### **API PATH FIXES** ✅ (Already completed)
```typescript
// All service files fixed to use correct paths:
✅ '/auth/login' not '/api/auth/login'
✅ '/bsg-templates/categories' not '/api/bsg-templates/categories'
✅ Base URL: 'http://localhost:3001/api' in .env
```

### **Field Optimization** ✅ (70.6% efficiency achieved)
- 13 common fields identified and shared
- Template mapping completed
- No need to modify optimization system

---

## 📊 **SUCCESS METRICS**

### **Current Achievement** ✅
- **9 Template Categories**: All functional
- **24 Banking Templates**: All selectable
- **119+ Dynamic Fields**: All rendering correctly
- **Authentication**: 100% working
- **API Response Time**: < 200ms average

### **Targets for Next Phase** 🎯
- **Ticket Creation**: End-to-end working
- **Approval Workflow**: Manager approval functional
- **Department Routing**: KASDA/BSGDirect → Dukungan dan Layanan
- **Mobile Responsive**: All BSG components

---

## 📁 **KEY FILES FOR AI CODING**

### **High Priority Files**
```bash
backend/src/routes/enhancedTicketRoutes.ts    # CRITICAL: Add BSG ticket creation
frontend/src/pages/BSGCreateTicketPage.tsx    # HIGH: Connect to API
backend/src/services/autoAssignmentService.ts # MEDIUM: Department routing
```

### **Reference Files** (Don't modify unless needed)
```bash
backend/src/routes/bsgTemplateRoutes.ts       # ✅ Perfect example of working API
frontend/src/components/BSGTemplateSelector.tsx # ✅ Perfect React component
backend/scripts/importTemplateCSVFields.js   # ✅ Template import logic
```

### **Configuration Files**
```bash
frontend/.env                                 # API URLs configured
backend/prisma/schema.prisma                  # Database schema complete
CLAUDE.md                                     # Development guidelines
```

---

## 🚀 **READY FOR CODING**

**The BSG Enterprise Ticketing System core is fully operational and ready for the next development phase. Focus on completing the ticket workflow to make it production-ready.**

**All necessary infrastructure, authentication, templates, and field optimization are working perfectly. The foundation is solid for rapid development.**