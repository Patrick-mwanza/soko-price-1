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

const BuyerDashboardPage: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [loading, setLoading] = useState(true);

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
                setPrices(res.data.prices);
            } catch (err) {
                console.error('Failed to load prices:', err);
            }
        };
        fetchPrices();
    }, [selectedCrop, selectedMarket]);

    useEffect(() => {
        if (!selectedCrop) return;
        const fetchTrends = async () => {
            try {
                const res = await api.get(`/analytics/trends?days=30&cropId=${selectedCrop}`);
                setTrends(res.data);
            } catch (err) {
                console.error('Failed to load trends:', err);
            }
        };
        fetchTrends();
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
        a.download = `sokoprice-buyer-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Build chart data from trends
    const chartData = trends.reduce((acc: any[], t: any) => {
        const existing = acc.find((a: any) => a.date === t.date);
        if (existing) {
            existing[t.market] = t.avgPrice;
        } else {
            acc.push({ date: t.date, [t.market]: t.avgPrice });
        }
        return acc;
    }, []);
    const trendMarkets = [...new Set(trends.map((t: any) => t.market))];
    const colors = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7'];

    // Compute supply indicators (submission count by market)
    const supplyData = markets.map((m) => {
        const count = prices.filter((p) => p.marketId?._id === m._id).length;
        return { market: m.name, submissions: count };
    }).filter((s) => s.submissions > 0);

    if (loading) {
        return <div className="spinner-container"><div className="spinner" /></div>;
    }

    return (
        <section className="animate-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🛒 Market Prices</h1>
                    <p>Live prices, historical graphs, and downloadable reports</p>
                </div>
                <button className="btn btn-primary" onClick={exportReport} id="buyer-export-btn">
                    📥 Download Report
                </button>
            </header>

            <nav className="filter-bar" aria-label="Price filters">
                <select
                    className="form-input"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    id="buyer-crop-filter"
                >
                    <option value="">All Crops</option>
                    {crops.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <select
                    className="form-input"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    id="buyer-market-filter"
                >
                    <option value="">All Markets</option>
                    {markets.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.county})</option>
                    ))}
                </select>
            </nav>

            {/* Live Prices Grid */}
            <div className="stat-grid" style={{ marginBottom: '32px' }}>
                {prices.slice(0, 8).map((p) => (
                    <article key={p._id} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="stat-icon">🌾</span>
                            <span className={`badge ${p.confidenceScore >= 0.7 ? 'badge-green' : p.confidenceScore >= 0.4 ? 'badge-gold' : 'badge-red'}`}>
                                {p.confidenceScore >= 0.7 ? 'High' : p.confidenceScore >= 0.4 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                        <p className="stat-label">{p.cropId?.name} — {p.marketId?.name}</p>
                        <p className="stat-value">KSh {p.price.toLocaleString()}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            per {p.cropId?.unit} · {new Date(p.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                        </p>
                    </article>
                ))}
            </div>

            <div className="grid-2">
                {/* Historical Price Graph */}
                {selectedCrop && chartData.length > 0 && (
                    <article className="chart-container">
                        <h3>📈 30-Day Price History</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData}>
                                <defs>
                                    {trendMarkets.map((m, i) => (
                                        <linearGradient key={String(m)} id={`buyer-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
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
                                        stroke={colors[i % colors.length]}
                                        fill={`url(#buyer-grad-${i})`}
                                        strokeWidth={2}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </article>
                )}

                {/* Supply Indicators */}
                {supplyData.length > 0 && (
                    <article className="chart-container">
                        <h3>📦 Supply Indicators (Submissions by Market)</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={supplyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="market" stroke="#6b7280" fontSize={11} />
                                <YAxis stroke="#6b7280" fontSize={11} />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="submissions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </article>
                )}
            </div>

            {/* Full Price Table */}
            <article className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>📋 All Approved Prices</h3>
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
                            {prices.map((p) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
        </section>
    );
};

export default BuyerDashboardPage;
