import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Activity, LockKeyhole, Mic, MicOff, Send, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { johnApi } from '../services/api';
import { socketUrl } from '../services/runtimeConfig';
import {
  captureVoiceFeatures,
  extractWakeCommand,
  getRandomQuip,
  getSpeechRecognition,
  greetingLine,
  isSensitiveJohnCommand,
  speakJohn,
  startupLine
} from '../../../john/john_ui.js';
import { AudioVisualizer } from '../utils/AudioVisualizer';
import AvatarSelector, { AVATAR_MODES, getStoredAvatarMode } from './AvatarSelector';
import NeuralCore from './NeuralCore';
import RoboDog from './RoboDog';
import '../../../john/john_ui.css';

export const JOHN_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ALERT: 'alert',
  LOCKED: 'locked'
};

const initialStatus = {
  chain: 'syncing',
  records: 0,
  threats: 0,
  voice: 'not enrolled',
  nodes: 5,
  compromised: false
};

function newEntry(role, text, severity = 'normal') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    severity,
    at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function formatUptime(startedAt) {
  const elapsed = Math.max(0, Date.now() - startedAt);
  const totalMinutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function threatLevel(status, johnState) {
  if (johnState === JOHN_STATES.ALERT || status.compromised) return 'red';
  if (status.threats > 0) return 'yellow';
  return 'green';
}

export default function JohnAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const logEndRef = useRef(null);
  const visualizerRef = useRef(null);
  const startupRef = useRef(Date.now());
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState(false);
  const [booting, setBooting] = useState(true);
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [pendingSecret, setPendingSecret] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [johnState, setJohnState] = useState(JOHN_STATES.IDLE);
  const [audioFrame, setAudioFrame] = useState({ amplitude: 0, bands: new Array(12).fill(0), source: 'none' });
  const [avatarMode, setAvatarMode] = useState(() => getStoredAvatarMode());
  const [log, setLog] = useState(() => [newEntry('john', startupLine())]);
  const [lastCommand, setLastCommand] = useState('Awaiting voice command');
  const [lastResponse, setLastResponse] = useState(startupLine());
  const [speechSupported] = useState(() => Boolean(getSpeechRecognition()));
  const [uptimeTick, setUptimeTick] = useState(0);

  const locked = status.voice === 'locked';
  const uptime = useMemo(() => formatUptime(startupRef.current), [uptimeTick]);
  const activeThreatLevel = useMemo(() => threatLevel(status, johnState), [status, johnState]);

  const append = useCallback((role, text, severity = 'normal') => {
    setLog((items) => [...items.slice(-70), newEntry(role, text, severity)]);
  }, []);

  useEffect(() => {
    const visualizer = new AudioVisualizer();
    visualizerRef.current = visualizer;
    const unsubscribe = visualizer.subscribe((frame) => setAudioFrame(frame));

    return () => {
      unsubscribe();
      visualizer.dispose().catch(() => null);
      visualizerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (locked) {
      setJohnState(JOHN_STATES.LOCKED);
      return;
    }
    if (alert) {
      setJohnState(JOHN_STATES.ALERT);
      return;
    }
    if (speaking) {
      setJohnState(JOHN_STATES.SPEAKING);
      return;
    }
    if (processing) {
      setJohnState(JOHN_STATES.PROCESSING);
      return;
    }
    if (listening) {
      setJohnState(JOHN_STATES.LISTENING);
      return;
    }
    setJohnState(JOHN_STATES.IDLE);
  }, [alert, listening, locked, processing, speaking]);

  useEffect(() => {
    const interval = window.setInterval(() => setUptimeTick((value) => value + 1), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const say = useCallback(async (text, severity = 'normal') => {
    append('john', text, severity);
    setLastResponse(text);
    setSpeaking(true);
    const stopSynthetic = visualizerRef.current?.startSyntheticSpeech(text);
    await speakJohn(text);
    if (typeof stopSynthetic === 'function') stopSynthetic();
    setSpeaking(false);
  }, [append]);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await johnApi.status();
      const data = response.data;
      const inferredNodes = Math.max(1, Math.min(9, (data.integrity?.records?.length || 0) + 1));
      setStatus({
        chain: data.status || 'nominal',
        records: data.integrity?.checkedRecords || 0,
        threats: data.threats?.length || 0,
        voice: data.voice?.lockedUntil ? 'locked' : data.voice?.enrolled ? 'enrolled' : 'not enrolled',
        nodes: inferredNodes,
        compromised: Boolean(data.integrity?.compromised)
      });
    } catch (error) {
      setStatus((current) => ({ ...current, chain: 'offline' }));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1600);
    setSpeaking(true);
    const stopSynthetic = visualizerRef.current?.startSyntheticSpeech(startupLine());
    speakJohn(startupLine()).finally(() => {
      if (typeof stopSynthetic === 'function') stopSynthetic();
      setSpeaking(false);
    });
    refreshStatus();
    const interval = window.setInterval(refreshStatus, 30000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [refreshStatus]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log, open]);

  useEffect(() => {
    if (!socketUrl) return undefined;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('john:alert', (payload) => {
      setAlert(true);
      setOpen(true);
      say(
        payload?.message || 'Warning: Unauthorized access detected on Node 3',
        payload?.level === 'critical' ? 'critical' : 'warning'
      );
      window.setTimeout(() => setAlert(false), 3200);
      refreshStatus();
    });

    socket.on('john:boot', (payload) => {
      append('john', payload?.message || startupLine());
    });

    return () => socket.disconnect();
  }, [append, refreshStatus, say]);

  const performAction = useCallback((action) => {
    if (!action) return;
    if (action.type === 'navigate' && action.path) {
      navigate(action.path, { state: action });
    }
    if (action.type === 'alert' || action.type === 'lockdown') {
      setAlert(true);
      window.setTimeout(() => setAlert(false), 3200);
    }
  }, [navigate]);

  const authenticateVoice = useCallback(async (enroll = false) => {
    try {
      setListening(true);
      append(
        'john',
        enroll
          ? 'Listening for enrollment phrase. Please say: Hey JOHN, authenticate me.'
          : 'Voice authentication running...'
      );
      const features = await captureVoiceFeatures(1300);
      const response = await johnApi.voiceAuth({ features, enroll });
      await say(response.data.message || 'Voice authentication accepted.');
      refreshStatus();
      return { ok: true, features };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Voice authentication failed.';
      await say(message, 'warning');
      refreshStatus();
      return { ok: false };
    } finally {
      setListening(false);
      visualizerRef.current?.stop();
    }
  }, [append, refreshStatus, say]);

  const submitCommand = useCallback(async (rawCommand, options = {}) => {
    const command = String(rawCommand || '').trim();
    if (!command) return;

    append('user', command);
    setLastCommand(command);
    setInput('');
    setProcessing(true);

    let voiceFeatures = options.voiceFeatures || null;
    if (!voiceFeatures && (options.fromVoice || isSensitiveJohnCommand(command))) {
      try {
        append('john', 'Confirming voice pattern...');
        voiceFeatures = await captureVoiceFeatures(1100);
      } catch (error) {
        setProcessing(false);
        await say('Microphone access is required for secure JOHN commands, Sir.', 'warning');
        return;
      }
    }

    try {
      const response = await johnApi.command({
        command,
        voiceFeatures,
        context: options.context || {}
      });
      const data = response.data;
      setPendingSecret(data.requiresSecret || null);
      performAction(data.action);
      await say(data.answer || 'Command complete.');
      refreshStatus();
    } catch (error) {
      const data = error?.response?.data;
      const message = data?.answer || data?.error || 'JOHN command failed.';
      await say(message, data?.requiresVoiceAuth ? 'warning' : 'critical');
      if (data?.requiresVoiceAuth) {
        setStatus((current) => ({ ...current, voice: data.auth?.locked ? 'locked' : current.voice }));
      }
    } finally {
      setProcessing(false);
    }
  }, [append, performAction, refreshStatus, say]);

  const submitSecret = useCallback(async () => {
    if (!pendingSecret || !secret.trim()) return;
    const command = pendingSecret.command || 'john generate new keys';
    const securePassphrase = secret.trim();
    setSecret('');
    setPendingSecret(null);
    await submitCommand(command, { context: { securePassphrase } });
  }, [pendingSecret, secret, submitCommand]);

  const toggleListening = useCallback(async () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      say('Speech recognition is not available in this browser, Sir.', 'warning');
      return;
    }

    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      visualizerRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript || '';
      const command = extractWakeCommand(transcript);
      if (command) {
        setOpen(true);
        submitCommand(command, { fromVoice: true });
      }
    };

    recognition.onend = () => {
      setListening(false);
      visualizerRef.current?.stop();
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListening(false);
      visualizerRef.current?.stop();
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
      visualizerRef.current?.startMicrophone().catch(() => null);
      say(greetingLine());
    } catch (error) {
      setListening(false);
      visualizerRef.current?.stop();
      say('Unable to start wake listening in this browser session, Sir.', 'warning');
    }
  }, [listening, say, submitCommand]);

  const openPanel = useCallback(() => {
    setOpen((value) => !value);
    if (!open) {
      johnApi.log({ event: 'frontend_panel_opened' }).catch(() => null);
    }
  }, [open]);

  return (
    <div className="john-assistant">
      {open && (
        <section className={`john-panel ${alert ? 'john-panel-alert' : ''}`} aria-label="JOHN assistant terminal">
          {booting && <div className="john-boot">{startupLine()}</div>}

          <header className="john-header">
            <div className="john-title">
              <strong>JOHN</strong>
              <span>Just Operational Human Network</span>
            </div>
            <div className="john-meta">
              <span>JOHN Online: {uptime}</span>
              <button className="john-close" type="button" onClick={() => setOpen(false)} aria-label="Close JOHN">
                <X size={16} />
              </button>
            </div>
          </header>

          <AvatarSelector value={avatarMode} onChange={setAvatarMode} />

          <div className="john-avatar-stage">
            <div
              key={avatarMode}
              className={`john-avatar-transition ${avatarMode === AVATAR_MODES.NEURAL ? 'john-mode-neural' : 'john-mode-robodog'}`}
            >
              {avatarMode === AVATAR_MODES.NEURAL ? (
                <NeuralCore state={johnState} amplitude={audioFrame.amplitude} bands={audioFrame.bands} />
              ) : (
                <RoboDog state={johnState} amplitude={audioFrame.amplitude} speechText={lastResponse} />
              )}
            </div>
          </div>

          <div className="john-grid john-grid-upgraded">
            <div className="john-stat">
              <span>Active Avatar</span>
              <strong>{avatarMode === AVATAR_MODES.NEURAL ? 'Neural Core' : 'RoboDog'}</strong>
            </div>
            <div className="john-stat">
              <span>Blockchain Nodes</span>
              <strong>{status.nodes}</strong>
              <div className="john-node-dots">
                {Array.from({ length: Math.min(status.nodes, 6) }, (_, index) => (
                  <i key={index} style={{ animationDelay: `${index * 0.12}s` }} />
                ))}
              </div>
            </div>
            <div className="john-stat">
              <span>Encryption</span>
              <strong className="john-inline-strong john-lock-pulse"><LockKeyhole size={13} /> AES-256 Active</strong>
            </div>
            <div className="john-stat">
              <span>Threat Level</span>
              <strong className={`john-threat john-threat-${activeThreatLevel}`}>
                <ShieldAlert size={13} /> {activeThreatLevel.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="john-last-exchange">
            <div>
              <span>Last Command</span>
              <strong>{lastCommand}</strong>
            </div>
            <div>
              <span>Last Response</span>
              <strong>{lastResponse}</strong>
            </div>
          </div>

          <div className="john-toolbar">
            <button className={`john-chip ${listening ? 'john-chip-active' : ''}`} type="button" onClick={toggleListening}>
              <Activity size={13} /> {listening ? 'Wake listening' : 'Listen for JOHN'}
            </button>
            <button className="john-chip" type="button" onClick={() => authenticateVoice(status.voice !== 'enrolled')}>
              <ShieldCheck size={13} /> {status.voice === 'enrolled' ? 'Verify voice' : 'Enroll voice'}
            </button>
            <button className="john-chip" type="button" onClick={() => say(getRandomQuip())}>
              Idle quip
            </button>
            {!speechSupported && <span className="john-chip john-chip-alert">No Web Speech API</span>}
          </div>

          <div className="john-log" role="log">
            {log.map((entry) => (
              <div
                key={entry.id}
                className={`john-message john-message-${entry.role === 'user' ? 'user' : 'john'} ${entry.severity === 'critical' || entry.severity === 'warning' ? 'john-message-alert' : ''}`}
              >
                {entry.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {pendingSecret && (
            <div className="john-secret-row">
              <input
                className="john-secret"
                type="password"
                value={secret}
                placeholder={pendingSecret.label || 'Secure input'}
                onChange={(event) => setSecret(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitSecret();
                }}
              />
              <button className="john-send" type="button" onClick={submitSecret}>Authorize</button>
            </div>
          )}

          <form
            className="john-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              submitCommand(input);
            }}
          >
            <input
              className="john-input"
              value={input}
              placeholder="Say or type: JOHN, show blockchain status"
              onChange={(event) => setInput(event.target.value)}
            />
            <button className="john-icon-button" type="button" onClick={toggleListening} aria-label="Toggle JOHN voice">
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button className="john-send" type="submit">
              <Send size={14} /> Send
            </button>
          </form>
        </section>
      )}

      <button
        className={`john-avatar ${open || listening || speaking || processing ? 'john-avatar-active' : ''} ${alert ? 'john-avatar-alert' : ''}`}
        type="button"
        onClick={openPanel}
        aria-label="Open JOHN assistant"
      />
    </div>
  );
}
