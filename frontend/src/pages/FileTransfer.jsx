import { useMemo, useState } from 'react';
import { Download, FileUp, ShieldCheck, UploadCloud } from 'lucide-react';
import CryptoPipelineVisualizer from '../components/visualization/CryptoPipelineVisualizer';
import { fileApi } from '../services/api';

const STAGES = ['File', 'Encrypt', 'Hash', 'Sign', 'Blockchain', 'Transfer'];

export default function FileTransfer() {
  const [file, setFile] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState('');
  const [uploadedKeyId, setUploadedKeyId] = useState('');
  const [trigger, setTrigger] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const stageProgress = useMemo(() => (uploading ? Math.min(stageIndex + 1, STAGES.length) : stageIndex > 0 ? STAGES.length : 0), [uploading, stageIndex]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStageIndex(1);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setStageIndex(1);
    }
  };

  const handleUpload = async () => {
    if (!file || !receiverId || !passphrase) {
      alert('Please select a file, enter receiver ID, and passphrase');
      return;
    }

    setUploading(true);
    try {
      for (let i = 1; i < STAGES.length; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 220));
        setStageIndex(i);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', receiverId);
      formData.append('passphrase', passphrase);

      const response = await fileApi.upload(formData);
      setUploadedFileId(response.data.fileId);
      setUploadedKeyId(response.data.encryptionKeyID || 'n/a');
      setTrigger(true);
      setTimeout(() => setTrigger(false), 6200);
      setStageIndex(STAGES.length);
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.error || error.message);
      setStageIndex(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await fileApi.download(fileId);
      // In a real app, you'd decrypt and download the file
      alert('File download would be implemented here with decryption');
    } catch (error) {
      alert('Download failed: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="panel lg:col-span-2 p-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Encrypted File Transfer</h2>
        <p className="mb-4 text-sm text-cyber-muted">File {'->'} AES Encrypt {'->'} SHA-256 Hash {'->'} RSA Sign {'->'} Blockchain {'->'} Secure transfer</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-2">Receiver ID</label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              placeholder="Enter receiver user ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-2">Signing Passphrase</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm focus:border-cyber-accent focus:outline-none"
              placeholder="Enter your signing passphrase"
            />
          </div>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition ${
              dragActive ? 'border-cyber-accent bg-emerald-500/10' : 'border-cyber-border bg-slate-900/40 hover:border-cyber-accent/60'
            }`}
          >
            <UploadCloud className="mb-3 text-cyber-accent" />
            <span className="text-sm">Drag and drop secure file</span>
            <span className="mt-1 text-xs text-cyber-muted">or click to choose | Max 10MB | AES encrypted</span>
            <input type="file" className="hidden" onChange={handleFileSelect} />
          </label>

          <div className="rounded-xl border border-cyber-border bg-slate-950/45 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-cyber-muted">Transfer Pipeline</p>
            <div className="grid gap-2 sm:grid-cols-6">
              {STAGES.map((stage, index) => (
                <div key={stage} className={`rounded-lg border px-2 py-1.5 text-center text-xs ${index < stageProgress ? 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300' : 'border-cyber-border bg-slate-900/45 text-cyber-muted'}`}>
                  {stage}
                </div>
              ))}
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="inline-flex items-center gap-2 text-sm text-emerald-300"><FileUp size={14} /> {file.name}</span>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-cyber-accent text-black rounded-lg hover:bg-cyber-accent/90 disabled:opacity-50"
              >
                <UploadCloud size={16} />
                {uploading ? 'Uploading...' : 'Upload Securely'}
              </button>
            </div>
          )}

          {uploadedFileId && (
            <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
              <p className="mb-2 inline-flex items-center gap-2 text-sm text-emerald-300"><ShieldCheck size={14} /> File uploaded and verified!</p>
              <p className="mb-2 text-xs text-cyber-muted">Key ID: <span className="font-mono text-emerald-300">{uploadedKeyId}</span></p>
              <button
                onClick={() => handleDownload(uploadedFileId)}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                <Download size={14} />
                Download Test
              </button>
            </div>
          )}
        </div>
      </section>

      <CryptoPipelineVisualizer
        trigger={trigger}
        sourceText={file?.name || 'secure-file.bin'}
        decryptedText={file?.name || 'secure-file.bin'}
      />
    </div>
  );
}
