import app from '../app';
import connect from '../db/connect';

// eslint-disable-next-line no-void
void connect();

const { PORT, ORIGIN } = process.env;

app.listen(Number(PORT), ORIGIN);
