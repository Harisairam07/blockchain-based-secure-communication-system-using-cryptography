import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { blockchainApi } from '../services/api';

export default function BlockchainMonitor() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    blockchainApi
      .monitor()
      .then((res) => setRows(res?.data?.records || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <section className="panel p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">Blockchain Monitor</h2>
      <div className="overflow-x-auto rounded-xl border border-cyber-border/60">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70 text-left text-xs text-cyber-muted">
            <tr>
              <th className="px-3 py-2">Sender</th>
              <th className="px-3 py-2">Receiver</th>
              <th className="px-3 py-2">Message Hash</th>
              <th className="px-3 py-2">Block</th>
              <th className="px-3 py-2">Verification</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <motion.tr key={`${row.txHash}-${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-t border-cyber-border/40">
                <td className="px-3 py-2">{row.sender}</td>
                <td className="px-3 py-2">{row.receiver}</td>
                <td className="px-3 py-2 font-mono text-xs text-cyber-muted">{row.messageHash?.slice(0, 24)}...</td>
                <td className="px-3 py-2">{row.blockNumber ?? '-'}</td>
                <td className="px-3 py-2">
                  {row.verificationStatus === 'Verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300"><ShieldCheck size={12} /> Verified</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-300"><ShieldAlert size={12} /> Message Integrity Compromised</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="mt-3 text-sm text-cyber-muted">No blockchain records available.</p>}
    </section>
  );
}
