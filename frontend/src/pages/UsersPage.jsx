
import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import UserForm from '../components/UserForm';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    async function loadUsers() {
        try {
            const data = await apiRequest('/users');
            setUsers(data);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadUsers();
    }, [refreshKey]);

    async function deleteUser(id) {
        if (!window.confirm('Delete this user?')) return;

        try {
            await apiRequest(`/users/${id}`, {
                method: 'DELETE'
            });

            setRefreshKey(value => value + 1);
        } catch (err) {
            setError(err.message);
        }
    }

    function startEditing(user) {
        setEditingUser({
            id: user.id,
            name: user.name,
            membership_id: user.membership_id,
            role: user.role
        });
        setError('');
    }

    async function updateUser(event) {
        event.preventDefault();
        setError('');

        try {
            await apiRequest(`/users/${editingUser.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: editingUser.name,
                    membership_id: editingUser.membership_id,
                    role: editingUser.role
                })
            });

            setEditingUser(null);
            setRefreshKey(value => value + 1);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="page-content">
            <h1>User Management</h1>
            <p>Manage library members and administrators.</p>

            <UserForm
                onUserAdded={() => setRefreshKey(value => value + 1)}
            />

            {editingUser && (
                <section className="content-card">
                    <h2>Edit User</h2>

                    <form onSubmit={updateUser}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={editingUser.name}
                            onChange={event =>
                                setEditingUser({
                                    ...editingUser,
                                    name: event.target.value
                                })
                            }
                            required
                        />

                        <label>Membership ID</label>
                        <input
                            type="text"
                            value={editingUser.membership_id}
                            onChange={event =>
                                setEditingUser({
                                    ...editingUser,
                                    membership_id: event.target.value
                                })
                            }
                            required
                        />

                        <label>Role</label>
                        <select
                            value={editingUser.role}
                            onChange={event =>
                                setEditingUser({
                                    ...editingUser,
                                    role: event.target.value
                                })
                            }
                            required
                        >
                            <option value="Member">Member</option>
                            <option value="Librarian">Librarian</option>
                            <option value="Admin">Admin</option>
                        </select>

                        <button type="submit">Save Changes</button>

                        <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                        >
                            Cancel
                        </button>
                    </form>
                </section>
            )}

            <section className="content-card">
                <h2>Registered Users</h2>

                {error && <p className="error">{error}</p>}

                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Membership ID</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.membership_id}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => startEditing(user)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() => deleteUser(user.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && <p>No users registered yet.</p>}
            </section>
        </div>
    );
}

export default UsersPage;
