const express = require('express');
const pool = require('../db');
const {SIZES} = require('../constants');
const authMiddleware = require('../auth/middleware');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {size} = req.query;
    let ultras;
    if (size === undefined) {
      ultras = await pool.query('SELECT * FROM "Ultra"');
    } else {
      ultras = await pool.query('SELECT * FROM "Ultra" WHERE size = $1', [size]);
    }
    res.json(ultras.rows);
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});
 
router.get('/:user_id', async (req, res) => {
  try {
    const {user_id} = req.params;

    const user = await pool.query('SELECT id FROM "User" WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      res.status(404);
      res.json({message: `User ${user_id} not found`});
    } else {
      const ultras = {};
      for (const size of SIZES) {
        const ultra = await pool.query('SELECT * FROM "Ultra" WHERE user_id = $1 AND size = $2', [user_id, size]);
        ultras[size] = ultra.rows.length === 0 ? null : ultra.rows[0];
      }
      res.json(ultras);
    }
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.post('/', authMiddleware.allowScoreSubmissionAccess, async (req, res) => {
	try {
    const {user_id, size, score} = req.body;
    const user = await pool.query('SELECT id FROM "User" WHERE id = $1', [user_id]);
    
    if (user.rows.length === 0) {
      res.status(404);
      res.json({message: `User ${user_id} not found`});
    } else {
      const oldUltra = await pool.query(
        'SELECT * FROM "Ultra" WHERE user_id = $1 AND size = $2',
        [user_id, size]
      );

      if (oldUltra.rows.length === 0) {
        const newUltra = await pool.query(
          'INSERT INTO "Ultra" (user_id, size, score, set_on) VALUES ($1, $2, $3, $4) RETURNING *',
          [user_id, size, score, new Date().toISOString().slice(0, 10)]
        );
        res.json({
          ...newUltra.rows[0],
          submitted: true,
        })
      } else if (score > oldUltra.rows[0].score) {
        const newUltra = await pool.query(
          'UPDATE "Ultra" SET score = $1, set_on = $2 WHERE user_id = $3 AND size = $4 RETURNING *',
          [score, new Date().toISOString().slice(0, 10), user_id, size]
        );
        res.json({
          ...newUltra.rows[0],
          submitted: true,
        })
      } else {
        res.json({
          ...oldUltra.rows[0],
          submitted: false,
        });
      }
    }
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

module.exports = router;