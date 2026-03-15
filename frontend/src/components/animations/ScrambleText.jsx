import { useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';

const CHARS = 'ABCDEF0123456789';

export default function ScrambleText({ text, active, className = '', duration = 1.2 }) {
  const [display, setDisplay] = useState(text);

  const target = useMemo(() => text || '', [text]);

  useEffect(() => {
    if (!active || !target) {
      setDisplay(target);
      return;
    }

    const state = { progress: 0 };
    const tween = gsap.to(state, {
      progress: 1,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const reveal = Math.floor(state.progress * target.length);
        const scrambled = target
          .split('')
          .map((char, idx) => {
            if (idx < reveal) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
        setDisplay(scrambled);
      },
      onComplete: () => setDisplay(target)
    });

    return () => tween.kill();
  }, [active, target, duration]);

  return <span className={className}>{display}</span>;
}
