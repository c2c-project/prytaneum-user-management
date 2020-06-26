/* eslint-disable @typescript-eslint/indent */
import {
    ObjectID,
    Collection,
    UpdateQuery,
    FilterQuery,
    ObjectId,
} from 'mongodb';
import Mongo from './mongo';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface UserDoc extends Express.User {
    _id?: ObjectId;
    [index: string]: unknown;
    username: string;
    roles: string[];
    email?: string; // TODO: make sure this isn't undefined
    name: {
        fName: string;
        lName: string;
    };
    password: string;
    verified: boolean;
}

// export interface DBUser extends UserDoc {
//     _id: ObjectID | string;
// }
// export type DBUser = WithId<UserDoc>;
type WhiteList = '_id' | 'email' | 'username' | 'roles' | 'name' | 'verified';
export const whitelist: string[] = [
    '_id',
    'email',
    'username',
    'roles',
    'name',
    'verified',
];
export type ClientSafeUserDoc = Pick<UserDoc, WhiteList>;

function Users() {
    let initialized = false;
    let collection: Collection<UserDoc>;

    return {
        isInitialized() {
            return initialized;
        },
        init(): void {
            if (!initialized) {
                collection = Mongo.collection<UserDoc>('users');
                initialized = true;
            }
        },
        async addUser(userDoc: UserDoc) {
            const writeResult = await collection.insertOne(userDoc);
            return writeResult.ops[0];
        },
        async updateUser(
            filter: FilterQuery<UserDoc>,
            modification: UpdateQuery<Partial<UserDoc>>
        ) {
            return collection.updateOne(filter, modification);
        },
        async removeUser(email: string) {
            return collection.deleteOne({ email });
        },
        async findByUsername({ username }: { username: string }) {
            return collection
                .find({ username })
                .toArray()
                .then((r) => r[0]);
        },
        async findByUserId(userId: ObjectID | string) {
            return collection
                .find({ _id: new ObjectID(userId) })
                .toArray()
                .then((r) => r[0]);
        },
        async findByEmail(email: string) {
            return collection
                .find({ email })
                .toArray()
                .then((r) => r[0]);
        },
        async find(query: FilterQuery<UserDoc>) {
            return collection.find(query).toArray();
        },
        async deleteOne(query: FilterQuery<UserDoc>) {
            return collection.deleteOne(query);
        },
    };
}

export default Users();
