function makeEmptyFrame() {
  const frequency = new Array(24).fill(0);
  return {
    amplitude: 0,
    frequency,
    bands: frequency.slice(0, 12),
    isSpeaking: false,
    isListening: false,
    source: 'none'
  };
}

export class AudioVisualizer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.stream = null;
    this.frequencyData = null;
    this.timeData = null;
    this.callbacks = new Set();
    this.animationFrame = null;
    this.syntheticTimer = null;
    this.syntheticFrame = makeEmptyFrame();
    this.isSpeaking = false;
    this.isListening = false;
    this.source = 'none';
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    callback(this.getSnapshot());
    return () => this.callbacks.delete(callback);
  }

  getSnapshot() {
    return {
      ...this.syntheticFrame,
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      source: this.source
    };
  }

  emit(frame = null) {
    const payload = frame
      ? {
          ...frame,
          isSpeaking: this.isSpeaking,
          isListening: this.isListening,
          source: this.source
        }
      : this.getSnapshot();

    this.syntheticFrame = payload;
    this.callbacks.forEach((callback) => callback(payload));
  }

  setListening(value) {
    this.isListening = Boolean(value);
    this.emit();
  }

  setSpeaking(value) {
    this.isSpeaking = Boolean(value);
    this.emit();
  }

  async ensureContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    await this.startFromStream(stream, 'microphone');
    this.setListening(true);
    return stream;
  }

  async startFromStream(stream, source = 'microphone') {
    this.stop({ resetFlags: false });
    this.stream = stream;
    this.source = source;
    await this.ensureContext();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.72;

    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
    this.startRealtimeLoop();
  }

  startSyntheticSpeech(text = '') {
    this.stop({ resetFlags: false });
    this.source = 'synthetic-speech';
    this.setSpeaking(true);

    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    let tick = 0;

    const push = () => {
      const rhythm = (Math.sin((tick / 10) * Math.PI * 2) + 1) * 0.5;
      const emphasis = words.length ? (tick % Math.max(2, Math.floor(10 / Math.max(1, words.length / 3))) === 0 ? 0.34 : 0.12) : 0.1;
      const amplitude = Math.max(0.06, Math.min(1, rhythm * 0.5 + emphasis));
      const frequency = new Array(24).fill(0).map((_, index) => {
        const phase = (tick / 8) + index * 0.27;
        const wave = (Math.sin(phase) + 1) * 0.5;
        const weight = index < 10 ? 1.1 : 0.7;
        return Number(Math.max(0.02, Math.min(1, wave * amplitude * weight)).toFixed(4));
      });

      this.emit({
        amplitude: Number(amplitude.toFixed(4)),
        frequency,
        bands: frequency.slice(0, 12),
        source: this.source
      });

      tick += 1;
    };

    push();
    this.syntheticTimer = window.setInterval(push, 70);

    return () => {
      this.stop({ resetFlags: false });
      this.setSpeaking(false);
      this.source = 'none';
      this.emit(makeEmptyFrame());
    };
  }

  startRealtimeLoop() {
    const frame = () => {
      if (!this.analyser || !this.frequencyData || !this.timeData) return;

      this.analyser.getByteFrequencyData(this.frequencyData);
      this.analyser.getByteTimeDomainData(this.timeData);

      let power = 0;
      for (let index = 0; index < this.timeData.length; index += 1) {
        const centered = (this.timeData[index] - 128) / 128;
        power += centered * centered;
      }
      const amplitude = Math.min(1, Math.sqrt(power / this.timeData.length) * 2.6);

      const frequency = new Array(24).fill(0).map((_, bucket) => {
        const start = Math.floor((bucket / 24) * this.frequencyData.length);
        const end = Math.floor(((bucket + 1) / 24) * this.frequencyData.length);
        let sum = 0;
        for (let index = start; index < end; index += 1) {
          sum += this.frequencyData[index] || 0;
        }
        return Number((sum / Math.max(1, end - start) / 255).toFixed(4));
      });

      this.emit({
        amplitude: Number(amplitude.toFixed(4)),
        frequency,
        bands: frequency.slice(0, 12),
        source: this.source
      });

      this.animationFrame = window.requestAnimationFrame(frame);
    };

    this.animationFrame = window.requestAnimationFrame(frame);
  }

  stop(options = {}) {
    const { resetFlags = true } = options;

    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.syntheticTimer) {
      window.clearInterval(this.syntheticTimer);
      this.syntheticTimer = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.analyser = null;
    this.frequencyData = null;
    this.timeData = null;
    this.source = 'none';

    if (resetFlags) {
      this.isSpeaking = false;
      this.isListening = false;
    }

    this.emit(makeEmptyFrame());
  }

  async dispose() {
    this.stop();
    this.callbacks.clear();
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}

let sharedVisualizer = null;

export function getAudioVisualizer() {
  if (!sharedVisualizer) {
    sharedVisualizer = new AudioVisualizer();
  }
  return sharedVisualizer;
}
