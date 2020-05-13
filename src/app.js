import express from 'express';
import dotenv from 'dotenv';
import config from './config/app.config';

dotenv.config();

const { PORT, ORIGIN } = process.env;
const app = express();
config(app);

app.use()
app.get('/', (req, res) => {
    res.send('Hello again');
});

app.listen(PORT, ORIGIN);
