-- create_ticket_attachments_table.sql

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL, -- Path on the server where the file is stored
    mimetype VARCHAR(100) NOT NULL,
    filesize INTEGER NOT NULL, -- Size in bytes
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add an index on ticket_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Grant permissions (if your DB user needs it)
-- Example: GRANT ALL ON ticket_attachments TO your_db_user;
-- Example: GRANT USAGE, SELECT ON SEQUENCE ticket_attachments_id_seq TO your_db_user;

COMMENT ON TABLE ticket_attachments IS 'Stores metadata for files attached to tickets.';
COMMENT ON COLUMN ticket_attachments.filepath IS 'Path on the server where the file is stored relative to a base uploads directory.';

