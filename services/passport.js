const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(e => {
      console.log(e);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          googleId: profile.id
        });
        if (existingUser) {
          if (!existingUser.emails) {
            await User.findByIdAndUpdate(existingUser._id, { emails: profile.emails });
          }
          return done(null, existingUser);
        }
        const user = await new User({ googleId: profile.id, emails: profile.emails }).save();
        done(null, user);
      } catch (e) {
        console.log(e);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebookAppId,
      clientSecret: keys.facebookAppSecret,
      callbackURL: "/auth/facebook/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const existingUser = await User.findOne({
          facebookId: profile.id
        });
        if (existingUser) {
          if (!existingUser.emails) {
            await User.findByIdAndUpdate(existingUser._id, { emails: profile.emails });
          }
          return done(null, existingUser);
        }
        const user = await new User({ facebookId: profile.id, emails: profile.emails }).save();
        done(null, user);
      } catch (e) {
        console.log(e);
      }
    }
  )
);
