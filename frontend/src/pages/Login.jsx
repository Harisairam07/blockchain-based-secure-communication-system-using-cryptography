import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockKeyhole, Shield } from 'lucide-react';
import { authApi } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authApi.login({ email, password, hiddenField: '' });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel z-10 w-full max-w-md space-y-5 p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex rounded-xl bg-emerald-500/15 p-3 text-cyber-accent"><Shield size={22} /></div>
          <h1 className="font-display text-2xl font-semibold">Secure Access Portal</h1>
          <p className="text-sm text-cyber-muted">Blockchain-based secure communication</p>
        </div>
        <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <LockKeyhole size={14} className="absolute left-3 top-3 text-cyber-muted" />
          <input className="input pl-9" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <input className="hidden" name="hiddenField" tabIndex={-1} autoComplete="off" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full">Authorize Session</button>
        <p className="text-sm text-cyber-muted">New account? <Link to="/register" className="text-cyber-accent">Register</Link></p>
      </motion.form>
    </div>
  );
}
