import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PriceManagementPage from './pages/PriceManagementPage';
import SourceManagementPage from './pages/SourceManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
    return <>{children}</>;
};

// Sidebar navigation layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/admin', icon: '📊', label: 'Dashboard' },
        { to: '/admin/prices', icon: '💰', label: 'Prices' },
        { to: '/admin/sources', icon: '📡', label: 'Sources' },
        { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
    ];

    const buyerLinks = [
        { to: '/buyer', icon: '🛒', label: 'Market Prices' },
        { to: '/buyer/reports', icon: '📈', label: 'Reports & Trends' },
    ];

    const links = isAdmin ? adminLinks : buyerLinks;

    return (
        <div className="app-layout">
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation"
            >
                ☰
            </button>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay visible"
                    onClick={() => setSidebarOpen(false)}
                    role="presentation"
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
                <div className="sidebar-logo">
                    <span className="logo-icon">🌾</span>
                    <h1>SokoPrice</h1>
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/admin' || link.to === '/buyer'}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <footer className="sidebar-footer">
                    <div style={{ padding: '8px 16px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {user?.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {user?.role} · {user?.email}
                        </p>
                    </div>
                    <button
                        className="nav-link"
                        onClick={handleLogout}
                        id="logout-btn"
                    >
                        <span className="nav-icon">🚪</span>
                        Sign Out
                    </button>
                </footer>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="spinner-container"><div className="spinner" /></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'Admin' ? '/admin' : '/buyer'} /> : <LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/prices" element={<ProtectedRoute roles={['Admin']}><AppLayout><PriceManagementPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/sources" element={<ProtectedRoute roles={['Admin']}><AppLayout><SourceManagementPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={['Admin']}><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />

            {/* Buyer Routes */}
            <Route path="/buyer" element={<ProtectedRoute roles={['Buyer']}><AppLayout><BuyerDashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/buyer/reports" element={<ProtectedRoute roles={['Buyer']}><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
