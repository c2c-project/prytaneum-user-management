import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import Accounts from 'lib/accounts';
import Users, { UserDoc } from 'db/users';
import env from 'config/env';

passport.use(
    'login',
    new LocalStrategy((username: string, password: string, done) => {
        async function verify(): Promise<void> {
            try {
                const user = await Users.findByUsername({ username });
                if (!user) {
                    // user does not exist
                    done(null, false);
                }
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
        (jwtPayload: UserDoc & { _id: string }, done) => {
            async function verify() {
                try {
                    const user = await Users.findByUserId(jwtPayload._id);
                    if (!user) {
                        done(null, false);
                    }
                    done(null, user);
                } catch (e) {
                    done(e);
                }
            }
            // eslint-disable-next-line no-void
            void verify();
        }
    )
);
