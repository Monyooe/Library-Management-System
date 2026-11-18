
import { useState } from 'react';

function AddBookForm({ onBookAdded }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        quantity: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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

        if (
            !form.title.trim() ||
            !form.author.trim() ||
            !form.genre.trim() ||
            !form.isbn.trim() ||
            form.quantity === '' ||
            !Number.isInteger(Number(form.quantity)) ||
            Number(form.quantity) < 0
        ) {
            setError('Please enter valid information in all fields.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    quantity: Number(form.quantity)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not add book.');
            }

            setSuccess('Book added successfully!');

            setForm({
                title: '',
                author: '',
                genre: '',
                isbn: '',
                quantity: ''
            });

            if (onBookAdded) {
                onBookAdded();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="content-card book-form" onSubmit={handleSubmit}>
            <h2>Add New Book</h2>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <label>Book Title</label>
            <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
            />

            <label>Author</label>
            <input
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
            />

            <label>Genre</label>
            <input
                name="genre"
                value={form.genre}
                onChange={handleChange}
                placeholder="Enter book genre"
                required
            />

            <label>ISBN</label>
            <input
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
                required
            />

            <label>Initial Quantity</label>
            <input
                type="number"
                name="quantity"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Adding Book...' : 'Add Book'}
            </button>
        </form>
    );
}

export default AddBookForm;
