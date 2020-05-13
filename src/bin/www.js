import app from '../app';

const { PORT, ORIGIN } = process.env;

app.listen(PORT, ORIGIN);