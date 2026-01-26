import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: interceptor log lỗi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
