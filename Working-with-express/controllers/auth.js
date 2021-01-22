const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const user = require('../models/user');

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422)
      .render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errors.array()[0].msg
      });
  }
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
            html: '<h1>Success</h1>'
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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/reset', {
    pageTitle: 'Reset',
    path: '/reset',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(16, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email exisit');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save()
          .then(resut => {
            transport.sendMail({
              to: req.body.email,
              from: 'ucancallmeakshay@gmail.com',
              subject: 'Password Reset',
              html: `
            <p>Password reset<p>
            <p> Click this link <a href="http://localhost:3000/reset/${token}">Link</a></p>
            `
            });
            req.flash('error', 'Reset Link Has been send to your email');
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
          });
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      }
      else {
        message = null;
      }
      res.render('auth/new-password', {
        pageTitle: 'Update Password',
        path: '/new-password',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: message,
        userId: user._id,
        token: token
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const token = req.body.token;
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
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