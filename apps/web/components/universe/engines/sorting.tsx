'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Segmented, Slider, Stepper, Action, useSound} from '../stage';
import {sorting, THINGS, GLYPHS, patternAt, type SortConfig, type Thing} from '@/lib/universe/engines/sorting';
import {eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const COLOR = {red: '#ff8a8a', blue: C.accent, yellow: C.ones};
function Shape({t, x, y}: {t: Thing; x: number; y: number}) {
  const r = t.size === 'big' ? 18 : 11; const f = COLOR[t.color];
  return t.shape === 'circle' ? <circle cx={x} cy={y} r={r} fill={f}/> : t.shape === 'square' ? <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx={3} fill={f}/> : <polygon points={`${x},${y - r} ${x + r},${y + r * .8} ${x - r},${y + r * .8}`} fill={f}/>;
}
const groupsOf = (rule: SortConfig['rule']) => (rule === 'color' ? ['red', 'blue', 'yellow'] : rule === 'shape' ? ['circle', 'square', 'triangle'] : ['big', 'small']);
const keyOf = (t: Thing, rule: SortConfig['rule']) => (rule === 'color' ? t.color : rule === 'shape' ? t.shape : t.size);
function Sorted({rule, t, prevRule}: {rule: SortConfig['rule']; t: number; prevRule?: SortConfig['rule']}) {
  const pos = (r: SortConfig['rule'] | undefined, th: Thing, i: number) => { if (!r) return {x: 80 + i * 55, y: 100}; const gs = groupsOf(r); const g = gs.indexOf(keyOf(th, r)); const idx = THINGS.slice(0, i).filter(o => keyOf(o, r) === keyOf(th, r)).length; return {x: 150 + g * (520 / (gs.length - 1 || 1)) - 40 + (idx % 3) * 40, y: 260 + Math.floor(idx / 3) * 44}; };
  const gs = groupsOf(rule);
  return <g>{gs.map((g, i) => <g key={g}><rect x={150 + i * (520 / (gs.length - 1 || 1)) - 70} y={225} width={140} height={150} rx={12} fill="none" stroke={C.line} strokeDasharray="5 5"/><T x={150 + i * (520 / (gs.length - 1 || 1))} y={395} size={14} color={C.muted}>{g} ({THINGS.filter(th => keyOf(th, rule) === g).length})</T></g>)}
    {THINGS.map((th, i) => { const a = pos(prevRule, th, i), b = pos(rule, th, i); const ti = eseg(t, i / 24, i / 24 + .5); return <Shape key={i} t={th} x={lerp(a.x, b.x, ti)} y={lerp(a.y, b.y, ti)}/>; })}</g>;
}
function TwoWay({t}: {t: number}) {
  return <g>{[['red & circle', 0, 0], ['red, not circle', 1, 0], ['not red & circle', 0, 1], ['not red, not circle', 1, 1]].map(([l, cx, cy]) => <g key={l as string}><rect x={200 + (cx as number) * 220} y={150 + (cy as number) * 130} width={200} height={115} rx={10} fill="none" stroke={C.line}/><T x={300 + (cx as number) * 220} y={252 + (cy as number) * 130} size={12} color={C.muted}>{l} ({THINGS.filter(th => (th.color === 'red') === (cy === 0) && (th.shape === 'circle') === (cx === 0)).length})</T></g>)}
    <T x={150} y={207} size={14} anchor="end">red</T><T x={150} y={337} size={14} anchor="end">not red</T><T x={300} y={135} size={14}>circle</T><T x={520} y={135} size={14}>not circle</T>
    {THINGS.map((th, i) => { const cy = th.color === 'red' ? 0 : 1, cx = th.shape === 'circle' ? 0 : 1; const idx = THINGS.slice(0, i).filter(o => (o.color === 'red' ? 0 : 1) === cy && (o.shape === 'circle' ? 0 : 1) === cx).length; const ti = eseg(t, i / 24, i / 24 + .5);
      return <Shape key={i} t={th} x={lerp(80 + i * 55, 230 + cx * 220 + (idx % 4) * 42, ti)} y={lerp(70, 185 + cy * 130 + Math.floor(idx / 4) * 40, ti)}/>; })}</g>;
}
function Beads({unit, n, group = false, missing = -1}: {unit: number; n: number; group?: boolean; missing?: number}) {
  return <g>{range(n).map(i => <g key={i}>{group && i % unit === 0 && <rect x={70 + i * 46 - 20} y={180} width={unit * 46 - 6} height={60} rx={14} fill="none" stroke={C.accent} strokeDasharray="4 4"/>}
    {i === missing ? <T x={70 + i * 46} y={210} size={30} color={C.unknown}>?</T> : <T x={70 + i * 46} y={210} size={30} color={[C.ones, C.tens, C.hundreds, C.thousands][i % unit]}>{patternAt(unit, i)}</T>}<T x={70 + i * 46} y={250} size={10} color={C.faint}>{i + 1}</T></g>)}</g>;
}
function Squares({n, highlightNew = false}: {n: number; highlightNew?: boolean}) {
  const s = 46, x0 = W / 2 - (n * s) / 2, y0 = 160; const seg = (x1: number, y1: number, x2: number, y2: number, k: string, isNew: boolean) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isNew && highlightNew ? C.unknown : C.ones} strokeWidth={6} strokeLinecap="round"/>;
  return <g>{seg(x0, y0, x0, y0 + s, 'l', false)}{range(n).map(i => [seg(x0 + i * s, y0, x0 + (i + 1) * s, y0, 't' + i, i === n - 1), seg(x0 + i * s, y0 + s, x0 + (i + 1) * s, y0 + s, 'b' + i, i === n - 1), seg(x0 + (i + 1) * s, y0, x0 + (i + 1) * s, y0 + s, 'r' + i, i === n - 1)])}</g>;
}

