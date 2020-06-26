import Users from './users';
import Mongo from './mongo';

beforeAll(async () => {
    await Mongo.init();
    Users.init();
});

afterAll(async () => {
    await Mongo.close();
});

describe('user collection tests', () => {
    it('init should fail since it has already been called', () => {
        expect(Users.isInitialized()).toStrictEqual(true);
        Users.init();
    });
});
