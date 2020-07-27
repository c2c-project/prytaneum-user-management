import { connect, close } from 'db';

import Users from './users';

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await close();
});

describe('Users', () => {
    // describe('#isAllowed()', () => {
    //     const userRoles = ['moderator'];
    //     it('should reject if there are no required roles', () => {
    //         const value = Users.isAllowed(userRoles, {});
    //         expect(value).toStrictEqual(false);
    //     });
    //     it('should reject if there are no user roles', () => {
    //         const value = Users.isAllowed([], {});
    //         expect(value).toStrictEqual(false);
    //     });
    //     it('should pass various valid use cases', () => {
    //         const value1 = Users.isAllowed(userRoles, {
    //             requiredAll: ['moderator'],
    //             requiredNot: ['speaker'],
    //         });
    //         const value2 = Users.isAllowed(userRoles, {
    //             requiredAny: ['admin', 'moderator'],
    //         });
    //         const value3 = Users.isAllowed(userRoles, {
    //             requiredNot: ['speaker'],
    //         });
    //         expect(value1).toStrictEqual(true);
    //         expect(value2).toStrictEqual(true);
    //         expect(value3).toStrictEqual(true);
    //     });
    //     it('should reject various invalid use cases', () => {
    //         const value1 = Users.isAllowed(userRoles, {
    //             requiredNot: ['moderator'],
    //         });
    //         const value2 = Users.isAllowed(userRoles, {
    //             requiredAll: ['admin', 'moderator'],
    //         });
    //         const value3 = Users.isAllowed(userRoles, {
    //             requiredAny: ['admin', 'user'],
    //         });
    //         expect(value1).toStrictEqual(false);
    //         expect(value2).toStrictEqual(false);
    //         expect(value3).toStrictEqual(false);
    //     });
    //     it('should reject with no args', () => {
    //         const value = Users.isAllowed();
    //         expect(value).toStrictEqual(false);
    //     });
    // });
    describe('#isOwner()', () => {
        it('should return true', () => {
            const result = Users.isOwner('1', { userId: '1' });
            expect(result).toBeTruthy();
        });
        it('should return false', () => {
            const result = Users.isOwner('2', { userId: '1' });
            expect(result).toBeFalsy();
        });
    });
});
