const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && localHosts.has(window.location.hostname);
const localApiBase = import.meta.env.DEV && isLocalHost ? 'http://localhost:5000/api' : '';
const localSocketUrl = import.meta.env.DEV && isLocalHost ? 'http://localhost:5000' : '';

export const apiBase = import.meta.env.VITE_API_BASE || localApiBase;
export const socketUrl = import.meta.env.VITE_SOCKET_URL || localSocketUrl;

export const demoCredentials = {
  email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@gmail.com',
  password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin'
};

export const isDemoMode = !apiBase;

export function createDemoUser() {
  return {
    id: 'demo-admin',
    name: 'Administrator',
    email: demoCredentials.email,
    role: 'admin',
    publicKey: 'demo'
  };
}
