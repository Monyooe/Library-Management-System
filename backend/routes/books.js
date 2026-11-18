
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all books
router.get('/', async (req, res) => {
    try {
        const [books] = await db.query(
            'SELECT * FROM books ORDER BY id DESC'
        );

        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET one book
router.get('/:id', async (req, res) => {
    try {
        const [books] = await db.query(
            'SELECT * FROM books WHERE id = ?',
            [req.params.id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.json(books[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD a book
router.post('/', async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;

        if (!title || !author || !genre || !isbn ||
            quantity === undefined) {
            return res.status(400).json({
                message: 'All book fields are required'
            });
        }

        const amount = Number(quantity);

        if (!Number.isInteger(amount) || amount < 0) {
            return res.status(400).json({
                message: 'Quantity must be a non-negative whole number'
            });
        }

        const [result] = await db.query(
            `INSERT INTO books
            (title, author, genre, isbn, quantity)
            VALUES (?, ?, ?, ?, ?)`,
            [title.trim(), author.trim(), genre.trim(),
             isbn.trim(), amount]
        );

        res.status(201).json({
            message: 'Book added successfully',
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE a book
router.put('/:id', async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;

        if (!title || !author || !genre || !isbn ||
            quantity === undefined) {
            return res.status(400).json({
                message: 'All book fields are required'
            });
        }

        const amount = Number(quantity);

        if (!Number.isInteger(amount) || amount < 0) {
            return res.status(400).json({
                message: 'Quantity must be a non-negative whole number'
            });
        }

        const [result] = await db.query(
            `UPDATE books
             SET title = ?, author = ?, genre = ?,
                 isbn = ?, quantity = ?
             WHERE id = ?`,
            [title.trim(), author.trim(), genre.trim(),
             isbn.trim(), amount, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.json({ message: 'Book updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a book
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM books WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'This book has transaction history and cannot be deleted.'
            });
        }

        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
