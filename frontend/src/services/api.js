import axios from 'axios';
import { apiBase } from './runtimeConfig';

const api = axios.create({
  baseURL: apiBase || '/api',
  timeout: 15000
});

function normalizeToken(raw) {
  if (!raw) return null;
  let token = String(raw).trim();

  if (!token) return null;
  if (token.startsWith('Bearer ')) token = token.slice(7).trim();
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }

  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}

function clearAuthAndRedirect(reason = 'Session expired. Please login again.') {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  if (typeof window === 'undefined') return;
  sessionStorage.setItem('auth_notice', reason);

  const path = window.location.pathname || '';
  if (!path.includes('/login') && !path.includes('/register')) {
    window.location.assign('/login');
  }
}

api.interceptors.request.use((config) => {
  const token = normalizeToken(localStorage.getItem('token'));
  if (!token) return config;

  if (token === 'demo-session' && apiBase) {
    clearAuthAndRedirect('Demo session detected. Please login to your live backend.');
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.error || '').toLowerCase();

    const tokenError =
      status === 401 &&
      (message.includes('token verification failed') ||
        message.includes('invalid token') ||
        message.includes('jwt') ||
        message.includes('unauthorized'));

    if (tokenError) {
      clearAuthAndRedirect('Token verification failed. Please login again.');
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

export const fileApi = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download: (fileId) => api.get(`/files/download/${fileId}`),
  decryptDownload: (fileId, payload) => api.post(`/files/download/${fileId}/decrypt`, payload)
};

export const messageApi = {
  send: (payload) => api.post('/messages/send', payload),
  inbox: () => api.get('/messages/inbox'),
  get: () => api.get('/message/get'),
  retrieveByKey: (payload) => api.post('/messages/retrieve-by-key', payload),
  decrypt: (id, payload) => api.post(`/messages/${id}/decrypt`, payload),
  verify: (id) => api.get(`/messages/${id}/verify`),
  blockchain: (id) => api.get(`/messages/${id}/blockchain`),
  blockchainVerify: (id) => api.get(`/blockchain/verify/${id}`),
  stats: () => api.get('/messages/stats'),
  audit: () => api.get('/messages/admin/audit'),
  attacks: () => api.get('/messages/admin/attacks')
};

export const blockchainApi = {
  monitor: () => api.get('/blockchain/monitor')
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  setUserBlock: (id, payload) => api.patch(`/admin/users/${id}/block`, payload),
  securityState: () => api.get('/admin/security-state'),
  emergencyShutdown: (payload) => api.post('/admin/emergency-shutdown', payload)
};

export const aiApi = {
  chat: (payload) => api.post('/ai/chat', payload)
};

export const johnApi = {
  config: () => api.get('/john/config'),
  status: () => api.get('/john/status'),
  voiceAuth: (payload) => api.post('/john/voice-auth', payload),
  command: (payload) => api.post('/john/command', payload),
  log: (payload) => api.post('/john/log', payload)
};

export default api;
