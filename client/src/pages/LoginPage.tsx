import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role] = useState<'Buyer'>('Buyer');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name,
                email,
                password,
                phoneNumber: phoneNumber || undefined,
                role,
            });
            // Auto-login after registration
            localStorage.setItem('sokoprice_token', res.data.token);
            localStorage.setItem('sokoprice_user', JSON.stringify(res.data.user));
            window.location.href = res.data.user.role === 'Admin' ? '/admin' : '/buyer';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <article className="login-card animate-in">
                <header className="login-logo">
                    <span className="logo-icon">🌾</span>
                    <h1>SokoPrice</h1>
                    <p>Agricultural Market Price Platform</p>
                </header>

                {error && <aside className="login-error" role="alert">{error}</aside>}

                {!isRegister ? (
                    /* ===== LOGIN FORM ===== */
                    <form onSubmit={handleLogin}>
                        <fieldset style={{ border: 'none', padding: 0 }}>
                            <legend className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                                Sign in to SokoPrice
                            </legend>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                id="login-submit"
                            >
                                {loading ? 'Signing in...' : '🔐 Sign In'}
                            </button>
                        </fieldset>
                    </form>
                ) : (
                    /* ===== REGISTER FORM ===== */
                    <form onSubmit={handleRegister}>
                        <fieldset style={{ border: 'none', padding: 0 }}>
                            <legend className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                                Create a SokoPrice account
                            </legend>

                            <div className="form-group">
                                <label htmlFor="reg-name">Full Name</label>
                                <input
                                    id="reg-name"
                                    type="text"
                                    className="form-input"
                                    placeholder="John Kamau"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-email">Email Address</label>
                                <input
                                    id="reg-email"
                                    type="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-phone">Phone Number <small style={{ color: 'var(--text-muted)' }}>(optional)</small></label>
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="+254 7XX XXX XXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-role">Account Type</label>
                                <input
                                    id="reg-role"
                                    type="text"
                                    className="form-input"
                                    value="🛒 Buyer / NGO"
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                id="register-submit"
                            >
                                {loading ? 'Creating account...' : '🌾 Create Account'}
                            </button>
                        </fieldset>
                    </form>
                )}

                <footer style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    {!isRegister ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => { setIsRegister(true); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-family)', fontSize: '14px' }}
                                id="switch-to-register"
                            >
                                Sign Up
                            </button>
                        </p>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => { setIsRegister(false); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-family)', fontSize: '14px' }}
                                id="switch-to-login"
                            >
                                Sign In
                            </button>
                        </p>
                    )}
                </footer>
            </article>
        </main>
    );
};

export default LoginPage;
