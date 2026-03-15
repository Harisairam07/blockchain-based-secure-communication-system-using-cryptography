import { NavLink, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SecureChat from './pages/SecureChat';
import FileTransfer from './pages/FileTransfer';
import EncryptionVisualization from './pages/EncryptionVisualization';
import AdminMonitoring from './pages/AdminMonitoring';
import SecurityLogs from './pages/SecurityLogs';

const items = [
  ['/', 'Dashboard'],
  ['/chat', 'Secure Chat'],
  ['/files', 'File Transfer'],
  ['/visual', 'Encryption Visualization'],
  ['/admin', 'Admin Monitoring'],
  ['/logs', 'Security Logs']
];

export default function App() {
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-cyber-border p-4">
        <h1 className="mb-4 text-lg font-semibold">Secure Comm</h1>
        <nav className="space-y-1">
          {items.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-cyber-accent/15 text-cyber-accent' : 'text-slate-300'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-cyber-border px-3 py-2 text-sm text-slate-200 hover:border-cyber-accent hover:text-cyber-accent" onClick={logout}>
          <LogOut size={14} />
          Logout
        </button>
      </aside>
      <main className="p-4 sm:p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<SecureChat />} />
            <Route path="/files" element={<FileTransfer />} />
            <Route path="/visual" element={<EncryptionVisualization />} />
            <Route path="/admin" element={<AdminMonitoring />} />
            <Route path="/logs" element={<SecurityLogs />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
}
