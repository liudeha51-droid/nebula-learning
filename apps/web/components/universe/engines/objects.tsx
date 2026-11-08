'use client';
import {useState} from 'react';
import {Stage, Obj, T, C, W, Stepper, Segmented, Readout, Action, useSound} from '../stage';
import {objects, type ObjectsConfig} from '@/lib/universe/engines/objects';
import {eseg, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const CELL = 56, FA = {x: 90, y: 150}, FB = {x: 430, y: 150};
const cell = (f: {x: number; y: number}, k: number) => ({x: f.x + ((k % 5) + .5) * CELL, y: f.y + (Math.floor(k / 5) + .5) * CELL});
function Frame({f, label, glow = false, color = C.line}: {f: {x: number; y: number}; label?: string; glow?: boolean; color?: string}) {
  return <g>{glow && <rect x={f.x - 6} y={f.y - 6} width={CELL * 5 + 12} height={CELL * 2 + 12} rx={10} fill={C.tens} opacity={.15}/>}
    {range(10).map(i => <rect key={i} x={f.x + (i % 5) * CELL} y={f.y + Math.floor(i / 5) * CELL} width={CELL} height={CELL} fill="none" stroke={color} strokeWidth={2}/>)}
    {label && <T x={f.x + CELL * 2.5} y={f.y + CELL * 2 + 28} size={22} color={C.muted}>{label}</T>}</g>;
}
type Tok = {x: number; y: number; color: string; opacity?: number; glow?: boolean; cross?: boolean};
const Tokens = ({list, kind}: {list: Tok[]; kind: ObjectsConfig['object']}) => <>{list.map((t, i) => <g key={i}><Obj kind={kind} x={t.x} y={t.y} r={19} color={t.color} opacity={t.opacity ?? 1} glow={t.glow}/>{t.cross && <path d={`M${t.x - 16} ${t.y - 16}L${t.x + 16} ${t.y + 16}M${t.x + 16} ${t.y - 16}L${t.x - 16} ${t.y + 16}`} stroke={C.bad} strokeWidth={4}/>}</g>)}</>;

function Scene({c, scene, p}: {c: ObjectsConfig; scene: number; p: number}) {
  const {a, b} = c; const k = c.object;
  if (c.mode === 'repeated') {
    const groups = scene < 2 ? 1 : scene === 2 ? 1 + Math.floor(p * b * .999) : scene === 3 ? b - Math.floor(p * (b + .999)) : b;
    const total = Math.max(0, groups) * a;
    return <g>{range(Math.max(0, groups)).map(g => <g key={g}><rect x={60} y={50 + g * 70} width={a * 52 + 20} height={56} rx={10} fill="none" stroke={C.line}/>{range(a).map(i => <Obj key={i} kind={k} x={80 + i * 52} y={78 + g * 70} r={18} color={g % 2 ? C.tens : C.ones}/>)}</g>)}
      <T x={620} y={150} size={70} weight={700} color={C.ones}>{total}</T>
      <T x={620} y={215} size={20} color={C.muted}>{groups > 0 ? Array(groups).fill(a).join(' + ') : '0'}</T>
      {scene >= 5 && <T x={620} y={280} size={24}>{Array(b).fill(a).join(' + ')} = {a * b}</T>}</g>;
  }
  const list: Tok[] = [];
  let left = '', right = '', banner = '', glowA = false;
  if (c.mode === 'add') {
    const join = scene === 2 ? eseg(p, .1, .8) : scene > 2 ? 1 : 0;
    range(a).forEach(i => list.push({...cell(FA, i), color: C.ones}));
    range(b).forEach(i => { const from = cell(FB, i), to = cell(FA, a + i); list.push({x: lerp(from.x, to.x, join), y: lerp(from.y, to.y, join), color: C.tens}); });
    left = join < 1 ? String(a) : String(a + b); right = join < 1 ? String(b) : '';
    if (scene === 3) banner = `${b} + ${a} = ${a + b}`; if (scene >= 4) banner = `${a} + ${b} = ${a + b}`;
  } else if (c.mode === 'subtract' || c.mode === 'mixed') {
    const out = c.mode === 'subtract' ? (scene === 2 ? p : scene === 3 ? 1 - eseg(p, .2, .8) : scene > 3 ? 1 : 0) : (scene === 2 ? p : scene > 2 ? 1 : 0);
    range(a).forEach(i => { const leaving = i >= a - b; const t = leaving ? seg(out, (a - 1 - i) / b * .7, (a - 1 - i) / b * .7 + .3) : 0; const q = cell(FA, i); list.push({x: q.x + t * 60, y: q.y - t * 140, color: leaving ? C.thousands : C.ones, opacity: 1 - t * .9}); });
    const on = c.mode === 'mixed' ? (scene === 3 ? p : scene > 3 ? 1 : 0) : 0;
    if (c.mode === 'mixed') range(c.c2).forEach(i => { const t = seg(on, i / c.c2 * .7, i / c.c2 * .7 + .3); const k2 = a - b + i; const slot = cell(k2 < 10 ? FA : FB, k2 % 10); list.push({x: lerp(W + 40, slot.x, t), y: slot.y, color: C.tens, opacity: t}); });
    const now = a - (out >= 1 ? b : 0) + (on >= 1 ? c.c2 : 0);
    left = String(now); banner = c.mode === 'subtract' ? (scene >= 4 ? `${a} − ${b} = ${a - b}` : '') : scene >= 4 ? `${a} − ${b} + ${c.c2} = ${a - b + c.c2}` : '';
  } else if (c.mode === 'make-ten') {
    const need = 10 - a; const move = scene === 3 ? p : scene > 3 ? 1 : 0;
    range(a).forEach(i => list.push({...cell(FA, i), color: C.ones}));
    range(b).forEach(i => { const moving = i >= b - need; const idx = moving ? i - (b - need) : -1; const t = moving ? eseg(move, idx / need * .6, idx / need * .6 + .4) : 0; const from = cell(FB, i), to = moving ? cell(FA, a + idx) : from; list.push({x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) - Math.sin(t * Math.PI) * 50, color: moving ? C.accent : C.tens}); });
    if (scene === 2) range(need).forEach(i => { const q = cell(FA, a + i); list.push({...q, color: C.accent, opacity: .25 + .25 * Math.sin(p * 14)}); });
    glowA = move >= 1; left = move >= 1 ? '10' : String(a); right = move >= 1 ? String(b - need) : String(b);
    if (scene >= 4) banner = scene === 4 ? `10 + ${b - need} = ${a + b}` : `${a} + ${b} = ${a} + ${need} + ${b - need} = ${a + b}`;
  } else {
    const ones = a - 10; const take = scene === 2 ? 0 : scene === 3 ? p : scene > 3 ? 1 : 0;
    range(10).forEach(i => { const leaving = i >= 10 - b; const t = leaving ? seg(take, (9 - i) / b * .6, (9 - i) / b * .6 + .4) : 0; const q = cell(FA, i); list.push({x: q.x - t * 40, y: q.y - t * 130, color: leaving ? C.thousands : C.tens, opacity: 1 - t * .92, cross: scene === 2 && leaving}); });
    const join = scene >= 4 ? eseg(scene === 4 ? p : 1, 0, .7) : 0;
    range(ones).forEach(i => { const from = cell(FB, i), to = cell(FA, 10 - b + i); list.push({x: lerp(from.x, to.x, join), y: lerp(from.y, to.y, join), color: C.ones}); });
    left = take >= 1 ? String(10 - b) : '10'; right = join >= 1 ? '' : String(ones);
    if (scene >= 4) banner = scene === 4 ? `${10 - b} + ${ones} = ${a - b}` : `${a} − ${b} = (10 − ${b}) + ${ones} = ${a - b}`;
  }
  return <g><Frame f={FA} label={left} glow={glowA}/>{(c.mode === 'make-ten' || c.mode === 'add' || c.mode === 'break-ten' || (c.mode === 'mixed' && a - b + c.c2 > 10)) && <Frame f={FB} label={right}/>}
    <Tokens list={list} kind={k}/>
    {scene === 1 && <T x={W / 2} y={60} size={26} color={C.accent}>{c.mode === 'add' ? `${a} + ${b} = ?` : c.mode === 'make-ten' ? `${a} + ${b} = ?` : c.mode === 'mixed' ? `${a} − ${b} + ${c.c2} = ?` : `${a} − ${b} = ?`}</T>}
    {banner && <T x={W / 2} y={60} size={28} weight={600}>{banner}</T>}
    {scene === 6 && <T x={W / 2} y={410} size={18} color={C.accent}>Now try it yourself in Explore, then solve the challenge.</T>}</g>;
}

