require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./middlewares/logger');

const app = express();
app.use(express.json());
app.use(logger);

app.use(morgan('dev'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api', require('./routes/postRouter'));


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