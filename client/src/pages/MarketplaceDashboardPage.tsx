import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Crop { _id: string; name: string; unit: string; }
interface Listing {
    _id: string;
    cropId: { _id: string; name: string; unit: string };
    sellerId: { _id: string; name: string; phoneNumber?: string };
    quantity: number;
    unit: string;
    price: number;
    location: string;
    phoneNumber: string;
    notes?: string;
    status: 'active' | 'sold';
    createdAt: string;
}

const MarketplaceDashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'my'>('buy');
    const [crops, setCrops] = useState<Crop[]>([]);
    const [listings, setListings] = useState<Listing[]>([]);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Sell form state
    const [sellForm, setSellForm] = useState({
        cropId: '', quantity: '', unit: '90kg bag', price: '', location: '', phoneNumber: user?.phoneNumber || '', notes: '',
    });

    // Buy filters
    const [filters, setFilters] = useState({ cropId: '', location: '', minPrice: '', maxPrice: '' });

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await api.get('/crops');
                setCrops(res.data);
            } catch (err) { console.error(err); }
        };
        fetchCrops();
    }, []);

    useEffect(() => {
        fetchListings();
    }, [filters]);

    useEffect(() => {
        if (activeTab === 'my') fetchMyListings();
    }, [activeTab]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filters.cropId) params.cropId = filters.cropId;
            if (filters.location) params.location = filters.location;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            const res = await api.get('/listings', { params });
            setListings(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchMyListings = async () => {
        try {
            const res = await api.get('/listings/user/my-listings');
            setMyListings(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/listings', {
                ...sellForm,
                quantity: Number(sellForm.quantity),
                price: Number(sellForm.price),
            });
            setSuccess('Listing created successfully! Buyers can now see your listing.');
            setSellForm({ cropId: '', quantity: '', unit: '90kg bag', price: '', location: '', phoneNumber: user?.phoneNumber || '', notes: '' });
            fetchMyListings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkSold = async (id: string) => {
        try {
            await api.patch(`/listings/${id}/status`, { status: 'sold' });
            fetchMyListings();
            fetchListings();
        } catch (err) { console.error(err); }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Delete this listing?')) return;
        try {
            await api.delete(`/listings/${id}`);
            fetchMyListings();
            fetchListings();
        } catch (err) { console.error(err); }
    };

    const handleInterest = async (id: string) => {
        try {
            const res = await api.post(`/listings/${id}/interest`);
            alert(`Seller Contact:\n${res.data.sellerContact.name}\n📞 ${res.data.sellerContact.phoneNumber}`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to express interest');
        }
    };

    const isFarmerOrTrader = user?.role === 'Farmer' || user?.role === 'Trader' || user?.role === 'Seller';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Top Navigation */}
            <header style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                padding: '12px 16px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(12px)',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <span style={{ fontSize: '24px' }}>🏪</span>
                        <div>
                            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--green-400)' }}>Marketplace</h1>
                            <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>SokoPrice Digital Trading</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                            background: 'rgba(34,197,94,0.15)',
                            color: 'var(--green-400)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}>
                            {user?.name} ({user?.role})
                        </span>
                        <a href="/farmers-dashboard" style={{
                            color: 'var(--text-muted)',
                            fontSize: '13px',
                            textDecoration: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                        }}>
                            📊 Prices
                        </a>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            style={{
                                color: 'var(--text-muted)',
                                fontSize: '13px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: 'none',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-family)',
                            }}
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    padding: '4px',
                    border: '1px solid var(--border-color)',
                }}>
                    {[
                        { key: 'buy' as const, label: '🛒 Buy Crops', show: true },
                        { key: 'sell' as const, label: '🌾 Sell Crops', show: isFarmerOrTrader },
                        { key: 'my' as const, label: '📋 My Listings', show: isFarmerOrTrader },
                    ].filter(t => t.show).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                background: activeTab === tab.key ? 'var(--green-400)' : 'transparent',
                                color: activeTab === tab.key ? '#000' : 'var(--text-muted)',
                                fontFamily: 'var(--font-family)',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== BUY TAB ===== */}
                {activeTab === 'buy' && (
                    <section className="animate-in">
                        {/* Filters */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '20px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                        }}>
                            <select
                                className="form-input"
                                value={filters.cropId}
                                onChange={e => setFilters({ ...filters, cropId: e.target.value })}
                                style={{ flex: '1', minWidth: '140px', maxWidth: '220px' }}
                                id="mkt-crop-filter"
                            >
                                <option value="">🌽 All Crops</option>
                                {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <input
                                className="form-input"
                                placeholder="📍 Location..."
                                value={filters.location}
                                onChange={e => setFilters({ ...filters, location: e.target.value })}
                                style={{ flex: '1', minWidth: '140px', maxWidth: '200px' }}
                                id="mkt-location-filter"
                            />
                            <input
                                className="form-input"
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                                style={{ width: '110px' }}
                                id="mkt-min-price"
                            />
                            <input
                                className="form-input"
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                style={{ width: '110px' }}
                                id="mkt-max-price"
                            />
                        </div>

                        {/* Listings Grid */}
                        {loading ? (
                            <div className="spinner-container"><div className="spinner" /></div>
                        ) : listings.length === 0 ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
                                <h3>No listings found</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Try adjusting your filters or check back later for new listings.
                                </p>
                            </article>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '16px',
                            }}>
                                {listings.map(listing => (
                                    <article key={listing._id} className="stat-card" style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--green-400)' }}>
                                                    {listing.cropId?.name}
                                                </h3>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                                    by {listing.sellerId?.name}
                                                </p>
                                            </div>
                                            <span className={`badge ${listing.status === 'active' ? 'badge-green' : 'badge-gold'}`}>
                                                {listing.status}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '8px 12px' }}>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Quantity</p>
                                                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{listing.quantity} {listing.unit}</p>
                                            </div>
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '8px 12px' }}>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Price / unit</p>
                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--green-400)' }}>KSh {listing.price.toLocaleString()}</p>
                                            </div>
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '8px 12px' }}>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Location</p>
                                                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>📍 {listing.location}</p>
                                            </div>
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '8px 12px' }}>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Total</p>
                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--gold-400)' }}>KSh {(listing.price * listing.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {listing.notes && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                                                💬 {listing.notes}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <a href={`tel:${listing.phoneNumber}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                📞 Call
                                            </a>
                                            <a href={`sms:${listing.phoneNumber}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                💬 SMS
                                            </a>
                                            <button onClick={() => handleInterest(listing._id)} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                ⭐ Interested
                                            </button>
                                        </div>

                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                                            {new Date(listing.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ===== SELL TAB ===== */}
                {activeTab === 'sell' && isFarmerOrTrader && (
                    <section className="animate-in">
                        <article className="card" style={{ maxWidth: '600px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>🌾 Create a New Listing</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                                List your crops for buyers to discover and contact you directly.
                            </p>

                            {success && (
                                <div style={{
                                    background: 'rgba(34,197,94,0.1)',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '16px',
                                    color: 'var(--green-400)',
                                    fontSize: '14px',
                                }}>{success}</div>
                            )}
                            {error && <div className="login-error">{error}</div>}

                            <form onSubmit={handleSell}>
                                <div className="form-group">
                                    <label htmlFor="sell-crop">Crop</label>
                                    <select
                                        id="sell-crop"
                                        className="form-input"
                                        value={sellForm.cropId}
                                        onChange={e => setSellForm({ ...sellForm, cropId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a crop...</option>
                                        {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label htmlFor="sell-qty">Quantity</label>
                                        <input
                                            id="sell-qty"
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g. 50"
                                            value={sellForm.quantity}
                                            onChange={e => setSellForm({ ...sellForm, quantity: e.target.value })}
                                            required
                                            min={1}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sell-unit">Unit</label>
                                        <select
                                            id="sell-unit"
                                            className="form-input"
                                            value={sellForm.unit}
                                            onChange={e => setSellForm({ ...sellForm, unit: e.target.value })}
                                        >
                                            <option value="90kg bag">90kg bag</option>
                                            <option value="50kg bag">50kg bag</option>
                                            <option value="kg">kg</option>
                                            <option value="ton">ton</option>
                                            <option value="crate">crate</option>
                                            <option value="bunch">bunch</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sell-price">Price per Unit (KSh)</label>
                                    <input
                                        id="sell-price"
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 4500"
                                        value={sellForm.price}
                                        onChange={e => setSellForm({ ...sellForm, price: e.target.value })}
                                        required
                                        min={0}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sell-location">Location (County or Market)</label>
                                    <input
                                        id="sell-location"
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Nakuru, Wakulima Market"
                                        value={sellForm.location}
                                        onChange={e => setSellForm({ ...sellForm, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sell-phone">Phone Number</label>
                                    <input
                                        id="sell-phone"
                                        type="tel"
                                        className="form-input"
                                        placeholder="+254 7XX XXX XXX"
                                        value={sellForm.phoneNumber}
                                        onChange={e => setSellForm({ ...sellForm, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sell-notes">Notes <small style={{ color: 'var(--text-muted)' }}>(optional)</small></label>
                                    <textarea
                                        id="sell-notes"
                                        className="form-input"
                                        placeholder="e.g. Fresh harvest, available for pickup..."
                                        value={sellForm.notes}
                                        onChange={e => setSellForm({ ...sellForm, notes: e.target.value })}
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                                    id="sell-submit"
                                >
                                    {submitting ? 'Creating listing...' : '🌾 Publish Listing'}
                                </button>
                            </form>
                        </article>
                    </section>
                )}

                {/* ===== MY LISTINGS TAB ===== */}
                {activeTab === 'my' && isFarmerOrTrader && (
                    <section className="animate-in">
                        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>📋 My Listings</h2>
                        {myListings.length === 0 ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '48px', marginBottom: '12px' }}>📝</p>
                                <h3>No listings yet</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Switch to the "Sell Crops" tab to create your first listing.
                                </p>
                            </article>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Crop</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myListings.map(l => (
                                            <tr key={l._id}>
                                                <td style={{ fontWeight: 600 }}>{l.cropId?.name}</td>
                                                <td>{l.quantity} {l.unit}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--green-400)' }}>KSh {l.price.toLocaleString()}</td>
                                                <td>{l.location}</td>
                                                <td>
                                                    <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{l.status}</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {l.status === 'active' && (
                                                            <button onClick={() => handleMarkSold(l._id)} className="btn btn-outline btn-sm">✅ Sold</button>
                                                        )}
                                                        <button onClick={() => handleDeleteListing(l._id)} className="btn btn-danger btn-sm">🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default MarketplaceDashboardPage;
