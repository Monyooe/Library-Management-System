
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

// Import routes
const booksRoutes = require('./routes/books');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const verifyToken = require('./middleware/auth');

// Create application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public route: login
app.use('/api/users', usersRoutes);

// Protected routes: valid login token required
app.use('/api/books', verifyToken, booksRoutes);
app.use('/api/transactions', verifyToken, transactionsRoutes);

// Home page
app.get('/', (req, res) => {
    res.json({
        message: 'Library Management System API is running!'
    });
});

// Test database
app.get('/api/test-db', async (req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.ping();
        connection.release();

        res.json({
            success: true,
            message: 'Successfully connected to LibraryDB!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
