import express from 'express';

import userRoutes from './users';
import adminRoutes from './admin';

const router = express.Router();

router.use('/api/users', userRoutes);
router.use('/api/admin', adminRoutes);

export default router;