function Explore({c}: {c: ObjectsConfig}) {
  const sound = useSound();
  const twoFrames = c.mode === 'make-ten' || c.mode === 'break-ten';
  const [a, setA] = useState(c.mode === 'break-ten' ? 10 : c.a); const [b, setB] = useState(c.mode === 'break-ten' ? c.a - 10 : c.b);
  const [strategy, setStrategy] = useState<'make-ten' | 'count-on' | 'doubles'>('make-ten');
  const [removed, setRemoved] = useState(0);
  const sum = a + b;
  if (!twoFrames || c.mode === 'break-ten') {
    // Free play: build a group, take some away, see the sentence.
    const total = c.mode === 'break-ten' ? a + b : a;
    return <Stage label={`Ten-frames with ${total} objects; ${removed} taken away`} controls={<>
      {c.mode !== 'break-ten' && <Stepper label="Start with" value={a} min={0} max={10} onChange={v => { setA(v); setRemoved(0); }}/>}
      <Action onClick={() => { if (removed < total) { setRemoved(removed + 1); sound('whoosh'); } }} disabled={removed >= total}>Take one away</Action>
      <Action onClick={() => { if (removed > 0) { setRemoved(removed - 1); sound('click'); } }} disabled={removed === 0}>Put one back</Action>
      <Readout>{total} − {removed} = {total - removed}{removed > 0 ? ` · check: ${total - removed} + ${removed} = ${total}` : ''}</Readout></>}>
      <Frame f={FA}/>{total > 10 && <Frame f={FB}/>}
      <Tokens kind={c.object} list={range(total).map(i => ({...cell(i < 10 ? FA : FB, i % 10), color: i >= total - removed ? C.thousands : i < 10 ? C.tens : C.ones, opacity: i >= total - removed ? .15 : 1}))}/>
      <T x={W / 2} y={60} size={28}>{total} − {removed} = {total - removed}</T>
    </Stage>;
  }
  const inA = Math.min(10, a + removed); const inB = b - (inA - a);
  const strategies = {
    'make-ten': `${a} + ${b} = ${a} + ${10 - a} + ${b - (10 - a)} = 10 + ${b - (10 - a)} = ${sum}`,
    'count-on': `Start at ${a}, count on ${b}: ${range(b).map(i => a + i + 1).join(', ')}`,
    doubles: `${Math.min(a, b)} + ${Math.min(a, b)} = ${2 * Math.min(a, b)}, plus ${Math.abs(a - b)} more = ${sum}`,
  };
  return <Stage label={`${a} + ${b}. First frame has ${inA}, second has ${inB}.`} controls={<>
    <Stepper label="First" value={a} min={1} max={10} onChange={v => { setA(v); setRemoved(0); }}/><Stepper label="Second" value={b} min={1} max={10} onChange={v => { setB(v); setRemoved(0); }}/>
    <Segmented label="Strategy" value={strategy} onChange={setStrategy} options={[['make-ten', 'Make ten'], ['count-on', 'Count on'], ['doubles', 'Near doubles']]}/>
    <Action onClick={() => setRemoved(0)}>Reset</Action><Readout>{strategies[strategy]}</Readout></>}>
    <Frame f={FA} label={String(inA)} glow={inA === 10}/><Frame f={FB} label={String(inB)}/>
    <Tokens kind={c.object} list={range(inA).map(i => ({...cell(FA, i), color: i < a ? C.ones : C.accent}))}/>
    {range(inB).map(i => { const q = cell(FB, i); return <Obj key={i} kind={c.object} x={q.x} y={q.y} r={19} color={C.tens} label={`Move one ${c.object} into the first frame`} onClick={() => { if (inA < 10) { setRemoved(removed + 1); sound(inA + 1 === 10 ? 'group' : 'click'); } else sound('error'); }}/>; })}
    <T x={W / 2} y={60} size={24}>{inA < 10 ? `Tap a ${c.object} in the second frame to fill the first frame` : `${a} + ${b} = 10 + ${inB} = ${sum}`}</T>
  </Stage>;
}

export const objectsView: EngineView<ObjectsConfig> = {
  Scene: props => <Stage label={objects.describe(props.c)}><Scene {...props}/></Stage>,
  Explore,
};
