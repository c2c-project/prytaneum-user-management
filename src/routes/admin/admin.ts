/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import Joi from '@hapi/joi';

import Admin from 'modules/admin';
import { userForm, userStatus } from 'modules/admin/types';

import { makeJoiMiddleware } from 'middlewares';

const router = express.Router();

router.use(Admin.isAdminMiddleware);
/* TODO: add code here for admin dashboard
    1. user list
    2. get one specific user
    3. promote user
*/

// *Fetch A specific user data
router.get(
    '/users/:userId',
    makeJoiMiddleware({
        params: Joi.object({
            userId: Joi.string()
                .required()
                .messages({ 'any.required': 'Invalid Link' }),
        }),
    }),
    async (req, res, next) => {
        try {
            const { userId } = req.params;
            const user = await Admin.confirmUserExist(userId);
            if (user) {
                res.status(200).send(user);
            }
        } catch (e) {
            console.log(e);
            next(e);
        }
    }
);

// *Patch a user status data. Allows modification of user status
router.patch(
    '/users/:userId/update',
    makeJoiMiddleware({
        params: Joi.object({
            userId: Joi.string()
                .required()
                .messages({ 'any.required': 'Invalid link' }),
        }),
        body: Joi.object({
            form: Joi.object<userForm, userForm>({
                status: Joi.array()
                    .items(
                        Joi.object<userStatus, userStatus>({
                            role: Joi.string().required().messages({
                                'any.required': 'valid status required',
                            }),
                            count: Joi.number().required().messages({
                                'number.required': 'Valid number is required',
                            }),
                            active: Joi.boolean().required().messages({
                                'any.required': 'Boolean value was not passed',
                            }),
                        }).required()
                    )
                    .required(),
            }).required(),
        }),
    }),
    async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { form } = req.body as { form: { status: userStatus[] } };
            await Admin.updateUserStatus(userId, form.status);
            res.status(200).send();
        } catch (e) {
            next(e);
        }
    }
);

// *Fetch all the user data
router.get('/users', async (req, res, next) => {
    try {
        const users = await Admin.fetchAllUsers();
        res.status(200).send(users);
    } catch (e) {
        next(e);
    }
});

export default router;
