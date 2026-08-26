const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token with ID and Role in payload
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role: role.toString().toLowerCase().trim() },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '30d' }
  );
};

// Helper to normalize role input across different registration sources
const normalizeRole = (role, userType) => {
  const inputRole = (role || userType || 'general').toString().toLowerCase().trim();

  if (inputRole === 'authority' || inputRole === 'official authority') {
    return 'authority';
  }
  if (inputRole === 'moderator' || inputRole === 'community moderator') {
    return 'moderator';
  }
  if (inputRole === 'admin') {
    return 'admin';
  }
  return 'general';
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, userType } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    const userExists = await User.findOne({ 
      $or: [{ email: cleanEmail }, { username: cleanUsername }] 
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const selectedRole = normalizeRole(role, userType);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: selectedRole,
      trustScore: 100
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password.' });
    }

    const identifier = email.trim();

    const user = await User.findOne({ 
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const normalizedUserRole = (user.role || 'general').toLowerCase().trim();

      return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: normalizedUserRole,
        trustScore: user.trustScore ?? 100,
        token: generateToken(user._id, normalizedUserRole),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};