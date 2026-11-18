
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

function LoginPage() {
    const [membershipId, setMembershipId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRequest('/users/login', {
                method: 'POST',
                body: JSON.stringify({
                    membership_id: membershipId,
                    password: password
                })
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('loggedInUser', JSON.stringify(data.user));

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="brand-icon login-icon">L</div>
                <h1>Library Login</h1>
                <p>Sign in to access the management portal.</p>

                {error && <p className="error">{error}</p>}

                <label>Membership ID
                    <input
                        type="text"
                        value={membershipId}
                        onChange={e => setMembershipId(e.target.value)}
                        placeholder="Enter membership ID"
                        required
                    />
                </label>

                <label>Password
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </label>

                <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
