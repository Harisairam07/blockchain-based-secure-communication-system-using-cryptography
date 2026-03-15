import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { messageApi } from '../services/api';
import ThreatRadarAnimation from '../components/animations/ThreatRadarAnimation';

export default function SecurityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    messageApi.audit().then((res) => setLogs(res.data.logs || [])).catch(() => setLogs([]));
  }, []);

  return (
    <section className="panel p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">Immutable Audit Trail</h2>
      <div className="mb-4">
        <ThreatRadarAnimation />
      </div>
      <div className="space-y-2">
        {logs.map((log, idx) => (
          <motion.div key={log._id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="glass flex flex-wrap items-center justify-between rounded-xl p-3 text-xs">
            <span>{new Date(log.createdAt).toLocaleString()}</span>
            <span>{log.sender?.email} {'->'} {log.receiver?.email}</span>
            <span className="font-mono text-cyber-muted">{log.hash?.slice(0, 16)}...</span>
            <span className="text-cyber-accent">{log.verificationStatus}</span>
          </motion.div>
        ))}
        {!logs.length && <p className="text-sm text-cyber-muted">No logs found.</p>}
      </div>
    </section>
  );
}
