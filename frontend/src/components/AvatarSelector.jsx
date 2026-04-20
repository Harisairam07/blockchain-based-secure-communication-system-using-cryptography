import { Cpu, Shield } from 'lucide-react';

const KEY = 'john-avatar-mode';

export const AVATAR_MODES = {
  ROBODOG: 'robodog',
  NEURAL: 'neural'
};

export function getStoredAvatarMode() {
  if (typeof window === 'undefined') return AVATAR_MODES.NEURAL;
  const value = window.localStorage.getItem(KEY);
  if (value === AVATAR_MODES.ROBODOG || value === AVATAR_MODES.NEURAL) return value;
  return AVATAR_MODES.NEURAL;
}

export default function AvatarSelector({ value, onChange }) {
  return (
    <div className="john-avatar-selector" role="tablist" aria-label="JOHN avatar mode selector">
      <button
        type="button"
        role="tab"
        aria-selected={value === AVATAR_MODES.ROBODOG}
        className={`john-chip ${value === AVATAR_MODES.ROBODOG ? 'john-chip-active' : ''}`}
        onClick={() => {
          window.localStorage.setItem(KEY, AVATAR_MODES.ROBODOG);
          onChange(AVATAR_MODES.ROBODOG);
        }}
      >
        <Shield size={13} /> RoboDog Mode
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === AVATAR_MODES.NEURAL}
        className={`john-chip ${value === AVATAR_MODES.NEURAL ? 'john-chip-active' : ''}`}
        onClick={() => {
          window.localStorage.setItem(KEY, AVATAR_MODES.NEURAL);
          onChange(AVATAR_MODES.NEURAL);
        }}
      >
        <Cpu size={13} /> Neural Core Mode
      </button>
    </div>
  );
}
