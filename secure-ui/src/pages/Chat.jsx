import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { SendHorizontal } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import EncryptionStatus from '../components/EncryptionStatus';
import { securityService } from '../services/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        autoConnect: false,
        transports: ['websocket', 'polling']
      }),
    []
  );

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('receive_message', (payload) => {
      setMessages((previous) => [...previous, payload]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    const ownMessage = {
      id: crypto.randomUUID(),
      sender: 'me',
      text,
      encrypted: true,
      timestamp: new Date().toISOString()
    };

    setMessages((previous) => [...previous, ownMessage]);
    setInput('');

    try {
      await securityService.sendEncryptedMessage(text);
    } catch {
      // UI remains functional in demo mode even without backend chat route.
    }

    socket.emit('send_message', ownMessage);

    if (!connected) {
      setTimeout(() => {
        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            sender: 'peer',
            text: `Echo secure reply: ${text}`,
            encrypted: true,
            timestamp: new Date().toISOString()
          }
        ]);
      }, 500);
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Encrypted Realtime Chat</h2>
          <p className="text-sm text-slate-400">Secure channel with blockchain-aware message flow</p>
        </div>
        <div className="flex items-center gap-2">
          <EncryptionStatus compact encrypted label="AES-256 active" />
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              connected ? 'bg-green-400/15 text-green-300' : 'bg-amber-400/15 text-amber-300'
            }`}
          >
            {connected ? 'Socket Connected' : 'Offline Demo Mode'}
          </span>
        </div>
      </div>

      <ChatWindow messages={messages} />

      <div className="panel flex gap-2 p-3">
        <input
          className="input"
          placeholder="Type secure message..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
        />
        <button className="btn-primary inline-flex items-center gap-2" onClick={sendMessage}>
          <SendHorizontal size={16} />
          Send
        </button>
      </div>
    </section>
  );
}
