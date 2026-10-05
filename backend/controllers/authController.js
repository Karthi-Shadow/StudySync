const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBState, inMemoryStore } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Helper to generate JWT token
const generateToken = (userId, email, name) => {
  return jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, dailyGoalHours } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        dailyGoalHours: dailyGoalHours || 3
      });

      const token = generateToken(newUser._id.toString(), newUser.email, newUser.name);
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, dailyGoalHours: newUser.dailyGoalHours }
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryStore.users.find(u => u.email === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const mockId = 'usr_' + Date.now();
      const newUser = {
        _id: mockId,
        id: mockId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        dailyGoalHours: dailyGoalHours || 3,
        createdAt: new Date()
      };
      inMemoryStore.users.push(newUser);

      const token = generateToken(mockId, newUser.email, newUser.name);
      return res.status(201).json({
        message: 'Registration successful (In-Memory Mode)',
        token,
        user: { id: mockId, name: newUser.name, email: newUser.email, dailyGoalHours: newUser.dailyGoalHours }
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString(), user.email, user.name);
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, dailyGoalHours: user.dailyGoalHours }
      });
    } else {
      // In-Memory Fallback
      const user = inMemoryStore.users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id || user._id, user.email, user.name);
      return res.json({
        message: 'Login successful (In-Memory Mode)',
        token,
        user: { id: user.id || user._id, name: user.name, email: user.email, dailyGoalHours: user.dailyGoalHours }
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user });
    } else {
      const user = inMemoryStore.users.find(u => u.id === userId || u._id === userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { password, ...safeUser } = user;
      return res.json({ user: safeUser });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};
