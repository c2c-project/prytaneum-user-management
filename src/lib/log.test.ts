/* eslint-disable no-console */
import { _test } from './log';

const { Log } = _test;

let cachedEnv: 'test' | 'development' | 'production' | undefined;
beforeAll(function () {
    cachedEnv = process.env.NODE_ENV;
});

afterAll(function () {
    process.env.NODE_ENV = cachedEnv;
});

describe('Log', function () {
    it('should use console in dev env', () => {
        process.env.NODE_ENV = 'development';
        const dLog = Log();
        expect(dLog.info).toStrictEqual(console.log);
        expect(dLog.err).toStrictEqual(console.error);
        expect(dLog.print).toStrictEqual(console.log);
    });
    it('should use nothing in prod', () => {
        process.env.NODE_ENV = 'production';
        const pLog = Log();
        expect(pLog.info('') === undefined).toStrictEqual(true);
        expect(pLog.err('') === undefined).toStrictEqual(true);
        expect(pLog.print('') === undefined).toStrictEqual(true);
    });

    it('should default to development', () => {
        process.env.NODE_ENV = undefined;
        const dLog = Log();
        // console.log(dLog);
        expect(dLog.info).toStrictEqual(console.log);
        expect(dLog.err).toStrictEqual(console.error);
        expect(dLog.print).toStrictEqual(console.log);
    });
});
