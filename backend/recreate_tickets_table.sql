-- Drop existing tickets table if it exists
DROP TABLE IF EXISTS tickets CASCADE; -- CASCADE will also drop dependent objects like triggers

-- Drop custom types if they exist (they should, but just in case for a full reset)
-- Note: Dropping types can be tricky if they are in use by other tables or functions not being recreated.
-- For now, assuming 'tickets' is the only user of these specific types.
DROP TYPE IF EXISTS ticket_status;
DROP TYPE IF EXISTS ticket_priority;

-- Recreate custom ENUM types
CREATE TYPE ticket_status AS ENUM (
    'open',
    'in_progress',
    'pending_requester_response',
    'resolved',
    'closed'
);

CREATE TYPE ticket_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Recreate the tickets table with the correct schema
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- Recreate the trigger function
-- (DROP FUNCTION IF EXISTS is good practice but CASCADE on table drop might handle it)
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

SELECT 'Tickets table and related objects recreated successfully.' AS result;
