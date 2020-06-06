import Mongo from 'config/mongo.config';
import connect from 'db/connect';

import Accounts from './accounts';

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await Mongo.close();
});

describe('Accounts', () => {
    describe('#isAllowed()', () => {
        const userRoles = ['moderator'];
        it('should reject if there are no required roles', async () => {
            const value = await Accounts.isAllowed(userRoles, {});
            expect(value).toStrictEqual(false);
        });
        it('should reject if there are no user roles', async () => {
            const value = await Accounts.isAllowed([], {});
            expect(value).toStrictEqual(false);
        });
        it('should pass various valid use cases', async () => {
            const value1 = await Accounts.isAllowed(userRoles, {
                requiredAll: ['moderator'],
                requiredNot: ['speaker'],
            });
            const value2 = await Accounts.isAllowed(userRoles, {
                requiredAny: ['admin', 'moderator'],
            });
            const value3 = await Accounts.isAllowed(userRoles, {
                requiredNot: ['speaker'],
            });
            expect(value1).toStrictEqual(true);
            expect(value2).toStrictEqual(true);
            expect(value3).toStrictEqual(true);
        });
        it('should reject various invalid use cases', async () => {
            const value1 = await Accounts.isAllowed(userRoles, {
                requiredNot: ['moderator'],
            });
            const value2 = await Accounts.isAllowed(userRoles, {
                requiredAll: ['admin', 'moderator'],
            });
            const value3 = await Accounts.isAllowed(userRoles, {
                requiredAny: ['admin', 'user'],
            });
            expect(value1).toStrictEqual(false);
            expect(value2).toStrictEqual(false);
            expect(value3).toStrictEqual(false);
        });
        it('should reject with no args', async () => {
            const value = await Accounts.isAllowed();
            expect(value).toStrictEqual(false);
        });
    });
    describe('#isOwner()', () => {
        it('should return true', async () => {
            const result = await Accounts.isOwner('1', { userId: '1' });
            expect(result).toBeTruthy();
        });
        it('should return false', async () => {
            const result = await Accounts.isOwner('2', { userId: '1' });
            expect(result).toBeFalsy();
        });
    });
});
