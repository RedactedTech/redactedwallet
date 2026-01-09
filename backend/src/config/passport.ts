import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { pool } from './database';
import { OAuthUserProfile } from '../types';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Extract user info from Google profile
        const oauthProfile: OAuthUserProfile = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          picture: profile.photos?.[0]?.value
        };

        if (!oauthProfile.email) {
          return done(new Error('No email found in Google profile'));
        }

        // Check if user exists with this OAuth ID
        const oauthUserResult = await pool.query(
          'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
          ['google', oauthProfile.id]
        );

        if (oauthUserResult.rows.length > 0) {
          // Existing OAuth user - return for login
          return done(null, oauthProfile);
        }

        // Check if email already exists (legacy or local user)
        const emailUserResult = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [oauthProfile.email.toLowerCase()]
        );

        if (emailUserResult.rows.length > 0) {
          // Email collision - user registered with email/password
          // Pass the profile but mark it as a collision
          const profileWithError = { ...oauthProfile, emailCollision: true };
          return done(null, profileWithError);
        }

        // New OAuth user - will be created in AuthService
        return done(null, oauthProfile);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user to session (store minimal data)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user as OAuthUserProfile);
});

export default passport;
