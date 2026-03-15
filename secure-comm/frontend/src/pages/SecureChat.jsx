import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { messageApi } from '../services/api';

export default function SecureChat() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [receiverId, setReceiverId] = useState('');
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);

  const socket = useMemo(() => io(window.location.origin, { path: '/socket.io' }), []);

  useEffect(() => {
    socket.emit('join', user.id);
    socket.on('incoming_message', () => messageApi.inbox(token).then((r) => setMessages(r.data.messages)));
    if (token) messageApi.inbox(token).then((r) => setMessages(r.data.messages));
    return () => socket.disconnect();
  }, [socket, token, user.id]);

  const send = async () => {
    await messageApi.send({ receiverId, message: text, password }, token);
    setText('');
    const box = await messageApi.inbox(token);
    setMessages(box.data.messages);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel p-4 space-y-3">
        <h2 className="text-lg font-semibold">Secure Chat</h2>
        <input className="input" placeholder="Receiver ID" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} />
        <textarea className="input" placeholder="Message" value={text} onChange={(e) => setText(e.target.value)} />
        <input className="input" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" onClick={send}>Send Secure Message</button>
      </div>
      <div className="panel p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {messages.map((m) => (
          <div key={m._id} className="rounded-xl bg-slate-900/70 p-3 text-sm">
            <p className="font-mono text-xs text-emerald-300">hash: {m.hash?.slice(0, 16)}...</p>
            <p className="text-xs text-slate-400">blockchain: {m.blockchainTxHash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
