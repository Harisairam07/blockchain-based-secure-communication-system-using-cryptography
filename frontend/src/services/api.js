import axios from 'axios';
import { apiBase } from './runtimeConfig';

const api = axios.create({
  baseURL: apiBase || '/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export default api;
