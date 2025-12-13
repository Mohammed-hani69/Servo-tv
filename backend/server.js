
const express = require('express');
const cors = require('cors');
const config = require('./config');

// Controllers
const authController = require('./controllers/authController');
const resellerController = require('./controllers/resellerController');
const userController = require('./controllers/userController');
// const adminController = require('./controllers/adminController'); // Implemented similarly

// Middleware
const authenticate = require('./middleware/authenticate'); // We'll define this inline for simplicity in this file

const app = express();
app.use(cors());
app.use(express.json());

// --- Inline Auth Middleware for brevity ---
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid Token' }); }
};

// --- ROUTES ---

// Auth
app.post('/api/auth/login', authController.login);
app.post('/api/auth/verify-device', authController.verifyDevice);

// Reseller
app.get('/api/reseller/stats', authMiddleware, resellerController.getStats);
app.post('/api/reseller/users', authMiddleware, resellerController.createUser);
app.post('/api/reseller/buy-points', authMiddleware, resellerController.buyPoints);

// User (Playlists)
app.get('/api/playlists', authMiddleware, userController.getPlaylists);
app.post('/api/playlists', authMiddleware, userController.createPlaylist);
app.get('/api/playlists/:playlistId/items', authMiddleware, userController.getPlaylistItems);
app.post('/api/playlists/:playlistId/items', authMiddleware, userController.addPlaylistItem);

// Admin (Mock for now, follows similar pattern)
app.get('/api/admin/settings', authMiddleware, (req, res) => res.json(config.defaults));


if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => console.log(`TV App Backend running on port ${config.port}`));
}
