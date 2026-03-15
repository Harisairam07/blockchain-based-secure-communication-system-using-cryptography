import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(payload) {
    try {
      const response = await api.post('/auth/login', payload);
      return response.data;
    } catch (error) {
      return {
        token: 'demo-secure-token',
        user: { name: 'Security Analyst', email: payload.email },
        demo: true,
        message: error?.response?.data?.error || 'Demo login enabled: backend auth route unavailable.'
      };
    }
  },

  async register(payload) {
    try {
      const response = await api.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        demo: true,
        message: error?.response?.data?.error || 'Demo registration completed.'
      };
    }
  }
};

export const securityService = {
  sendEncryptedMessage(message) {
    return api.post('/send', { message });
  },

  verifyHash(hash, signature) {
    return api.post('/verify', { hash, signature });
  },

  decryptMessage(encrypted, iv) {
    return api.post('/decrypt', { encrypted, iv });
  }
};

export default api;
