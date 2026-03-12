import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    active: boolean;
    createdAt: string;
}

const ROLE_BADGES: Record<string, string> = {
    Admin: 'badge-blue',
    Buyer: 'badge-green',
    NGO: 'badge-gold',
    Trader: 'badge-purple',
    Seller: 'badge-orange',
    Farmer: 'badge-green',
};

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (roleFilter !== 'all') params.role = roleFilter;
            if (search.trim()) params.search = search.trim();
            const res = await api.get('/users', { params });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
        setDeleting(id);
        try {
            const res = await api.delete(`/users/${id}`);
            setMessage(res.data.message);
            fetchUsers();
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleting(null);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const handleBulkDelete = async (roles: string[]) => {
        const roleStr = roles.join(', ');
        if (!confirm(`Delete ALL ${roleStr} users? This action cannot be undone.`)) return;
        try {
            const res = await api.delete('/users/bulk', { data: { roles } });
            setMessage(res.data.message);
            fetchUsers();
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to bulk delete');
        } finally {
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {});

    return (
        <section className="animate-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>👥 User Management</h1>
                    <p>View, search, and manage all registered users</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleBulkDelete(['Buyer', 'Trader', 'Seller', 'NGO', 'Farmer'])}
                        id="bulk-delete-all-btn"
                    >
                        🗑 Delete All Non-Admin
                    </button>
                </div>
            </header>

            {message && (
                <div style={{
                    background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    border: `1px solid ${message.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: message.includes('Failed') ? '#ef4444' : 'var(--green-400)',
                    fontSize: '14px',
                }}>{message}</div>
            )}

            {/* Stats */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
                <article className="stat-card">
                    <span className="stat-icon">👥</span>
                    <p className="stat-label">Total Users</p>
                    <p className="stat-value">{users.length}</p>
                </article>
                {['Buyer', 'NGO', 'Trader', 'Seller', 'Farmer', 'Admin'].map(role => (
                    <article key={role} className="stat-card" style={{ cursor: 'pointer', opacity: roleFilter === role ? 1 : 0.7 }} onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}>
                        <span className="stat-icon">{
                            role === 'Buyer' ? '🛒' : role === 'NGO' ? '🏛️' : role === 'Trader' ? '💼' : role === 'Seller' ? '🌾' : role === 'Farmer' ? '👨‍🌾' : '🔑'
                        }</span>
                        <p className="stat-label">{role}s</p>
                        <p className="stat-value">{roleCounts[role] || 0}</p>
                    </article>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                    className="form-input"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    style={{ maxWidth: '200px' }}
                    id="user-role-filter"
                >
                    <option value="all">All Roles</option>
                    <option value="Buyer">Buyer</option>
                    <option value="NGO">NGO</option>
                    <option value="Trader">Trader</option>
                    <option value="Seller">Seller</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Admin">Admin</option>
                </select>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input
                        className="form-input"
                        placeholder="🔍 Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                        id="user-search"
                    />
                    <button type="submit" className="btn btn-primary btn-sm" id="user-search-btn">Search</button>
                </form>
            </div>

            {/* Bulk Actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['Buyer', 'NGO', 'Trader', 'Seller', 'Farmer'].map(role => (
                    <button
                        key={role}
                        className="btn btn-outline btn-sm"
                        onClick={() => handleBulkDelete([role])}
                        style={{ fontSize: '12px' }}
                    >
                        🗑 Delete all {role}s ({roleCounts[role] || 0})
                    </button>
                ))}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="spinner-container"><div className="spinner" /></div>
            ) : users.length === 0 ? (
                <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
                    <h3>No users found</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        {search ? 'Try a different search term.' : 'No users match the selected filter.'}
                    </p>
                </article>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                    <td>{u.phoneNumber || '—'}</td>
                                    <td>
                                        <span className={`badge ${ROLE_BADGES[u.role] || 'badge-green'}`}>{u.role}</span>
                                    </td>
                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td>
                                        {u.role !== 'Admin' ? (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(u._id, u.name)}
                                                disabled={deleting === u._id}
                                                style={{ fontSize: '12px' }}
                                            >
                                                {deleting === u._id ? '...' : '🗑 Delete'}
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Protected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default AdminUsersPage;
