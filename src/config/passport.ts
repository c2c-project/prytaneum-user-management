import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { ObjectID } from 'mongodb';

import Accounts from 'lib/accounts';
import Collections from 'db';
import env from 'config/env';

passport.use(
    'login',
    new LocalStrategy((username: string, password: string, done) => {
        async function verify(): Promise<void> {
            try {
                const user = await Collections.Users().findOne({ username });
                if (!user) {
                    // user does not exist
                    done(null, false);
                } else {
                    const isVerified = await Accounts.verifyPassword(
                        password,
                        user.password
                    );

                    // password does not match
                    if (!isVerified) {
                        done(null, false);
                    }

                    // password matches and we're good to go
                    done(null, user);
                }
            } catch (e) {
                // some error happened somewhere
                done(e);
            }
        }

        // eslint-disable-next-line no-void
        void verify();
    })
);

passport.use(
    'jwt',
    new JWTStrategy(
        {
            secretOrKey: env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        ({ _id }: { _id: string }, done) => {
            async function verify() {
                try {
                    const user = await Collections.Users().findOne({
                        _id: new ObjectID(_id),
                    });
                    if (!user) {
                        done(null, false);
                    } else {
                        done(null, user);
                    }
                } catch (e) {
                    done(e);
                }
            }

            // eslint-disable-next-line no-void
            void verify();
        }
    )
);
