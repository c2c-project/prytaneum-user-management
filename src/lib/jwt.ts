import jwt from 'jsonwebtoken';

const getSecret = () => {
    const secret = process.env.JWT_SECRET || 'secret';
    const env = process.env.NODE_ENV || 'production';
    if (env === 'production' && secret === 'secret') {
        throw new Error('JWT_SECRET IS SET INCORRECTLY IN PRODUCTION!');
    }
    return secret;
};

/**
 * @description wrapper to jsonwebtoken.verify
 * @arg {string} token
 * @returns {Promise} resolves to a decoded jwt on success
 */
const verify = function (token: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getSecret(), (err, decodedJwt) => {
            if (err) {
                reject(err);
            } else {
                resolve(decodedJwt as Record<string, unknown>);
            }
        });
    });
};

/**
 * @description wrapper to jsonwebtoken.sign
 * @arg {Any} target this is going to jwt'd
 * @arg {Object} [options] optional options for jwt signing
 * @returns {Promise} resolves to the jwt on success
 */
const sign = function (
    target: string | Record<string, unknown> | Buffer,
    options = {}
): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(target, getSecret(), options, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

export default {
    verify,
    sign,
};
