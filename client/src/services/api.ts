import axios from 'axios';

// Use Render backend in production, Vite proxy in development
let API_BASE = import.meta.env.VITE_API_URL
    || (window.location.hostname !== 'localhost' ? 'https://sokoprice-api.onrender.com/api' : '/api');
// Ensure the base URL ends with /api
if (API_BASE !== '/api' && !API_BASE.endsWith('/api')) {
    API_BASE = API_BASE.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sokoprice_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sokoprice_token');
            localStorage.removeItem('sokoprice_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
