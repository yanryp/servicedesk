-- backend/database.sql

-- Drop tables if they exist (for easy re-creation during development)
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plain text
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'technician', 'requester')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- If user is deleted, set requester to NULL
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- If user is deleted, set assignee to NULL
    -- category_id INTEGER, -- Placeholder for now, will be a FK to a categories table later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create a function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to users table
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Apply the trigger to tickets table
CREATE TRIGGER set_timestamp_tickets
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- Sample Data (Optional - for testing)
-- Insert a sample admin user (password: 'adminpassword' - HASH THIS PROPERLY IN REAL APP)
-- For testing, you'd need to hash this password using bcrypt or similar before inserting.
-- Example: INSERT INTO users (username, password_hash, email, role) VALUES ('admin', '<hashed_adminpassword>', 'admin@example.com', 'admin');

-- Insert a sample technician user (password: 'techpassword')
-- Example: INSERT INTO users (username, password_hash, email, role) VALUES ('tech1', '<hashed_techpassword>', 'tech1@example.com', 'technician');

-- Insert a sample requester user (password: 'userpassword')
-- Example: INSERT INTO users (username, password_hash, email, role) VALUES ('user1', '<hashed_userpassword>', 'user1@example.com', 'requester');


-- Note: For actual password hashing, you'll implement that in your backend user creation logic.
-- The sample inserts above are commented out and require pre-hashed passwords.

SELECT 'Database schema created successfully.' AS message;
