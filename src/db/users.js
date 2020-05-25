import { ObjectID } from 'mongodb';
import Mongo from '../config/mongo.config';

const Users = function () {};

Users.prototype.init = async function () {
    if (!this.initialed) {
        this.initialized = true;
        this.collection = await Mongo.collection('users');
    }
};

Users.prototype.addUser = async function (userDoc) {
    return this.collection.insertOne(userDoc).then((r) => r.ops[0]);
};

Users.prototype.updateUser = async function (doc, addition) {
    return this.collection.updateOne(doc, addition);
};

Users.prototype.removeUser = async function (email) {
    return this.collection.deleteOne({ email });
};

Users.prototype.findByUsername = async function ({ username }) {
    return this.collection
        .find({ username })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByUserId = async function (userId) {
    return this.collection
        .find({ _id: new ObjectID(userId) })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByEmail = async function (email) {
    return this.collection
        .find({ email })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.find = async function (...args) {
    return this.collection.find(...args).toArray();
};

export default new Users();
