import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import api from '../services/api';

interface Crop { _id: string; name: string; unit: string; }
interface Market { _id: string; name: string; county: string; }
interface PriceData {
    _id: string;
    cropId: { _id: string; name: string; unit: string };
    marketId: { _id: string; name: string };
    price: number;
    date: string;
    confidenceScore: number;
}

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'];

const FarmerDashboardPage: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [comparison, setComparison] = useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'prices' | 'trends' | 'compare'>('prices');

    // Load base data
    useEffect(() => {
        const fetchBase = async () => {
            try {
                const [cropsRes, marketsRes] = await Promise.all([
                    api.get('/crops'),
                    api.get('/markets'),
                ]);
                setCrops(cropsRes.data);
                setMarkets(marketsRes.data);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBase();
    }, []);

    // Load prices when filters change
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const params: any = { approved: 'true', limit: 100 };
                if (selectedCrop) params.cropId = selectedCrop;
                if (selectedMarket) params.marketId = selectedMarket;
                const res = await api.get('/prices', { params });
                setPrices(res.data.prices || []);
            } catch (err) {
                console.error('Failed to load prices:', err);
            }
        };
        fetchPrices();
    }, [selectedCrop, selectedMarket]);

    // Load trends when crop changes
    useEffect(() => {
        if (!selectedCrop) { setTrends([]); return; }
        const fetchTrends = async () => {
            try {
                const res = await api.get(`/analytics/public/trends?days=30&cropId=${selectedCrop}`);
                setTrends(res.data);
            } catch (err) {
                console.error('Failed to load trends:', err);
            }
        };
        fetchTrends();
    }, [selectedCrop]);

    // Load market comparison when crop changes
    useEffect(() => {
        if (!selectedCrop) { setComparison([]); return; }
        const fetchComparison = async () => {
            try {
                const res = await api.get(`/analytics/public/compare?cropId=${selectedCrop}`);
                setComparison(res.data);
            } catch (err) {
                console.error('Failed to load comparison:', err);
            }
        };
        fetchComparison();
    }, [selectedCrop]);

    // CSV export
    const exportCSV = () => {
        const headers = 'Crop,Market,Price (KSh),Unit,Date,Confidence\n';
        const rows = prices
            .map(p =>
                `${p.cropId?.name},${p.marketId?.name},${p.price},${p.cropId?.unit},${new Date(p.date).toLocaleDateString()},${Math.round(p.confidenceScore * 100)}%`
            )
            .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sokoprice-farmer-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Build chart data from trends
    const chartData = trends.reduce((acc: any[], t: any) => {
        const existing = acc.find((a: any) => a.date === t.date);
        if (existing) { existing[t.market] = t.avgPrice; }
        else { acc.push({ date: t.date, [t.market]: t.avgPrice }); }
        return acc;
    }, []);
    const trendMarkets = [...new Set(trends.map((t: any) => t.market))];

    // Latest prices per crop (summary cards)
    const latestByCrop = crops.map(crop => {
        const cropPrices = prices.filter(p => p.cropId?._id === crop._id);
        if (cropPrices.length === 0) return null;
        const latest = cropPrices[0];
        const avgPrice = Math.round(cropPrices.reduce((s, p) => s + p.price, 0) / cropPrices.length);
        return { crop: crop.name, unit: crop.unit, avgPrice, latest };
    }).filter(Boolean);

    if (loading) {
        return <div className="spinner-container"><div className="spinner" /></div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Top Navigation Bar */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🌾</span>
                        <div>
                            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--green-400)' }}>SokoPrice</h1>
                            <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>Market Prices for Farmers</p>
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
                            USSD: *384*474718#
                        </span>
                        <a href="/login" style={{
                            color: 'var(--text-muted)',
                            fontSize: '13px',
                            textDecoration: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                        }}>
                            Sign In
                        </a>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
                {/* Hero Section */}
                <section style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(59,130,246,0.08) 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    border: '1px solid rgba(34,197,94,0.15)',
                }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0' }}>
                        📊 Today's Market Prices
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                        Real-time crop prices from {markets.length} markets · {crops.length} crops tracked · Updated daily
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <div className="stat-card" style={{ flex: '1', minWidth: '120px', padding: '12px' }}>
                            <p className="stat-value" style={{ fontSize: '22px' }}>{crops.length}</p>
                            <p className="stat-label">Crops</p>
                        </div>
                        <div className="stat-card" style={{ flex: '1', minWidth: '120px', padding: '12px' }}>
                            <p className="stat-value" style={{ fontSize: '22px' }}>{markets.length}</p>
                            <p className="stat-label">Markets</p>
                        </div>
                        <div className="stat-card" style={{ flex: '1', minWidth: '120px', padding: '12px' }}>
                            <p className="stat-value" style={{ fontSize: '22px' }}>{prices.length}</p>
                            <p className="stat-label">Price Reports</p>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <nav style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <select
                        className="form-input"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        style={{ flex: '1', minWidth: '140px', maxWidth: '250px' }}
                        id="farmer-crop-filter"
                    >
                        <option value="">🌽 All Crops</option>
                        {crops.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        className="form-input"
                        value={selectedMarket}
                        onChange={(e) => setSelectedMarket(e.target.value)}
                        style={{ flex: '1', minWidth: '140px', maxWidth: '250px' }}
                        id="farmer-market-filter"
                    >
                        <option value="">🏪 All Markets</option>
                        {markets.map(m => (
                            <option key={m._id} value={m._id}>{m.name} ({m.county})</option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={exportCSV} style={{ fontSize: '13px' }}>
                        📥 Export CSV
                    </button>
                </nav>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '20px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    padding: '4px',
                    border: '1px solid var(--border-color)',
                }}>
                    {(['prices', 'trends', 'compare'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                background: activeTab === tab ? 'var(--green-400)' : 'transparent',
                                color: activeTab === tab ? '#000' : 'var(--text-muted)',
                            }}
                        >
                            {tab === 'prices' ? '💰 Prices' : tab === 'trends' ? '📈 Trends' : '📊 Compare'}
                        </button>
                    ))}
                </div>

                {/* Tab: Prices */}
                {activeTab === 'prices' && (
                    <section className="animate-in">
                        {/* Summary Cards */}
                        {!selectedCrop && latestByCrop.length > 0 && (
                            <div className="stat-grid" style={{ marginBottom: '24px' }}>
                                {latestByCrop.map((item: any) => (
                                    <article key={item.crop} className="stat-card">
                                        <span className="stat-icon">🌾</span>
                                        <p className="stat-label">{item.crop}</p>
                                        <p className="stat-value">KSh {item.avgPrice.toLocaleString()}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            avg. per {item.unit}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}

                        {/* Price Table */}
                        <article className="card">
                            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📋 Approved Prices</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Crop</th>
                                            <th>Market</th>
                                            <th>Price (KSh)</th>
                                            <th>Unit</th>
                                            <th>Date</th>
                                            <th>Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prices.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No prices found for selected filters</td></tr>
                                        ) : (
                                            prices.map(p => (
                                                <tr key={p._id}>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.cropId?.name}</td>
                                                    <td>{p.marketId?.name}</td>
                                                    <td style={{ fontWeight: 700, color: 'var(--green-400)' }}>{p.price.toLocaleString()}</td>
                                                    <td>{p.cropId?.unit}</td>
                                                    <td>{new Date(p.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td>
                                                        <span className={`badge ${p.confidenceScore >= 0.7 ? 'badge-green' : p.confidenceScore >= 0.4 ? 'badge-gold' : 'badge-red'}`}>
                                                            {Math.round(p.confidenceScore * 100)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </section>
                )}

                {/* Tab: Trends */}
                {activeTab === 'trends' && (
                    <section className="animate-in">
                        {!selectedCrop ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📈</p>
                                <h3>Select a crop to view price trends</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Use the crop filter above to see 30-day historical pricing data
                                </p>
                            </article>
                        ) : chartData.length === 0 ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                                <h3>No trend data available</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    No approved prices found for this crop in the last 30 days
                                </p>
                            </article>
                        ) : (
                            <article className="chart-container">
                                <h3>📈 30-Day Price History: {crops.find(c => c._id === selectedCrop)?.name}</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            {trendMarkets.map((m, i) => (
                                                <linearGradient key={String(m)} id={`farmer-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                                        <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                                        <Tooltip
                                            contentStyle={{ background: '#1f2937', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '13px' }}
                                            formatter={(value: number) => [`KSh ${value.toLocaleString()}`, '']}
                                        />
                                        <Legend />
                                        {trendMarkets.map((market, i) => (
                                            <Area
                                                key={String(market)}
                                                type="monotone"
                                                dataKey={String(market)}
                                                stroke={COLORS[i % COLORS.length]}
                                                fill={`url(#farmer-grad-${i})`}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </article>
                        )}
                    </section>
                )}

                {/* Tab: Market Comparison */}
                {activeTab === 'compare' && (
                    <section className="animate-in">
                        {!selectedCrop ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
                                <h3>Select a crop to compare markets</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    See how prices differ across markets for the same crop
                                </p>
                            </article>
                        ) : comparison.length === 0 ? (
                            <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                                <h3>No comparison data</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    No approved prices found across markets for this crop
                                </p>
                            </article>
                        ) : (
                            <>
                                <article className="chart-container">
                                    <h3>📊 Market Comparison: {crops.find(c => c._id === selectedCrop)?.name}</h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={comparison}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="market" stroke="#6b7280" fontSize={11} />
                                            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                                            <Tooltip
                                                contentStyle={{ background: '#1f2937', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}
                                                formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Price']}
                                            />
                                            <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                                                {comparison.map((_: any, i: number) => (
                                                    <rect key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </article>
                                <div className="stat-grid" style={{ marginTop: '20px' }}>
                                    {comparison.map((c: any, i: number) => (
                                        <article key={c.market} className="stat-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '20px' }}>🏪</span>
                                                {c.confidence && (
                                                    <span className={`badge ${c.confidence >= 0.7 ? 'badge-green' : c.confidence >= 0.4 ? 'badge-gold' : 'badge-red'}`}>
                                                        {Math.round(c.confidence * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="stat-label">{c.market} · {c.county}</p>
                                            <p className="stat-value" style={{ color: COLORS[i % COLORS.length] }}>
                                                KSh {c.price?.toLocaleString()}
                                            </p>
                                            {c.date && (
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {new Date(c.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                )}

                {/* USSD Instructions */}
                <section style={{
                    marginTop: '32px',
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(245,158,11,0.08) 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(34,197,94,0.15)',
                }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>📱 Check Prices on Your Phone (USSD)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        No internet needed! Dial the code below on any phone to get real-time market prices via SMS.
                    </p>
                    <div style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--green-400)', letterSpacing: '2px' }}>
                            *384*474718#
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                            Safaricom · Airtel · Telkom
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {[
                            { step: '1', title: 'Dial *384*474718#', desc: 'On your phone keypad' },
                            { step: '2', title: 'Select Language', desc: 'English or Swahili' },
                            { step: '3', title: 'Choose Crop', desc: 'Pick from the list' },
                            { step: '4', title: 'Get Prices', desc: 'Latest prices via SMS' },
                        ].map(s => (
                            <div key={s.step} style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '10px',
                                padding: '14px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                            }}>
                                <span style={{
                                    background: 'var(--green-400)',
                                    color: '#000',
                                    fontWeight: 800,
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    flexShrink: 0,
                                }}>
                                    {s.step}
                                </span>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>{s.title}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    marginTop: '32px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    paddingBottom: '24px',
                }}>
                    <p>🌾 SokoPrice — Agricultural Market Price Platform</p>
                    <p style={{ marginTop: '4px' }}>Empowering Kenyan farmers with real-time market data</p>
                </footer>
            </main>
        </div>
    );
};

export default FarmerDashboardPage;
