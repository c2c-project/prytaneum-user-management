import express from 'express';
import Joi from '@hapi/joi';

import jwt from 'lib/jwt/jwt';
import Users from 'modules/users';
import Emails from 'lib/email';
import { ClientError } from 'lib/errors';
import { UserDoc } from 'db/users';
import { makeJoiMiddleware } from 'middlewares';

const router = express.Router();

interface RegForm {
    email: string;
    password: string;
    confirmPassword: string;
}

router.post(
    '/register',
    makeJoiMiddleware({
        body: Joi.object({
            form: Joi.object<RegForm, RegForm>({
                email: Joi.string().email().required().messages({
                    'any.required': 'E-mail is required',
                    'string.email': 'Invalid e-mail provided',
                }),
                password: Joi.string().min(8).max(32).required().messages({
                    'any.required': 'Password is required',
                    'string.ref':
                        'Password must be between 8 and 32 characters',
                }),
                confirmPassword: Joi.ref('password'),
            }).required(),
        }),
    }),
    async (req, res, next) => {
        try {
            const { form } = req.body as { form: RegForm };
            const { email, password, confirmPassword } = form;
            const { insertedId } = await Users.register(
                email,
                password,
                confirmPassword
            );
            // TODO: provide option to re-send verification email
            Emails.sendEmailVerification(email, insertedId);
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/email/verify',
    makeJoiMiddleware({
        body: Joi.object({
            userId: Joi.string()
                .required()
                .messages({ 'any.required': 'Invalid link' }),
        }),
    }),
    async (req, res, next) => {
        try {
            const { userId } = req.body as { userId: string };
            await Users.verifyUser(userId);
            res.status(200).send();
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/password/forgot-password',
    makeJoiMiddleware({
        body: Joi.object({
            form: Joi.object({
                email: Joi.string().email().required().messages({
                    'any.required': 'E-mail is required',
                    'string.email': 'Invalid e-mail provided',
                }),
            }),
        }),
    }),
    async (req, res, next) => {
        try {
            const { form } = req.body as { form: { email: string } };
            await Users.sendPasswordResetEmail(form.email);
            res.status(200).send();
        } catch (e) {
            next(e);
        }
    }
);

// Call to update to new password
router.post(
    '/password/consume-reset-token',
    makeJoiMiddleware({
        body: Joi.object({
            token: Joi.string().required(),
            form: Joi.object({
                password: Joi.string().min(8).max(32).required(),
                confirmPassword: Joi.ref('password'),
            }),
        }),
    }),
    async (req, res, next) => {
        try {
            const { token, form } = req.body as {
                token: string;
                form: {
                    password: string;
                    confirmPassword: string;
                };
            };
            const { password, confirmPassword } = form;

            const decodedJwt = (await jwt.verify(token)) as UserDoc & {
                _id: string;
            };
            await Users.updatePassword(decodedJwt, password, confirmPassword);

            res.status(200).send('Password Reset');
        } catch (e) {
            if (e instanceof ClientError) {
                next(e);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const { message } = e;
                if (message === 'jwt expired') {
                    next(new ClientError('Expired Link'));
                } else {
                    next(new ClientError('Invalid Link'));
                }
            }
        }
    }
);

export default router;
