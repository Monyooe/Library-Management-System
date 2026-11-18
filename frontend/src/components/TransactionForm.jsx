
import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

function TransactionForm({ onTransactionAdded }) {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        book_id: '',
        user_id: '',
        transaction_type: 'BORROW',
        quantity: '1'
    });

    useEffect(() => {
        async function loadOptions() {
            try {
                const [bookData, userData] = await Promise.all([
                    apiRequest('/books'),
                    apiRequest('/users')
                ]);

                setBooks(bookData);
                setUsers(userData);
            } catch (err) {
                setError(err.message);
            }
        }

        loadOptions();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!form.book_id || !form.user_id) {
            setError('Please select a book and a user.');
            return;
        }

        const quantity = Number(form.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            setError('Quantity must be a whole number greater than zero.');
            return;
        }

        setLoading(true);

        try {
            const result = await apiRequest('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    book_id: Number(form.book_id),
                    user_id: Number(form.user_id),
                    transaction_type: form.transaction_type,
                    quantity
                })
            });

            setSuccess(
                `${result.message} Remaining stock: ${result.remaining_stock}`
            );

            setForm({
                book_id: '',
                user_id: '',
                transaction_type: 'BORROW',
                quantity: '1'
            });

            onTransactionAdded();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <h2>Record a Transaction</h2>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <label>Select Book</label>
            <select
                name="book_id"
                value={form.book_id}
                onChange={handleChange}
                required
            >
                <option value="">Choose a book</option>

                {books.map(book => (
                    <option key={book.id} value={book.id}>
                        {book.title} — {book.quantity} available
                    </option>
                ))}
            </select>

            <label>Select User</label>
            <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                required
            >
                <option value="">Choose a user</option>

                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} — {user.membership_id}
                    </option>
                ))}
            </select>

            <label>Transaction Type</label>
            <select
                name="transaction_type"
                value={form.transaction_type}
                onChange={handleChange}
                required
            >
                <option value="BORROW">Borrow Book</option>
                <option value="RETURN">Return Book</option>
                <option value="ADD_STOCK">Add Stock</option>
            </select>

            <label>Quantity</label>
            <input
                type="number"
                name="quantity"
                min="1"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Transaction'}
            </button>
        </form>
    );
}

export default TransactionForm;
