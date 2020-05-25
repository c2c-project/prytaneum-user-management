// import { ObjectID } from 'mongodb';
// import request from 'supertest';

// import app from '../app';
// import Users from '../db/users';
// import Accounts from '../lib/accounts';
// import jwt from '../lib/jwt';

// const mockUser = {
//     username: '__test__',
//     password: '1',
//     email: '__test__@__test__.com',
//     userRoles: ['user'],
// };

// beforeAll(async () => {
//     const { _id } = await Accounts.register(
//         mockUser.username,
//         mockUser.password,
//         mockUser.password,
//         { email: mockUser.email }
//     );
//     mockUser._id = _id;
// });
// afterAll(async () => {
//     await Users.removeUser(mockUser.email);
// });

// describe('users', () => {
//     let _jwt;

//     describe('#login', () => {
//         it('should reject the login with no username or password', async () => {
//             const { status } = await request(app).post('/api/auth/login');
//             expect(status).toStrictEqual(400);
//         });
//         it('should reject a login with no password', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/login')
//                 .send({ username: mockUser.username });
//             expect(status).toStrictEqual(400);
//         });
//         it('should reject a login with incorrect password', async () => {
//             const { status } = await request(app).post('/api/auth/login').send({
//                 username: mockUser.username,
//                 password: 'wrongpassword',
//             });
//             expect(status).toStrictEqual(401);
//         });
//         it('should accept a valid username & password', async () => {
//             const { status, body } = await request(app)
//                 .post('/api/auth/login')
//                 .send({
//                     username: mockUser.username,
//                     password: mockUser.password,
//                 });
//             expect(status).toStrictEqual(200);
//             _jwt = body.jwt;
//         });
//     });

//     describe('#register', () => {
//         it('should register a user', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/register')
//                 .send({
//                     form: {
//                         username: 'asdf',
//                         email: 'blah@blah.com',
//                         password: 'password',
//                         confirmPassword: 'password',
//                     },
//                 });
//             expect(status).toStrictEqual(200);
//             await Users.removeUser('blah@blah.com');
//         });
//     });

//     describe('#authenticate', () => {
//         it('should accept a valid jwt', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/authenticate')
//                 .set('Authorization', `bearer ${_jwt}`);
//             expect(status).toStrictEqual(200);
//         });
//         it('should reject a tampered jwt', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/authenticate')
//                 // maybe think of more ways to tamper with the jwt?
//                 .set('Authorization', `bearer ${_jwt}$`);
//             expect(status).toStrictEqual(401);
//         });
//     });
//     describe('#email verification', () => {
//         it('should reject an invalid userId', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/confirm/user-email')
//                 .send({ userId: new ObjectID() });
//             expect(status).toStrictEqual(400);
//         });
//         it('should accept a valid userId', async () => {
//             const { _id } = mockUser;
//             const { status } = await request(app)
//                 .post('/api/auth/confirm/user-email')
//                 .send({ userId: _id });
//             expect(status).toStrictEqual(200);
//         });
//     });
//     describe('#request-password-reset', () => {
//         it('should accept valid email', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ form: { email: mockUser.email } });
//             expect(status).toStrictEqual(200);
//         });
//         it('should reject undefined email', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ form: { email: undefined } });
//             expect(status).toStrictEqual(400);
//         });
//         it('should reject invalid email', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ form: { email: 'invalidEmail' } });
//             expect(status).toStrictEqual(400);
//         });
//     });
//     describe('#consume-password-reset-token', () => {
//         it('should accept valid token', async () => {
//             const { _id } = mockUser;
//             const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
//                 expiresIn: '2m',
//             });

//             const { status } = await request(app)
//                 .post('/api/auth/consume-password-reset-token')
//                 .send({
//                     token,
//                     form: {
//                         password: '1',
//                         confirmPassword: '1',
//                     },
//                 });
//             expect(status).toStrictEqual(200);
//         });
//         it('should reject invalid token', async () => {
//             const { status } = await request(app)
//                 .post('/api/auth/consume-password-reset-token')
//                 .send({
//                     form: { password: '1', confirmPassword: '1' },
//                 })
//                 .set('Authorization', 'bearer 123123')
//                 .set('Content-Type', 'application/json');
//             expect(status).toStrictEqual(400);
//         });
//         it('should reject expired token', async () => {
//             const { _id } = mockUser;
//             const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
//                 expiresIn: '-10s',
//             });

//             const { status } = await request(app)
//                 .post('/api/auth/consume-password-reset-token')
//                 .send({
//                     token,
//                     form: {
//                         password: '1',
//                         confirmPassword: '1',
//                     },
//                 });
//             expect(status).toStrictEqual(400);
//         });
//         it('should reject mismatching password', async () => {
//             const { _id } = mockUser;
//             const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
//                 expiresIn: '2m',
//             });

//             const { status } = await request(app)
//                 .post('/api/auth/consume-password-reset-token')
//                 .send({
//                     token,
//                     form: { password: '1', confirmPassword: '2' },
//                 });
//             expect(status).toStrictEqual(400);
//         });
//     });
// });
