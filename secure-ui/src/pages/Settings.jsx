import { useState } from 'react';
import { BellRing, KeyRound, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const [preferences, setPreferences] = useState({
    mfa: true,
    anomalyAlerts: true,
    blockchainChecks: true
  });

  const toggle = (key) => {
    setPreferences((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="panel p-6">
        <h2 className="font-display text-lg font-semibold">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-400">Manage identity and access controls</p>

        <div className="mt-5 space-y-4">
          <input className="input" defaultValue="Security Analyst" placeholder="Display name" />
          <input className="input" defaultValue="analyst@securecomm.io" placeholder="Email" />
          <button className="btn-secondary">Update Account</button>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-lg font-semibold">Security Preferences</h2>
        <p className="mt-1 text-sm text-slate-400">Tune protection layers for your workspace</p>

        <div className="mt-5 space-y-3">
          {[
            {
              key: 'mfa',
              title: 'Multi-factor Authentication',
              description: 'Require one-time verification for all sign-ins.',
              icon: KeyRound
            },
            {
              key: 'anomalyAlerts',
              title: 'Anomaly Alerts',
              description: 'Notify on unusual session and traffic behavior.',
              icon: BellRing
            },
            {
              key: 'blockchainChecks',
              title: 'Blockchain Proof Checks',
              description: 'Validate message integrity against blockchain records.',
              icon: ShieldAlert
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 rounded-xl border border-cyber-border bg-slate-900/60 p-4"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <Icon size={15} className="text-cyber-accent" />
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    preferences[item.key] ? 'bg-cyber-accent' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      preferences[item.key] ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
