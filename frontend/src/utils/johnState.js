export const JOHN_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ALERT: 'alert',
  LOCKED: 'locked'
};

const DEFAULT_SNAPSHOT = {
  state: JOHN_STATES.IDLE,
  previousState: JOHN_STATES.IDLE,
  lastStateChangeAt: Date.now(),
  isSpeaking: false,
  isListening: false,
  amplitude: 0,
  frequency: new Array(24).fill(0),
  lastCommand: '',
  lastResponse: '',
  avatarMode: 'neural',
  alerts: [],
  metrics: {
    chain: 'syncing',
    records: 0,
    threats: 0,
    nodes: 0,
    compromised: false
  },
  startedAt: Date.now()
};

function cloneSnapshot(snapshot) {
  return {
    ...snapshot,
    frequency: [...snapshot.frequency],
    alerts: snapshot.alerts.map((alert) => ({ ...alert })),
    metrics: { ...snapshot.metrics }
  };
}

class JohnStateStore {
  constructor(initial = DEFAULT_SNAPSHOT) {
    this.state = cloneSnapshot(initial);
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return cloneSnapshot(this.state);
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  patch(partial) {
    const next = typeof partial === 'function' ? partial(this.getSnapshot()) : partial;
    if (!next || typeof next !== 'object') return this.getSnapshot();

    this.state = {
      ...this.state,
      ...next,
      metrics: {
        ...this.state.metrics,
        ...(next.metrics || {})
      },
      alerts: Array.isArray(next.alerts) ? next.alerts : this.state.alerts,
      frequency: Array.isArray(next.frequency) ? [...next.frequency] : this.state.frequency
    };

    this.notify();
    return this.getSnapshot();
  }

  transition(nextState) {
    if (!nextState || nextState === this.state.state) return this.getSnapshot();

    this.state = {
      ...this.state,
      previousState: this.state.state,
      state: nextState,
      lastStateChangeAt: Date.now()
    };

    this.notify();
    return this.getSnapshot();
  }

  setAudioFrame(frame = {}) {
    const amplitude = Number(frame.amplitude || 0);
    const frequency = Array.isArray(frame.frequency)
      ? frame.frequency.slice(0, 24)
      : Array.isArray(frame.bands)
        ? frame.bands.slice(0, 24)
        : this.state.frequency;

    this.state = {
      ...this.state,
      amplitude: Math.max(0, Math.min(1, Number.isFinite(amplitude) ? amplitude : 0)),
      frequency: frequency.map((value) => Number(value) || 0),
      isSpeaking: Boolean(frame.isSpeaking ?? this.state.isSpeaking),
      isListening: Boolean(frame.isListening ?? this.state.isListening)
    };

    this.notify();
    return this.getSnapshot();
  }

  setCommand(command) {
    this.state = {
      ...this.state,
      lastCommand: String(command || '')
    };
    this.notify();
    return this.getSnapshot();
  }

  setResponse(response) {
    this.state = {
      ...this.state,
      lastResponse: String(response || '')
    };
    this.notify();
    return this.getSnapshot();
  }

  setAvatarMode(mode) {
    const value = mode === 'robodog' ? 'robodog' : 'neural';
    this.state = {
      ...this.state,
      avatarMode: value
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('john-avatar-mode', value);
    }
    this.notify();
    return this.getSnapshot();
  }

  pushAlert(message, severity = 'warning') {
    const alert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      message: String(message || ''),
      severity,
      createdAt: new Date().toISOString()
    };

    this.state = {
      ...this.state,
      alerts: [alert, ...this.state.alerts].slice(0, 30)
    };
    this.notify();
    return this.getSnapshot();
  }

  clearAlerts() {
    this.state = {
      ...this.state,
      alerts: []
    };
    this.notify();
    return this.getSnapshot();
  }

  setMetrics(metrics = {}) {
    this.state = {
      ...this.state,
      metrics: {
        ...this.state.metrics,
        ...metrics
      }
    };
    this.notify();
    return this.getSnapshot();
  }
}

let sharedStore = null;

export function getJohnStateStore() {
  if (!sharedStore) {
    sharedStore = new JohnStateStore();
  }
  return sharedStore;
}

export function createJohnStateStore(initial = DEFAULT_SNAPSHOT) {
  return new JohnStateStore(initial);
}
