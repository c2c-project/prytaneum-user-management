import app from '../app';
import connect from '../db/connect';

connect();

const { PORT, ORIGIN } = process.env;

app.listen(PORT, ORIGIN);
