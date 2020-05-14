/* eslint-disable no-unused-expressions */
import chai from 'chai';
import chaihttp from 'chai-http';
import JWT from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import server from '../app';
import Users from '../db/users';
import Accounts from '../lib/accounts';

chai.should();
chai.use(chaihttp);

const mockUser = {
    username: '__test__',
    password: '1',
    email: '__test__@__test__.com',
    userRoles: ['user'],
};
describe('users', function () {
    let jwt;

    before(async function () {
        const { _id } = await Accounts.register(
            mockUser.username,
            mockUser.password,
            mockUser.password,
            { email: mockUser.email }
        );
        mockUser._id = _id;
    });

    after(async function () {
        await Users.removeUser(mockUser.email);
    });

    describe('#login', function () {
        it('should reject the login with no username or password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with no password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: mockUser.username })
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with incorrect password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({
                    username: mockUser.username,
                    password: 'wrongpassword',
                })
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should accept a valid username & password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({
                    username: mockUser.username,
                    password: mockUser.password,
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    jwt = res.body.jwt;
                    done();
                });
        });
    });
    describe('#register', function () {
        after(async function () {
            await Users.removeUser('blah@blah.com');
        });
        it('should register a user', function (done) {
            chai.request(server)
                .post('/api/users/register')
                .send({
                    form: {
                        username: 'asdf',
                        email: 'blah@blah.com',
                        password: 'password',
                        confirmPass: 'password',
                    },
                })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('#authenticate', function () {
        it('should accept a valid jwt', function (done) {
            chai.request(server)
                .post('/api/users/authenticate')
                .set('Authorization', `bearer ${jwt}`)
                // .set('credentials', 'same-origin')
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('should reject a tampered jwt', function (done) {
            chai.request(server)
                .post('/api/users/authenticate')
                // maybe think of more ways to tamper with the jwt?
                .set('Authorization', `bearer ${jwt}$`)
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });
    describe('#verification', function () {
        it('should reject an invalid userId', function (done) {
            chai.request(server)
                .post('/api/users/verification')
                .send({ userId: new ObjectID() })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(400);
                    done();
                });
        });
        it('should accept a valid userId', function (done) {
            const { _id } = mockUser;
            chai.request(server)
                .post('/api/users/verification')
                .send({ userId: _id })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('#request-password-reset', function () {
        it('should accept valid email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: mockUser.email } })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(200);
                    done();
                });
        });
        it('should reject undefined email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: undefined } })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject invalid email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: 'invalidEmail' } })
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(400);
                    done();
                });
        });
    });
    describe('#consume-password-reset-token', function () {
        it('should accept valid token', function (done) {
            const { _id } = mockUser;
            JWT.sign(
                { _id },
                process.env.JWT_SECRET,
                { expiresIn: '2m' },
                (err, token) => {
                    chai.request(server)
                        .post('/api/users/consume-password-reset-token')
                        .send({
                            token,
                            form: {
                                password: '1',
                                confirmPassword: '1',
                            },
                        })
                        .end(function (innerErr, res) {
                            (innerErr === null).should.be.true;
                            res.should.have.status(200);
                            done();
                        });
                }
            );
        });
        it('should reject invalid token', function (done) {
            chai.request(server)
                .post('/api/users/consume-password-reset-token')
                .send({
                    form: { password: '1', confirmPassword: '1' },
                })
                .set('Authorization', 'bearer 123123')
                .set('Content-Type', 'application/json')
                .end(function (err, res) {
                    (err === null).should.be.true;
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject expired token', function (done) {
            const { _id } = mockUser;
            JWT.sign(
                { _id },
                process.env.JWT_SECRET,
                { expiresIn: '1s' },
                (err, token) => {
                    (err === null).should.be.true;
                    setTimeout(function () {
                        return chai
                            .request(server)
                            .post('/api/users/consume-password-reset-token')
                            .send({
                                token,
                                form: {
                                    password: '1',
                                    confirmPassword: '1',
                                },
                            })
                            .end(function (innerErr, res) {
                                (innerErr === null).should.be.true;
                                res.should.have.status(400);
                                done();
                            });
                    }, 1500);
                }
            );
        });
        it('should reject mismatching password', function (done) {
            const { _id } = mockUser;
            JWT.sign(
                { _id },
                process.env.JWT_SECRET,
                { expiresIn: '2m' },
                (err, token) => {
                    (err === null).should.be.true;
                    chai.request(server)
                        .post('/api/users/consume-password-reset-token')
                        .send({
                            token,
                            form: { password: '1', confirmPassword: '2' },
                        })
                        .end(function (innerErr, res) {
                            (innerErr === null).should.be.true;
                            res.should.have.status(400);
                            done();
                        });
                }
            );
        });
    });
});
