/* eslint-disable no-unused-expressions */
import chai from 'chai';
import chaihttp from 'chai-http';
import app from './app';

chai.should();
chai.use(chaihttp);

const server = chai.request(app).keepOpen();

describe('App', function () {
    after(function () {
        server.close();
    });
    it('should respond with 200', function (done) {
        server.get('/').end(function (err, res) {
            (err === null).should.be.true;
            res.should.have.status(200);
            done();
        });
    });
    it('should respond with 404', function (done) {
        server.patch('/bogus-route').end(function (err, res) {
            (err === null).should.be.true;
            res.should.have.status(404);
            done();
        });
    });
});
