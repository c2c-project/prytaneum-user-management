import { ObjectID } from 'mongodb';
import request from 'supertest';
import faker from 'faker';

import app from 'app';
import Users from 'modules/users';
import Collections, { connect, close } from 'db';
import { UserDoc, makeUser } from 'db/users';

const statusType = ['Admin', 'Moderator', 'Organizer', 'Attended', 'Banned'];

// TODO Change Id used as a parameter in url

const makeUserStatus = statusType.map((s) => {
    return {
        role: s,
        count: faker.random.number(),
        active: faker.random.boolean(),
    };
});

const mockUser = makeUser(faker.internet.email(), {
    password: faker.internet.password(),
});

beforeAll(async () => {
    await connect();
    const { insertedId } = await Users.register(
        mockUser.email.address,
        mockUser.password,
        mockUser.password
    );
    mockUser._id = insertedId;
});

afterAll(async () => {
    await Collections.Users().deleteOne({ 'email.address': mockUser.email });
    await close();
});

const prefix = '/api/admin';

describe('#User List', () => {
    const url = `${prefix}/users`;

    it('it should retrieve a list of user for admin to see', async () => {
        const { status } = await request(app).get(url);

        expect(status).toStrictEqual(200);
    });

    // TODO: once we have solidifed how to verify an admin, fix this test
    // it('it should not retrieve a list of user, invalid connection', async () => {
    //     const { status } = await request(app).get(`${url}`);
    //     expect(status).toStrictEqual(400);
    // });
});

describe('#Fetch specific User', () => {
    let url: string;

    beforeAll(() => {
        const strId = mockUser._id?.toHexString();
        url = `${prefix}/users/${strId || ''}`;
    });
    it('it should retrieve info of a specific user', async () => {
        const { status } = await request(app).get(url);

        expect(status).toStrictEqual(200);
    });
});

describe('#Promote a specific User', () => {
    let url: string;

    beforeAll(() => {
        const strId = mockUser._id?.toHexString();
        url = `${prefix}/users/${strId || ''}/update`;
    });

    it('should promote a user', async () => {
        const userStatus = makeUserStatus;

        const { status } = await request(app)
            .patch(url)
            .send({
                form: {
                    status: userStatus,
                },
            });

        expect(status).toStrictEqual(200);
    });
});
