require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./middlewares/logger');
const cors = require('cors');

const app = express();

app.use(logger);
app.use(morgan('dev'));

// Middleware for CORS
const corsOptions = {
    origin: 'http://localhost:5000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

// Áp dụng CORS cho tất cả routes
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/uploads', express.static('uploads'));


// Connect to MongoDB
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        app.listen(3000, () => console.log('Server running at http://localhost:3000'));
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

startServer();