import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('scs_token', data.token || 'demo-secure-token');
      localStorage.setItem('scs_user', JSON.stringify(data.user || { email }));
      navigate('/dashboard');
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <motion.div
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyber-accent/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
        animate={{ x: [0, -70, 0], y: [0, -35, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel z-10 w-full max-w-md space-y-6 p-8"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-cyber-accent/15 p-3 text-cyber-accent">
            <Shield size={24} />
          </div>
          <h1 className="font-display text-2xl font-semibold">Secure Communication System</h1>
          <p className="mt-2 text-sm text-slate-400">Authenticated access to encrypted channels</p>
        </div>

        <div className="space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3 text-slate-500" size={16} />
            <input
              className="input pl-10"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In Securely'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400">
          New user?{' '}
          <Link className="text-cyber-accent hover:text-green-400" to="/register">
            Create account
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
