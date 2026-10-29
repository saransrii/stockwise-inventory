const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role, name) => {
  return jwt.sign(
    { id, role, name },
    process.env.JWT_SECRET || 'stockwise_super_secret_jwt_key_2026_inventory_management',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      phone: phone || '',
    });

    const token = generateToken(user._id, user.role, user.name);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role, user.name);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({
        success: true,
        data: {
          _id: req.user.id,
          name: req.user.name || 'Demo Admin',
          email: 'admin@stockwise.com',
          role: req.user.role || 'admin',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    One-click Demo Login
// @route   POST /api/auth/demo
exports.demoLogin = async (req, res, next) => {
  try {
    const role = req.body.role === 'manager' ? 'manager' : (req.body.role === 'staff' ? 'staff' : 'admin');
    const demoEmail = `${role}@stockwise.com`;

    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      user = await User.create({
        name: role === 'admin' ? 'System Administrator' : (role === 'manager' ? 'Inventory Manager' : 'Sales Representative'),
        email: demoEmail,
        password: `${role}123`,
        role: role,
      });
    }

    const token = generateToken(user._id, user.role, user.name);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    // If DB isn't connected, provide static demo session token
    const token = generateToken('demo_admin_id', 'admin', 'Demo Administrator');
    res.json({
      success: true,
      data: {
        _id: 'demo_admin_id',
        name: 'Demo Administrator',
        email: 'admin@stockwise.com',
        role: 'admin',
        token,
      },
    });
  }
};
