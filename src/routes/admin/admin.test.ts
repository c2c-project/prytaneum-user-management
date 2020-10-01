import { ObjectID } from 'mongodb';
import request from 'supertest';
import faker from 'faker';

import app from 'app';
import Users from 'modules/users';
import Collections, { connect, close } from 'db';

const statusType = ['Admin', 'Moderator', 'Organizer', 'Attended', 'Banned'];

// TODO Change Id used as a parameter in url

const makeUserStatus = statusType.map((s) => {
    return {
        role: s,
        count: faker.random.number(),
        active: faker.random.boolean(),
    };
});

const mockUser = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    userRoles: ['users'],
    _id: new ObjectID(),
    status: makeUserStatus,
};

beforeAll(async () => {
    await connect();
    const { insertedId } = await Users.register(
        mockUser.email,
        mockUser.password,
        mockUser.password
    );
    mockUser._id = insertedId;
});

afterAll(async () => {
    await Collections.Users().deleteOne({ 'email.address': mockUser.email });
    await close();
});

describe('#User List', () => {
    const url = '/api/users/list';

    it('it should retrieve a list of user for admin to see', async () => {
        const { status } = await request(app).get(url);

        expect(status).toStrictEqual(200);
    });

    it('it should not retrieve al ist of user, invalid connection', async () => {
        const { status } = await request(app).get(`${url}x`);
        expect(status).toStrictEqual(400);
    });
});

describe('#Fetch specific User', () => {
    const url = '/api/users/:userId';
    it('it should retrieve info of a specific user', async () => {
        const { status } = await request(app)
            .get(url)
            .query({ userId: mockUser._id });

        expect(status).toStrictEqual(200);
    });
});

describe('#Promote a specific User', () => {
    const url = '/users/:userId/update';

    it('should promote a user', async () => {
        const userStatus = makeUserStatus;

        const { status } = await request(app)
            .patch(url)
            .query({ userId: mockUser._id })
            .send({
                form: {
                    status: userStatus,
                },
            });

        expect(status).toStrictEqual(200);
    });
});
