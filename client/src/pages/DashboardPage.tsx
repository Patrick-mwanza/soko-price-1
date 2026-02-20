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
} from 'recharts';
import api from '../services/api';

interface Stats {
    totalUsers: number;
    activeMarkets: number;
    pricesToday: number;
    pendingApprovals: number;
    totalCrops: number;
    totalSources: number;
}

interface TrendData {
    date: string;
    crop: string;
    market: string;
    avgPrice: number;
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, trendsRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/analytics/trends?days=14'),
                ]);
                setStats(statsRes.data);
                setTrends(trendsRes.data);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <figure className="spinner-container" aria-label="Loading dashboard">
                <span className="spinner" />
            </figure>
        );
    }

    // Aggregate trends by date for chart
    const chartData = trends.reduce((acc: any[], t) => {
        const existing = acc.find((a) => a.date === t.date);
        if (existing) {
            existing[t.crop] = t.avgPrice;
        } else {
            acc.push({ date: t.date, [t.crop]: t.avgPrice });
        }
        return acc;
    }, []);

    const cropNames = [...new Set(trends.map((t) => t.crop))];
    const colors = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

    return (
        <section className="animate-in">
            <header className="page-header">
                <h1>📊 Dashboard Overview</h1>
                <p>Real-time agricultural market analytics for Kenya</p>
            </header>

            <nav className="stat-grid" aria-label="Key metrics">
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">👥</span>
                    <p className="stat-label">Total Users</p>
                    <p className="stat-value">{stats?.totalUsers || 0}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">🏪</span>
                    <p className="stat-label">Active Markets</p>
                    <p className="stat-value">{stats?.activeMarkets || 0}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">💰</span>
                    <p className="stat-label">Prices Today</p>
                    <p className="stat-value">{stats?.pricesToday || 0}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">⏳</span>
                    <p className="stat-label">Pending Approvals</p>
                    <p className="stat-value">{stats?.pendingApprovals || 0}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">🌽</span>
                    <p className="stat-label">Total Crops</p>
                    <p className="stat-value">{stats?.totalCrops || 0}</p>
                </article>
                <article className="stat-card">
                    <span className="stat-icon" aria-hidden="true">📡</span>
                    <p className="stat-label">Active Sources</p>
                    <p className="stat-value">{stats?.totalSources || 0}</p>
                </article>
            </nav>

            <section className="grid-2">
                <article className="chart-container">
                    <h3>📈 Price Trends (14 Days)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData}>
                            <defs>
                                {cropNames.map((crop, i) => (
                                    <linearGradient key={crop} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={11}
                                tickFormatter={(v) => v.slice(5)}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={11}
                                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#1f2937',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                }}
                                formatter={(value: number) => [`KSh ${value.toLocaleString()}`, '']}
                            />
                            {cropNames.map((crop, i) => (
                                <Area
                                    key={crop}
                                    type="monotone"
                                    dataKey={crop}
                                    stroke={colors[i % colors.length]}
                                    fill={`url(#color-${i})`}
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </article>

                <article className="chart-container">
                    <h3>📊 Submissions by Crop</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={cropNames.map((crop) => ({
                                crop,
                                count: trends.filter((t) => t.crop === crop).length,
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="crop" stroke="#6b7280" fontSize={11} />
                            <YAxis stroke="#6b7280" fontSize={11} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1f2937',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </article>
            </section>
        </section>
    );
};

export default DashboardPage;
