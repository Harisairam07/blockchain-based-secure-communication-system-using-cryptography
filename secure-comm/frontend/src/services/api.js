import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload)
};

export const messageApi = {
  send: (payload, token) => api.post('/messages/send', payload, { headers: { Authorization: `Bearer ${token}` } }),
  inbox: (token) => api.get('/messages/inbox', { headers: { Authorization: `Bearer ${token}` } }),
  verify: (id, token) => api.post(`/messages/verify/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
};

export default api;
