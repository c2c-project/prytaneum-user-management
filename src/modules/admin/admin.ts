import { RequestHandler } from 'express';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';
import jwt from 'lib/jwt';
import Collections, { UserUtils } from 'db';
import { ClientError } from 'lib/errors';
import { userStatus } from './types';

// TODO Modify appropriately when authorization is complete
const isAdminMiddleware: RequestHandler = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.sendStatus(401);
    try {
        const verified = await jwt.verify(token);
        if (verified) {
            return next();
        }
    } catch (e) {
        return res.sendStatus(401);
    }

    return res.sendStatus(401);
};

/**
 * @description fetches all users from db
 * @throws {ClientError} Error when fetching data
 * @returns Array of all users from database
 */

const fetchAllUsers = async (): Promise<UserUtils.UserDoc[]> => {
    const docs = await Collections.Users().find().toArray();
    if (docs) {
        return docs;
    }
    throw new ClientError('Error when fetching');
};

/**
 * @description verify if its a valid user
 * @arg {string} userId _id of user data being fetched
 * @throws {ClientError} The user navigated to invalid link
 * @returns Individual User Data based on Id
 */

const confirmUserExist = async (userId: string): Promise<UserUtils.UserDoc> => {
    const objectUserId = new ObjectID(userId);
    const doc = await Collections.Users().findOne({ _id: objectUserId });
    if (doc) {
        return doc;
    }
    throw new ClientError('Invalid Link');
};

/**
 *  @description update user status roles on admin permission
 *  @arg {string} userId, user id
 *  @arg {object{string, number, boolean}} form, data being patched(updated)
 *  @throws {ClientError} Invalid User Id
 *  @returns {Promise<UpdateWriteOpResult>} MongoDB cursor Promise
 */

// TODO: reconcile differences between userdoc and userform here

const updateUserStatus = async (
    userId: string,
    form: userStatus[]
): Promise<UpdateWriteOpResult> => {
    const objectUserId = new ObjectID(userId);
    const doc = await Collections.Users().findOne({ _id: objectUserId });
    if (doc) {
        const update = { $set: { status: form } };
        return Collections.Users().updateOne({ _id: objectUserId }, update);
    }
    throw new ClientError('Invalid Link');
};

export default {
    isAdminMiddleware,
    confirmUserExist,
    updateUserStatus,
    fetchAllUsers,
};
