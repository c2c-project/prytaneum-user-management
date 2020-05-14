import { ObjectID } from 'mongodb';
import MongoCollection from '../config/mongo.config';

const Users = function () {
    MongoCollection.call(this, 'users');
};

Users.prototype.addUser = function (userDoc) {
    return this.collection.insertOne(userDoc).then((r) => r.ops[0]);
};

Users.prototype.updateUser = function (doc, addition) {
    return this.collection.updateOne(doc, addition);
};

Users.prototype.removeUser = function (email) {
    return this.collection.deleteOne({ email });
};

Users.prototype.findByUsername = function ({ username }) {
    return this.collection
        .find({ username })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByUserId = function (userId) {
    return this.collection
        .find({ _id: new ObjectID(userId) })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByEmail = function (email) {
    return this.collection
        .find({ email })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.find = async function (...args) {
    return this.collection.find(...args).toArray();
};

export default new Users();
