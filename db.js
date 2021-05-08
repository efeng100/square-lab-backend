const Pool = require('pg').Pool;

const pool = new Pool({
	user: 'postgres',
	password: 'postgres',
	host: 'localhost',
	port: 5432,
	database: 'square_lab',
});

module.exports = pool;