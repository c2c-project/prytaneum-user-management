/* eslint-disable no-unused-expressions */
import chai from 'chai';
import chaihttp from 'chai-http';
import app, { _test } from './app';

chai.should();
chai.use(chaihttp);

describe('App', function () {
    it('should respond with 200', function (done) {
        chai.request(app)
            .get('/')
            .end(function (err, res) {
                (err === null).should.be.true;
                res.should.have.status(200);
                done();
            });
    });
    it('should respond with 404', function (done) {
        chai.request(app)
            .patch('/bogus-route')
            .end(function (err, res) {
                (err === null).should.be.true;
                res.should.have.status(404);
                done();
            });
    });
    it('should respond with a 404 in prod', function (done) {
        const cachedEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const testApp = _test.initApp();
        chai.request(testApp)
            .get('/')
            .end(function (err, res) {
                (err === null).should.be.true;
                res.should.have.status(404);
                process.env.NODE_ENV = cachedEnv;
                done();
            });
    });
});
