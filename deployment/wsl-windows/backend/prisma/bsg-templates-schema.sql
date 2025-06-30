-- BSG Template System Database Schema
-- Based on template.csv with 24 banking templates

-- Template Categories (OLIBS, KLAIM, XCARD, etc.)
CREATE TABLE bsg_template_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'OLIBS', 'KLAIM', 'XCARD', etc.
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- for UI icons
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Types within categories (e.g., 'Perubahan Menu & Limit Transaksi')
CREATE TABLE bsg_templates (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES bsg_template_categories(id),
    name VARCHAR(200) NOT NULL, -- 'Perubahan Menu & Limit Transaksi'
    display_name VARCHAR(250) NOT NULL,
    description TEXT,
    template_number INTEGER, -- The "No." from CSV (1, 2, 3, etc.)
    is_active BOOLEAN DEFAULT true,
    popularity_score INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, template_number)
);

-- Field Types (Short Text, Date, Drop-Down, etc.)
CREATE TABLE bsg_field_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'text', 'date', 'dropdown', 'currency', etc.
    display_name VARCHAR(100) NOT NULL, -- 'Short Text', 'Date', 'Drop-Down', etc.
    html_input_type VARCHAR(30), -- 'text', 'date', 'select', 'number', etc.
    validation_pattern VARCHAR(500), -- regex patterns for validation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Field Definitions
CREATE TABLE bsg_template_fields (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES bsg_templates(id) ON DELETE CASCADE,
    field_type_id INTEGER NOT NULL REFERENCES bsg_field_types(id),
    field_name VARCHAR(100) NOT NULL, -- 'Tanggal berlaku*', 'Cabang / Capem*'
    field_label VARCHAR(150) NOT NULL,
    field_description TEXT, -- The "Keterangan" column
    is_required BOOLEAN DEFAULT false,
    max_length INTEGER,
    sort_order INTEGER DEFAULT 0,
    placeholder_text VARCHAR(200),
    help_text VARCHAR(500),
    validation_rules JSONB, -- For complex validation rules
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, field_name)
);

-- Master Data for Drop-downs (Branches, Menus, etc.)
CREATE TABLE bsg_master_data (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL, -- 'branch', 'olibs_menu', 'kantor_kas', etc.
    code VARCHAR(50), -- Branch codes, menu codes, etc.
    name VARCHAR(200) NOT NULL,
    display_name VARCHAR(250),
    parent_id INTEGER REFERENCES bsg_master_data(id), -- For hierarchical data
    metadata JSONB, -- Additional properties (address, phone, etc.)
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(data_type, is_active),
    INDEX(parent_id)
);

-- Field Options for Drop-downs (links fields to master data)
CREATE TABLE bsg_field_options (
    id SERIAL PRIMARY KEY,
    field_id INTEGER NOT NULL REFERENCES bsg_template_fields(id) ON DELETE CASCADE,
    master_data_type VARCHAR(50), -- Reference to bsg_master_data.data_type
    option_value VARCHAR(200),
    option_label VARCHAR(250),
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Custom Field Values (enhanced for BSG templates)
CREATE TABLE bsg_ticket_field_values (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL, -- References tickets.id
    field_id INTEGER NOT NULL REFERENCES bsg_template_fields(id),
    field_value TEXT,
    master_data_id INTEGER REFERENCES bsg_master_data(id), -- For dropdown selections
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticket_id, field_id)
);

-- Template Usage Analytics
CREATE TABLE bsg_template_usage_logs (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES bsg_templates(id),
    user_id INTEGER NOT NULL, -- References users.id
    department_id INTEGER, -- References departments.id
    ticket_id INTEGER, -- References tickets.id when completed
    action_type VARCHAR(20) NOT NULL, -- 'viewed', 'started', 'completed', 'abandoned'
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    completion_time_ms INTEGER, -- Time taken to complete template
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(template_id, action_type),
    INDEX(user_id, created_at),
    INDEX(created_at)
);

-- Indexes for performance
CREATE INDEX idx_bsg_templates_category ON bsg_templates(category_id, is_active);
CREATE INDEX idx_bsg_template_fields_template ON bsg_template_fields(template_id, sort_order);
CREATE INDEX idx_bsg_master_data_type ON bsg_master_data(data_type, is_active, sort_order);
CREATE INDEX idx_bsg_ticket_field_values_ticket ON bsg_ticket_field_values(ticket_id);