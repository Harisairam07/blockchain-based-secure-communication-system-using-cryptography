import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { KeyRound, Lock, Send, UserRound } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import BlockchainVerification from '../components/BlockchainVerification';
import CryptoPipelineVisualizer from '../components/visualization/CryptoPipelineVisualizer';
import RoboDog from '../components/RoboDog';
import NeuralCore from '../components/NeuralCore';
import { messageApi } from '../services/api';
import { isDemoMode, socketUrl } from '../services/runtimeConfig';

const EncryptionPipeline3D = lazy(() => import('../components/visualization/EncryptionPipeline3D'));

export default function SecureChat() {
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [messages, setMessages] = useState([]);
  const [lastTx, setLastTx] = useState(null);
  const [runPipeline, setRunPipeline] = useState(false);
  const [pipelineRunId, setPipelineRunId] = useState(0);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const quickRecipients = [
    { label: 'SOC Analyst', id: 'admin@gmail.com' },
    { label: 'Incident Desk', id: 'security@ops.local' },
    { label: 'Crypto Admin', id: 'admin' }
  ];

  const socket = useMemo(
    () =>
      socketUrl
        ? io(socketUrl, {
        transports: ['websocket', 'polling']
      })
        : null,
    []
  );

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit('join', currentUser.id);
    socket.on('receive_message', (payload) => {
      setTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, payload]);
        setTyping(false);
      }, 550);
    });

    return () => socket.disconnect();
  }, [socket, currentUser.id]);

  useEffect(() => {
    if (isDemoMode) {
      setMessages([
        {
          _id: 'demo-message',
          sender: { _id: 'demo-admin', name: 'System' },
          receiver: currentUser.id,
          preview: 'Demo mode is active. Deploy the backend and set VITE_API_BASE to enable live messaging.',
          createdAt: new Date().toISOString(),
          encrypted: true
        }
      ]);
      return;
    }

    messageApi
      .inbox()
      .then((res) => setMessages(res?.data?.messages || []))
      .catch((error) => {
        console.warn('Inbox fetch failed:', error?.message || error);
        setMessages([]);
      });
  }, []);

  const send = async () => {
    if (!receiverId || !message || !passphrase) return;
    setRunPipeline(true);
    setPipelineRunId((n) => n + 1);
    setSending(true);
    const text = message;

    try {
      if (isDemoMode) {
        setMessages((prev) => [
          ...prev,
          {
            _id: `demo-${Date.now()}`,
            sender: { _id: currentUser.id, name: currentUser.name || 'Demo Admin' },
            receiver: receiverId,
            preview: text,
            createdAt: new Date().toISOString(),
            encrypted: true
          }
        ]);
        setLastTx({
          blockchainTxHash: 'demo-blockchain-proof',
          verificationStatus: 'simulated'
        });
        setMessage('');
        return;
      }

      const { data } = await messageApi.send({ receiverId, message: text, signingPassphrase: passphrase });
      setLastTx(data.data);
      setMessage('');
      messageApi
        .inbox()
        .then((res) => setMessages(res?.data?.messages || []))
        .catch(() => setMessages((prev) => prev));
    } catch (error) {
      console.warn('Secure send failed:', error?.message || error);
    } finally {
      setSending(false);
      setTimeout(() => setRunPipeline(false), 6200);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <div className="space-y-3 xl:col-span-3">
        <div className="panel flex items-center justify-between p-4">
          <div>
            <p className="font-display text-sm font-semibold">Secure Chat Channel</p>
            <p className="text-xs text-cyber-muted">AES + SHA-256 + Signature + Blockchain pipeline</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"><Lock size={12} /> encrypted transport</div>
        </div>

        <div className="panel p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-cyber-muted">Quick Recipients</p>
          <div className="flex flex-wrap gap-2">
            {quickRecipients.map((contact) => (
              <button
                key={contact.id}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${receiverId === contact.id ? 'border-cyber-accent bg-cyber-accent/15 text-cyber-accent' : 'border-cyber-border bg-slate-900/40 text-slate-300 hover:border-cyber-accent/60'}`}
                onClick={() => setReceiverId(contact.id)}
              >
                {contact.label}
              </button>
            ))}
          </div>
        </div>

        <ChatWindow messages={messages} currentUserId={currentUser.id} typing={typing} />

        <div className="panel space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs text-cyber-muted">Receiver Identity</span>
              <div className="relative">
                <UserRound size={14} className="pointer-events-none absolute left-3 top-3 text-cyber-muted" />
                <input className="input pl-9" placeholder="Receiver user ID or email" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-cyber-muted">Signature Passphrase</span>
              <div className="relative">
                <KeyRound size={14} className="pointer-events-none absolute left-3 top-3 text-cyber-muted" />
                <input className="input pl-9" type="password" placeholder="Signing passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
              </div>
            </label>
          </div>
          <label className="space-y-1.5">
            <span className="text-xs text-cyber-muted">Secure Payload</span>
            <textarea className="input min-h-28" placeholder="Type secure message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-cyber-muted">Message will be encrypted, hashed, signed, and anchored to blockchain.</p>
            <button className="btn-primary inline-flex items-center gap-2" onClick={send} disabled={sending}>
              <Send size={14} /> {sending ? 'PROCESSING...' : 'SEND SECURELY'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
        <Suspense fallback={<div className="panel h-48 p-4 text-sm text-cyber-muted">Loading 3D cyber pipeline...</div>}>
          <EncryptionPipeline3D autoStart={pipelineRunId} />
        </Suspense>
        <CryptoPipelineVisualizer trigger={runPipeline} sourceText={message || 'HELLO'} decryptedText={message || 'HELLO'} />
        <BlockchainVerification txHash={lastTx?.blockchainTxHash} status={lastTx?.verificationStatus} />
        <div className="panel p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-cyber-muted">Chat Security Assistant</p>
          <RoboDog compact state="idle" />
        </div>
        <div className="panel p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-cyber-muted">AI Copilot Core</p>
          <NeuralCore compact state="idle" />
        </div>
      </div>
    </div>
  );
}
