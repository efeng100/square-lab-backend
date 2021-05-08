require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

function validUser(user) {
	return (
		typeof user.name == 'string' &&
		user.name == user.name.trim() &&
		user.name.length > 0 &&
		user.name.length <= 20 &&
		typeof user.password == 'string' &&
		user.password == user.password.trim() &&
		user.password.length >= 5
	);
}

router.post('/signup', async (req, res) => {
	try {
		if (validUser(req.body)) {
			const {name, password} = req.body;
			const existingUser = await pool.query('SELECT id FROM "User" WHERE name = $1', [name]);
			if (existingUser.rows.length === 0) {
				const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);
				const newUser = await pool.query(
					'INSERT INTO "User" (name, password) VALUES ($1, $2) RETURNING id, name',
					[name, hashedPassword]
				);
				res.cookie('user_id', newUser.rows[0].id, {
					httpOnly: true,
					secure: req.app.get('env') != 'development',
					signed: true,
				});
				res.json(newUser.rows[0]);
			} else {
				res.status(400);
				res.json({message: `Username ${name} already in use`});
			}
		} else {
			res.status(400);
			res.json({message: 'Invalid username and/or password'})
		}
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.post('/login', async (req, res) => {
	try {
		const {name, password} = req.body;
		const user = await pool.query('SELECT * FROM "User" WHERE name = $1', [name]);
		if (user.rows.length != 0 && await bcrypt.compare(password, user.rows[0].password)) {
			res.cookie('user_id', user.rows[0].id, {
				httpOnly: true,
				secure: req.app.get('env') != 'development',
				signed: true,
			});
			res.json({
				id: user.rows[0].id,
				name: user.rows[0].name,
			});
		} else {
			res.status(400);
			res.json({message: `Username and password do not match any existing account`});
		}
  } catch (err) {
    res.status(400);
    res.json({message: err.message});
  }
});

router.get('/logout', (req, res) => {
	try {
		res.clearCookie('user_id');
		res.json(true);
	} catch (err) {
		res.status(400);
		res.json({message: err.message});
	}
});

module.exports = router;