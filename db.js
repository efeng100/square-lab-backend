const Pool = require('pg').Pool;

const env = process.env.NODE_ENV || 'development';
let poolParams;
if (env === 'development') {
	poolParams = {
		user: 'postgres',
		password: 'postgres',
		host: 'localhost',
		port: 5432,
		database: 'square_lab',
	};
} else {
	poolParams = {
		connectionString: process.env.DATABASE_URL,
    ssl: true,
	}
}

const pool = new Pool(poolParams);

module.exports = pool;