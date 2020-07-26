/* eslint-disable @typescript-eslint/indent */
import { ObjectId, Collection } from 'mongodb';
import { getCollection } from './mongo';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface UserDoc extends Express.User {
    [index: string]: unknown;
    _id?: ObjectId;
    method: {
        createdAt: Date;
        method: 'invitation';
    };
    username: string;
    roles: ['temp-user'];
    tokens: string[];
    email: {
        address: string;
        verified: false;
    };
    name: {
        first: string;
        last: string;
    };
    password: string;
}

type WhiteList = '_id' | 'email' | 'username' | 'roles' | 'name';
export const whitelist: string[] = [
    '_id',
    'email',
    'username',
    'roles',
    'name',
];
export type ClientSafeUserDoc = Pick<UserDoc, WhiteList>;

export default (): Collection<UserDoc> => getCollection<UserDoc>('temp-users');
