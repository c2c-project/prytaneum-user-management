import { ObjectID } from 'mongodb';
import request from 'supertest';
import faker from 'faker';

import app from 'app';
import Users from 'modules/users';
import jwt from 'lib/jwt/jwt';
import Collections, { connect, close } from 'db';
// import Mongo from 'db/mongo';
import { _test as EnvTest } from 'config/env';

const { env } = EnvTest;

const mockUser = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    userRoles: ['user'],
    _id: new ObjectID(),
};

beforeAll(async () => {
    await connect();
    const { insertedId } = await Users.register(
        mockUser.email,
        mockUser.password,
        mockUser.password
    );
    mockUser._id = insertedId;
});
afterAll(async () => {
    await Collections.Users().deleteOne({ 'email.address': mockUser.email });
    await close();
});

interface Response {
    status: number;
}

describe('users', () => {
    let _jwt: string;

    // describe('#login', () => {
    //     it('should reject the login with no username or password', async () => {
    //         const { status } = await request(app).post('/api/users/login');
    //         expect(status).toStrictEqual(400);
    //     });
    //     it('should reject a login with no password', async () => {
    //         const { status } = await request(app)
    //             .post('/api/users/login')
    //             .send({ username: mockUser.username });
    //         expect(status).toStrictEqual(400);
    //     });
    //     it('should reject a login with incorrect password', async () => {
    //         const { status } = await request(app).post('/api/users/login').send({
    //             username: mockUser.username,
    //             password: 'wrongpassword',
    //         });
    //         expect(status).toStrictEqual(401);
    //     });
    //     it('should accept a valid username & password', async () => {
    //         const { status, body } = (await request(app)
    //             .post('/api/users/login')
    //             .send({
    //                 username: mockUser.username,
    //                 password: mockUser.password,
    //             })) as Response & {
    //             body: {
    //                 jwt: string;
    //             };
    //         };
    //         expect(status).toStrictEqual(200);
    //         _jwt = body.jwt;
    //     });
    //     it('should catch if JWT_SECRET is undefined', async () => {
    //         const cachedSecret = env.JWT_SECRET;
    //         const cachedEnv = env.NODE_ENV;
    //         delete env.JWT_SECRET;
    //         delete env.NODE_ENV;
    //         const { status } = await request(app).post('/api/users/login').send({
    //             username: mockUser.username,
    //             password: mockUser.password,
    //         });
    //         expect(status).toStrictEqual(500);
    //         env.JWT_SECRET = cachedSecret;
    //         env.NODE_ENV = cachedEnv;
    //     });
    // });

    // describe('#login-temporary', () => {
    //     it('should succeed', async () => {
    //         const { status, body } = (await request(app)
    //             .post('/api/users/login-temporary')
    //             .send({
    //                 username: 'fake@fake.com',
    //             })) as Response & {
    //             body: {
    //                 jwt: string;
    //             };
    //         };
    //         const { jwt: token } = body;

    //         expect(status).toStrictEqual(200);
    //         expect(token).toBeTruthy();
    //         await Users.deleteOne({ username: 'fake@fake.com' });
    //     });
    //     it('should fail to login as existing user', async () => {
    //         const { status, body } = (await request(app)
    //             .post('/api/users/login-temporary')
    //             .send({
    //                 username: mockUser.username,
    //             })) as Response & {
    //             body: {
    //                 jwt: string;
    //             };
    //         };
    //         const { jwt: token } = body;
    //         expect(status).toStrictEqual(400);
    //         expect(token).toBeFalsy();
    //     });
    // });

    describe('#register', () => {
        const url = '/api/users/register';
        it('should register a user', async () => {
            const password = faker.internet.password();
            const email = faker.internet.email();
            const { status } = await request(app)
                .post(url)
                .send({
                    form: {
                        email,
                        password,
                        confirmPassword: password,
                    },
                });
            expect(status).toStrictEqual(200);
            await Collections.Users().deleteOne({
                'email.address': email,
            });
        });
        it('should not register an already existing user', async () => {
            const { status } = await request(app)
                .post(url)
                .send({
                    form: {
                        email: mockUser.email,
                        password: mockUser.password,
                        confirmPassword: mockUser.password,
                    },
                });
            expect(status).toStrictEqual(400);
        });

        it('should not register mismatching passwords', async () => {
            const { status } = await request(app)
                .post(url)
                .send({
                    form: {
                        email: mockUser.email,
                        password: mockUser.password,
                        confirmPassword: faker.internet.password(),
                    },
                });
            expect(status).toStrictEqual(400);
        });
    });

    // describe('#authenticate', () => {
    //     it('should accept a valid jwt', async () => {
    //         const { status } = await request(app)
    //             .post('/api/users/authenticate')
    //             .set('Authorization', `bearer ${_jwt}`);
    //         expect(status).toStrictEqual(200);
    //     });
    //     it('should reject a tampered jwt', async () => {
    //         // const tamperedJwt = `asdf${_jwt}$`;
    //         const { status } = await request(app)
    //             .post('/api/users/authenticate')
    //             // maybe think of more ways to tamper with the jwt?
    //             .set('Authorization', `bearer ${_jwt}$`);
    //         expect(status).toStrictEqual(401);
    //     });
    // });
    describe('#email verification', () => {
        const url = '/api/users/email/verify';
        it('should reject an invalid userId', async () => {
            const { status } = await request(app)
                .post(url)
                .send({ userId: new ObjectID() });
            expect(status).toStrictEqual(400);
        });
        it('should reject an empty userId', async () => {
            const { status } = await request(app).post(url).send();
            expect(status).toStrictEqual(400);
        });
        it('should accept a valid userId', async () => {
            const { _id } = mockUser;
            const { status } = await request(app)
                .post(url)
                .send({ userId: _id });
            expect(status).toStrictEqual(200);
        });
    });
    describe('#request-password-reset', () => {
        const url = '/api/users/password/forgot-password';
        it('should accept valid email', async () => {
            const { status } = await request(app)
                .post(url)
                .send({ form: { email: mockUser.email } });
            expect(status).toStrictEqual(200);
        });
        it('should reject undefined email', async () => {
            const { status } = await request(app)
                .post(url)
                .send({ form: { email: undefined } });
            expect(status).toStrictEqual(400);
        });
        it('should reject invalid email', async () => {
            const { status } = await request(app)
                .post(url)
                .send({ form: { email: 'invalidEmail' } });
            expect(status).toStrictEqual(400);
        });
    });
    describe('#consume-password-reset-token', () => {
        const url = '/api/users/password/consume-reset-token';
        it('should accept valid token', async () => {
            const password = faker.internet.password();
            const { _id } = mockUser;
            const token = await jwt.sign(
                { _id },
                {
                    expiresIn: '2m',
                }
            );

            const { status } = await request(app)
                .post(url)
                .send({
                    token,
                    form: {
                        password,
                        confirmPassword: password,
                    },
                });
            expect(status).toStrictEqual(200);
        });
        it('should reject invalid token', async () => {
            const { status } = await request(app)
                .post(url)
                .send({
                    form: { password: '1', confirmPassword: '1' },
                })
                .set('Content-Type', 'application/json')
                .send({ token: '123' });
            expect(status).toStrictEqual(400);
        });
        it('should reject missing token', async () => {
            const { status } = await request(app)
                .post(url)
                .send({
                    form: { password: '1', confirmPassword: '1' },
                })
                .set('Content-Type', 'application/json')
                .send();
            expect(status).toStrictEqual(400);
        });
        it('should reject expired token', async () => {
            const { _id } = mockUser;
            const token = await jwt.sign(
                { _id },
                {
                    expiresIn: '-10s',
                }
            );

            const { status } = await request(app)
                .post(url)
                .send({
                    token,
                    form: {
                        password: '1',
                        confirmPassword: '1',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should reject mismatching password', async () => {
            const { _id } = mockUser;
            const token = await jwt.sign(
                { _id },
                {
                    expiresIn: '2m',
                }
            );

            const { status } = await request(app)
                .post(url)
                .send({
                    token,
                    form: { password: '1', confirmPassword: '2' },
                });
            expect(status).toStrictEqual(400);
        });
    });
});
