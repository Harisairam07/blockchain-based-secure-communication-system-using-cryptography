import { useRef, useState } from 'react';
import { FileUp, ShieldCheck } from 'lucide-react';
import EncryptionStatus from '../components/EncryptionStatus';

export default function Files() {
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const item = {
      id: crypto.randomUUID(),
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      time: new Date().toLocaleString(),
      status: 'Encrypted + Stored'
    };

    setHistory((previous) => [item, ...previous]);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Secure File Transfer</h2>
            <p className="text-sm text-slate-400">Upload files through encrypted pipeline</p>
          </div>
          <EncryptionStatus encrypted label="File payload encryption enabled" />
        </div>

        <button
          className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-cyber-border bg-slate-900/50 px-6 py-12 text-slate-300 transition hover:border-cyber-accent/60"
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="text-cyber-accent" />
          <span>Click to upload a secure file</span>
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="text-cyber-accent" size={17} />
          <h3 className="text-sm font-semibold">Transfer History</h3>
        </div>

        <div className="space-y-2">
          {history.length === 0 && <p className="text-sm text-slate-400">No secure file transfer yet.</p>}
          {history.map((file) => (
            <div
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyber-border bg-slate-900/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-slate-400">{file.size} • {file.time}</p>
              </div>
              <span className="rounded-full bg-cyber-accent/15 px-3 py-1 text-xs text-cyber-accent">
                {file.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
