require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./middlewares/logger');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(logger);

app.use(morgan('dev'));
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/postRouter'));
// Middleware for CORS
app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// app.use(cors()); // Enable CORS for all origins
app.use(express.json());


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