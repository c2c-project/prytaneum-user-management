import express from 'express';
import Joi from '@hapi/joi';

import { isAdminMiddleware } from 'modules/admin';
import { makeJoiMiddleware } from 'middlewares';

const router = express.Router();

interface RegForm {
    email: string;
    password: string;
    confirmPassword: string;
}

router.use(isAdminMiddleware);
/* TODO: add code here for admin dashboard
    1. user list
    2. promote user
    3. get one specific user
*/
router.post('/users/list', () => {
    // do something
});

export default router;
