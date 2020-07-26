import express from 'express';

import owner from './owner';
import passwordReset from './password-reset';

const router = express.Router();

router.use('/api/auth/password-reset', passwordReset);
router.use('/api/auth/owner', owner);

export default router;
