// Test script to debug pending-approvals endpoint
const pool = require('./src/db').default;

async function testPendingApprovals() {
  const client = await pool.connect();
  try {
    console.log('Testing pending approvals query...');
    
    // Test manager ID 4 (cabang.utama.manager)
    const managerId = 4;
    
    // First, check if manager exists
    const managerCheck = await client.query('SELECT id, username, email, role FROM users WHERE id = $1', [managerId]);
    console.log('Manager:', managerCheck.rows[0]);
    
    // Check tickets with status pending-approval
    const ticketCheck = await client.query("SELECT id, title, status, created_by_user_id FROM tickets WHERE status = 'pending-approval'");
    console.log('Pending approval tickets:', ticketCheck.rows);
    
    // Check user relationships - who has this manager?
    const subordinatesCheck = await client.query('SELECT id, username, email, manager_id FROM users WHERE manager_id = $1', [managerId]);
    console.log('Manager subordinates:', subordinatesCheck.rows);
    
    // Try the actual query from the endpoint
    const query = `
      SELECT 
        t.*,
        c.name as category_name,
        sc.name as subcategory_name,
        i.name as item_name,
        u.username as creator_username,
        u.email as creator_email,
        d.name as creator_department
      FROM tickets t
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN sub_categories sc ON i.sub_category_id = sc.id  
      LEFT JOIN categories c ON sc.category_id = c.id
      JOIN users u ON t.created_by_user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.manager_id = $1 
        AND t.status = 'pending-approval'
      ORDER BY t.created_at DESC
    `;
    
    const result = await client.query(query, [managerId]);
    const rawTickets = result.rows;

    // Test the new data transformation logic
    const tickets = rawTickets.map(ticket => ({
      ...ticket,
      createdBy: {
        username: ticket.creator_username,
        email: ticket.creator_email
      },
      item: {
        name: ticket.item_name
      },
      // Clean up flat fields to avoid confusion
      creator_username: undefined,
      creator_email: undefined,
      creator_department: undefined,
      item_name: undefined,
      category_name: undefined,
      subcategory_name: undefined
    }));

    console.log('Raw query result:', rawTickets[0]);
    console.log('Transformed ticket:', tickets[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPendingApprovals();