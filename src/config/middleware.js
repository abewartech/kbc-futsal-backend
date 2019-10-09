const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

module.exports = app => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      cookie: { maxAge: 60000 },
      resave: true,
      saveUninitialized: true
    })
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(expressValidator());
  app.use(fileUpload());
};
