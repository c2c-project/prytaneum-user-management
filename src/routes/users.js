import express from 'express';
import passport from 'passport';
import jwt from '../lib/jwt';
import Accounts from '../lib/accounts';
import Emails from '../lib/email';
import { ClientError } from '../lib/errors';

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        const { form } = req.body;
        const { username, email, password, confirmPassword } = form;
        const { _id } = await Accounts.register(
            username,
            password,
            confirmPassword,
            {
                email,
            }
        );
        // TODO: provide option to re-send verification email
        Emails.sendEmailVerification(email, _id);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post(
    '/login',
    passport.authenticate('login', { session: false }),
    async (req, res, next) => {
        try {
            const { user } = req;
            const clientUser = await Accounts.filterSensitiveData(user);
            const token = await jwt.sign(
                clientUser,
                process.env.JWT_SECRET,
                {}
            );
            res.status(200).send({ jwt: token });
        } catch (e) {
            next(e);
        }
    }
);

// NOTE: unprotected route here
// TODO: rate limit this
router.post('/login-temporary', async (req, res, next) => {
    try {
        const { username } = req.body;
        const userDoc = await Accounts.registerTemporary(username, {
            roles: ['user'],
        });
        const token = await jwt.sign(userDoc, process.env.JWT_SECRET, {});
        res.status(200).send({ jwt: token });
    } catch (e) {
        next(e);
    }
});

router.post(
    '/authenticate',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const { user } = req;
        const { requiredAny, requiredAll, requiredNot } = req.body;
        const allowed = await Accounts.isAllowed(user.roles, {
            requiredAll,
            requiredAny,
            requiredNot,
        }).catch(next);
        res.status(200).send({
            allowed,
        });
    }
);

router.post('/confirm/user-email', async (req, res, next) => {
    // we want to wait for this before sending a success message
    try {
        const { userId } = req.body;
        await Accounts.verifyUser(userId);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

// Call to send password reset email
router.post('/request-password-reset', async (req, res, next) => {
    if (req.body.form.email !== undefined) {
        try {
            await Accounts.sendPasswordResetEmail(req.body.form.email);
            res.status(200).send();
        } catch (e) {
            next(e);
        }
    } else {
        next(new ClientError('Email Missing'));
    }
});

// Call to update to new password
router.post('/consume-password-reset-token', async (req, res, next) => {
    try {
        const { token, form } = req.body;
        const { password, confirmPassword } = form;

        const decodedJwt = await jwt.verify(token, process.env.JWT_SECRET);
        await Accounts.updatePassword(decodedJwt, password, confirmPassword);

        res.status(200).send('Password Reset');
    } catch (e) {
        if (e instanceof ClientError) {
            next(e);
        } else {
            const { message } = e;
            if (message === 'jwt expired') {
                next(new ClientError('Expired Link'));
            } else {
                next(new ClientError('Invalid Link'));
            }
        }
    }
});

module.exports = router;
