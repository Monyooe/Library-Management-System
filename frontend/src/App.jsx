
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <div className="app-layout">
            <Navbar />

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <span className="topbar-label">
                            LIBRARY MANAGEMENT SYSTEM
                        </span>
                    </div>
                    <span className="admin-label">Administrator</span>
                </header>

                <div className="page-container">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/books" element={
                            <ProtectedRoute>
                                <BooksPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/transactions" element={
                            <ProtectedRoute>
                                <TransactionsPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/users" element={
                            <ProtectedRoute>
                                <UsersPage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;
