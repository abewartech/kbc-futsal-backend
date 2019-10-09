const passport = require("passport");
const jwt = require("jsonwebtoken");
const { User } = require("../../../config/dbConfig");
require("../../../config/auth")(passport);

const user = {
  registerUser: (req, res, next) => {
    req
      .checkBody("username", "Username field cannot be empty")
      .trim()
      .notEmpty();
    req.checkBody("password", "Password field cannot be empty").notEmpty();
    req
      .checkBody("passwordMatch", "Confirm Password field cannot be empty")
      .notEmpty();
    req
      .checkBody("passwordMatch", "Passwords do not match, please try again")
      .equals(req.body.password);
    req.checkBody("role", "Role field cannot be empty").notEmpty();
    const errors = req.validationErrors();

    if (errors) {
      res.status(400).json({
        success: false,
        message: errors[0].msg
      });
    } else {
      passport.authenticate("signup", (err, user, info) => {
        if (err) return next(err);
        if (user) {
          res.status(200).json({
            success: true,
            message: { username: user.username, role: user.role }
          });
        } else {
          res.status(200).json({
            success: false,
            message: req.flash(info).registerMessage[0]
          });
        }
      })(req, res, next);
    }
  },

  loginUser: (req, res, next) => {
    req
      .checkBody("username", "Username field cannot be empty")
      .trim()
      .notEmpty();
    req.checkBody("password", "Password field cannot be empty").notEmpty();

    const errors = req.validationErrors();
    if (errors) {
      res.status(400).json({
        success: false,
        message: errors[0].msg
      });
    } else {
      passport.authenticate("login", (err, user, info) => {
        if (err) return next(err);
        if (user) {
          jwt.sign({ user }, process.env.JWT_SECRET_KEY, (err, token) => {
            if (err) {
              res.status(401).json({ success: false, message: err });
            } else {
              res.status(200).json({
                success: true,
                message: "Login Successfully",
                username: user.username,
                role: user.role,
                id: user.id,
                token: token
              });
            }
          });
        } else {
          res.status(200).json({
            success: false,
            message: req.flash(info).loginMessage[0]
          });
        }
      })(req, res, next);
    }
  },

  deleteOneUser: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function (err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const userId = req.params.id;
        Order.find({ user: userId }, function (err, orders) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          if (orders.length === 0) {
            User.findByIdAndDelete(userId, function (err, deletedUser) {
              if (err) {
                return res.status(400).json({ success: false, message: err });
              }

              if (deletedUser === null) {
                return res
                  .status(200)
                  .json({ success: false, message: "User not found" });
              }

              res.status(200).json({ success: true, message: deletedUser });
            });
          } else {
            return res.status(200).json({
              success: false,
              message:
                "Unable to delete User that is still active in the system"
            });
          }
        });
      }
    });
  },

  getAllUsers: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function (err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        User.find({}, function (err, users) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          res.status(200).json({ success: true, message: users });
        });
      }
    });
  },

  getOneUser: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function (err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const id = req.params.id;
        User.findById(id, function (err, user) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          if (user === null) {
            return res
              .status(200)
              .json({ success: false, message: "User not found" });
          }

          res.status(200).json({ success: true, message: user });
        });
      }
    });
  },

  changePassword: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const id = req.params.id;
        User.findById(id, async function (err, result) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          if (result === null) {
            return res
              .status(200)
              .json({ success: false, message: "User not found" });
          }

          result.password = req.body.password;
          const editedUser = await result.save();

          res.status(200).json({ success: true, message: editedUser });
        });
      }
    });
  },

  verifyToken: (req, res, next) => {
    const secureHeader = req.headers["authorization"];

    if (typeof secureHeader !== "undefined") {
      const security = secureHeader.split(" ");
      const securityToken = security[1];

      req.token = securityToken;
      next();
    } else {
      res.status(401).json({ success: false, message: "You're unauthorized" });
    }
  }
};

module.exports = user;
