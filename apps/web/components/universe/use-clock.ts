'use client';
import {useEffect, useState} from 'react';

/** A free-running animation clock (seconds). Starts paused when the OS asks for reduced motion. */
export function useClock() {
  const [playing, setPlaying] = useState(() => typeof window === 'undefined' || !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => { const dt = Math.min(.05, (now - last) / 1000); last = now; setT(v => v + dt); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return {t, setT, playing, toggle: () => setPlaying(v => !v)};
}
