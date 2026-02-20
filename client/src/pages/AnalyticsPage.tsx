import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
} from 'recharts';
import api from '../services/api';

interface Crop {
    _id: string;
    name: string;
}

interface Market {
    _id: string;
    name: string;
}

interface TrendData {
    date: string;
    crop: string;
    market: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    submissions: number;
}

interface ComparisonData {
    market: string;
    county: string;
    price: number;
    date: string;
    confidence: number;
}

const AnalyticsPage: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [comparison, setComparison] = useState<ComparisonData[]>([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [days, setDays] = useState(30);
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
                if (cropsRes.data.length > 0) {
                    setSelectedCrop(cropsRes.data[0]._id);
                }
            } catch (err) {
                console.error('Failed to load base data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBase();
    }, []);

    useEffect(() => {
        if (!selectedCrop) return;
        const fetchAnalytics = async () => {
            try {
                const [trendsRes, compRes] = await Promise.all([
                    api.get(`/analytics/trends?days=${days}&cropId=${selectedCrop}`),
                    api.get(`/analytics/compare?cropId=${selectedCrop}`),
                ]);
                setTrends(trendsRes.data);
                setComparison(compRes.data);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            }
        };
        fetchAnalytics();
    }, [selectedCrop, days]);

    const exportCSV = () => {
        const headers = 'Date,Crop,Market,Avg Price,Min Price,Max Price,Submissions\n';
        const rows = trends
            .map((t) => `${t.date},${t.crop},${t.market},${t.avgPrice},${t.minPrice},${t.maxPrice},${t.submissions}`)
            .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sokoprice-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Group trends by date with market breakdown
    const chartData = trends.reduce((acc: any[], t) => {
        const existing = acc.find((a) => a.date === t.date);
        if (existing) {
            existing[t.market] = t.avgPrice;
        } else {
            acc.push({ date: t.date, [t.market]: t.avgPrice });
        }
        return acc;
    }, []);

    const marketNames = [...new Set(trends.map((t) => t.market))];
    const colors = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

    if (loading) {
        return <div className="spinner-container"><div className="spinner" /></div>;
    }

    return (
        <section className="animate-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>📈 Analytics</h1>
                    <p>Historical trends, market comparisons, and export reports</p>
                </div>
                <button className="btn btn-primary" onClick={exportCSV} id="export-csv-btn">
                    📥 Export CSV
                </button>
            </header>

            <div className="filter-bar">
                <select
                    className="form-input"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    id="crop-filter"
                >
                    {crops.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <select
                    className="form-input"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    id="days-filter"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            <div className="grid-2">
                <article className="chart-container">
                    <h3>📊 Price Trends by Market</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                            <Tooltip
                                contentStyle={{ background: '#1f2937', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '13px' }}
                                formatter={(value: number) => [`KSh ${value.toLocaleString()}`, '']}
                            />
                            <Legend />
                            {marketNames.map((market, i) => (
                                <Line
                                    key={market}
                                    type="monotone"
                                    dataKey={market}
                                    stroke={colors[i % colors.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </article>

                <article className="chart-container">
                    <h3>🏪 Market Price Comparison (Latest)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={comparison} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" stroke="#6b7280" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                            <YAxis type="category" dataKey="market" stroke="#6b7280" fontSize={12} width={120} />
                            <Tooltip
                                contentStyle={{ background: '#1f2937', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}
                                formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Price']}
                            />
                            <Bar dataKey="price" fill="#22c55e" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </article>
            </div>

            {trends.length > 0 && (
                <article className="card" style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>📋 Detailed Data</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Crop</th>
                                    <th>Market</th>
                                    <th>Avg Price</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                    <th>Submissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trends.slice(0, 50).map((t, i) => (
                                    <tr key={i}>
                                        <td>{t.date}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.crop}</td>
                                        <td>{t.market}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--green-400)' }}>KSh {t.avgPrice.toLocaleString()}</td>
                                        <td>KSh {t.minPrice.toLocaleString()}</td>
                                        <td>KSh {t.maxPrice.toLocaleString()}</td>
                                        <td>{t.submissions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>
            )}
        </section>
    );
};

export default AnalyticsPage;
