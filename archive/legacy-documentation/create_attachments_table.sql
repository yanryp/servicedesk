-- Create ticket_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100),
  uploaded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on ticket_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_ticket_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_ticket_attachments ON ticket_attachments;
CREATE TRIGGER set_timestamp_ticket_attachments
BEFORE UPDATE ON ticket_attachments
FOR EACH ROW
EXECUTE FUNCTION update_ticket_attachments_updated_at();

-- Verify the table was created
SELECT 'ATTACHMENTS TABLE CHECK' as operation, 
  table_name 
FROM information_schema.tables 
WHERE table_name = 'ticket_attachments' AND table_schema = 'public';
