import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MarketplacePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // If already logged in, go to marketplace dashboard
    if (user) {
        navigate('/marketplace/dashboard');
        return null;
    }

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
                        <span style={{ fontSize: '24px' }}>🌾</span>
                        <div>
                            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--green-400)' }}>SokoPrice</h1>
                            <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>Digital Agricultural Marketplace</p>
                        </div>
                    </div>
                    <a href="/farmers-dashboard" style={{
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                    }}>
                        ← Farmer Dashboard
                    </a>
                </div>
            </header>

            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px' }}>
                {/* Hero Section */}
                <section className="animate-in" style={{
                    textAlign: 'center',
                    marginBottom: '48px',
                }}>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '16px',
                    }}>🏪</div>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 800,
                        marginBottom: '12px',
                        background: 'linear-gradient(135deg, var(--green-400), var(--gold-400))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        SokoPrice Marketplace
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '18px',
                        maxWidth: '600px',
                        margin: '0 auto 8px',
                        lineHeight: 1.6,
                    }}>
                        Connect directly with farmers and buyers across Kenya. Trade crops at verified market prices with SokoPrice as your trusted middleman.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        No payment processing — just transparent connections.
                    </p>
                </section>

                {/* Features Grid */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '48px',
                }}>
                    {[
                        { icon: '🌽', title: 'Sell Your Crops', desc: 'Farmers list their crops with quantity, price, and location. Reach buyers directly.' },
                        { icon: '🛒', title: 'Browse & Buy', desc: 'Buyers browse available listings, filter by crop, location, and price range.' },
                        { icon: '📊', title: 'Verified Prices', desc: 'All listings are backed by SokoPrice market data. Trade with confidence.' },
                        { icon: '📞', title: 'Direct Contact', desc: 'Call or SMS sellers directly. No middleman fees, just fair trade.' },
                    ].map(f => (
                        <article key={f.title} className="stat-card" style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{f.icon}</span>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</p>
                        </article>
                    ))}
                </section>

                {/* CTA Section */}
                <section style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(59,130,246,0.08) 100%)',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    border: '1px solid rgba(34,197,94,0.2)',
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
                        Ready to start trading?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '15px' }}>
                        Create an account to start selling or buying crops on the marketplace.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '14px 36px', fontSize: '16px' }}
                            onClick={() => navigate('/login?mode=register&redirect=/marketplace/dashboard')}
                            id="marketplace-signup-btn"
                        >
                            🌾 Sign Up
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '14px 36px', fontSize: '16px' }}
                            onClick={() => navigate('/login?redirect=/marketplace/dashboard')}
                            id="marketplace-signin-btn"
                        >
                            🔐 Sign In
                        </button>
                    </div>
                </section>

                {/* How it Works */}
                <section style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
                        How it Works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {[
                            { step: '1', title: 'Create Account', desc: 'Sign up as a Farmer, Buyer, or Trader' },
                            { step: '2', title: 'List or Browse', desc: 'Farmers list crops, Buyers browse listings' },
                            { step: '3', title: 'Connect', desc: 'Contact sellers via call or SMS' },
                            { step: '4', title: 'Trade', desc: 'Agree on terms and complete the trade' },
                        ].map(s => (
                            <div key={s.step} style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                border: '1px solid var(--border-color)',
                            }}>
                                <span style={{
                                    display: 'inline-flex',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'var(--green-400)',
                                    color: '#000',
                                    fontWeight: 800,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    marginBottom: '12px',
                                }}>{s.step}</span>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>{s.title}</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    marginTop: '48px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    paddingBottom: '24px',
                }}>
                    <p>🌾 SokoPrice Marketplace — Connecting Kenyan Farmers & Buyers</p>
                </footer>
            </main>
        </div>
    );
};

export default MarketplacePage;
