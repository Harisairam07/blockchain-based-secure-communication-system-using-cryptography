import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldPlus } from 'lucide-react';
import { authService } from '../services/api';

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const labels = ['Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      navigate('/login');
    } catch {
      setError('Unable to create account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel w-full max-w-lg space-y-6 p-8"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-cyber-accent/15 p-3 text-cyber-accent">
            <ShieldPlus size={24} />
          </div>
          <h1 className="font-display text-2xl font-semibold">Create Secure Account</h1>
          <p className="mt-2 text-sm text-slate-400">Provision your encrypted workspace access</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.name} onChange={handleChange('name')} required />
          <input className="input" type="email" placeholder="Work email" value={form.email} onChange={handleChange('email')} required />
          <input
            className="input sm:col-span-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange('password')}
            required
          />
          <input
            className="input sm:col-span-2"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
          />
        </div>

        <div className="panel bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Password strength</span>
            <span className="text-cyber-accent">{labels[Math.max(0, strength - 1)] || 'Weak'}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 rounded-full ${level <= strength ? 'bg-cyber-accent' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link className="text-cyber-accent hover:text-green-400" to="/login">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
