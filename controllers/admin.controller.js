const User = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.dashboard = async (req, res) => {
  try {
    const managerCount = await User.countDocuments({ role: 'manager' });
    const employeeCount = await User.countDocuments({ role: 'employee' });

    res.render('./pages/admin/dashboard', {
      user: req.user,
      managerCount,
      employeeCount,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/admin');
  }
};

exports.listManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' });
    res.render('./pages/admin/managers', {
      user: req.user,
      managers,
    });
  } catch (err) {
    console.error('Manager List Error:', err);
    req.flash('error_msg', 'Error loading managers');
    res.redirect('/admin');
  }
};

exports.listEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' });
    res.render('./pages/admin/employees', {
      user: req.user,
      employees,
    });
  } catch (err) {
    console.error('Employee List Error:', err);
    req.flash('error_msg', 'Error loading employees');
    res.redirect('/admin');
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, role });

    req.flash('success_msg', `User (${role}) added successfully`);

    if (role === 'manager') return res.redirect('/admin/managers');
    return res.redirect('/admin/employees');
  } catch (err) {
    console.error('Add User Error:', err);
    req.flash('error_msg', 'Error adding user');
    res.redirect('/admin');
  }
};

exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    await User.findByIdAndUpdate(id, { name, email, role });

    req.flash('success_msg', `User (${role}) updated successfully`);

    if (role === 'manager') return res.redirect('/admin/managers');
    return res.redirect('/admin/employees');
  } catch (err) {
    console.error('Edit User Error:', err);
    req.flash('error_msg', 'Error editing user');
    res.redirect('/admin');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin');
    }

    await User.findByIdAndDelete(id);

    req.flash('success_msg', `User (${user.role}) deleted successfully`);

    if (user.role === 'manager') return res.redirect('/admin/managers');
    return res.redirect('/admin/employees');
  } catch (err) {
    console.error('Delete User Error:', err);
    req.flash('error_msg', 'Error deleting user');
    res.redirect('/admin');
  }
};

