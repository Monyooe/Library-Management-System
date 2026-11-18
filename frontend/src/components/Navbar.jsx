
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');

        navigate('/login');
    }

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">L</div>
                <div>
                    <h2>LibraCore</h2>
                    <p>Library Management</p>
                </div>
            </div>

            <p className="menu-heading">MAIN MENU</p>

            <nav className="navigation">
                <NavLink to="/" end>Dashboard</NavLink>
                <NavLink to="/books">Book Management</NavLink>
                <NavLink to="/transactions">Transactions</NavLink>
                <NavLink to="/users">User Management</NavLink>
                <NavLink to="/login">Login</NavLink>

                <button type="button" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <div className="sidebar-footer">
                <p>Library Management System</p>
                <small>Administrator Portal</small>
            </div>
        </aside>
    );
}

export default Navbar;
