require('dotenv').config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const pool = require('./db');

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}));
app.use(express.json());

const userRouter = require('./routes/user');
const sprintRouter = require('./routes/sprint');
const ultraRouter = require('./routes/ultra');
const authRouter = require('./auth/index');

app.use('/user', userRouter);
app.use('/sprint', sprintRouter);
app.use('/ultra', ultraRouter);
app.use('/auth', authRouter);

app.listen(process.env.PORT, () => {
	console.log(`Server has started on port ${process.env.PORT}`)
});