const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Render Signup Page
exports.signupPage = (req, res) => {
  res.render('./pages/register');
};

// Render Login Page
exports.loginPage = (req, res) => {
  res.render('./pages/login');
};

// 🧩 Signup User
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'User with this email already exists');
      return res.redirect('/signup');
    }

    // Prevent admin registration through normal signup
    if (role === 'admin') {
      req.flash('error_msg', 'Invalid role selection');
      return res.redirect('/signup');
    }

    // Check if attempting to register as manager when not authorized
    if (role === 'manager') {
      // Only admin can create managers
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        // If no admin exists, this will be the first user - make them admin
        await User.create({ name, email, password, role: 'admin' });
        req.flash('success_msg', 'Admin account created successfully! Please login');
        return res.redirect('/login');
      }
    }

    // Create regular user (employee/manager)
    await User.create({ name, email, password, role });

    req.flash('success_msg', 'Signup successful! Please login');
    res.redirect('/login');
  } catch (err) {
    console.log('Signup Error:', err);
    req.flash('error_msg', 'Error signing up');
    res.redirect('/signup');
  }
};

// 🔐 Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/login');
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash('error_msg', 'Invalid password');
      return res.redirect('/login');
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.PRIVATE_KEY,
      { expiresIn: '1d' }
    );

    // Set token in cookie
    res.cookie('token', token, { httpOnly: true });

    req.flash('success_msg', 'Login successful');

    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return res.redirect('/admin');
      case 'manager':
        return res.redirect('/manager');
      case 'employee':
        return res.redirect('/employee');
      default:
        return res.redirect('/login');
    }
  } catch (err) {
    console.log('Login Error:', err);
    req.flash('error_msg', 'Login error');
    res.redirect('/login');
  }
};

// 🚪 Logout
exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  req.flash('success_msg', 'Logout successful');
  res.redirect('/login');
};

exports.profilePage = async (req, res) => {
  try {
    res.render('./pages/profile', {
      user: req.user,
    });
  } catch (err) {
    console.log('Profile page error:', err);
    req.flash('error_msg', 'Cannot load profile');
    res.redirect(`/${req.user.role}`);
  }
};

exports.editProfilePage = async (req, res) => {
  try {
    res.render('./pages/editProfile', { user: req.user });
  } catch (err) {
    console.log('Edit profile page error:', err);
    req.flash('error_msg', 'Cannot load edit profile page');
    res.redirect(`/${req.user.role}/profile`);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, age, address, mobile, gender, bloodGroup } = req.body;

    const updateData = { name, email, age, address, mobile, gender, bloodGroup };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    // direct update using req.user._id
    await User.findByIdAndUpdate(req.user._id, updateData);

    req.flash('success_msg', 'Profile updated successfully');
    res.redirect(`/${req.user.role}/profile`);
  } catch (err) {
    console.log('Update profile error:', err);
    req.flash('error_msg', 'Cannot update profile');
    res.redirect(`/${req.user.role}/profile`);
  }
};


exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('token');
    req.flash('success_msg', 'Profile deleted successfully');
    res.redirect('/login');
  } catch (err) {
    console.log('Delete profile error:', err);
    req.flash('error_msg', 'Cannot delete profile');
    res.redirect(`/${req.user.role}/profile`);
  }
};