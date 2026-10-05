const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Fullstack Study Planner API is running!'
    });
});

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('========================================');
            console.log(`Study Planner Backend running on port ${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/health`);
            console.log('========================================');
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
};

startServer();