import { ObjectID } from 'mongodb';
import MongoCollection from '../config/mongo.config';

const Users = new MongoCollection('users');

const addUser = function (userDoc) {
    return this.collection.insertOne(userDoc).then((r) => r.ops[0]);
};

const updateUser = function (doc, addition) {
    return this.collection.updateOne(doc, addition);
};

const removeUser = function (_id) {
    return this.collection.deleteOne({ _id: new ObjectID(_id) });
};

const findByUsername = function ({ username }) {
    return this.collection
        .find({ username })
        .toArray()
        .then((r) => r[0]);
};

const findByUserId = function (userId) {
    return this.collection
        .find({ _id: new ObjectID(userId) })
        .toArray()
        .then((r) => r[0]);
};

const findByEmail = function (email) {
    return this.collection
        .find({ email })
        .toArray()
        .then((r) => r[0]);
};

const find = async function (...args) {
    this.collection.find(...args).toArray();
};

export default {
    find: find.bind(Users),
    findByEmail: findByEmail.bind(Users),
    findByUserId: findByUserId.bind(Users),
    findByUsername: findByUsername.bind(Users),
    updateUser: updateUser.bind(Users),
    addUser: addUser.bind(Users),
    removeUser: removeUser.bind(Users),
};
