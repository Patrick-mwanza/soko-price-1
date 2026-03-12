import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Listing {
    _id: string;
    cropId: { _id: string; name: string; unit: string };
    sellerId: { _id: string; name: string; email: string; phoneNumber?: string; role: string; active: boolean };
    quantity: number;
    unit: string;
    price: number;
    location: string;
    phoneNumber: string;
    notes?: string;
    status: 'active' | 'sold';
    createdAt: string;
}

const AdminMarketplacePage: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get('/listings/admin/all');
            setListings(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this listing? This action cannot be undone.')) return;
        try {
            await api.delete(`/listings/admin/${id}`);
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleToggleSuspend = async (userId: string, currentActive: boolean) => {
        const action = currentActive ? 'suspend' : 'activate';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await api.patch(`/listings/admin/users/${userId}/suspend`, { active: !currentActive });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1>🏪 Marketplace Management</h1>
                <p>View all marketplace listings, remove fraudulent listings, and manage users.</p>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <article className="stat-card">
                    <span className="stat-icon">📋</span>
                    <p className="stat-label">Total Listings</p>
                    <p className="stat-value">{listings.length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">✅</span>
                    <p className="stat-label">Active</p>
                    <p className="stat-value">{listings.filter(l => l.status === 'active').length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">🏷️</span>
                    <p className="stat-label">Sold</p>
                    <p className="stat-value">{listings.filter(l => l.status === 'sold').length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">👥</span>
                    <p className="stat-label">Unique Sellers</p>
                    <p className="stat-value">{new Set(listings.map(l => l.sellerId?._id)).size}</p>
                </article>
            </div>

            {/* Listings Table */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>All Marketplace Listings</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Crop</th>
                                <th>Seller</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No marketplace listings yet</td></tr>
                            ) : (
                                listings.map(l => (
                                    <tr key={l._id}>
                                        <td style={{ fontWeight: 600 }}>{l.cropId?.name}</td>
                                        <td>
                                            <div>
                                                <span style={{ fontWeight: 600 }}>{l.sellerId?.name}</span>
                                                <br />
                                                <small style={{ color: 'var(--text-muted)' }}>{l.sellerId?.email}</small>
                                                {!l.sellerId?.active && (
                                                    <span className="badge badge-red" style={{ marginLeft: '6px', fontSize: '10px' }}>Suspended</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{l.quantity} {l.unit}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--green-400)' }}>KSh {l.price.toLocaleString()}</td>
                                        <td>{l.location}</td>
                                        <td>
                                            <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{l.status}</span>
                                        </td>
                                        <td style={{ fontSize: '12px' }}>
                                            {new Date(l.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button onClick={() => handleRemove(l._id)} className="btn btn-danger btn-sm">
                                                    🗑 Remove
                                                </button>
                                                <button
                                                    onClick={() => handleToggleSuspend(l.sellerId?._id, l.sellerId?.active)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    {l.sellerId?.active ? '🚫 Suspend User' : '✅ Activate User'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMarketplacePage;
