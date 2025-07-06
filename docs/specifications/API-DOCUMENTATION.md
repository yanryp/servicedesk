# BSG Helpdesk API Documentation

**Base URL**: `http://localhost:3001/api`  
**Authentication**: Bearer JWT token required for all endpoints (except auth)

## 🔐 **Authentication Endpoints**

### **POST /auth/login**
```typescript
// Request
{ "email": "admin@example.com", "password": "admin123" }

// Response  
{ "message": "Login successful!", "token": "jwt-token", "user": {...} }
```

### **POST /auth/register**
```typescript
// Request
{ "username": "newuser", "email": "user@example.com", "password": "password123", "role": "technician" }
```

## 🎫 **Ticket Management**

### **GET /tickets**
Get tickets with filtering
```typescript
// Query: ?status=open&priority=high&page=1&limit=10
// Response: { "tickets": [...], "pagination": {...} }
```

### **GET /tickets/:id**
Get ticket with custom field values
```typescript
// Response includes customFieldValues array with field data
```

### **POST /tickets**
Create ticket with custom fields
```typescript
// Request includes customFieldValues for template-specific fields
```

## 📋 **Template Management**

### **GET /service-templates**
Get all service templates

### **GET /service-templates/:id/fields**
Get custom field definitions for template
```typescript
// Response
{
  "fields": [
    {
      "fieldName": "tanggal_berlaku",
      "fieldLabel": "Tanggal berlaku", 
      "fieldType": "date",
      "isRequired": true,
      "validationRules": {...}
    }
  ]
}
```

## 📊 **Master Data Management**

### **GET /master-data/:type**
Get master data by type (branch, olibs_menu, etc.)

### **POST /master-data/:type**
Create master data entity

## 💬 **Comment System**

### **GET /tickets/:id/comments**
Get threaded comments for ticket

### **POST /tickets/:id/comments**
Add comment to ticket

## ⚙️ **System Health**

### **GET /health**
System health check - returns database connection status

## ⚠️ **DEPRECATED ENDPOINTS - July 2025**

The following endpoints have been removed from the system. Use the specified replacements:

### ~~Legacy Categories API~~ → **REMOVED** ❌
```
❌ GET /categories 
❌ GET /categories/:id/subcategories
❌ GET /categories/items-by-subcategory/:id
```
**Migration**: Use `GET /service-catalog/categories` with hierarchical structure

### ~~Legacy Templates API~~ → **REMOVED** ❌  
```
❌ POST /templates
❌ GET /templates
❌ GET /templates/:id
❌ PUT /templates/:id  
❌ DELETE /templates/:id
❌ POST /templates/:id/fields
```
**Migration**: 
- For BSG templates: Use `/bsg-templates/*` endpoints
- For service templates: Use `/template-management/*` endpoints

### **Modern API Structure**
```typescript
// ✅ Current Active APIs
/api/service-catalog/*     // ITIL-aligned service management
/api/bsg-templates/*       // BSG-specific template system  
/api/template-management/* // Administrative template management
/api/v2/tickets/*          // Enhanced ticket system with ITIL support
```

---

**Current Status**: ✅ Production-ready system with clean, modern API architecture  
**Legacy Code**: 🗑️ Removed (6MB cleanup completed July 2025)  
**Backup**: 💾 Complete rollback capability maintained