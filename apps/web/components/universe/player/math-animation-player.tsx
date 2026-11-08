'use client';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Pause, Play, RotateCcw, SkipBack, SkipForward, Captions, Volume2, VolumeX, Speech} from 'lucide-react';
import type {EngineLogic, EngineConfig, Prediction} from '@/lib/universe/types';
import type {EngineView} from '../engines/types';
import {InteractiveTimeline} from './interactive-timeline';
import {StudentPrediction} from './student-prediction';
import {SoundContext, playTone, type SoundName} from '../stage';

export interface PlayerPrefs {muted: boolean; captions: boolean; narrate: boolean}

/**
 * MathAnimationPlayer — plays an engine's storyboard as a pure function of time.
 * Every frame is rendered from (scene, progress), so scrubbing, replay, step playback
 * and reduced motion (final frame of each scene, no tweening) all share one code path.
 * Playback pauses before the reveal scene until the learner has made a prediction.
 */
export function MathAnimationPlayer({logic, view, config, reduced, prefs, setPrefs, startScene = 0, predicted, onPredict, onComplete}: {
  logic: EngineLogic<unknown>; view: EngineView<unknown>; config: EngineConfig; reduced: boolean;
  prefs: PlayerPrefs; setPrefs: (p: PlayerPrefs) => void; startScene?: number;
  predicted: boolean; onPredict: (correct: boolean) => void; onComplete: () => void;
}) {
  const c = useMemo(() => logic.parse(config), [logic, config]);
  const scenes = useMemo(() => logic.scenes(c), [logic, c]);
  const prediction: Prediction = useMemo(() => logic.prediction(c), [logic, c]);
  const starts = useMemo(() => scenes.reduce<number[]>((acc, s, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + scenes[i - 1].duration); return acc; }, []), [scenes]);
  const total = starts[starts.length - 1] + scenes[scenes.length - 1].duration;
  const [t, setT] = useState(() => starts[Math.min(startScene, scenes.length - 1)] ?? 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [gate, setGate] = useState(false);
  const completed = useRef(false);
  const gateAt = starts[Math.min(prediction.revealScene, scenes.length - 1)];

  const sceneIndex = useMemo(() => { let i = 0; while (i < starts.length - 1 && t >= starts[i + 1]) i++; return i; }, [t, starts]);
  const local = Math.min(1, Math.max(0, (t - starts[sceneIndex]) / scenes[sceneIndex].duration));
  const p = reduced ? 1 : local;

  // A parent jump to a specific scene ("watch it happen") remounts the player via `key`.

  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      const prev = tRef.current, next = prev + dt * speed;
      if (!predicted && prev < gateAt && next >= gateAt) { tRef.current = gateAt; setT(gateAt); setPlaying(false); setGate(true); return; }
      if (next >= total) { tRef.current = total; setT(total); setPlaying(false); if (!completed.current) { completed.current = true; onComplete(); } return; }
      tRef.current = next; setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total, gateAt, predicted, onComplete]);

  // Optional read-aloud of the current scene's narration (Web Speech API).
  useEffect(() => {
    if (!prefs.narrate || !playing || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(scenes[sceneIndex].narration); u.rate = .95; u.lang = 'en-US';
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [sceneIndex, prefs.narrate, playing, scenes]);

  const sound = useCallback((s: SoundName) => { if (!prefs.muted) playTone(s); }, [prefs.muted]);
  const toggle = () => { if (t >= total - .01) { setT(0); completed.current = false; } setPlaying(!playing); sound('click'); };
  const go = (i: number) => { const k = Math.max(0, Math.min(scenes.length - 1, i)); setT(starts[k] + (reduced ? 0 : .001)); if (k === scenes.length - 1 && !completed.current) { completed.current = true; onComplete(); } };
  const replay = () => { completed.current = false; setGate(false); setT(0); setPlaying(true); };
  const reset = () => { setPlaying(false); setGate(false); setT(0); };
  const scene = scenes[sceneIndex];

  return <SoundContext.Provider value={sound}>
    <section className="u-player" tabIndex={0} aria-label="Animation player. Space plays or pauses; left and right arrows change scene."
      onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === ' ') { e.preventDefault(); toggle(); } if (e.key === 'ArrowRight') go(sceneIndex + 1); if (e.key === 'ArrowLeft') go(sceneIndex - 1); }}>
      <div className="u-player-frame">
        <view.Scene c={c} scene={sceneIndex} p={p}/>
        <span className="u-scene-tag">Scene {String(sceneIndex + 1).padStart(2, '0')} · {scene.purpose}</span>
        {gate && !predicted && <div className="u-gate"><StudentPrediction prediction={prediction} compact onAnswered={ok => { onPredict(ok); }} onWatch={() => { setGate(false); setPlaying(true); }}/>
          <button className="text-button" onClick={() => { setGate(false); onPredict(false); setPlaying(true); }}>Skip prediction</button></div>}
      </div>
      {prefs.captions && <div className="u-caption" aria-live="polite"><strong>{scene.title}</strong> {scene.narration}</div>}
      <div className="u-transport">
        <button aria-label="Previous scene" onClick={() => go(sceneIndex - 1)} disabled={sceneIndex === 0}><SkipBack size={16}/></button>
        <button className="primary" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>{playing ? <Pause size={16}/> : <Play size={16}/>}{playing ? 'Pause' : t >= total - .01 ? 'Play again' : t > 0 ? 'Continue' : 'Play'}</button>
        <button aria-label="Next scene" onClick={() => go(sceneIndex + 1)} disabled={sceneIndex === scenes.length - 1}><SkipForward size={16}/></button>
        <button aria-label="Replay from the beginning" onClick={replay}><RotateCcw size={16}/>Replay</button>
        <button onClick={reset}>Reset</button>
        <label className="u-speed">Speed<select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={.5}>0.5×</option><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
        <span className="u-transport-right">
          <button aria-pressed={prefs.captions} aria-label="Captions" onClick={() => setPrefs({...prefs, captions: !prefs.captions})} className={prefs.captions ? 'on' : ''}><Captions size={16}/></button>
          <button aria-pressed={prefs.narrate} aria-label="Read narration aloud" onClick={() => setPrefs({...prefs, narrate: !prefs.narrate})} className={prefs.narrate ? 'on' : ''}><Speech size={16}/></button>
          <button aria-pressed={!prefs.muted} aria-label={prefs.muted ? 'Unmute sound effects' : 'Mute sound effects'} onClick={() => setPrefs({...prefs, muted: !prefs.muted})}>{prefs.muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}</button>
        </span>
      </div>
      <InteractiveTimeline scenes={scenes} starts={starts} total={total} t={t} current={sceneIndex} gateAt={predicted ? null : gateAt}
        onSeek={v => { setT(v); }} onScene={go}/>
      {reduced && <p className="muted u-reduced-note">Reduced motion is on: each scene shows its final arrangement without movement. Use the scene buttons to step through.</p>}
    </section>
  </SoundContext.Provider>;
}
