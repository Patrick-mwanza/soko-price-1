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

    // Add Price form state
    const [showForm, setShowForm] = useState(false);
    const [crops, setCrops] = useState<any[]>([]);
    const [markets, setMarkets] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [formData, setFormData] = useState({ cropId: '', marketId: '', sourceId: '', price: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    // Load crops, markets, sources for form dropdowns
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [cropsRes, marketsRes, sourcesRes] = await Promise.all([
                    api.get('/crops'),
                    api.get('/markets'),
                    api.get('/sources').catch(() => ({ data: [] })),
                ]);
                setCrops(cropsRes.data);
                setMarkets(marketsRes.data);
                setSources(sourcesRes.data);
            } catch (err) {
                console.error('Failed to load form data:', err);
            }
        };
        loadFormData();
    }, []);

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

    const handleAddPrice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cropId || !formData.marketId || !formData.price) {
            setFormMsg('Please fill in all required fields');
            return;
        }
        setSubmitting(true);
        setFormMsg('');
        try {
            await api.post('/prices', {
                cropId: formData.cropId,
                marketId: formData.marketId,
                sourceId: formData.sourceId || undefined,
                price: Number(formData.price),
            });
            setFormMsg('✅ Price added successfully!');
            setFormData({ cropId: '', marketId: '', sourceId: '', price: '' });
            fetchPrices();
            setTimeout(() => setFormMsg(''), 3000);
        } catch (err: any) {
            setFormMsg(`❌ ${err.response?.data?.message || 'Failed to add price'}`);
        } finally {
            setSubmitting(false);
        }
    };

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
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>💰 Price Management</h1>
                    <p>Review, approve, and manage submitted market prices</p>
                </div>
                <button
                    className={`btn ${showForm ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => setShowForm(!showForm)}
                    id="toggle-add-price"
                >
                    {showForm ? '✕ Close' : '➕ Add Price'}
                </button>
            </header>

            {/* Add Price Form */}
            {showForm && (
                <article className="card" style={{ marginBottom: '24px', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <h3 style={{ marginBottom: '16px' }}>📝 Add New Price</h3>
                    <form onSubmit={handleAddPrice} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                Crop *
                            </label>
                            <select
                                className="form-input"
                                value={formData.cropId}
                                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                                required
                            >
                                <option value="">Select crop</option>
                                {crops.map(c => <option key={c._id} value={c._id}>{c.name} ({c.unit})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                Market *
                            </label>
                            <select
                                className="form-input"
                                value={formData.marketId}
                                onChange={(e) => setFormData({ ...formData, marketId: e.target.value })}
                                required
                            >
                                <option value="">Select market</option>
                                {markets.map(m => <option key={m._id} value={m._id}>{m.name} ({m.county})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                Source (optional)
                            </label>
                            <select
                                className="form-input"
                                value={formData.sourceId}
                                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                            >
                                <option value="">Auto-select</option>
                                {sources.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                Price (KSh) *
                            </label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="e.g. 4500"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                min="1"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ height: '42px' }}>
                            {submitting ? '⏳ Adding...' : '✅ Submit Price'}
                        </button>
                    </form>
                    {formMsg && (
                        <p style={{
                            marginTop: '12px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                            background: formMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: formMsg.startsWith('✅') ? 'var(--green-400)' : '#ef4444',
                        }}>
                            {formMsg}
                        </p>
                    )}
                </article>
            )}

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
