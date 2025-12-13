
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.dbUrl });

exports.getPlaylists = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC', 
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

exports.createPlaylist = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

exports.getPlaylistItems = async (req, res) => {
  const { playlistId } = req.params;
  try {
    // Verify ownership
    const playlist = await pool.query('SELECT * FROM playlists WHERE id = $1 AND user_id = $2', [playlistId, req.user.id]);
    if (playlist.rows.length === 0) return res.status(404).json({ error: 'Playlist not found' });

    const items = await pool.query(
      'SELECT * FROM playlist_items WHERE playlist_id = $1 ORDER BY position ASC',
      [playlistId]
    );
    res.json(items.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

exports.addPlaylistItem = async (req, res) => {
  const { playlistId } = req.params;
  const { title, url, category } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO playlist_items (playlist_id, title, url, category) VALUES ($1, $2, $3, $4)`,
      [playlistId, title, url, category || 'General']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add channel' });
  }
};
