
import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

function BookList({ refreshKey }) {
    const [books, setBooks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load books from the database
    async function loadBooks() {
        try {
            setLoading(true);

            const data = await apiRequest('/books');

            setBooks(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBooks();
    }, [refreshKey]);

    // Start editing a book
    function startEditing(book) {
        setEditingId(book.id);

        setEditForm({
            title: book.title,
            author: book.author,
            genre: book.genre,
            isbn: book.isbn,
            quantity: book.quantity
        });

        setError('');
    }

    // Handle changes in edit form
    function handleEditChange(e) {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    }

    // Save updated book
    async function saveBook(id) {
        if (
            !editForm.title.trim() ||
            !editForm.author.trim() ||
            !editForm.genre.trim() ||
            !editForm.isbn.trim()
        ) {
            setError('Please complete all book fields.');
            return;
        }

        const quantity = Number(editForm.quantity);

        if (!Number.isInteger(quantity) || quantity < 0) {
            setError('Quantity must be a whole number of 0 or more.');
            return;
        }

        try {
            await apiRequest(`/books/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...editForm,
                    quantity: quantity
                })
            });

            setEditingId(null);
            setError('');

            await loadBooks();

            alert('Book updated successfully!');
        } catch (err) {
            setError(err.message);
        }
    }

    // Delete a book
    async function deleteBook(id) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this book?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiRequest(`/books/${id}`, {
                method: 'DELETE'
            });

            await loadBooks();

            alert('Book deleted successfully!');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="content-card">
            <h2>Book List</h2>

            {error && (
                <p className="error">{error}</p>
            )}

            {loading && (
                <p>Loading books...</p>
            )}

            {!loading && books.length === 0 ? (
                <p>No books have been added yet.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Genre</th>
                                <th>ISBN</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    {editingId === book.id ? (
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={editForm.title}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    name="author"
                                                    value={editForm.author}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    name="genre"
                                                    value={editForm.genre}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    name="isbn"
                                                    value={editForm.isbn}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    min="0"
                                                    step="1"
                                                    value={editForm.quantity}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => saveBook(book.id)}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setError('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{book.title}</td>
                                            <td>{book.author}</td>
                                            <td>{book.genre}</td>
                                            <td>{book.isbn}</td>

                                            <td>
                                                {book.quantity < 2 ? (
                                                    <span className="error">
                                                        {book.quantity} - Low Stock
                                                    </span>
                                                ) : (
                                                    book.quantity
                                                )}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(book)}
                                                >
                                                    Update
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() => deleteBook(book.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default BookList;
