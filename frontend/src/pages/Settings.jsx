import { useState } from 'react';
import { Key, Shield, User } from 'lucide-react';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Password change logic would go here
    alert('Password change functionality would be implemented here');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <User size={20} />
          Account Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-muted">Display Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-muted">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Key size={20} />
          Security Settings
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-muted">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-muted">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-muted">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-cyber-accent px-4 py-2 text-sm font-medium text-black hover:bg-cyber-accent/90 focus:outline-none focus:ring-2 focus:ring-cyber-accent focus:ring-offset-2 focus:ring-offset-cyber-bg"
          >
            Update Password
          </button>
        </form>
      </section>

      <section className="panel lg:col-span-2 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Shield size={20} />
          Cryptography Status
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-cyber-border bg-slate-900/40 p-4">
            <div className="text-sm font-medium text-emerald-300">RSA Key Pair</div>
            <div className="mt-1 text-xs text-cyber-muted">2048-bit keys generated</div>
          </div>

          <div className="rounded-lg border border-cyber-border bg-slate-900/40 p-4">
            <div className="text-sm font-medium text-emerald-300">AES Encryption</div>
            <div className="mt-1 text-xs text-cyber-muted">256-bit CBC mode</div>
          </div>

          <div className="rounded-lg border border-cyber-border bg-slate-900/40 p-4">
            <div className="text-sm font-medium text-emerald-300">SHA-256 Hashing</div>
            <div className="mt-1 text-xs text-cyber-muted">Integrity verification</div>
          </div>
        </div>
      </section>
    </div>
  );
}