const localStrategy = require("passport-local").Strategy;
const { User } = require("./dbConfig");

module.exports = passport => {
  //Register
  passport.use(
    "signup",
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        let newUser = new User({
          name: req.body.name,
          email: email.toLowerCase(),
          password,
          role: req.body.role
        });

        newUser.save(function(err, savedUser) {
          if (err) {
            if (err.name === "MongoError" && err.code === 11000) {
              return done(
                null,
                false,
                req.flash("registerMessage", "User already exist")
              );
            }
            done(null, false, req.flash("registerMessage", `${err}`));
          } else {
            done(null, savedUser);
          }
        });
      }
    )
  );

  //login
  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        User.findOne({ email }, function(err, user) {
          if (err) return done(err);

          if (!user) {
            return done(
              null,
              false,
              req.flash("loginMessage", "User not found")
            );
          } else {
            user.comparePassword(password, (err, isMatch) => {
              if (err) {
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "Error getting your credentials")
                );
              }
              if (!isMatch) {
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "Wrong email or password")
                );
              }

              return done(null, user);
            });
          }
        });
      }
    )
  );
};
