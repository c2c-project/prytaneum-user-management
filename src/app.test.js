import request from 'supertest';

import app, { _test } from './app';
import connect from './db/connect';
import Mongo from './config/mongo.config';

beforeAll(async () => {
    connect();
});

afterAll(async () => {
    Mongo.close();
});

describe('App', function () {
    it('should respond with 200', async () => {
        const { status } = await request(app).get('/');
        expect(status).toStrictEqual(200);
    });
    it('should respond with 404', async () => {
        const { status } = await request(app).patch('/bogus-route');
        expect(status).toStrictEqual(404);
    });
    it('should respond with a 404 in prod', async () => {
        const cachedEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const testApp = _test.initApp();
        const { status } = await request(testApp).get('/');
        expect(status).toStrictEqual(404);
        process.env.NODE_ENV = cachedEnv;
    });
});
