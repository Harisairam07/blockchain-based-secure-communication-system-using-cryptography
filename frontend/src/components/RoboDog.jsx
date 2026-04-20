import { Lock, Mic } from 'lucide-react';
import robodogSit from '../assets/robodog-sit.png';
import robodogStand from '../assets/robodog-stand.png';
import robodogWalk from '../assets/robodog-walk.png';
import '../styles/RoboDog.css';

const stateLabel = {
  idle: 'Sentinel Idle',
  listening: 'Acoustic Scan',
  processing: 'Command Analysis',
  speaking: 'Voice Relay',
  alert: 'Guard Mode',
  locked: 'Security Lock'
};

export default function RoboDog({
  state = 'idle',
  amplitude = 0,
  compact = false,
  speechText = '',
  onActivate = null
}) {
  const wrapClass = `john-dog-shell john-dog-${state} ${compact ? 'john-dog-compact' : ''}`;
  const mouthScale = state === 'speaking' ? 0.8 + Math.min(0.8, amplitude * 1.3) : 0.82;
  const imageSrc = state === 'idle' || state === 'locked'
    ? robodogSit
    : state === 'speaking'
      ? robodogWalk
      : robodogStand;

  return (
    <div className={wrapClass}>
      {speechText && (
        <div className="john-dog-speech">{speechText}</div>
      )}

      <div
        className={`john-dog-stage ${onActivate ? 'john-dog-clickable' : ''}`}
        onClick={onActivate || undefined}
        title={onActivate ? 'Click to activate JOHN' : undefined}
      >
        <div className="john-dog-tag">J.O.H.N - Unit 01</div>
        <div className="john-dog-ring" />
        <div className="john-dog-scanner" />
        <img className="john-dog-image" src={imageSrc} alt="JOHN robot dog sentinel" draggable={false} />

        <div className="john-dog-eye john-dog-eye-left" />
        <div className="john-dog-eye john-dog-eye-right" />
        <div className="john-dog-reactor" />
        <div className="john-dog-mouth" style={{ transform: `translateX(-50%) scaleY(${mouthScale})` }} />
        <div className="john-dog-tail" />

        {state === 'listening' && (
          <div className="john-dog-badge john-dog-badge-mic">
            <Mic size={11} /> Listening
          </div>
        )}
        {state === 'locked' && (
          <div className="john-dog-badge john-dog-badge-lock">
            <Lock size={11} /> Locked
          </div>
        )}
        {state === 'alert' && <div className="john-dog-badge john-dog-badge-alert">INTRUDER ALERT</div>}
      </div>

      <div className="john-dog-label">{stateLabel[state] || stateLabel.idle}</div>
    </div>
  );
}
