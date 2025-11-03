const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user.model');

exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login'); // ← Changed from /user/login

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);

    const user = await User.findById(decoded.id).lean();
    if (!user) return res.redirect('/login'); // ← Changed from /user/login

    req.user = user;
    res.locals.user = user;

    next();
  } catch (err) {
    console.log('JWT Error:', err);
    return res.redirect('/login'); // ← Changed from /user/login
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.flash('error_msg', 'Access denied');
      return res.redirect('/login'); // ← Changed from /user/login
    }
    next();
  };
};

exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    next();
  } else {
    return res.redirect('/login'); // ← Changed from /user/login
  }
};
