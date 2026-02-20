import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface PriceEntry {
    _id: string;
    cropId: { name: string; unit: string };
    marketId: { name: string; county: string };
    price: number;
    date: string;
    confidenceScore: number;
    approved: boolean;
    sourceId: { name: string; role: string; reliabilityScore: number };
}

const PriceManagementPage: React.FC = () => {
    const [prices, setPrices] = useState<PriceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20 };
            if (filter === 'pending') params.approved = 'false';
            if (filter === 'approved') params.approved = 'true';

            const res = await api.get('/prices', { params });
            setPrices(res.data.prices);
            setTotalPages(res.data.pages);
        } catch (error) {
            console.error('Failed to load prices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, [filter, page]);

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/prices/${id}/approve`);
            fetchPrices();
        } catch (error) {
            console.error('Failed to approve price:', error);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this price?')) return;
        try {
            await api.patch(`/prices/${id}/reject`);
            fetchPrices();
        } catch (error) {
            console.error('Failed to reject price:', error);
        }
    };

    const getConfidenceClass = (score: number) => {
        if (score >= 0.7) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <section className="animate-in">
            <header className="page-header">
                <h1>💰 Price Management</h1>
                <p>Review, approve, and manage submitted market prices</p>
            </header>

            <nav className="filter-bar" aria-label="Price filters">
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => { setFilter('all'); setPage(1); }}
                    id="filter-all"
                >
                    All
                </button>
                <button
                    className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => { setFilter('pending'); setPage(1); }}
                    id="filter-pending"
                >
                    ⏳ Pending
                </button>
                <button
                    className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => { setFilter('approved'); setPage(1); }}
                    id="filter-approved"
                >
                    ✅ Approved
                </button>
            </nav>

            {loading ? (
                <figure className="spinner-container" aria-label="Loading prices"><span className="spinner" /></figure>
            ) : (
                <article>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Crop</th>
                                    <th scope="col">Market</th>
                                    <th scope="col">Price (KSh)</th>
                                    <th scope="col">Source</th>
                                    <th scope="col">Submitted</th>
                                    <th scope="col">Confidence</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prices.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <strong style={{ color: 'var(--text-primary)' }}>{p.cropId?.name}</strong>
                                            <br />
                                            <small>per {p.cropId?.unit}</small>
                                        </td>
                                        <td>
                                            {p.marketId?.name}
                                            <br />
                                            <small style={{ color: 'var(--text-muted)' }}>{p.marketId?.county}</small>
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--green-400)', fontSize: '16px' }}>
                                            {p.price?.toLocaleString('en-KE')}
                                        </td>
                                        <td>
                                            {p.sourceId?.name}
                                            <br />
                                            <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                                                {p.sourceId?.role}
                                            </span>
                                        </td>
                                        <td><time dateTime={p.date}>{formatDate(p.date)}</time></td>
                                        <td>
                                            <div className="confidence-bar">
                                                <div className="bar">
                                                    <meter
                                                        className={`bar-fill ${getConfidenceClass(p.confidenceScore)}`}
                                                        style={{ width: `${(p.confidenceScore * 100)}%`, appearance: 'none', border: 'none', height: '100%', display: 'block', borderRadius: '3px' }}
                                                        min={0}
                                                        max={1}
                                                        value={p.confidenceScore}
                                                    />
                                                </div>
                                                <small style={{ minWidth: '35px' }}>
                                                    {Math.round(p.confidenceScore * 100)}%
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            {p.approved ? (
                                                <mark className="badge badge-green" style={{ background: 'transparent' }}>Approved</mark>
                                            ) : (
                                                <mark className="badge badge-gold" style={{ background: 'transparent' }}>Pending</mark>
                                            )}
                                        </td>
                                        <td>
                                            {!p.approved && (
                                                <menu style={{ display: 'flex', gap: '8px', padding: 0, margin: 0 }}>
                                                    <li style={{ listStyle: 'none' }}>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleApprove(p._id)}
                                                            id={`approve-${p._id}`}
                                                            aria-label={`Approve ${p.cropId?.name} price`}
                                                        >
                                                            ✓
                                                        </button>
                                                    </li>
                                                    <li style={{ listStyle: 'none' }}>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleReject(p._id)}
                                                            id={`reject-${p._id}`}
                                                            aria-label={`Reject ${p.cropId?.name} price`}
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                </menu>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <nav style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }} aria-label="Pagination">
                            <button
                                className="btn btn-outline btn-sm"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Previous
                            </button>
                            <span style={{ padding: '6px 14px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="btn btn-outline btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next →
                            </button>
                        </nav>
                    )}
                </article>
            )}
        </section>
    );
};

export default PriceManagementPage;
