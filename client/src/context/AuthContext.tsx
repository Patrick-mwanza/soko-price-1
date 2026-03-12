import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: 'Farmer' | 'Admin' | 'Buyer' | 'Trader' | 'Seller' | 'NGO';
    language: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
    isBuyer: boolean;
    isFarmer: boolean;
    isTrader: boolean;
    isNGO: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('sokoprice_token');
        const savedUser = localStorage.getItem('sokoprice_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('sokoprice_token', newToken);
        localStorage.setItem('sokoprice_user', JSON.stringify(newUser));
    };

    const register = async (data: RegisterData) => {
        const res = await api.post('/auth/register', data);
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('sokoprice_token', newToken);
        localStorage.setItem('sokoprice_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('sokoprice_token');
        localStorage.removeItem('sokoprice_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAdmin: user?.role === 'Admin',
                isBuyer: user?.role === 'Buyer',
                isFarmer: user?.role === 'Farmer',
                isTrader: user?.role === 'Trader',
                isNGO: user?.role === 'NGO',
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
