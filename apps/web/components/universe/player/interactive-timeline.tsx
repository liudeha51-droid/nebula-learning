'use client';
import type {SceneScript} from '@/lib/universe/types';

/** Scrubbable storyboard timeline with one chip per scene. */
export function InteractiveTimeline({scenes, starts, total, t, current, gateAt, onSeek, onScene}: {
  scenes: SceneScript[]; starts: number[]; total: number; t: number; current: number; gateAt: number | null;
  onSeek: (t: number) => void; onScene: (i: number) => void;
}) {
  return <div className="u-timeline">
    <div className="u-track">
      <div className="u-track-fill" style={{width: `${(t / total) * 100}%`}}/>
      {starts.map((s, i) => i > 0 && <span key={i} className="u-track-mark" style={{left: `${(s / total) * 100}%`}}/>)}
      {gateAt !== null && <span className="u-track-gate" style={{left: `${(gateAt / total) * 100}%`}} title="Prediction point"/>}
      <input aria-label="Scrub animation timeline" type="range" min={0} max={total} step={.05} value={t} onChange={e => onSeek(Number(e.target.value))}
        aria-valuetext={`Scene ${current + 1} of ${scenes.length}: ${scenes[current].title}`}/>
    </div>
    <ol className="u-scene-chips">{scenes.map((s, i) =>
      <li key={s.id}><button className={i === current ? 'on' : i < current ? 'done' : ''} onClick={() => onScene(i)} aria-current={i === current ? 'step' : undefined}>
        <b>{String(i + 1).padStart(2, '0')}</b><span>{s.title}</span></button></li>)}</ol>
  </div>;
}
