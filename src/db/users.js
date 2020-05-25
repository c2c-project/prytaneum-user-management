import { ObjectID } from 'mongodb';
import Mongo from '../config/mongo.config';

const Users = function () {
    this.connectionStatus = Mongo.call(this, 'users');
};

Users.prototype.addUser = async function (userDoc) {
    await this.connectionStatus;
    return this.collection.insertOne(userDoc).then((r) => r.ops[0]);
};

Users.prototype.updateUser = async function (doc, addition) {
    await this.connectionStatus;
    return this.collection.updateOne(doc, addition);
};

Users.prototype.removeUser = async function (email) {
    await this.connectionStatus;
    return this.collection.deleteOne({ email });
};

Users.prototype.findByUsername = async function ({ username }) {
    await this.connectionStatus;
    return this.collection
        .find({ username })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByUserId = async function (userId) {
    await this.connectionStatus;
    return this.collection
        .find({ _id: new ObjectID(userId) })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.findByEmail = async function (email) {
    await this.connectionStatus;
    return this.collection
        .find({ email })
        .toArray()
        .then((r) => r[0]);
};

Users.prototype.find = async function (...args) {
    await this.connectionStatus;
    return this.collection.find(...args).toArray();
};

export default new Users();
