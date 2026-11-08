'use client';
import {createContext,useCallback,useContext,useRef,type ReactNode,type PointerEvent as RPointerEvent,type KeyboardEvent as RKeyboardEvent} from 'react';

/** Nebula quantity colours: identical meaning in every grade. */
export const C = {
  ones: '#f2c46d', tens: '#7fdcc4', hundreds: '#b9a2ff', thousands: '#ff9f8a', unknown: '#ff8fc7', accent: '#8ec9ff',
  ink: '#eeecf5', muted: '#9d98ad', faint: '#5f5a72', line: '#3a3550', panel: '#1d1b27', bg: '#15141d', good: '#8fe0a8', warn: '#ffb36b', bad: '#ff8a9a',
};
export const W = 800, H = 450;

/* ---------- Sound (Web Audio, synthesised, no assets) ---------- */
export type SoundName = 'click' | 'group' | 'success' | 'error' | 'whoosh' | 'tick';
export const SoundContext = createContext<(s: SoundName) => void>(() => {});
export const useSound = () => useContext(SoundContext);
let audio: AudioContext | null = null;
export function playTone(name: SoundName) {
  if (typeof window === 'undefined') return;
  try {
    audio ??= new AudioContext();
    const ctx = audio; const t = ctx.currentTime;
    const notes: Record<SoundName, [number, number, number][]> = {
      click: [[880, 0, .05]], tick: [[1320, 0, .03]], group: [[523, 0, .09], [659, .07, .12]],
      success: [[523, 0, .1], [659, .08, .1], [784, .16, .18]], error: [[220, 0, .14]], whoosh: [[330, 0, .16]],
    };
    for (const [f, d, len] of notes[name]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = name === 'error' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(f, t + d);
      if (name === 'whoosh') o.frequency.exponentialRampToValueAtTime(f * 2, t + d + len);
      g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.07, t + d + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + len);
      o.connect(g).connect(ctx.destination); o.start(t + d); o.stop(t + d + len + .02);
    }
  } catch { /* audio unavailable: silent by design */ }
}

/* ---------- Stage ---------- */
export function Stage({label, children, controls, height = H}: {label: string; children: ReactNode; controls?: ReactNode; height?: number}) {
  return <figure className="u-stage">
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} className="u-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="u-glow"><stop offset="0" stopColor="#ffffff" stopOpacity=".5"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></radialGradient>
        <pattern id="u-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#ffffff" strokeOpacity=".04"/></pattern>
      </defs>
      <rect width={W} height={height} fill="url(#u-grid)"/>
      {children}
    </svg>
    {controls && <figcaption className="u-controls">{controls}</figcaption>}
  </figure>;
}

export function T({x, y, children, size = 18, color = C.ink, anchor = 'middle', weight = 500, opacity = 1, mono = false}: {x: number; y: number; children: ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; opacity?: number; mono?: boolean}) {
  return <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} dominantBaseline="middle" fontWeight={weight} opacity={opacity} fontFamily={mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined} style={{pointerEvents: 'none'}}>{children}</text>;
}

