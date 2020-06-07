/* eslint-disable no-console */

/**
 * @description Logger type return description
 * @typedef {Object} Logger
 * @property {function} info prints info to the log
 * @property {function} err prints info to the error log
 * @property {function} print DEVELOPMENT ONLY prints info the console
 */
interface Logger {
    info: (msg: string) => void;
    err: (msg: string) => void;
    print: (msg: string) => void;
}

/**
 * @returns {Log} functions accesssing the logger
 */
function Log(): Logger {
    const { NODE_ENV } = process.env;
    const emptyLogger = {
        info: () => {},
        err: () => {},
        print: () => {},
    };
    switch (NODE_ENV) {
        case 'production':
            return emptyLogger;
        case 'development':
            return {
                info: console.log,
                err: console.error,
                print: console.log,
            };
        case 'test':
            return emptyLogger;
        default:
            return {
                info: console.log,
                err: console.error,
                print: console.log,
            };
    }
}

export default Log();

export const _test = {
    Log,
};
