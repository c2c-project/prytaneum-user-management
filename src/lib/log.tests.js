/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import chai from 'chai';
import { _test } from './log';

const { Log } = _test;

chai.should();

describe('Log', function () {
    let cachedEnv;
    before(function () {
        cachedEnv = process.env.NODE_ENV;
    });

    after(function () {
        process.env.NODE_ENV = cachedEnv;
    });
    it('should use console in dev env', function (done) {
        process.env.NODE_ENV = 'development';
        const dLog = Log();
        dLog.info.should.be.equal(console.log);
        dLog.err.should.be.equal(console.error);
        dLog.print.should.be.equal(console.log);
        done();
    });
    it('should use nothing in prod', function (done) {
        process.env.NODE_ENV = 'production';
        const pLog = Log();
        (pLog.info() === undefined).should.be.true;
        (pLog.err() === undefined).should.be.true;
        (pLog.print() === undefined).should.be.true;
        done();
    });

    it('should default to development', function (done) {
        process.env.NODE_ENV = undefined;
        const dLog = Log();
        dLog.info.should.equal(console.log);
        dLog.err.should.equal(console.error);
        dLog.print.should.equal(console.log);
        done();
    });
});
