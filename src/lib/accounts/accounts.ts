/* eslint-disable @typescript-eslint/indent */
import bcrypt from 'bcrypt';

import Users, { whitelist, ClientSafeUserDoc, DBUser } from 'db/users';
import jwt from '../jwt';
import { ClientError } from '../errors';
import Emails from '../email';

const SALT_ROUNDS = 10;
const BASE_USER = {
    roles: ['user'],
};

/**
 * @description Realistically, only one of the required's fields within the requirements object will be used at any given time
 * @arg {Array} userRoles the array of string codes corresponding to the user's assigned roles
 * @arg {Object} requirements the object containing different role requirements for what they are trying to access
 * @returns {Promise} evalutes to a boolean
 */
const isAllowed = async (
    userRoles: Array<string> = [],
    {
        requiredAll = [],
        requiredAny = [],
        requiredNot = [],
    }: {
        requiredAll?: string[];
        requiredAny?: string[];
        requiredNot?: string[];
    } = {}
): Promise<boolean> => {
    if (userRoles.length === 0) {
        return false;
    }
    const isNull =
        requiredAll.length === 0 &&
        requiredAny.length === 0 &&
        requiredNot.length === 0;
    if (isNull) {
        return false;
    }
    const every =
        requiredAll.length > 0
            ? requiredAll.every((role) => userRoles.includes(role))
            : true;
    const any =
        requiredAny.length > 0
            ? userRoles.some((role) => requiredAny.includes(role))
            : true;
    const not =
        requiredNot.length > 0
            ? userRoles.every((role) => !requiredNot.includes(role))
            : true;

    return every && any && not;
};

/**
 * @description verifies the user; expects catch in calling function
 * @arg {string} userId _id of the user to verify
 * @throws {ClientError} The user navigated to an invalid link
 * @returns {Promise} MongoDB Cursor Promise
 */
const confirmUserEmail = async (userId: string): Promise<any> => {
    const doc = await Users.findByUserId(userId);

    if (doc) {
        const verified = { $set: { verified: true } };
        return Users.updateUser(doc, verified);
    }

    throw new ClientError('Invalid Link');
};

/**
 * @description Function to send reset password link to user's email using jwt based on user's _id
 * @param {string} email user's email to send reset password link to
 * @returns {Promise} evaluates to the email sent
 * @throws {ClientError} Invalid Email or error with signing jwt
 */
const sendPasswordResetEmail = async (email: string): Promise<any> => {
    const doc = await Users.findByEmail(email);
    if (doc) {
        // Filter doc
        const { _id } = doc;
        const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
            expiresIn: '30m',
        });
        return Emails.sendPasswordReset(email, token);
    }
    throw new ClientError('Invalid Email');
};

/**
 * @description Function to reset user's password in database
 * @param {object} decodedJwt user jwt that is decoded
 * @param {string} password new password
 * @param {string} confirmPassword new password confirmation
 * @returns {Promise} resolves to a MongoDB cursor on success
 * @throws {ClientError} Passwords do Not Match, Invalid Link, Expired Link
 */
const updatePassword = async (
    decodedJwt: { _id: string },
    password: string,
    confirmPassword: string
): Promise<any> => {
    const { _id } = decodedJwt;
    // Find user in database then hash and update with new password
    if (password === confirmPassword) {
        const doc = await Users.findByUserId(_id);
        const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
        const updatedPassword = {
            $set: { password: encryptedPw },
        };
        return Users.updateUser(doc, updatedPassword);
    }
    // if they do not match, throw an error
    throw new ClientError('Passwords do not match');
};

/**
 * @description register the user in the database ONLY
 * @arg {string} username
 * @arg {string} password
 * @arg {string} confirmPass
 * @arg {object} [additionalFields] optional argument with additional fields to register the user with
 * @returns {Promise} userDoc with db _id field
 * @throws {ClientError} Username or email already exists, Passwords do not match
 */
const register = async (
    username: string,
    password: string,
    confirmPass: string,
    additionalFields: {
        email?: string;
    } = {}
): Promise<any> => {
    const { email } = additionalFields;

    // if the user registered with an email & username, then find by username or email
    // because both should be unique, otherwise just find by username
    const query = email ? { $or: [{ email }, { username }] } : { username };

    if (password === confirmPass) {
        // returning a Promise here -- so register.then.catch will work
        const docArray = await Users.find(query);

        // if username and email do not already exist, based on my query before
        if (!docArray[0]) {
            const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
            return Users.addUser({
                username,
                password: encryptedPw,
                // BASE_USER before additionalFields so that way additionalFields can override defaults if necessary
                ...BASE_USER,
                ...additionalFields,
            });
        }

        throw new ClientError('Username or E-mail already exists');
    }
    throw new ClientError('Passwords do not match');
};

/**
 * @description registers a user temporarily
 * @arg {String} username
 * @returns {Promise} resolves to a MongoDB cursor
 * @throws {ClientError} Username already exists
 */
const registerTemporary = async (
    username: string,
    additionalFields = {}
): Promise<any> => {
    const doc = await Users.findByUsername({ username });
    // if username does not already exist
    if (!doc) {
        return Users.addUser({
            username,
            ...additionalFields,
            temporary: true,
        });
    }
    throw new ClientError('Username already exists');
};

// TODO: figure out where this should belong
/**
 * @description filters the sensitive data using whitelist methodology
 * @arg {DBUser} userDoc target to filter
 * @returns {ClientSafeUserDoc} resolves to the userDoc with ONLY whitelisted fields
 */
const filterSensitiveData = (userDoc: DBUser): ClientSafeUserDoc => {
    type Entry = [keyof DBUser, unknown];
    function reducer(
        accum: Partial<DBUser>,
        [key, value]: Entry
    ): Partial<ClientSafeUserDoc> {
        if (whitelist.includes(key)) {
            return { ...accum, [key]: value };
        }
        return accum;
    }
    const entries: Entry[] = Object.entries<DBUser>(userDoc);
    return Object.entries(userDoc).reduce(reducer, {});
};

/**
 * @description determines if the userId owns the document
 * @arg {string} userId
 * @arg {object} doc
 * @returns {boolean} whether or not the user is the owner of a particular document
 */
const isOwner = (userId: '', doc: { userId?: string } = {}): boolean => {
    return doc.userId === String(userId);
};

export default {
    register,
    registerTemporary,
    verifyPassword: bcrypt.compare,
    isAllowed,
    filterSensitiveData,
    isOwner,
    verifyUser: confirmUserEmail,
    sendPasswordResetEmail,
    updatePassword,
};
