/* eslint-disable @typescript-eslint/indent */
import { ObjectId, Db, Collection } from 'mongodb';
import { getCollection } from './mongo';

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

export default (): Collection<UserDoc> => getCollection<UserDoc>('users');

// export default {
//     collectionName: 'users',
//     init(db: Db): Collection<UserDoc> {
//         return db.collection<UserDoc>(this.collectionName);
//     },
// };
