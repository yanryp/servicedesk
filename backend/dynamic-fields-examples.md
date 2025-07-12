# Dynamic Fields Configuration Examples

Based on the codebase analysis, here are examples of services with dynamic fields configuration:

## 1. BSG Templates with Dynamic Fields

### Example 1: OLIBS - Perubahan Menu & Limit Transaksi (7 fields)
```json
{
  "templateName": "BSG - Perubahan Menu & Limit Transaksi",
  "fieldsCount": 7,
  "fields": [
    {
      "fieldName": "user_id",
      "fieldLabel": "User ID",
      "fieldType": "text",
      "isRequired": true,
      "placeholderText": "Enter user ID"
    },
    {
      "fieldName": "branch",
      "fieldLabel": "Branch",
      "fieldType": "dropdown",
      "isRequired": true,
      "options": {
        "values": "DYNAMIC_BRANCHES" // Dynamically loaded from branch master data
      }
    },
    {
      "fieldName": "current_menu",
      "fieldLabel": "Current Menu",
      "fieldType": "text",
      "isRequired": false
    },
    {
      "fieldName": "requested_menu",
      "fieldLabel": "Requested Menu",
      "fieldType": "textarea",
      "isRequired": true
    },
    {
      "fieldName": "current_limit",
      "fieldLabel": "Current Transaction Limit",
      "fieldType": "number",
      "isRequired": false
    },
    {
      "fieldName": "requested_limit",
      "fieldLabel": "Requested Transaction Limit",
      "fieldType": "number",
      "isRequired": true
    },
    {
      "fieldName": "justification",
      "fieldLabel": "Business Justification",
      "fieldType": "textarea",
      "isRequired": true,
      "options": {
        "minLength": 50
      }
    }
  ]
}
```

### Example 2: ATM - PERMASALAHAN TEKNIS (7 fields)
```json
{
  "templateName": "BSG - PERMASALAHAN TEKNIS",
  "description": "BSG Template: ATM - PERMASALAHAN TEKNIS",
  "fieldsCount": 7,
  "fields": [
    {
      "fieldName": "atm_id",
      "fieldLabel": "ATM ID",
      "fieldType": "text",
      "isRequired": true,
      "validationRules": {
        "pattern": "^ATM[0-9]{6}$"
      }
    },
    {
      "fieldName": "error_code",
      "fieldLabel": "Error Code",
      "fieldType": "text",
      "isRequired": false
    },
    {
      "fieldName": "error_description",
      "fieldLabel": "Error Description",
      "fieldType": "textarea",
      "isRequired": true
    },
    {
      "fieldName": "occurrence_time",
      "fieldLabel": "Time of Occurrence",
      "fieldType": "datetime",
      "isRequired": true
    },
    {
      "fieldName": "affected_services",
      "fieldLabel": "Affected Services",
      "fieldType": "checkbox",
      "options": {
        "values": ["Cash Withdrawal", "Balance Inquiry", "Transfer", "Bill Payment"]
      }
    },
    {
      "fieldName": "attempted_solutions",
      "fieldLabel": "Attempted Solutions",
      "fieldType": "textarea",
      "isRequired": false
    },
    {
      "fieldName": "impact_level",
      "fieldLabel": "Impact Level",
      "fieldType": "dropdown",
      "isRequired": true,
      "options": {
        "values": ["High", "Medium", "Low"]
      }
    }
  ]
}
```

### Example 3: BSGTouch - Transfer Antar Bank (6 fields)
```json
{
  "templateName": "BSG - BSGTouch – Transfer Antar Bank",
  "fieldsCount": 6,
  "fields": [
    {
      "fieldName": "account_number",
      "fieldLabel": "Account Number",
      "fieldType": "text",
      "isRequired": true,
      "validationRules": {
        "pattern": "^[0-9]{10,16}$"
      }
    },
    {
      "fieldName": "transaction_date",
      "fieldLabel": "Transaction Date",
      "fieldType": "date",
      "isRequired": true
    },
    {
      "fieldName": "transaction_amount",
      "fieldLabel": "Transaction Amount",
      "fieldType": "number",
      "isRequired": true,
      "validationRules": {
        "min": 0,
        "max": 999999999
      }
    },
    {
      "fieldName": "destination_bank",
      "fieldLabel": "Destination Bank",
      "fieldType": "dropdown",
      "isRequired": true,
      "options": {
        "dataSource": "master_data",
        "entityType": "banks"
      }
    },
    {
      "fieldName": "destination_account",
      "fieldLabel": "Destination Account",
      "fieldType": "text",
      "isRequired": true
    },
    {
      "fieldName": "reference_number",
      "fieldLabel": "Reference Number",
      "fieldType": "text",
      "isRequired": false
    }
  ]
}
```

## 2. Dynamic Field Types Available

Based on the system configuration, these field types are supported:

### Text Fields
- **text**: Single line text input
- **textarea**: Multi-line text input
- **email**: Email validation
- **phone**: Phone number validation
- **url**: URL validation

### Numeric Fields
- **number**: Integer or decimal numbers
- **currency**: Currency formatted numbers

### Date/Time Fields
- **date**: Date picker
- **datetime**: Date and time picker
- **time**: Time picker only

### Selection Fields
- **dropdown**: Single selection from options
- **radio**: Radio button selection
- **checkbox**: Multiple selection checkboxes
- **boolean**: Yes/No toggle

### Special Fields
- **file**: File upload
- **dynamic_lookup**: Lookup from master data tables

## 3. Dynamic Options Configuration

Dynamic fields can have their options loaded from various sources:

### Static Options
```json
{
  "fieldType": "dropdown",
  "options": {
    "values": ["Option 1", "Option 2", "Option 3"]
  }
}
```

### Dynamic Master Data
```json
{
  "fieldType": "dropdown",
  "options": {
    "dataSource": "master_data",
    "entityType": "branches",
    "filter": {
      "isActive": true
    }
  }
}
```

### Conditional Options
```json
{
  "fieldType": "dropdown",
  "options": {
    "values": "DYNAMIC_BRANCHES",
    "dependsOn": "department_id",
    "filterBy": "departmentId"
  }
}
```

## 4. Validation Rules

Dynamic fields support various validation rules:

```json
{
  "validationRules": {
    "required": true,
    "minLength": 5,
    "maxLength": 100,
    "pattern": "^[A-Z0-9]+$",
    "min": 0,
    "max": 1000000,
    "email": true,
    "url": true,
    "custom": {
      "validator": "validateAccountNumber",
      "message": "Invalid account number format"
    }
  }
}
```

## 5. Field Dependencies

Fields can depend on other fields:

```json
{
  "fieldName": "sub_category",
  "dependsOn": "main_category",
  "showWhen": {
    "main_category": ["Hardware", "Software"]
  }
}
```

## Summary

The system supports comprehensive dynamic field configurations with:
- Multiple field types (text, number, date, dropdown, etc.)
- Dynamic data loading from master data tables
- Complex validation rules
- Field dependencies and conditional display
- Custom field options and behaviors

These dynamic fields are used across various service templates, particularly in:
- Banking operations (OLIBS, BSGTouch)
- Hardware services (ATM troubleshooting)
- User management services
- Transaction services