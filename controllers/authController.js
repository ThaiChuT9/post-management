const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const { error } = require('console');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// User registration
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user.', error });
    }
};

// User login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.', error });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error });
    }
};