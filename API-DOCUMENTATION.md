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

---

**Current Status**: Core APIs implemented, template custom fields need completion