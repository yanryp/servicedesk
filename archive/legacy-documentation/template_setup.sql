-- Check if item with ID 1 exists
SELECT 'ITEM CHECK' as operation, * FROM items WHERE id = 1;

-- Check all existing ticket templates
SELECT 'ALL TEMPLATES' as operation, * FROM ticket_templates;

-- Insert new ticket template
INSERT INTO ticket_templates (name, item_id, description) 
VALUES ('Standard Laptop Request v2', 1, 'Template for requesting a new standard laptop version 2.')
RETURNING 'TEMPLATE INSERT' as operation, id, name, item_id;

-- Verify the new template was created
SELECT 'TEMPLATE VERIFY' as operation, id, name, item_id, description 
FROM ticket_templates 
WHERE name = 'Standard Laptop Request v2' AND item_id = 1;