export type ObjKind = 'star' | 'apple' | 'dot' | 'ball' | 'fish' | 'flower' | 'cube' | 'chick' | 'rabbit';
/** Friendly counting objects drawn as vector glyphs centred on (x,y). */
export function Obj({kind = 'dot', x, y, r = 16, color = C.ones, glow = false, opacity = 1, onClick, label}: {kind?: ObjKind; x: number; y: number; r?: number; color?: string; glow?: boolean; opacity?: number; onClick?: () => void; label?: string}) {
  const body = (() => {
    switch (kind) {
      case 'star': { const pts = Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * .45 : r; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' '); return <polygon points={pts} fill={color}/>; }
      case 'apple': return <><circle r={r * .85} cy={r * .1} fill={color}/><path d={`M0 ${-r * .6} q${r * .15} ${-r * .5} ${r * .45} ${-r * .55}`} stroke="#7fdc8f" strokeWidth={r * .18} fill="none" strokeLinecap="round"/></>;
      case 'ball': return <><circle r={r * .9} fill={color}/><path d={`M${-r * .9} 0 Q0 ${r * .5} ${r * .9} 0`} stroke="#00000044" fill="none"/></>;
      case 'fish': return <><ellipse rx={r} ry={r * .55} fill={color}/><polygon points={`${r * .8},0 ${r * 1.4},${-r * .5} ${r * 1.4},${r * .5}`} fill={color}/><circle cx={-r * .45} cy={-r * .1} r={r * .12} fill="#15141d"/></>;
      case 'flower': return <>{[0, 1, 2, 3, 4].map(i => <circle key={i} cx={Math.cos(i * 1.2566) * r * .5} cy={Math.sin(i * 1.2566) * r * .5} r={r * .42} fill={color}/>)}<circle r={r * .32} fill="#fff3c4"/></>;
      case 'cube': return <><rect x={-r * .8} y={-r * .8} width={r * 1.6} height={r * 1.6} rx={r * .2} fill={color}/><rect x={-r * .8} y={-r * .8} width={r * 1.6} height={r * .5} rx={r * .2} fill="#ffffff22"/></>;
      case 'chick': return <><circle r={r * .8} fill={color}/><polygon points={`${r * .7},${-r * .1} ${r * 1.15},0 ${r * .7},${r * .12}`} fill="#ff9f5a"/><circle cx={r * .3} cy={-r * .25} r={r * .1} fill="#15141d"/></>;
      case 'rabbit': return <><ellipse cx={-r * .25} cy={-r * .85} rx={r * .17} ry={r * .5} fill={color}/><ellipse cx={r * .25} cy={-r * .85} rx={r * .17} ry={r * .5} fill={color}/><circle r={r * .7} fill={color}/><circle cx={-r * .22} cy={-r * .1} r={r * .09} fill="#15141d"/><circle cx={r * .22} cy={-r * .1} r={r * .09} fill="#15141d"/></>;
      default: return <circle r={r * .8} fill={color}/>;
    }
  })();
  const interactive = !!onClick;
  return <g transform={`translate(${x} ${y})`} opacity={opacity} className={interactive ? 'u-hit' : undefined}
    onClick={onClick} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? label : undefined}
    onKeyDown={interactive ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}>
    {glow && <circle r={r * 1.9} fill="url(#u-glow)" opacity=".55"/>}
    {interactive && <circle r={r * 1.3} fill="transparent"/>}
    {body}
  </g>;
}

/** Base-ten block: unit cube, ten rod, hundred flat or thousand cube. */
export function Block({place, x, y, s = 10, opacity = 1}: {place: 0 | 1 | 2 | 3; x: number; y: number; s?: number; opacity?: number}) {
  const color = [C.ones, C.tens, C.hundreds, C.thousands][place];
  if (place === 0) return <rect x={x} y={y} width={s} height={s} rx={1.5} fill={color} stroke="#00000055" opacity={opacity}/>;
  if (place === 1) return <g opacity={opacity}><rect x={x} y={y} width={s} height={s * 10} rx={1.5} fill={color} stroke="#00000055"/>{Array.from({length: 9}, (_, i) => <line key={i} x1={x} x2={x + s} y1={y + s * (i + 1)} y2={y + s * (i + 1)} stroke="#00000044"/>)}</g>;
  if (place === 2) return <g opacity={opacity}><rect x={x} y={y} width={s * 10} height={s * 10} rx={2} fill={color} stroke="#00000055"/>{Array.from({length: 9}, (_, i) => <g key={i}><line x1={x + s * (i + 1)} x2={x + s * (i + 1)} y1={y} y2={y + s * 10} stroke="#00000033"/><line x1={x} x2={x + s * 10} y1={y + s * (i + 1)} y2={y + s * (i + 1)} stroke="#00000033"/></g>)}</g>;
  const d = s * 3; // isometric thousand cube
  return <g opacity={opacity} transform={`translate(${x} ${y})`}>
    <polygon points={`0,${d} ${s * 10},${d} ${s * 10},${d + s * 10} 0,${d + s * 10}`} fill={color} stroke="#00000055"/>
    <polygon points={`0,${d} ${d},0 ${s * 10 + d},0 ${s * 10},${d}`} fill="#ffc2b5" stroke="#00000055"/>
    <polygon points={`${s * 10},${d} ${s * 10 + d},0 ${s * 10 + d},${s * 10} ${s * 10},${d + s * 10}`} fill="#d97a68" stroke="#00000055"/>
  </g>;
}

