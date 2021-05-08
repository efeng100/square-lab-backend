const express = require('express');
const pool = require('../db');
const authMiddleware = require('../auth/middleware');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const allUserIds = await pool.query('SELECT id FROM "User"');
    res.json(allUserIds.rows.map(row => row.id));
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const user = await pool.query('SELECT id, name FROM "User" WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      res.status(404);
      res.json({message: `User ${id} not found`});
    } else {
      res.json(user.rows[0]);
    }
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.delete('/:id', authMiddleware.allowUserDeleteAccess, async (req, res) => {
  try {
    const {id} = req.params;
    const user = await pool.query('SELECT id FROM "User" WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      res.status(404);
      res.json({message: `User ${id} not found`});
    } else {
      await pool.query('DELETE FROM "User" WHERE id = $1', [id]);
      res.json(true);
    }
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});
 
module.exports = router;