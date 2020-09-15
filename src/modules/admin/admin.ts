import { RequestHandler } from 'express';

export const isAdminMiddleware: RequestHandler = (req, res, next) => {
    // if user is admin, call next
    // else res.sendStatus(401);
    next();
};

// dummy fn, delete later
export function doAdmin() {}
