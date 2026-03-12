import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || null;
    const initialMode = searchParams.get('mode') === 'register';

    const [isRegister, setIsRegister] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<'Buyer' | 'NGO'>('Buyer');
    const [name, setName] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getRedirectPath = (userRole: string) => {
        if (redirectTo) return redirectTo;
        if (userRole === 'Admin') return '/admin';
        if (userRole === 'NGO') return '/ngo';
        if (userRole === 'Buyer') return '/buyer';
        // Trader, Seller, Farmer → marketplace
        return '/marketplace/dashboard';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Auth context updates, then redirect
            const savedUser = localStorage.getItem('sokoprice_user');
            const userRole = savedUser ? JSON.parse(savedUser).role : 'Buyer';
            navigate(getRedirectPath(userRole));
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
            await register({
                name,
                email,
                password,
                phoneNumber: phoneNumber || undefined,
                role: selectedRole,
            });
            const savedUser = localStorage.getItem('sokoprice_user');
            const userRole = savedUser ? JSON.parse(savedUser).role : 'Buyer';
            navigate(getRedirectPath(userRole));
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        id="reg-role-buyer"
                                        onClick={() => setSelectedRole('Buyer')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: selectedRole === 'Buyer' ? '2px solid var(--green-400)' : '1px solid var(--border-color)',
                                            background: selectedRole === 'Buyer' ? 'rgba(34,197,94,0.12)' : 'var(--bg-secondary)',
                                            color: selectedRole === 'Buyer' ? 'var(--green-400)' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            fontFamily: 'var(--font-family)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        🛒 Buyer
                                    </button>
                                    <button
                                        type="button"
                                        id="reg-role-ngo"
                                        onClick={() => setSelectedRole('NGO')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: selectedRole === 'NGO' ? '2px solid var(--green-400)' : '1px solid var(--border-color)',
                                            background: selectedRole === 'NGO' ? 'rgba(34,197,94,0.12)' : 'var(--bg-secondary)',
                                            color: selectedRole === 'NGO' ? 'var(--green-400)' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            fontFamily: 'var(--font-family)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        🏛️ NGO / Research
                                    </button>
                                </div>
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
