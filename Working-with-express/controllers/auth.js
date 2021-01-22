const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transport = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Email Or Password');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (!doMatch) {
            req.flash('error', 'Invalid Email Or Password');
            return res.redirect('/login');
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        })
        .catch(err => {
          console.log(err);
        })

    })
    .catch(err => {
      console.log(err);
    })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message
  });
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        req.flash('error', 'Email already exist');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
        .then(hashPassword => {
          return User.create({
            email: email,
            password: hashPassword,
            cart: { items: [] }
          });
        })
        .then(result => {
          res.redirect('/login');
          console.log(result);
          return transport.sendMail({
            to: email,
            from: 'ucancallmeakshay@gmail.com',
            subject: 'Signup Successful!',
            html: '<h1>SUccess</h1>'
          });
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
}