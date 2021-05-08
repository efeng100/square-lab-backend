const express = require('express');
const pool = require('../db');
const {SIZES} = require('../constants');
const authMiddleware = require('../auth/middleware');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {size} = req.query;
    let sprints;
    if (size === undefined) {
      sprints = await pool.query('SELECT * FROM "Sprint"');
    } else {
      sprints = await pool.query('SELECT * FROM "Sprint" WHERE size = $1', [size]);
    }
    res.json(sprints.rows);
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
      const sprints = {};
      for (const size of SIZES) {
        const sprint = await pool.query('SELECT * FROM "Sprint" WHERE user_id = $1 AND size = $2', [user_id, size]);
        sprints[size] = sprint.rows.length === 0 ? null : sprint.rows[0];
      }
      res.json(sprints);
    }
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.post('/', authMiddleware.allowScoreSubmissionAccess, async (req, res) => {
	try {
    const {user_id, size, time} = req.body;
    const user = await pool.query('SELECT id FROM "User" WHERE id = $1', [user_id]);
    
    if (user.rows.length === 0) {
      res.status(404);
      res.json({message: `User ${user_id} not found`});
    } else {
      const oldSprint = await pool.query(
        'SELECT * FROM "Sprint" WHERE user_id = $1 AND size = $2',
        [user_id, size]
      );

      if (oldSprint.rows.length === 0) {
        const newSprint = await pool.query(
          'INSERT INTO "Sprint" (user_id, size, time, set_on) VALUES ($1, $2, $3, $4) RETURNING *',
          [user_id, size, time, new Date().toISOString().slice(0, 10)]
        );
        res.json({
          ...newSprint.rows[0],
          submitted: true,
        })
      } else if (time < oldSprint.rows[0].time) {
        const newSprint = await pool.query(
          'UPDATE "Sprint" SET time = $1, set_on = $2 WHERE user_id = $3 AND size = $4 RETURNING *',
          [time, new Date().toISOString().slice(0, 10), user_id, size]
        );
        res.json({
          ...newSprint.rows[0],
          submitted: true,
        })
      } else {
        res.json({
          ...oldSprint.rows[0],
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