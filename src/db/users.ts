/* eslint-disable @typescript-eslint/indent */
import { ObjectID, Collection, UpdateQuery, FilterQuery } from 'mongodb';
import Mongo from '../config/mongo.config';

interface UserDoc {
    username: string;
    roles: string[];
    email: string;
    name: {
        fName: string;
        lName: string;
    };
    password: string;
    verified: boolean;
}
export interface DBUser extends UserDoc {
    _id: ObjectID | string;
}
type WhiteList = '_id' | 'email' | 'username' | 'roles' | 'name' | 'verified';
export const whitelist: string[] = [
    '_id',
    'email',
    'username',
    'roles',
    'name',
    'verified',
];
export type ClientSafeUserDoc = Pick<DBUser, WhiteList>;

export default (function () {
    let initialized = false;
    let collection: Collection<DBUser>;

    const throwIfNotInitialized = () => {
        if (!initialized) {
            throw new Error('Not yet connected to DB');
        }
    };

    return {
        async init(): Promise<void> {
            if (!initialized) {
                collection = await Mongo.collection<DBUser>('users');
                initialized = true;
            }
        },
        async addUser(userDoc: UserDoc) {
            throwIfNotInitialized();
            const writeResult = await collection.insertOne(userDoc);
            return writeResult.ops[0];
        },
        async updateUser(
            doc: UserDoc,
            modification: UpdateQuery<Partial<UserDoc>>
        ) {
            throwIfNotInitialized();
            return collection.updateOne(doc, modification);
        },
        async removeUser(email: string) {
            throwIfNotInitialized();
            return collection.deleteOne({ email });
        },
        async findByUsername({ username }: { username: string }) {
            throwIfNotInitialized();
            return collection
                .find({ username })
                .toArray()
                .then((r) => r[0]);
        },
        async findByUserId(userId: ObjectID | string) {
            throwIfNotInitialized();
            return collection
                .find({ _id: new ObjectID(userId) })
                .toArray()
                .then((r) => r[0]);
        },
        async findByEmail(email: string) {
            throwIfNotInitialized();
            return collection
                .find({ email })
                .toArray()
                .then((r) => r[0]);
        },
        async find(query: FilterQuery<DBUser> | undefined) {
            throwIfNotInitialized();
            return collection.find(query).toArray();
        },
        initialized,
    };
})();
