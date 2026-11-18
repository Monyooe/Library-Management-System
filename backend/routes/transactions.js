
const express = require('express');
const router = express.Router();
const db = require('../db');

// Calculate how a transaction affects stock
function stockChange(type, quantity) {
    if (type === 'BORROW') return -quantity;
    return quantity;
}

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT t.*, b.title AS book_title,
                   u.name AS user_name
            FROM transactions t
            JOIN books b ON t.book_id = b.id
            JOIN users u ON t.user_id = u.id
            ORDER BY t.transaction_date DESC
        `);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET one transaction
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Transaction not found'
            });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD a transaction
router.post('/', async (req, res) => {
    const { book_id, user_id, transaction_type, quantity } = req.body;

    if (!book_id || !user_id ||
        !['BORROW', 'RETURN', 'ADD_STOCK'].includes(transaction_type) ||
        !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
        return res.status(400).json({
            message: 'Enter valid book, user, transaction type and quantity'
        });
    }

    const amount = Number(quantity);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [books] = await connection.query(
            'SELECT * FROM books WHERE id = ? FOR UPDATE',
            [book_id]
        );

        if (books.length === 0) {
            throw new Error('Book not found');
        }

        const [users] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const change = stockChange(transaction_type, amount);
        const newStock = books[0].quantity + change;

        if (newStock < 0) {
            throw new Error('Not enough books available to borrow');
        }

        await connection.query(
            'UPDATE books SET quantity = ? WHERE id = ?',
            [newStock, book_id]
        );

        const [result] = await connection.query(
            `INSERT INTO transactions
             (book_id, user_id, transaction_type, quantity)
             VALUES (?, ?, ?, ?)`,
            [book_id, user_id, transaction_type, amount]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Transaction recorded successfully',
            transaction_id: result.insertId,
            remaining_stock: newStock
        });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

// UPDATE a transaction
router.put('/:id', async (req, res) => {
    const { user_id, transaction_type, quantity } = req.body;

    if (!user_id ||
        !['BORROW', 'RETURN', 'ADD_STOCK'].includes(transaction_type) ||
        !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
        return res.status(400).json({
            message: 'Enter a valid user, transaction type and quantity'
        });
    }

    const amount = Number(quantity);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
            [req.params.id]
        );

        if (rows.length === 0) {
            throw new Error('Transaction not found');
        }

        const old = rows[0];

        const [users] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const [books] = await connection.query(
            'SELECT * FROM books WHERE id = ? FOR UPDATE',
            [old.book_id]
        );

        const currentStock = books[0].quantity;
        const oldChange = stockChange(
            old.transaction_type,
            old.quantity
        );
        const newChange = stockChange(transaction_type, amount);

        const newStock = currentStock - oldChange + newChange;

        if (newStock < 0) {
            throw new Error('Not enough stock for this update');
        }

        await connection.query(
            'UPDATE books SET quantity = ? WHERE id = ?',
            [newStock, old.book_id]
        );

        await connection.query(
            `UPDATE transactions
             SET user_id = ?, transaction_type = ?, quantity = ?
             WHERE id = ?`,
            [user_id, transaction_type, amount, req.params.id]
        );

        await connection.commit();

        res.json({
            message: 'Transaction updated successfully',
            remaining_stock: newStock
        });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

// DELETE a transaction and reverse its stock effect
router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
            [req.params.id]
        );

        if (rows.length === 0) {
            throw new Error('Transaction not found');
        }

        const transaction = rows[0];

        const [books] = await connection.query(
            'SELECT * FROM books WHERE id = ? FOR UPDATE',
            [transaction.book_id]
        );

        const change = stockChange(
            transaction.transaction_type,
            transaction.quantity
        );

        const newStock = books[0].quantity - change;

        if (newStock < 0) {
            throw new Error(
                'Cannot delete this transaction because there is not enough stock to reverse it'
            );
        }

        await connection.query(
            'UPDATE books SET quantity = ? WHERE id = ?',
            [newStock, transaction.book_id]
        );

        await connection.query(
            'DELETE FROM transactions WHERE id = ?',
            [req.params.id]
        );

        await connection.commit();

        res.json({
            message: 'Transaction deleted successfully',
            remaining_stock: newStock
        });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
