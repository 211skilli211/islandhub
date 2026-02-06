import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../config/db';
import { User } from '../models/User'; // Assuming User model exists or I'll use pool directly

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'place_holder_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email) {
            return done(null, false, { message: 'No email found from Google' });
        }

        // Check if user exists
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userRes.rows[0];

        if (!user) {
            // Create New User
            // Assuming 'users' table has name, email, password, role
            const newUserRes = await pool.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING *",
                [profile.displayName, email, 'google_sso_placeholder'] // Placeholder password
            );
            user = newUserRes.rows[0];
        }

        return done(null, user);
    } catch (error) {
        return done(error as any, false);
    }
}));

// Serialize user for session (if using sessions, but we use JWT, we might just use this for the initial callback handling)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, userRes.rows[0]);
    } catch (error) {
        done(error, null);
    }
});
