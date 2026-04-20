import { lazy, Suspense, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import JohnAssistant from './components/JohnAssistant';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SecureChat = lazy(() => import('./pages/SecureChat'));
const FileTransfer = lazy(() => import('./pages/FileTransfer'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SecurityLogs = lazy(() => import('./pages/SecurityLogs'));
const AttackSimulation = lazy(() => import('./pages/AttackSimulation'));
const BlockchainMonitor = lazy(() => import('./pages/BlockchainMonitor'));

function Protected({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cyber-bg john-shell-host">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="lg:pl-72">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/secure-chat" element={<SecureChat />} />
                <Route path="/file-transfer" element={<FileTransfer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/security-logs" element={<SecurityLogs />} />
                <Route path="/attack-simulation" element={<AttackSimulation />} />
                <Route path="/blockchain-monitor" element={<BlockchainMonitor />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <JohnAssistant />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-cyber-muted">Loading secure interface...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<Protected><Shell /></Protected>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
