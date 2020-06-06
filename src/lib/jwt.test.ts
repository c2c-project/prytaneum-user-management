import dotenv from 'dotenv';
import jwt from './jwt';

dotenv.config();

describe('async jwt', () => {
    it('should use default options with jwt', async () => {
        const token = await jwt.sign({}, process.env.JWT_SECRET);
        expect(token).toBeTruthy();
    });
});
