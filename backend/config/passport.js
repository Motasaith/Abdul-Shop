const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://abdul-shop.onrender.com/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const stateRole = req.query.state;
        const targetRole = 'user'; // Always start as user until approved
        const targetVendorStatus = stateRole === 'vendor' ? 'pending' : 'none';

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: 'oauth-' + Date.now(), // Dummy password for OAuth users
          googleId: profile.id,
          role: targetRole,
          vendorStatus: targetVendorStatus,
          // Since we can't easily get shop name here, we might leave vendorDetails empty 
          // or set a default. The user can update it later in profile.
          emailVerified: true // OAuth emails are already verified
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "https://abdul-shop.onrender.com/api/auth/google/callback",
      profileFields: ['id', 'displayName', 'emails']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ facebookId: profile.id });
        
        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        // Facebook might not return email if user didn't grant permission or signed up with phone
        const email = profile.emails ? profile.emails[0].value : `facebook-${profile.id}@example.com`;
        
        user = await User.findOne({ email: email });
        
        if (user) {
          // Link facebook account to existing user
          user.facebookId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: email,
          password: 'oauth-' + Date.now(), // Dummy password
          facebookId: profile.id,
          emailVerified: true
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

module.exports = passport;
