import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Camera, Loader2, MapPin, Mic, Send, Square, Volume2 } from 'lucide-react';
import { aiApi } from '../../services/api';
import { isDemoMode } from '../../services/runtimeConfig';

const briefings = [
  'Good to see you. Neural Core is online and monitoring the secure channel.',
  'Encryption, identity, and ledger signals are stable. I will alert you if anything drifts.',
  'Standing by. Ask for status, threats, blockchain, login, or messages.'
];

const safeSensorsNotice = 'Camera preview, microphone audio, and precise location stay on this device.';

function fallbackAnswer(input) {
  const text = input.toLowerCase();

  if (text.includes('status') || text.includes('system')) {
    return 'All primary systems are operational. GitHub Pages is running in demo-safe mode until a hosted backend URL is configured.';
  }

  if (text.includes('login') || text.includes('credential') || text.includes('password')) {
    return 'Demo access is ready. Use admin@gmail.com with password admin on laptop or phone.';
  }

  if (text.includes('camera') || text.includes('mic') || text.includes('location')) {
    return 'Sensor access is available on demand. Use the camera, mic, or location controls, and your raw media stays local.';
  }

  if (text.includes('message') || text.includes('chat')) {
    return 'Secure chat simulation is ready. Live cross-device messaging activates after the backend is deployed and connected.';
  }

  if (text.includes('block') || text.includes('ledger') || text.includes('chain')) {
    return 'Blockchain verification is simulated on GitHub Pages. Real ledger writes require the hosted API and contract configuration.';
  }

  if (text.includes('threat') || text.includes('attack') || text.includes('security')) {
    return 'Threat posture is calm. I am watching authentication, rate limits, and unusual message patterns.';
  }

  if (text.includes('help') || text.includes('what can')) {
    return 'I can brief status, login, messaging, blockchain verification, sensors, and security posture.';
  }

  return 'Acknowledged. I can give a deeper answer once the AI backend is configured; for now I will keep the secure dashboard steady.';
}

