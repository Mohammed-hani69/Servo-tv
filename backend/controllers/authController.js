
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.dbUrl });

// Helper: HMAC Hash for Device ID
const hashDeviceId = (rawId) => {
  return crypto.createHmac('sha256', config.deviceSecret).update(rawId).digest('hex');
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
    config.jwtSecret, 
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  const { email, password, deviceId } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled by administrator' });
    }

    // --- Device Binding Logic ---
    const incomingDeviceHash = hashDeviceId(deviceId);

    // 1. If user has no device bound, bind this one automatically (First Login)
    if (!user.device_hash) {
      await pool.query('UPDATE users SET device_hash = $1 WHERE id = $2', [incomingDeviceHash, user.id]);
    } 
    // 2. Check if device matches
    else if (user.device_hash !== incomingDeviceHash) {
      // Check admin policy for multi-device (Optional query)
      const settings = await pool.query('SELECT allow_multi_device FROM admin_settings WHERE id = 1');
      if (!settings.rows[0].allow_multi_device) {
         return res.status(200).json({ 
           requiresVerification: true, 
           message: 'Device unrecognized. Please verify identity.' 
         });
      }
    }

    const token = generateToken(user);
    delete user.password_hash;
    delete user.device_hash; // Never send hash to client

    res.json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.verifyDevice = async (req, res) => {
  const { email, code, deviceId } = req.body;
  
  // MOCK OTP CHECK (In prod, check Redis/DB)
  if (code !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  try {
    const newHash = hashDeviceId(deviceId);
    
    // Unbind old device and bind new one (or add to list if supporting multi)
    // Here we strictly enforce 1 device -> 1 account for security
    const result = await pool.query(
      'UPDATE users SET device_hash = $1 WHERE email = $2 RETURNING *', 
      [newHash, email]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    delete user.password_hash;
    delete user.device_hash;

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};
