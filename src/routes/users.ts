import express, { Request, NextFunction, Response } from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';

import jwt from 'lib/jwt/jwt';
import Accounts from 'lib/accounts';
import Emails from 'lib/email';
import { ClientError } from 'lib/errors';
import { UserDoc } from 'db/users';

const router = express.Router();

interface RegForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

function validate(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
    } else {
        next();
    }
}
router.post(
    '/register',
    [
        body('form.username').notEmpty(),
        body('form.email').notEmpty(),
        body('form.password').notEmpty(),
        body('form.confirmPassword').notEmpty(),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { form } = req.body as { form: RegForm };
            const { username, email, password, confirmPassword } = form;
            const { insertedId } = await Accounts.register(
                username,
                password,
                confirmPassword,
                {
                    email,
                }
            );
            // TODO: provide option to re-send verification email
            Emails.sendEmailVerification(email, insertedId);
            res.status(200).send();
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/login',
    passport.authenticate('login', { session: false }),
    async (req, res, next) => {
        try {
            const { user } = req as Request & { user?: UserDoc };
            if (!user) {
                throw new ClientError('Invalid Login');
            }
            const clientUser = Accounts.filterSensitiveData(user);
            const token = await jwt.sign(clientUser, {});
            res.status(200).send({ jwt: token });
        } catch (e) {
            next(e);
        }
    }
);

// NOTE: unprotected route here
// TODO: rate limit this
// router.post('/login-temporary', async (req, res, next) => {
//     try {
//         const { username } = req.body;
//         const userDoc = await Accounts.registerTemporary(username, {
//             roles: ['user'],
//         });
//         const token = await jwt.sign(userDoc, {});
//         res.status(200).send({ jwt: token });
//     } catch (e) {
//         next(e);
//     }
// });

router.post(
    '/authenticate',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req as Request & { user: UserDoc };
        const { requiredAny, requiredAll, requiredNot } = req.body as {
            requiredAll?: string[];
            requiredAny?: string[];
            requiredNot?: string[];
        };
        const allowed = Accounts.isAllowed(user.roles, {
            requiredAll,
            requiredAny,
            requiredNot,
        });
        res.status(200).send({
            allowed,
        });
    }
);

router.post('/confirm/user-email', async (req, res, next) => {
    // we want to wait for this before sending a success message
    try {
        const { userId } = req.body as { userId?: string };
        if (!userId) {
            throw new ClientError('Invalid input provided');
        }
        await Accounts.verifyUser(userId);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

// Call to send password reset email
router.post('/request-password-reset', async (req, res, next) => {
    try {
        const { form } = req.body as { form?: { email?: string } };
        if (!form || !form.email) {
            throw new ClientError('Invalid input provided'); // TODO: unify error messages
        }
        await Accounts.sendPasswordResetEmail(form.email);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

// Call to update to new password
router.post('/consume-password-reset-token', async (req, res, next) => {
    try {
        const { token, form } = req.body as {
            token?: string;
            form?: {
                password?: string;
                confirmPassword?: string;
            };
        };
        if (!form || !token || !form.confirmPassword || !form.password) {
            throw new ClientError('Invalid input provided');
        }
        const { password, confirmPassword } = form;

        const decodedJwt = (await jwt.verify(token)) as UserDoc & {
            _id: string;
        };
        await Accounts.updatePassword(decodedJwt, password, confirmPassword);

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
});

export default router;
