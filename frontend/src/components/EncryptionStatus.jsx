import { ShieldCheck } from 'lucide-react';

export default function EncryptionStatus({ verified, label = 'Encryption status' }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${verified ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
      <ShieldCheck size={12} />
      {label}: {verified ? 'verified' : 'pending'}
    </span>
  );
}