/* ---------- HTML controls ---------- */
export function Stepper({label, value, min, max, step = 1, onChange, format}: {label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string}) {
  const sound = useSound();
  const set = (v: number) => { const n = Math.round(Math.min(max, Math.max(min, v)) / step) * step; if (n !== value) { sound('click'); onChange(Number(n.toFixed(6))); } };
  return <div className="u-stepper" role="group" aria-label={label}>
    <span>{label}</span>
    <button type="button" aria-label={`Decrease ${label}`} onClick={() => set(value - step)} disabled={value <= min}>−</button>
    <output aria-live="polite">{format ? format(value) : value}</output>
    <button type="button" aria-label={`Increase ${label}`} onClick={() => set(value + step)} disabled={value >= max}>+</button>
  </div>;
}
export function Slider({label, value, min, max, step = 1, onChange, format}: {label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string}) {
  return <label className="u-slider"><span>{label} <output>{format ? format(value) : value}</output></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}/></label>;
}
export function Segmented<T extends string>({label, value, options, onChange}: {label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void}) {
  const sound = useSound();
  return <div className="u-segmented" role="radiogroup" aria-label={label}>{options.map(([v, l]) =>
    <button type="button" role="radio" aria-checked={value === v} key={v} className={value === v ? 'on' : ''} onClick={() => { sound('click'); onChange(v); }}>{l}</button>)}</div>;
}
export function Action({children, onClick, primary = false, disabled = false}: {children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean}) {
  const sound = useSound();
  return <button type="button" className={'u-action ' + (primary ? 'primary' : '')} disabled={disabled} onClick={() => { sound('click'); onClick(); }}>{children}</button>;
}
export function Readout({children}: {children: ReactNode}) { return <div className="u-readout" aria-live="polite">{children}</div>; }

/* ---------- Dragging inside the SVG viewBox ---------- */
/** Draggable handle; supports pointer and keyboard (arrow keys move by `keyStep`). */
export function Handle({x, y, onMove, label, color = C.accent, r = 11, keyStep = 10}: {x: number; y: number; onMove: (x: number, y: number) => void; label: string; color?: string; r?: number; keyStep?: number}) {
  const dragging = useRef(false);
  const toSvg = useCallback((e: RPointerEvent<SVGGElement>) => {
    const svg = (e.currentTarget as SVGGElement).ownerSVGElement; if (!svg) return null;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); if (!m) return null;
    const p = pt.matrixTransform(m.inverse()); return [p.x, p.y] as const;
  }, []);
  return <g className="u-handle" tabIndex={0} role="slider" aria-label={label} aria-valuetext={`${Math.round(x)}, ${Math.round(y)}`}
    onPointerDown={e => { dragging.current = true; (e.currentTarget as Element).setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (!dragging.current) return; const p = toSvg(e); if (p) onMove(p[0], p[1]); }}
    onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}
    onKeyDown={(e: RKeyboardEvent<SVGGElement>) => { const d: Record<string, [number, number]> = {ArrowLeft: [-keyStep, 0], ArrowRight: [keyStep, 0], ArrowUp: [0, -keyStep], ArrowDown: [0, keyStep]}; const m = d[e.key]; if (m) { e.preventDefault(); onMove(x + m[0], y + m[1]); } }}>
    <circle cx={x} cy={y} r={r * 2.2} fill="transparent"/>
    <circle cx={x} cy={y} r={r} fill={color} stroke="#fff" strokeWidth={2}/>
  </g>;
}

/** Simple arrow between two points. */
export function Arrow({x1, y1, x2, y2, color = C.muted, width = 2, dash}: {x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dash?: string}) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
  return <g stroke={color} strokeWidth={width} fill={color}><line x1={x1} y1={y1} x2={x2 - Math.cos(a) * h * .6} y2={y2 - Math.sin(a) * h * .6} strokeDasharray={dash}/>
    <polygon stroke="none" points={`${x2},${y2} ${x2 - Math.cos(a - .45) * h},${y2 - Math.sin(a - .45) * h} ${x2 - Math.cos(a + .45) * h},${y2 - Math.sin(a + .45) * h}`}/></g>;
}

/** Pill-shaped equation banner. */
export function Banner({x = W / 2, y = 40, children, color = C.ink, size = 24, opacity = 1}: {x?: number; y?: number; children: ReactNode; color?: string; size?: number; opacity?: number}) {
  return <g opacity={opacity}><T x={x} y={y} size={size} color={color} weight={600}>{children}</T></g>;
}
