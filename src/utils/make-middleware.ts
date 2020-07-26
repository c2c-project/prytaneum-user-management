import { RequestHandler } from 'express';

export default function makeMiddleware(fn: () => boolean): RequestHandler {
    return (req, res, next) => {
        try {
            const { user } = req;
            if (!user) throw new Error('No user account attached to request.');
            if (fn()) {
                next();
            }
        } catch (e) {
            next(e);
        }
    };
}
