
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod',
  deviceSecret: process.env.DEVICE_SECRET || 'device-binding-secret-key',
  dbUrl: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/tvapp',
  
  // Default Admin Settings (Fallback if DB is empty)
  defaults: {
    pointPriceCents: 10000, // $100
    pointsPerUser: 1,
  }
};
