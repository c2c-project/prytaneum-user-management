import jwt from './jwt';

describe('async jwt', () => {
    it('should use default options with jwt', async () => {
        const token = await jwt.sign({});
        expect(token).toBeTruthy();
    });
});
