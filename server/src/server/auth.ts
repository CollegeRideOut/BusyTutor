import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as userService from '../modules/user/service';

export function setupAuth() {
  if (
    process.env.GOOGLE_CLIENT_ID === undefined ||
    process.env.GOOGLE_CLIENT_SECRET === undefined
  ) {
    console.log('error');
    throw new Error(
      `${process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID is empty/undefined'} 
      ${process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET is empty/undefined'}`
    );
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BASE_URL!}/api/google/callback`,
        passReqToCallback: true,
      },
      async function (req, accessToken, refreshToken, profile, cb) {
        if (profile.emails === undefined || profile.emails[0] === undefined) {
          return cb('error');
        }

        if (profile.photos === undefined || profile.photos[0] === undefined) {
          return cb('error');
        }

        let result = await userService.findOrRegisterUser({
          id: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicUrl: profile.photos[0].value,
          createdAt: new Date(),
        });
        if (!result.ok) {
          return cb(result.error);
        }

        cb(null, result.value);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user!);
  });
}
