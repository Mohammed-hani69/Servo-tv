
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.dbUrl });

exports.getStats = async (req, res) => {
  const resellerId = req.user.id;
  try {
    const balanceRes = await pool.query('SELECT points_balance FROM users WHERE id = $1', [resellerId]);
    const usersRes = await pool.query(
      `SELECT 
         COUNT(*) as total, 
         SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active 
       FROM users WHERE reseller_id = $1`, 
      [resellerId]
    );

    res.json({
      pointsBalance: parseInt(balanceRes.rows[0]?.points_balance || 0),
      totalUsers: parseInt(usersRes.rows[0]?.total || 0),
      activeUsers: parseInt(usersRes.rows[0]?.active || 0),
      // Mock sales data for chart
      monthlySales: [
        { name: 'Jan', sales: 10 }, { name: 'Feb', sales: 25 }, { name: 'Mar', sales: 15 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
};

exports.createUser = async (req, res) => {
  const { email, password = 'password123' } = req.body;
  const resellerId = req.user.id;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Get Cost Settings
    const settingsRes = await client.query('SELECT points_per_user FROM admin_settings WHERE id = 1');
    const cost = settingsRes.rows[0].points_per_user;

    // 2. Check Balance
    const resellerRes = await client.query('SELECT points_balance FROM users WHERE id = $1 FOR UPDATE', [resellerId]);
    if (resellerRes.rows[0].points_balance < cost) {
      throw new Error('Insufficient points balance');
    }

    // 3. Deduct Points
    await client.query('UPDATE users SET points_balance = points_balance - $1 WHERE id = $2', [cost, resellerId]);

    // 4. Create User
    const hash = await bcrypt.hash(password, 10);
    const newUser = await client.query(
      `INSERT INTO users (email, password_hash, role, reseller_id, is_active) 
       VALUES ($1, $2, 'user', $3, true) RETURNING id, email`,
      [email, hash, resellerId]
    );

    // 5. Log Transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, points_amount, description) VALUES ($1, 'ALLOCATION', $2, $3)`,
      [resellerId, cost, `Created user ${email}`]
    );

    await client.query('COMMIT');
    res.json({ success: true, user: newUser.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.buyPoints = async (req, res) => {
  // Simulates Stripe Webhook Success
  const { amountCents, points } = req.body;
  const resellerId = req.user.id;

  try {
    await pool.query('UPDATE users SET points_balance = points_balance + $1 WHERE id = $2', [points, resellerId]);
    await pool.query(
      `INSERT INTO transactions (user_id, type, amount_cents, points_amount, description) VALUES ($1, 'PURCHASE', $2, $3, 'Points Top-up')`,
      [resellerId, amountCents, points]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Transaction failed' });
  }
};