function Scene({c, scene, p}: {c: SortConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'multi': return <g><TwoWay t={scene < 2 ? 0 : scene === 2 ? p * .5 : scene === 3 ? .5 + p * .5 : 1}/></g>;
    case 'pattern': return <g><Beads unit={c.unit} n={scene < 2 ? 3 * c.unit : 4 * c.unit} group={scene >= 3} missing={scene === 1 ? 3 * c.unit - 1 : -1}/><T x={W / 2} y={80} size={22} weight={600}>{scene >= 4 ? `20th = ${patternAt(c.unit, 19)} (20 ÷ ${c.unit} remainder ${20 % c.unit})` : scene >= 2 ? `unit: ${GLYPHS.slice(0, c.unit).join(' ')}` : 'What comes next?'}</T></g>;
    case 'number-pattern': { const hops = scene < 2 ? 0 : scene === 2 ? p * 3 : scene === 3 ? 3 : 4; const max = c.start + 5 * c.step; const X = (v: number) => 80 + (v / max) * 640; const k = Math.floor(hops), f = hops - k; const pos = c.start + (k + eseg(f, 0, 1)) * c.step;
      return <g><line x1={80} x2={720} y1={300} y2={300} stroke={C.muted} strokeWidth={2}/>{range(max + 1).filter(v => v % Math.max(1, Math.round(max / 20)) === 0 || v % c.step === c.start % c.step).map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={292} y2={308} stroke={C.muted}/><T x={X(v)} y={326} size={11} color={C.muted}>{v}</T></g>)}
        {range(k).map(i => <path key={i} d={`M${X(c.start + i * c.step)} 290 Q${X(c.start + (i + .5) * c.step)} 220 ${X(c.start + (i + 1) * c.step)} 290`} fill="none" stroke={C.tens} strokeWidth={2}/>)}<circle cx={X(pos)} cy={290 - Math.sin(f * Math.PI) * 60} r={12} fill={C.good}/>
        <T x={W / 2} y={80} size={22} weight={600}>{range(Math.min(5, k + 1)).map(i => c.start + i * c.step).join(', ')}{scene >= 4 ? '' : ', …'}</T>{scene >= 3 && <T x={W / 2} y={120} size={18} color={C.tens}>rule: + {c.step}</T>}</g>; }
    case 'growing': { const n = scene < 2 ? 1 : scene === 2 ? 1 + Math.floor(p * 4) : 4; return <g><Squares n={n} highlightNew={scene === 2}/><T x={W / 2} y={80} size={22} weight={600}>{n} square{n > 1 ? 's' : ''}: {c.first + (n - 1) * c.step} matchsticks</T>
      {scene >= 3 && range(4).map(i => <T key={i} x={200 + i * 130} y={300} size={18}>{i + 1} → {c.first + i * c.step}</T>)}{scene >= 4 && <T x={W / 2} y={370} size={22} color={C.accent}>n squares: {c.step}n + {c.first - c.step}</T>}</g>; }
    default: { const other = c.rule === 'color' ? 'shape' : 'color'; return scene < 2 ? <Sorted rule={c.rule} t={0}/> : scene === 2 ? <Sorted rule={c.rule} t={p}/> : <Sorted rule={other} prevRule={c.rule} t={scene === 3 ? p : 1}/>; }
  }
}

