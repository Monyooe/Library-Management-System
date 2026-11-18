
import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import TransactionForm from '../components/TransactionForm';

function TransactionPage() {
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadData() {
        try {
            const [transactionData, userData] = await Promise.all([
                apiRequest('/transactions'),
                apiRequest('/users')
            ]);

            setTransactions(transactionData);
            setUsers(userData);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadData();
    }, [refreshKey]);

    function startEditing(transaction) {
        setEditingId(transaction.id);

        setEditForm({
            user_id: transaction.user_id,
            transaction_type: transaction.transaction_type,
            quantity: transaction.quantity
        });

        setError('');
        setSuccess('');
    }

    async function updateTransaction(id) {
        setError('');
        setSuccess('');

        const quantity = Number(editForm.quantity);
        const userId = Number(editForm.user_id);

        if (!Number.isInteger(quantity) || quantity < 1) {
            setError('Quantity must be a whole number greater than zero.');
            return;
        }

        if (!userId || !editForm.transaction_type) {
            setError('Please select a user and transaction type.');
            return;
        }

        try {
            await apiRequest(`/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    user_id: userId,
                    transaction_type: editForm.transaction_type,
                    quantity
                })
            });

            setEditingId(null);
            setSuccess('Transaction updated successfully!');
            setRefreshKey(value => value + 1);
        } catch (err) {
            setError(err.message);
        }
    }

    async function deleteTransaction(id) {
        const confirmed = window.confirm(
            'Delete this transaction? Book stock will be adjusted.'
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            await apiRequest(`/transactions/${id}`, {
                method: 'DELETE'
            });

            setSuccess('Transaction deleted successfully!');
            setRefreshKey(value => value + 1);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="page-content">
            <h1>Transactions</h1>
            <p>Record borrowing, returns and new stock arrivals.</p>

            <TransactionForm
                onTransactionAdded={() => {
                    setSuccess('Transaction recorded successfully!');
                    setRefreshKey(value => value + 1);
                }}
            />

            <section className="content-card">
                <h2>Transaction History</h2>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                {transactions.length === 0 ? (
                    <p>No transactions have been recorded yet.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>User</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.book_title}</td>

                                        <td>
                                            {editingId === transaction.id ? (
                                                <select
                                                    value={editForm.user_id}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            user_id: e.target.value
                                                        })
                                                    }
                                                >
                                                    {users.map(user => (
                                                        <option
                                                            key={user.id}
                                                            value={user.id}
                                                        >
                                                            {user.name} — {user.membership_id}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : transaction.user_name}
                                        </td>

                                        <td>
                                            {editingId === transaction.id ? (
                                                <select
                                                    value={editForm.transaction_type}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            transaction_type: e.target.value
                                                        })
                                                    }
                                                >
                                                    <option value="BORROW">BORROW</option>
                                                    <option value="RETURN">RETURN</option>
                                                    <option value="ADD_STOCK">ADD_STOCK</option>
                                                </select>
                                            ) : transaction.transaction_type}
                                        </td>

                                        <td>
                                            {editingId === transaction.id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={editForm.quantity}
                                                    onChange={e =>
                                                        setEditForm({
                                                            ...editForm,
                                                            quantity: e.target.value
                                                        })
                                                    }
                                                />
                                            ) : transaction.quantity}
                                        </td>

                                        <td>
                                            {transaction.transaction_date
                                                ? new Date(
                                                    transaction.transaction_date
                                                ).toLocaleString()
                                                : '—'}
                                        </td>

                                        <td>
                                            {editingId === transaction.id ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateTransaction(transaction.id)
                                                        }
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
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditing(transaction)
                                                        }
                                                    >
                                                        Update
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() =>
                                                            deleteTransaction(transaction.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default TransactionPage;
