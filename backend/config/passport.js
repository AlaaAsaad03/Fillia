import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/userModel.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user exists in the user model
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (!user) {
            // If not found, check in the admin model
            user = await adminModel.findOne({ email: profile.emails[0].value });

            if (!user) {
                // If user does not exist in both models, create a new user
                user = new userModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    image: profile.photos[0].value,
                    isVerified: false,
                    role: "user", // Default role; adjust as needed
                });
                await user.save();
            } else {
                // If found in admin model, ensure the role is preserved
                user.image = profile.photos[0].value; // Update image
                await user.save();
            }
        } else {
            // If user found in user model, update details
            user.image = profile.photos[0].value; // Update image
            await user.save();
        }

        // Determine the role for the token
        const role = user.role || "user"; // Fallback to user if role is not defined
        const token = createToken(user._id, role);
        done(null, { user, token });
    } catch (error) {
        done(error, null);
    }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;