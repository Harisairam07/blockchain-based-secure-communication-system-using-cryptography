import { motion } from 'framer-motion';
import { Activity, Blocks, Lock, ShieldCheck, TrendingUp } from 'lucide-react';
import EncryptionStatus from '../components/EncryptionStatus';

const overviewStats = [
  { label: 'Encrypted Sessions', value: '128', change: '+12%', icon: Lock },
  { label: 'Blockchain Verifications', value: '1,094', change: '+4%', icon: Blocks },
  { label: 'Threat Events Blocked', value: '37', change: '+18%', icon: ShieldCheck }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {overviewStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="panel p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-cyber-accent/15 p-2 text-cyber-accent">
                  <Icon size={18} />
                </div>
                <span className="text-xs text-green-300">{item.change}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.label}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="panel xl:col-span-2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Security Activity Overview</h2>
            <div className="inline-flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp size={14} className="text-cyber-accent" />
              Last 24h
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Session integrity checks', value: 92 },
              { name: 'Hash verification success', value: 98 },
              { name: 'Transport encryption health', value: 95 }
            ].map((metric) => (
              <div key={metric.name}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                  <span>{metric.name}</span>
                  <span>{metric.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-2 rounded-full bg-cyber-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity size={16} className="text-cyber-accent" />
              <h3 className="text-sm font-semibold">Encryption Status</h3>
            </div>
            <EncryptionStatus encrypted label="AES-256 / SHA-256 Active" />
            <p className="mt-3 text-xs text-slate-400">All active channels are currently secured.</p>
          </div>

          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <Blocks size={16} className="text-cyber-accent" />
              <h3 className="text-sm font-semibold">Blockchain Verification</h3>
            </div>
            <div className="rounded-xl border border-cyber-border bg-slate-900/70 p-3 text-xs text-slate-300">
              Last verified block: <span className="font-mono text-cyber-accent"># 1,936,224</span>
            </div>
            <p className="mt-3 text-xs text-slate-400">Proof-of-integrity checks are synchronized.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