function Explore({c}: {c: SortConfig}) {
  const sound = useSound();
  const [rule, setRule] = useState<SortConfig['rule']>(c.rule); const [prev, setPrev] = useState<SortConfig['rule'] | undefined>(undefined); const [unit, setUnit] = useState(c.unit); const [guess, setGuess] = useState<string | null>(null); const [n, setN] = useState(3); const [step, setStep] = useState(c.step);
  if (c.mode === 'pattern') { const target = 4 * unit; return <Stage label="Pattern" controls={<><Stepper label="Unit length" value={unit} min={2} max={4} onChange={u => { setUnit(u); setGuess(null); }}/>{GLYPHS.slice(0, unit).map(g => <Action key={g} onClick={() => { setGuess(g); sound(g === patternAt(unit, target) ? 'success' : 'error'); }}>{g}</Action>)}<Readout>{guess ? (guess === patternAt(unit, target) ? `Yes! Position ${target + 1} is ${guess}.` : `Not quite — try finding the unit.`) : `Which bead is at position ${target + 1}?`}</Readout></>}>
    <Beads unit={unit} n={Math.min(15, target + 1)} missing={Math.min(14, target)} group={guess !== null}/></Stage>; }
  if (c.mode === 'growing') return <Stage label="Squares" controls={<><Slider label="Squares" value={n} min={1} max={10} onChange={setN}/><Readout>{n} squares → {3 * n + 1} matchsticks (3n + 1)</Readout></>}><Squares n={n}/></Stage>;
  if (c.mode === 'number-pattern') return <Stage label="Number pattern" controls={<><Stepper label="Step" value={step} min={1} max={10} onChange={setStep}/><Readout>{range(6).map(i => c.start + i * step).join(', ')}, …</Readout></>}><Scene c={{...c, step}} scene={4} p={1}/></Stage>;
  if (c.mode === 'multi') return <Stage label="Two-way sort" controls={<Readout>Each thing is in exactly one box.</Readout>}><TwoWay t={1}/></Stage>;
  return <Stage label={`Sorted by ${rule}`} controls={<><Segmented label="Rule" value={rule} onChange={r => { setPrev(rule); setRule(r); }} options={[['color', 'Colour'], ['shape', 'Shape'], ['size', 'Size']]}/><Readout>{groupsOf(rule).map(g => `${g}: ${THINGS.filter(th => keyOf(th, rule) === g).length}`).join(' · ')} · total 12</Readout></>}>
    <g key={rule}><SortAnim rule={rule} prev={prev}/></g></Stage>;
}
function SortAnim({rule, prev}: {rule: SortConfig['rule']; prev?: SortConfig['rule']}) { return <Sorted rule={rule} prevRule={prev} t={1}/>; }

export const sortingView: EngineView<SortConfig> = {Scene: props => <Stage label={sorting.describe(props.c)}><Scene {...props}/></Stage>, Explore};
