import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://studentask.web.id/api',
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Interceptor untuk token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // AUTO HANDLE FORM DATA
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

export default api;