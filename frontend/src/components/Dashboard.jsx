
import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

function Dashboard() {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [bookData, userData, transactionData] =
                    await Promise.all([
                        apiRequest('/books'),
                        apiRequest('/users'),
                        apiRequest('/transactions')
                    ]);

                setBooks(bookData);
                setUsers(userData);
                setTransactions(transactionData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const totalCopies = books.reduce(
        (total, book) => total + Number(book.quantity), 0
    );

    const lowStock = books.filter(
        book => Number(book.quantity) < 2
    );

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="page-content">
            <h1>Dashboard</h1>
            <p>Welcome to your library management portal.</p>

            {error && <p className="error">{error}</p>}

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Book Titles</h3>
                    <h2>{books.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Available Copies</h3>
                    <h2>{totalCopies}</h2>
                </div>

                <div className="stat-card">
                    <h3>Registered Users</h3>
                    <h2>{users.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Transactions</h3>
                    <h2>{transactions.length}</h2>
                </div>
            </div>

            <section className="content-card">
                <h2>Book Availability</h2>

                {books.length === 0 ? (
                    <p>No books have been added yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Genre</th>
                                <th>Available Copies</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.genre}</td>
                                    <td>{book.quantity}</td>
                                    <td>
                                        {Number(book.quantity) < 2 ? (
                                            <span className="low-stock">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="in-stock">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
