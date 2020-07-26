/* eslint-disable @typescript-eslint/indent */
import { ObjectId, Collection } from 'mongodb';
import { getCollection } from './mongo';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface UserDoc {
    _id?: ObjectId;
    [index: string]: unknown;
    meta: {
        createdAt: string;
        method: 'invitation' | 'registration';
    };
    email: {
        address: string;
        verified: boolean;
    };
    name: {
        first: string;
        last: string;
    };
    roles: string[];
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

export function makeUser(
    email: string,
    overrides: Partial<UserDoc> = {}
): UserDoc {
    return {
        meta: {
            createdAt: new Date().toISOString(),
            method: 'registration',
        },
        email: {
            address: email,
            verified: false,
        },
        name: {
            first: '',
            last: '',
        },
        roles: [],
        ...overrides,
    };
}

export default (): Collection<UserDoc> => getCollection<UserDoc>('users');
