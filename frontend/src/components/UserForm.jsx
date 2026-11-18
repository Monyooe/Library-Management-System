
import { useState } from 'react';
import { apiRequest } from '../api';

function UserForm({ onUserAdded }) {
    const [form, setForm] = useState({
        name: '',
        membership_id: '',
        role: 'Member',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setMessage('');
        setError('');
        setLoading(true);

        try {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify(form)
            });

            setMessage('User added successfully!');

            setForm({
                name: '',
                membership_id: '',
                role: 'Member',
                password: ''
            });

            onUserAdded();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <h2>Add New User</h2>

            <p>All fields are required.</p>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <label>Full Name</label>
            <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
            />

            <label>Membership ID</label>
            <input
                type="text"
                name="membership_id"
                value={form.membership_id}
                onChange={handleChange}
                placeholder="Enter membership ID"
                required
            />

            <label>Role</label>
            <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
            >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
            </select>

            <label>Password</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength="8"
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Adding User...' : 'Add User'}
            </button>
        </form>
    );
}

export default UserForm;
