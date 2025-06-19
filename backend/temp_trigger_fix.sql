-- Attempt to drop existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate the function
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

SELECT 'Function and trigger creation script executed.' AS result;
