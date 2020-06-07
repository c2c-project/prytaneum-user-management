import app from '../app';
import connect from '../db/connect';

// eslint-disable-next-line no-void
void connect();

const { PORT, ORIGIN } = process.env;

const defaultOrigin = 'localhost';
const defaultPort = 3001;

const port = Number(PORT) || defaultPort;
const origin = ORIGIN || defaultOrigin;

app.listen(port, origin);
