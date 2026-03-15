import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Fingerprint, ShieldAlert } from 'lucide-react';
import { adminApi, messageApi } from '../services/api';

export default function AdminPanel() {
  const [attacks, setAttacks] = useState([]);
  const [audit, setAudit] = useState([]);
  const [users, setUsers] = useState([]);
  const [securityState, setSecurityState] = useState({ emergencyShutdown: false });

  useEffect(() => {
    Promise.all([messageApi.attacks(), messageApi.audit(), adminApi.users(), adminApi.securityState()])
      .then(([a, b, u, s]) => {
        setAttacks(a.data.logs || []);
        setAudit(b.data.logs || []);
        setUsers(u.data.users || []);
        setSecurityState(s.data.state || { emergencyShutdown: false });
      })
      .catch(() => {
        setAttacks([]);
        setAudit([]);
        setUsers([]);
      });
  }, []);

  const toggleUserBlock = async (user) => {
    try {
      const { data } = await adminApi.setUserBlock(user._id, {
        blocked: !user.isBlocked,
        reason: user.isBlocked ? 'manual_admin_unblock' : 'manual_admin_block'
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
                ...u,
                isBlocked: data.user.isBlocked,
                blockedReason: data.user.blockedReason,
                blockedAt: data.user.blockedAt
              }
            : u
        )
      );
    } catch (error) {
      alert(error?.response?.data?.error || 'Failed to update user state');
    }
  };

  const toggleEmergency = async () => {
    try {
      const enabled = !securityState.emergencyShutdown;
      const { data } = await adminApi.emergencyShutdown({
        enabled,
        reason: enabled ? 'Manual SOC escalation' : 'Manual recovery'
      });
      setSecurityState(data.state || { emergencyShutdown: false });
    } catch (error) {
      alert(error?.response?.data?.error || 'Failed to toggle emergency shutdown');
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="panel p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Attack Detection Timeline</h2>
        <div className="space-y-3">
          {attacks.slice(0, 12).map((item, idx) => (
            <motion.div key={item._id || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} className="glass rounded-xl p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-red-300"><AlertTriangle size={14} /> {item.type}</div>
              <p className="text-xs text-cyber-muted">IP: {item.ip} | {new Date(item.createdAt).toLocaleString()}</p>
            </motion.div>
          ))}
          {!attacks.length && <p className="text-sm text-cyber-muted">No attack events or access denied.</p>}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Blockchain Transaction Monitor</h2>
        <div className="space-y-3">
          {audit.slice(0, 12).map((item, idx) => (
            <motion.div key={item._id || idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="glass rounded-xl p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-emerald-300"><Fingerprint size={14} /> {item.sender?.email} {'->'} {item.receiver?.email}</div>
              <p className="font-mono text-xs text-cyber-muted">tx: {item.blockchainTxHash || 'pending'} | hash: {item.hash?.slice(0, 16)}...</p>
              <p className="mt-1 text-xs text-cyber-accent">status: {item.verificationStatus}</p>
            </motion.div>
          ))}
          {!audit.length && <p className="text-sm text-cyber-muted">No audit records available.</p>}
        </div>
      </section>

      <section className="panel xl:col-span-2 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300"><ShieldAlert size={12} /> Brute-force and suspicious-IP tracking enabled</div>
          <button
            onClick={toggleEmergency}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              securityState.emergencyShutdown ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {securityState.emergencyShutdown ? 'Disable Emergency Shutdown' : 'Activate Emergency Shutdown'}
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-cyber-border bg-slate-900/50 p-3 text-xs">
          <p className="text-cyber-muted">
            Emergency state: <span className={securityState.emergencyShutdown ? 'text-red-300' : 'text-emerald-300'}>{securityState.emergencyShutdown ? 'ACTIVE' : 'NORMAL'}</span>
          </p>
          {securityState.reason && <p className="mt-1 text-cyber-muted">Reason: {securityState.reason}</p>}
        </div>

        <h3 className="mb-3 font-display text-sm font-semibold">User Access Control</h3>
        <div className="space-y-2">
          {users.slice(0, 20).map((user) => (
            <div key={user._id} className="glass flex items-center justify-between rounded-xl p-3 text-sm">
              <div>
                <p className="font-medium">{user.name} ({user.role})</p>
                <p className="text-xs text-cyber-muted">{user.email}</p>
              </div>
              <button
                onClick={() => toggleUserBlock(user)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  user.isBlocked ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {user.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          ))}
          {!users.length && <p className="text-sm text-cyber-muted">No users available.</p>}
        </div>
      </section>
    </div>
  );
}
