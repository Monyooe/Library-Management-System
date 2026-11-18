
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

// GET all users (never return passwords)
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, membership_id, role, created_at
             FROM users ORDER BY id DESC`
        );

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// REGISTER a user
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, membership_id, role, password } = req.body;

        if (!name || !membership_id || !role || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (!['Admin', 'Librarian', 'Member'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid user role'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
             (name, membership_id, role, password_hash)
             VALUES (?, ?, ?, ?)`,
            [name.trim(), membership_id.trim(), role, password_hash]
        );

        res.status(201).json({
            message: 'User registered successfully',
            id: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Membership ID already exists'
            });
        }

        res.status(500).json({ message: error.message });
    }
});

// UPDATE a user
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, membership_id, role } = req.body;

        if (!name || !membership_id || !role) {
            return res.status(400).json({
                message: 'Name, membership ID and role are required'
            });
        }

        if (!['Admin', 'Librarian', 'Member'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid user role'
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET name = ?, membership_id = ?, role = ?
             WHERE id = ?`,
            [name.trim(), membership_id.trim(), role, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({ message: 'User updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a user
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'This user has transaction history and cannot be deleted.'
            });
        }

        res.status(500).json({ message: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { membership_id, password } = req.body;

        if (!membership_id || !password) {
            return res.status(400).json({
                message: 'Membership ID and password are required'
            });
        }

        const [users] = await db.query(
            'SELECT * FROM users WHERE membership_id = ?',
            [membership_id.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid membership ID or password'
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: 'Invalid membership ID or password'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                membership_id: user.membership_id,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
