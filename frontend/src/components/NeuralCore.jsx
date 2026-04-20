import { Lock, Mic } from 'lucide-react';
import '../styles/NeuralCore.css';

const labelByState = {
  idle: 'JOHN - Standing By',
  listening: 'JOHN - Listening...',
  processing: 'JOHN - Processing...',
  speaking: 'JOHN - Speaking',
  alert: 'JOHN - ALERT',
  locked: 'JOHN - LOCKED'
};

function buildOrbStyle(state, amplitude) {
  const baseScale = state === 'speaking' ? 1 + Math.min(amplitude * 0.2, 0.2) : 1;
  const colorMap = {
    idle: '#00FF88',
    listening: '#AFFFCF',
    processing: '#00BFFF',
    speaking: '#FFD700',
    alert: '#FF2222',
    locked: '#444444'
  };

  return {
    '--john-color': colorMap[state] || colorMap.idle,
    '--john-scale': String(baseScale)
  };
}

export default function NeuralCore({
  state = 'idle',
  amplitude = 0,
  bands = [],
  compact = false
}) {
  const bars = bands.length ? bands : new Array(12).fill(0.08);
  const shellClass = `john-neural-shell john-neural-${state} ${compact ? 'john-neural-compact' : ''}`;

  return (
    <div className={shellClass} style={buildOrbStyle(state, amplitude)}>
      {state === 'alert' && <div className="john-neural-vignette" />}
      <div className="john-neural-orb-wrap">
        <div className="john-neural-ring john-ring-a" />
        <div className="john-neural-ring john-ring-b" />
        <div className="john-neural-ring john-ring-c" />
        <div className="john-neural-sonar" />

        <div className="john-neural-orb">
          <div className="john-neural-fragments">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="john-neural-inner-bars" aria-hidden={state !== 'listening' && state !== 'speaking'}>
            {bars.slice(0, 8).map((bar, index) => (
              <span key={index} style={{ '--bar-level': String(Math.max(0.08, Math.min(1, bar))) }} />
            ))}
          </div>

          {state === 'locked' && (
            <div className="john-neural-lock">
              <Lock size={18} />
            </div>
          )}
        </div>

        {state === 'listening' && (
          <div className="john-neural-mic">
            <Mic size={13} />
            <span className="john-neural-dot" />
          </div>
        )}
      </div>

      <div className="john-neural-label">{labelByState[state] || labelByState.idle}</div>
    </div>
  );
}
