export const JOHN_CLIENT_CONFIG = {
  name: 'JOHN',
  fullName: 'Just Operational Human Network',
  owner: 'Sir',
  wakeWord: 'john',
  themeColor: '#00BFFF',
  alertColor: '#FF4444',
  voiceRate: 175,
  voiceVolume: 1,
  idleQuips: [
    'I am monitoring all channels, Sir.',
    'Encryption protocol active. Naturally.',
    'Blockchain telemetry is behaving itself for once.',
    'Standing by, Sir. Dramatic pause optional.'
  ]
};

export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function startupLine() {
  return `Initializing JOHN... Blockchain link established. Cryptographic protocols loaded. Good ${getTimeOfDay()}, I am JOHN. All systems are operational.`;
}

export function greetingLine() {
  return `Good ${getTimeOfDay()}, I am JOHN. How may I assist you?`;
}

export function getRandomQuip() {
  return JOHN_CLIENT_CONFIG.idleQuips[Math.floor(Math.random() * JOHN_CLIENT_CONFIG.idleQuips.length)];
}

export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function extractWakeCommand(transcript = '') {
  const text = String(transcript || '').trim();
  const match = text.match(/\b(?:hey\s+)?john\b[\s,]*(.*)$/i);
  if (!match) return null;
  return (match[1] || '').trim() || 'john';
}

export function isSensitiveJohnCommand(text = '') {
  const command = String(text).toLowerCase();
  return /\b(send|lock|shutdown|secure|generate|rotate|create|scan)\b.*\b(message|system|keys?|tamper|integrity|blockchain)\b/.test(command);
}

export function speakJohn(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Number(options.rate || JOHN_CLIENT_CONFIG.voiceRate) / 175;
    utterance.volume = Number(options.volume ?? JOHN_CLIENT_CONFIG.voiceVolume);
    utterance.pitch = 0.92;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}

export async function captureVoiceFeatures(durationMs = 1200) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is not available in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.42;
  source.connect(analyser);

  const frequency = new Uint8Array(analyser.frequencyBinCount);
  const time = new Uint8Array(analyser.fftSize);
  const buckets = new Array(16).fill(0);
  let rmsTotal = 0;
  let zcrTotal = 0;
  let frames = 0;

  const startedAt = performance.now();
  while (performance.now() - startedAt < durationMs) {
    analyser.getByteFrequencyData(frequency);
    analyser.getByteTimeDomainData(time);

    for (let bucket = 0; bucket < buckets.length; bucket += 1) {
      const start = Math.floor((bucket / buckets.length) * frequency.length);
      const end = Math.floor(((bucket + 1) / buckets.length) * frequency.length);
      let sum = 0;
      for (let index = start; index < end; index += 1) sum += frequency[index] || 0;
      buckets[bucket] += sum / Math.max(1, end - start) / 255;
    }

    let square = 0;
    let zcr = 0;
    for (let index = 1; index < time.length; index += 1) {
      const current = (time[index] - 128) / 128;
      const previous = (time[index - 1] - 128) / 128;
      square += current * current;
      if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) zcr += 1;
    }

    rmsTotal += Math.sqrt(square / time.length);
    zcrTotal += zcr / time.length;
    frames += 1;
    await wait(80);
  }

  stream.getTracks().forEach((track) => track.stop());
  await context.close();

  const vector = buckets.map((value) => Number((value / Math.max(1, frames)).toFixed(5)));
  vector.push(Number((rmsTotal / Math.max(1, frames)).toFixed(5)));
  vector.push(Number((zcrTotal / Math.max(1, frames)).toFixed(5)));

  return { vector, durationMs, capturedAt: new Date().toISOString() };
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
