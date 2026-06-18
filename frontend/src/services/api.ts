import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach Firebase ID token or fallback to mock token
api.interceptors.request.use(
  async (config) => {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Dùng mock token từ localStorage cho môi trường dev khi Firebase không hoạt động
      const mockToken = localStorage.getItem('spts_mock_token');
      if (mockToken) {
        config.headers.Authorization = `Bearer ${mockToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl: string = error.config?.url || '';

    if (error.response?.status === 401) {
      // /auth/me được gọi ngay sau khi đăng nhập để lấy profile người dùng.
      // Nếu backend trả về 401 ở đây (ví dụ: mock token, Firebase chưa cấu hình),
      // AuthContext sẽ tự xử lý fallback — không nên redirect về /login.
      const isProfileFetch = requestUrl.includes('/auth/me');

      if (!isProfileFetch) {
        // Token hết hạn hoặc không hợp lệ ở các API khác → đăng xuất người dùng
        try {
          await auth?.signOut();
        } catch {
          // Bỏ qua lỗi sign out
        }
        window.location.href = '/login';
      }
    }

    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
