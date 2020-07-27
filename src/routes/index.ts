import express from 'express';

import owner from './owner';
import passwordReset from './password-reset';
import userRoutes from './users';

const router = express.Router();

router.use('/api/auth/password-reset', passwordReset);
router.use('/api/auth/owner', owner);
router.use('/api/users', userRoutes);

export default router;
