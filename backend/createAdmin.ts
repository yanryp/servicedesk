// backend/createAdmin.ts
import bcrypt from 'bcryptjs';
import { pool } from './src/config'; // Adjust path as necessary

async function createAdminUser() {
  const email = 'admin@example.com';
  const username = 'admin_user'; // Added username
  const password = 'admin123'; // Plain text password
  const role = 'admin'; // 'admin', 'technician', or 'requester'
  // const name = 'Admin User'; // 'name' column does not exist in users table

  try {
    // Check if user already exists by email or username
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      console.log(`User with email ${email} or username ${username} already exists.`);
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role;
    `;
    const result = await pool.query(insertQuery, [username, email, hashedPassword, role]);

    console.log('Admin user created successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end(); // Close the database connection
  }
}

createAdminUser();
