import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { authApi } from '../services/api';
import { passwordStrength, strengthLabel } from '../services/cryptoService';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const score = useMemo(() => passwordStrength(form.password), [form.password]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authApi.register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel w-full max-w-lg space-y-4 p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex rounded-xl bg-emerald-500/15 p-3 text-cyber-accent"><UserPlus size={22} /></div>
          <h1 className="font-display text-2xl font-semibold">Create Secure Identity</h1>
        </div>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="glass rounded-xl p-3 text-xs text-cyber-muted">Password strength: <span className="text-cyber-accent">{strengthLabel(score)}</span></div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full">Provision Account</button>
        <p className="text-sm text-cyber-muted">Already have an account? <Link to="/login" className="text-cyber-accent">Login</Link></p>
      </motion.form>
    </div>
  );
}
