import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import api from '../services/api';

interface Crop {
    _id: string;
    name: string;
    unit: string;
}

interface Market {
    _id: string;
    name: string;
    county: string;
}

interface PriceData {
    _id: string;
    cropId: { _id: string; name: string; unit: string };
    marketId: { _id: string; name: string };
    price: number;
    date: string;
    confidenceScore: number;
}

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'];

const NGODashboardPage: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [comparison, setComparison] = useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'data' | 'trends' | 'compare'>('data');

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

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                let url = '/analytics/public/trends?days=30';
                if (selectedCrop) url += `&cropId=${selectedCrop}`;
                const res = await api.get(url);
                setTrends(res.data);
            } catch (err) {
                console.error('Failed to load trends:', err);
            }
        };
        fetchTrends();
    }, [selectedCrop]);

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

    const exportReport = () => {
        const headers = 'Crop,Market,Price (KSh),Unit,Date,Confidence\n';
        const rows = prices
            .map((p) =>
                `${p.cropId?.name},${p.marketId?.name},${p.price},${p.cropId?.unit},${new Date(p.date).toLocaleDateString()},${Math.round(p.confidenceScore * 100)}%`
            )
            .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sokoprice-ngo-research-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const chartData = trends.reduce((acc: any[], t: any) => {
        const existing = acc.find((a: any) => a.date === t.date);
        if (existing) { existing[t.market] = t.avgPrice; }
        else { acc.push({ date: t.date, [t.market]: t.avgPrice }); }
        return acc;
    }, []);
    const trendMarkets = [...new Set(trends.map((t: any) => t.market))];

    if (loading) {
        return <div className="spinner-container"><div className="spinner" /></div>;
    }

    return (
        <section className="animate-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>🏛️ NGO Research Dashboard</h1>
                    <p>Agricultural data analytics, price trends, and downloadable research reports</p>
                </div>
                <button className="btn btn-primary" onClick={exportReport} id="ngo-export-btn">
                    📥 Export Research Report
                </button>
            </header>

            {/* Summary Stats */}
            <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <article className="stat-card">
                    <span className="stat-icon">🌾</span>
                    <p className="stat-label">Crops Tracked</p>
                    <p className="stat-value">{crops.length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">🏪</span>
                    <p className="stat-label">Markets Monitored</p>
                    <p className="stat-value">{markets.length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">📊</span>
                    <p className="stat-label">Price Data Points</p>
                    <p className="stat-value">{prices.length}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon">📈</span>
                    <p className="stat-label">Trend Records</p>
                    <p className="stat-value">{trends.length}</p>
                </article>
            </div>

            {/* Filters */}
            <nav className="filter-bar" aria-label="Data filters">
                <select
                    className="form-input"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    id="ngo-crop-filter"
                >
                    <option value="">🌽 All Crops</option>
                    {crops.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <select
                    className="form-input"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    id="ngo-market-filter"
                >
                    <option value="">🏪 All Markets</option>
                    {markets.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.county})</option>
                    ))}
                </select>
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
                {(['data', 'trends', 'compare'] as const).map(tab => (
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
                        {tab === 'data' ? '📋 Research Data' : tab === 'trends' ? '📈 Price Trends' : '📊 Market Comparison'}
                    </button>
                ))}
            </div>

            {/* Tab: Research Data */}
            {activeTab === 'data' && (
                <article className="card animate-in">
                    <h3 style={{ marginBottom: '16px' }}>📋 Agricultural Price Data</h3>
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
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No data found for selected filters</td></tr>
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
            )}

            {/* Tab: Price Trends */}
            {activeTab === 'trends' && (
                <section className="animate-in">
                    {chartData.length === 0 ? (
                        <article className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                            <h3>No trend data available</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                Select a crop to view 30-day price trend analysis
                            </p>
                        </article>
                    ) : (
                        <article className="chart-container">
                            <h3>📈 30-Day Price Trend Analysis: {selectedCrop ? crops.find(c => c._id === selectedCrop)?.name : 'All Crops'}</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        {trendMarkets.map((m, i) => (
                                            <linearGradient key={String(m)} id={`ngo-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
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
                                            fill={`url(#ngo-grad-${i})`}
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
                                Cross-market price comparison for research analysis
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
                                <h3>📊 Cross-Market Price Analysis: {crops.find(c => c._id === selectedCrop)?.name}</h3>
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
        </section>
    );
};

export default NGODashboardPage;
