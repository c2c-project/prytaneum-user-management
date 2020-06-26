/* eslint-disable no-console */
import app from 'app';
import connect from 'db/connect';
import env from 'config/env';

async function makeServer() {
    console.log('Connecting to DB...');
    await connect();
    app.listen(Number(env.PORT), env.ORIGIN);
    console.log(`Now listening on port ${env.PORT}`);
}

// eslint-disable-next-line no-void
void makeServer();