function makeMessage(role, text) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text
  };
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function NeuralCoreAnimation({ compact = false }) {
  const sizeClass = compact ? 'h-40 w-40' : 'h-56 w-56';
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [conversation, setConversation] = useState([
    makeMessage('core', compact ? briefings[2] : briefings[0])
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(isDemoMode ? 'Demo fallback ready' : 'AI uplink ready');
  const [cameraState, setCameraState] = useState('idle');
  const [micState, setMicState] = useState(getSpeechRecognition() ? 'ready' : 'unsupported');
  const [locationState, setLocationState] = useState('idle');

  const latestCoreLine = useMemo(
    () => [...conversation].reverse().find((item) => item.role === 'core')?.text || briefings[0],
    [conversation]
  );

  const clientContext = useMemo(
    () => ({
      cameraActive: cameraState === 'active',
      micReady: micState === 'ready' || micState === 'listening',
      locationPermission: locationState,
      demoMode: isDemoMode,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    }),
    [cameraState, locationState, micState]
  );

  useEffect(() => {
    if (videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraState]);

  useEffect(() => {
    return () => {
      window.clearInterval(typingTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const typeCoreLine = (text) => {
    window.clearInterval(typingTimerRef.current);
    const message = makeMessage('core', '');
    setConversation((items) => [...items.slice(-5), message]);

    let index = 0;
    typingTimerRef.current = window.setInterval(() => {
      index += 4;
      const nextText = text.slice(0, index);
      setConversation((items) =>
        items.map((item) => (item.id === message.id ? { ...item, text: nextText } : item))
      );

      if (index >= text.length) {
        window.clearInterval(typingTimerRef.current);
      }
    }, 18);
  };

  const askNeuralCore = async (cleanPrompt) => {
    const history = conversation.slice(-8).map((item) => ({
      role: item.role === 'user' ? 'user' : 'assistant',
      text: item.text
    }));

    if (isDemoMode) {
      return fallbackAnswer(cleanPrompt);
    }

    try {
      const { data } = await aiApi.chat({
        message: cleanPrompt,
        history,
        clientContext
      });
      return data?.answer || fallbackAnswer(cleanPrompt);
    } catch (error) {
      setStatus(error?.response?.data?.error || 'AI uplink unavailable; local fallback engaged');
      return fallbackAnswer(cleanPrompt);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;

    setPrompt('');
    setLoading(true);
    setStatus(isDemoMode ? 'Composing local response' : 'Contacting Neural Core');
    setConversation((items) => [...items.slice(-5), makeMessage('user', cleanPrompt)]);

    const answer = await askNeuralCore(cleanPrompt);
    typeCoreLine(answer);
    setLoading(false);
    setStatus(isDemoMode ? 'Demo fallback ready' : 'AI uplink ready');
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      setStatus('Voice brief is not supported in this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestCoreLine);
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    try {
      setCameraState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraState('active');
      setStatus('Camera preview active. Video stays on this device.');
    } catch (error) {
      setCameraState(error?.name === 'NotAllowedError' ? 'denied' : 'error');
      setStatus('Camera access was not granted.');
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState('idle');
    setStatus('Camera preview stopped.');
  };

  const startMic = async () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setMicState('unsupported');
      setStatus('Speech recognition is not supported in this browser. Typed input is ready.');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        stream.getTracks().forEach((track) => track.stop());
      }

      const recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();
        if (transcript) setPrompt(transcript);
      };
      recognition.onerror = () => {
        setMicState('error');
        setStatus('Mic transcript failed. Typed input remains available.');
      };
      recognition.onend = () => {
        setMicState((current) => (current === 'listening' ? 'ready' : current));
      };

      recognitionRef.current = recognition;
      recognition.start();
      setMicState('listening');
      setStatus('Listening for one command. Audio stays on this device.');
    } catch (error) {
      setMicState(error?.name === 'NotAllowedError' ? 'denied' : 'error');
      setStatus('Microphone access was not granted.');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      setStatus('Location is not supported in this browser.');
      return;
    }

    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationState('granted');
        setStatus('Location permission confirmed. Coordinates stay on this device.');
      },
      (error) => {
        setLocationState(error?.code === 1 ? 'denied' : 'error');
        setStatus('Location access was not granted.');
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-cyber-border/60 bg-slate-900/40">
      <div className="relative flex w-full items-center justify-center overflow-hidden py-6">
        <motion.div
          className="absolute h-80 w-80 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(34,197,94,0.14) 0%, rgba(16,185,129,0.08) 35%, rgba(15,23,42,0) 72%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className={`relative ${sizeClass}`}>
          <motion.div className="absolute inset-0 rounded-full border border-emerald-400/45" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute inset-3 rounded-full border border-emerald-300/30" animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute inset-8 rounded-full border border-emerald-200/20" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div
            className="absolute inset-12 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(167,243,208,0.9) 0%, rgba(16,185,129,0.95) 36%, rgba(6,78,59,0.95) 100%)',
              boxShadow: '0 0 28px rgba(34,197,94,0.45), inset 0 0 32px rgba(167,243,208,0.35)'
            }}
            animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)', '0 0 42px rgba(34,197,94,0.65), inset 0 0 35px rgba(167,243,208,0.4)', '0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100" animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="absolute bottom-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300">
          Neural Core Listening
        </div>
      </div>

      <div className="border-t border-cyber-border/70 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-300">
            <Bot size={14} /> Neural Core Assistant
          </div>
          <button type="button" onClick={speak} className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
            <Volume2 size={13} /> Voice Brief
          </button>
        </div>

        <p className="mb-3 rounded-lg border border-cyber-border bg-slate-950/40 px-3 py-2 text-[11px] text-cyber-muted">
          {safeSensorsNotice}
        </p>

        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={cameraState === 'active' ? stopCamera : startCamera} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs">
            {cameraState === 'active' ? <Square size={13} /> : <Camera size={13} />}
            {cameraState === 'active' ? 'Stop Camera' : 'Camera'}
          </button>
          <button type="button" onClick={startMic} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs">
            <Mic size={13} /> {micState === 'listening' ? 'Listening' : 'Mic'}
          </button>
          <button type="button" onClick={requestLocation} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs">
            <MapPin size={13} /> Location
          </button>
        </div>

        {cameraState === 'active' && (
          <video ref={videoRef} className="mb-3 aspect-video w-full rounded-lg border border-emerald-400/25 bg-slate-950 object-cover" autoPlay muted playsInline />
        )}

        <div className="mb-3 grid gap-2 text-[11px] text-cyber-muted sm:grid-cols-3">
          <span>Camera: {cameraState}</span>
          <span>Mic: {micState}</span>
          <span>Location: {locationState}</span>
        </div>

        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
          {conversation.map((item) => (
            <div key={item.id} className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${item.role === 'core' ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-50' : 'border-cyber-border bg-slate-950/45 text-slate-200'}`}>
              <span className="mb-1 block font-semibold text-emerald-300">{item.role === 'core' ? 'Core' : 'You'}</span>
              {item.text || (item.role === 'core' ? 'Composing...' : '')}
            </div>
          ))}
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyber-border bg-slate-950/45 px-3 py-2 text-xs text-cyber-muted">
              <Loader2 size={13} className="animate-spin" /> Neural Core is thinking
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            className="input h-10 rounded-lg px-3 py-2"
            placeholder="Ask anything, sir..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button className="btn-primary inline-flex h-10 items-center gap-2 rounded-lg px-3 py-2" type="submit" disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>

        <p className="mt-2 text-[11px] text-cyber-muted">{status}</p>
      </div>
    </div>
  );
}
