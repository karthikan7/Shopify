const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure:   process.env.NODE_ENV === 'production',
  maxAge:   30 * 24 * 60 * 60 * 1000
};

const registeruser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create(
      { name,
        email,
        password: hashedPassword
       });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000);

      const message = `
        <h2>Welcome to ShopNest, ${name}!</h2>
        <p>Thank you for registering.</p>
        <p>Your one-time verification OTP is: <strong>${otp}</strong></p>
      `;

      await sendEmail({ email: user.email, subject: 'Welcome to ShopNest - Your OTP', message });

      const token = generateToken(user._id);
      res.cookie('token', token, cookieOptions);

      res.status(201).json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      res.cookie('token', token, cookieOptions);

      res.json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,   // <-- this must be here
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIX: actually clears the cookie so the session ends properly
const logoutuser = (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};

const getusers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registeruser, loginuser, logoutuser, getusers };
