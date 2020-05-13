import { ObjectID } from 'mongodb';
import mongo from '../config/mongo.config';

const Users = mongo('users');

/**
 * All functions within this module assume verification has been done before the call occurs
 */

const addUser = async (userDoc) =>
    Users.insertOne(userDoc).then((r) => r.ops[0]);

const updateUser = (doc, addition) => Users.updateOne(doc, addition);

const removeUser = () => {};

const findByUsername = ({ username }) =>
    Users.find({ username })
        .toArray()
        .then((r) => r[0]);

const findByUserId = (userId) =>
    Users.find({ _id: new ObjectID(userId) })
        .toArray()
        .then((r) => r[0]);

const findByEmail = (email) =>
    Users.find({ email })
        .toArray()
        .then((r) => r[0]);

const find = (...args) => Users.find(...args).toArray();

export default {
    addUser,
    updateUser,
    removeUser,
    findByUsername,
    findByUserId,
    findByEmail,
    find,
};
