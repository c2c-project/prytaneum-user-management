/* eslint-disable @typescript-eslint/indent */
import bcrypt from 'bcrypt';
import {
    UpdateWriteOpResult,
    InsertOneWriteOpResult,
    WithId,
    ObjectID,
} from 'mongodb';

import Collections, { UserUtils } from 'db';
import env from 'config/env';
import jwt from '../jwt/jwt';
import { ClientError } from '../errors';
import Emails from '../email';

const SALT_ROUNDS = 10;

/**
 * Checks if the user has ALL the roles listed
 */
const hasRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
    return requiredRoles.every((role) => userRoles.includes(role));
};

/**
 * @description verifies the user; expects catch in calling function
 * @arg {string} userId _id of the user to verify
 * @throws {ClientError} The user navigated to an invalid link
 * @returns {Promise<UpdateWriteOpResult>} MongoDB Cursor Promise
 */
const confirmUserEmail = async (
    userId: string
): Promise<UpdateWriteOpResult> => {
    const objectUserId = new ObjectID(userId);
    const doc = await Collections.Users().findOne({ _id: objectUserId });

    if (doc) {
        const verified = { $set: { verified: true } };
        return Collections.Users().updateOne({ _id: objectUserId }, verified);
    }

    throw new ClientError('Invalid Link');
};

/**
 * @description Function to send reset password link to user's email using jwt based on user's _id
 * @param {string} email user's email to send reset password link to
 * @returns {Promise} evaluates to the email sent
 * @throws {ClientError} Invalid Email or error with signing jwt
 */
// TODO: remove the any/unknown
const sendPasswordResetEmail = async (email: string): Promise<unknown> => {
    const doc = await Collections.Users().findOne({ 'email.address': email });
    const { JWT_SECRET } = env;
    const defaultSecret = 'secret';
    const secret = JWT_SECRET || defaultSecret;
    if (secret === defaultSecret) {
        // TODO: LOG A WARNING BECAUSE THIS SHOULD NOT HAPPEN
    }
    if (doc) {
        // Filter doc
        const { _id } = doc;
        const token = await jwt.sign(
            { _id },
            {
                expiresIn: '30m',
            }
        );
        return Emails.sendPasswordReset(email, token);
    }
    throw new ClientError('Invalid Email');
};

/**
 * @description Function to reset user's password in database
 * @param {object} decodedJwt user jwt that is decoded
 * @param {string} password new password
 * @param {string} confirmPassword new password confirmation
 * @returns {Promise<UpdateWriteOpResult>} resolves to a MongoDB cursor on success
 * @throws {ClientError} Passwords do Not Match, Invalid Link, Expired Link
 */
const updatePassword = async (
    decodedJwt: UserUtils.UserDoc & { _id: string },
    password: string,
    confirmPassword: string
): Promise<UpdateWriteOpResult> => {
    const { _id } = decodedJwt;
    // Find user in database then hash and update with new password
    if (password === confirmPassword) {
        // const doc = await Collections.Users().findOne({ _id });
        const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
        const updatedPassword = {
            $set: { password: encryptedPw },
        };
        return Collections.Users().updateOne({ _id }, updatedPassword);
    }
    // if they do not match, throw an error
    throw new ClientError('Passwords do not match');
};

/**
 * @description register the user in the database ONLY
 * @arg email
 * @arg password
 * @arg confirmPass
 * @throws {ClientError} Username or email already exists, Passwords do not match
 * @throws {ClientError} Passwords do not match
 */
const register = async (
    email: string,
    password: string,
    confirmPass: string
): Promise<InsertOneWriteOpResult<WithId<UserUtils.UserDoc>>> => {
    if (password !== confirmPass)
        throw new ClientError('Passwords do not match');

    const match = await Collections.Users().findOne({
        'email.address': email,
    });
    if (!match) throw new ClientError('Username or E-mail already exists');

    const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const user = UserUtils.makeUser(email, { password: encryptedPw });
    return Collections.Users().insertOne(user);
};

// TODO: figure out where this should belong
/**
 * @description filters the sensitive data using whitelist methodology
 * @arg {UserDoc} userDoc target to filter
 * @returns {Partial<ClientSafeUserDoc>} resolves to the userDoc with ONLY whitelisted fields
 */
const filterSensitiveData = (
    userDoc: UserUtils.UserDoc
): Partial<UserUtils.ClientSafeUserDoc> => {
    function reducer(
        accum: Partial<UserUtils.ClientSafeUserDoc>,
        key: keyof UserUtils.UserDoc
    ): Partial<UserUtils.ClientSafeUserDoc> {
        if (userDoc[key] !== undefined) {
            return { ...accum, [key]: userDoc[key] };
        }
        return accum;
    }
    return UserUtils.whitelist.reduce<Partial<UserUtils.ClientSafeUserDoc>>(
        reducer,
        {}
    );
};

/**
 * @description determines if the userId owns the document
 * @arg userId
 * @arg doc
 * @returns whether or not the user is the owner of a particular document
 */
const isOwner = (userId = '', doc: { userId?: string } = {}): boolean => {
    return doc.userId === String(userId);
};

export default {
    register,
    // registerTemporary,
    verifyPassword: bcrypt.compare,
    hasRoles,
    filterSensitiveData,
    isOwner,
    verifyUser: confirmUserEmail,
    sendPasswordResetEmail,
    updatePassword,
};
