'use client';
import {useState} from 'react';
import {Stage, T, C, W, Block, Stepper, Readout, Action, useSound} from '../stage';
import {placeValue, PLACE_NAMES, PLACE_ZH, readChinese, groupFours, type PlaceConfig} from '@/lib/universe/engines/place-value';
import {digits, eseg, fmt, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const PC = [C.ones, C.tens, C.hundreds, C.thousands];
const pc = (i: number) => PC[i % 4];

/** Blocks for a count in one column (stacked compactly). */
function ColumnBlocks({place, count, x, y, s = 7}: {place: 0 | 1 | 2 | 3; count: number; x: number; y: number; s?: number}) {
  return <g>{range(count).map(i => {
    if (place === 0) return <Block key={i} place={0} x={x + (i % 5) * (s + 3)} y={y + Math.floor(i / 5) * (s + 3)} s={s}/>;
    if (place === 1) return <Block key={i} place={1} x={x + i * (s + 3)} y={y} s={s}/>;
    if (place === 2) return <Block key={i} place={2} x={x + (i % 3) * 8} y={y + i * 12} s={s * .9}/>;
    return <Block key={i} place={3} x={x + (i % 2) * 14} y={y + i * 16} s={s * .8}/>;
  })}</g>;
}
function PlaceTable({ds, x0 = 80, width = 640, top = 90, highlight = -1, showBlocks = true}: {ds: number[]; x0?: number; width?: number; top?: number; highlight?: number; showBlocks?: boolean}) {
  const n = ds.length, w = width / n;
  return <g>{range(n).map(j => { const i = n - 1 - j; const x = x0 + j * w; return <g key={i}>
    <rect x={x} y={top} width={w - 6} height={260} rx={10} fill={i === highlight ? '#ffffff12' : C.panel} stroke={i === highlight ? pc(i) : C.line}/>
    <T x={x + w / 2 - 3} y={top + 20} size={13} color={pc(i)}>{PLACE_NAMES[i]}</T>
    {showBlocks && <ColumnBlocks place={Math.min(i, 3) as 0 | 1 | 2 | 3} count={ds[i]} x={x + 14} y={top + 42} s={i === 0 ? 9 : 7}/>}
    <T x={x + w / 2 - 3} y={top + 228} size={44} weight={700} color={pc(i)}>{ds[i]}</T></g>; })}</g>;
}

function BuildScene({c, scene, p}: {c: PlaceConfig; scene: number; p: number}) {
  const ds = digits(c.value, c.places);
  if (scene === 0 || scene === 1) { const shown = Math.min(c.value, 300); const pour = scene === 0 ? p : 1;
    return <g>{range(Math.floor(shown * pour)).map(i => <Block key={i} place={0} x={140 + (i % 30) * 17 + ((i * 7) % 5)} y={360 - Math.floor(i / 30) * 17 - ((i * 13) % 6)} s={12}/>)}
      <T x={W / 2} y={60} size={26}>{scene === 0 ? `${fmt(Math.floor(c.value * pour))} unit cubes…` : 'How can we count these quickly?'}</T>{c.value > 300 && <T x={W / 2} y={95} size={14} color={C.muted}>(showing the first 300)</T>}</g>; }
  if (scene === 2 || scene === 3) {
    const t = eseg(p, .15, .75); const big = scene === 3; const s = 14;
    return <g><T x={W / 2} y={50} size={26}>{big ? '10 tens → 1 hundred' : '10 ones → 1 ten'}</T>
      {range(10).map(i => big ? <Block key={i} place={1} x={lerp(120 + i * 58, 300 + i * s, t)} y={110} s={s}/> : <Block key={i} place={0} x={lerp(160 + i * 50, 380, t)} y={lerp(200, 110 + i * 22, t)} s={lerp(30, 22, t)}/>)}
      {t >= 1 && (big ? <rect x={300} y={110} width={s * 10} height={s * 10} fill="none" stroke="#fff" strokeWidth={3} rx={3}/> : <rect x={380} y={110} width={22} height={220} fill="none" stroke="#fff" strokeWidth={3} rx={3}/>)}
      <T x={W / 2} y={400} size={18} color={C.muted} opacity={seg(p, .7, .9)}>{big ? (c.places > 3 ? 'Exchange complete. Ten hundreds become one thousand in the same way.' : 'Exchange complete: one hundred.') : 'Exchange complete: one ten.'}</T></g>;
  }
  return <g><PlaceTable ds={ds} highlight={scene === 4 ? c.places - 1 - Math.min(c.places - 1, Math.floor(p * c.places)) : -1}/>
    <T x={W / 2} y={50} size={26} weight={600}>{scene === 4 ? fmt(c.value) : `${fmt(c.value)} = ${ds.map((d, i) => d * 10 ** i).reverse().filter(v => v > 0).map(v => fmt(v)).join(' + ')}`}</T>
    {scene === 6 && <T x={W / 2} y={395} size={18} color={C.accent}>Build your own numbers in Explore.</T>}</g>;
}
function BuildExplore({c}: {c: PlaceConfig}) {
  const sound = useSound();
  const [ds, setDs] = useState<number[]>(() => digits(c.value, c.places));
  const [flash, setFlash] = useState('');
  const change = (i: number, delta: number) => {
    const next = [...ds]; next[i] += delta; let msg = '';
    for (let k = i; k < next.length; k++) {
      if (next[k] === 10 && k < next.length - 1) { next[k] = 0; next[k + 1] += 1; msg = `10 ${PLACE_NAMES[k]} → 1 ${PLACE_NAMES[k + 1].replace(/s$/, '')}`; }
      if (next[k] < 0 && k < next.length - 1 && next.slice(k + 1).some(v => v > 0)) { next[k] = 9; next[k + 1] -= 1; msg = `1 ${PLACE_NAMES[k + 1].replace(/s$/, '')} → 10 ${PLACE_NAMES[k]}`; }
    }
    if (next.some(v => v < 0 || v > 9)) { sound('error'); return; }
    setDs(next); setFlash(msg); sound(msg ? 'group' : 'click');
  };
  const value = ds.reduce((s, d, i) => s + d * 10 ** i, 0);
  return <Stage label={`Place-value machine showing ${fmt(value)}`} controls={<>{[...ds.keys()].reverse().map(i => <span key={i} className="u-stepper"><span style={{color: pc(i)}}>{PLACE_NAMES[i]}</span>
    <button aria-label={`Remove one ${PLACE_NAMES[i]}`} onClick={() => change(i, -1)}>−</button><button aria-label={`Add one ${PLACE_NAMES[i]}`} onClick={() => change(i, 1)}>+</button></span>)}
    <Readout>{flash ? `Exchange! ${flash}` : `${fmt(value)} = ${ds.map((d, i) => d * 10 ** i).reverse().filter(v => v > 0).map(v => fmt(v)).join(' + ') || '0'}`}</Readout></>}>
    <PlaceTable ds={ds}/><T x={W / 2} y={50} size={30} weight={700}>{fmt(value)}</T>
  </Stage>;
}

function CompareTables({a, b, upTo}: {a: number; b: number; upTo: number}) {
  const len = Math.max(String(a).length, String(b).length); const da = digits(a, len), db = digits(b, len);
  return <g>{range(len).map(j => { const i = len - 1 - j; const x = 170 + j * 120; const lit = i >= upTo; const diff = da[i] !== db[i];
    return <g key={i}><rect x={x} y={90} width={100} height={240} rx={10} fill={lit ? (diff ? '#ffd27a22' : '#ffffff0d') : C.panel} stroke={lit && diff ? C.warn : C.line}/>
      <T x={x + 50} y={110} size={13} color={pc(i)}>{PLACE_NAMES[i]}</T><T x={x + 50} y={175} size={48} weight={700} color={pc(i)}>{da[i]}</T><T x={x + 50} y={280} size={48} weight={700} color={pc(i)}>{db[i]}</T>
      {lit && <T x={x + 50} y={228} size={26} color={diff ? C.warn : C.good}>{diff ? (da[i] > db[i] ? '>' : '<') : '='}</T>}</g>; })}
    <T x={100} y={175} size={16} color={C.muted}>A</T><T x={100} y={280} size={16} color={C.muted}>B</T></g>;
}
function CompareScene({c, scene, p}: {c: PlaceConfig; scene: number; p: number}) {
  const len = Math.max(String(c.value).length, String(c.other).length); const a = digits(c.value, len), b = digits(c.other, len); let k = len - 1; while (k > 0 && a[k] === b[k]) k--;
  const upTo = scene < 2 ? len : scene === 2 ? Math.max(k, len - 1 - Math.floor(p * (len - k))) : k;
  return <g><CompareTables a={c.value} b={c.other} upTo={upTo}/><T x={W / 2} y={50} size={26} weight={600}>{scene >= 4 ? `${fmt(c.value)} ${c.value > c.other ? '>' : '<'} ${fmt(c.other)}` : `${fmt(c.value)}  ?  ${fmt(c.other)}`}</T></g>;
}
function CompareExplore({c}: {c: PlaceConfig}) {
  const [a, setA] = useState(c.value), [b, setB] = useState(c.other);
  const len = Math.max(String(a).length, String(b).length); const da = digits(a, len), db = digits(b, len); let k = len - 1; while (k > 0 && da[k] === db[k]) k--;
  return <Stage label={`${a} compared with ${b}`} controls={<><Stepper label="A" value={a} min={0} max={9999} step={1} onChange={setA}/><Stepper label="B" value={b} min={0} max={9999} onChange={setB}/>
    <Action onClick={() => setA(Math.min(9999, a + 100))}>A + 100</Action><Action onClick={() => setB(Math.min(9999, b + 10))}>B + 10</Action>
    <Readout>{a === b ? 'Equal' : `Decided in the ${PLACE_NAMES[k]} place: ${fmt(a)} ${a > b ? '>' : '<'} ${fmt(b)}`}</Readout></>}>
    <CompareTables a={a} b={b} upTo={a === b ? 0 : k}/><T x={W / 2} y={50} size={28}>{fmt(a)} {a === b ? '=' : a > b ? '>' : '<'} {fmt(b)}</T></Stage>;
}

function DigitStrip({digit, place, places, show}: {digit: number; place: number; places: number; show: number}) {
  const w = 600 / places;
  return <g>{range(places).map(j => { const i = places - 1 - j; return <g key={i}><rect x={100 + j * w} y={90} width={w - 6} height={110} rx={8} fill={C.panel} stroke={i === place ? pc(i) : C.line}/><T x={100 + j * w + w / 2 - 3} y={110} size={12} color={pc(i)}>{PLACE_NAMES[i]}</T>
    <T x={100 + j * w + w / 2 - 3} y={160} size={44} weight={700} color={i === place ? pc(i) : C.faint}>{i === place ? digit : i < place ? 0 : ''}</T></g>; })}
    {range(show).map(i => { const v = digit * 10 ** i; const bw = Math.max(4, Math.log10(v + 1) / Math.log10(digit * 10 ** places + 1) * 600); return <g key={i}><rect x={100} y={230 + i * 34} width={bw} height={24} rx={5} fill={pc(i)} opacity={i === place ? 1 : .35}/><T x={110 + bw} y={242 + i * 34} anchor="start" size={15}>{digit} {PLACE_NAMES[i]} = {fmt(v)}</T></g>; })}</g>;
}
function DigitScene({c, scene, p}: {c: PlaceConfig; scene: number; p: number}) {
  const place = scene < 2 ? 0 : scene === 2 ? Math.min(c.places - 1, Math.floor(p * c.places)) : c.places - 1;
  return <g><DigitStrip digit={c.digit} place={place} places={c.places} show={scene >= 3 ? c.places : place + 1}/><T x={W / 2} y={50} size={24}>{scene >= 5 ? `${c.digit} in the ${PLACE_NAMES[place]} place = ${fmt(c.digit * 10 ** place)}` : `${c.digit} is worth ${fmt(c.digit * 10 ** place)} here`}</T>
    {scene >= 3 && <T x={W - 60} y={250} size={13} color={C.muted} anchor="end">bar length on a log scale</T>}</g>;
}
function DigitExplore({c}: {c: PlaceConfig}) {
  const [place, setPlace] = useState(0), [digit, setDigit] = useState(c.digit);
  return <Stage label={`${digit} in the ${PLACE_NAMES[place]} place is ${digit * 10 ** place}`} controls={<><Stepper label="Digit" value={digit} min={1} max={9} onChange={setDigit}/><Stepper label="Place" value={place} min={0} max={c.places - 1} onChange={setPlace} format={v => PLACE_NAMES[v]}/><Readout>{digit} × {fmt(10 ** place)} = {fmt(digit * 10 ** place)}</Readout></>}>
    <DigitStrip digit={digit} place={place} places={c.places} show={place + 1}/></Stage>;
}

function LargeView({value, stage}: {value: number; stage: number}) {
  const s = String(value); const len = s.length; const cw = Math.min(56, 640 / len); const x0 = W / 2 - (len * cw) / 2;
  const levelOf = (i: number) => Math.floor(i / 4); const levelNames = ['个级 ones', '万级 ten-thousands', '亿级 hundred-millions'];
  return <g>{s.split('').map((d, j) => { const i = len - 1 - j; const lv = levelOf(i); const gap = stage >= 1 ? (2 - lv) * 14 : 0;
    return <g key={j}><rect x={x0 + j * cw + gap - 14} y={150} width={cw - 4} height={70} rx={6} fill={stage >= 1 ? [C.ones, C.tens, C.hundreds][lv] + '22' : C.panel} stroke={C.line}/>
      <T x={x0 + j * cw + gap - 14 + (cw - 4) / 2} y={186} size={34} weight={700} color={stage >= 1 ? [C.ones, C.tens, C.hundreds][lv] : C.ink}>{d}</T>
      {stage >= 2 && <T x={x0 + j * cw + gap - 14 + (cw - 4) / 2} y={238} size={12} color={C.muted}>{PLACE_ZH[i]}</T>}</g>; })}
    {stage >= 2 && groupFours(value).map((g, k, arr) => { const lv = arr.length - 1 - k; return <T key={k} x={W / 2 + (k - (arr.length - 1) / 2) * 200} y={280} size={14} color={[C.ones, C.tens, C.hundreds][lv]}>{levelNames[lv]}</T>; })}
    {stage >= 3 && <><T x={W / 2} y={340} size={32} weight={600}>{readChinese(value)}</T><T x={W / 2} y={380} size={16} color={C.muted}>International grouping: {fmt(value)}</T></>}</g>;
}
function LargeScene({c, scene}: {c: PlaceConfig; scene: number; p: number}) {
  return <g><T x={W / 2} y={70} size={24}>{scene < 2 ? fmt(c.value) : groupFours(c.value).join(' | ')}</T><LargeView value={c.value} stage={scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? 2 : 3}/></g>;
}
function LargeExplore({c}: {c: PlaceConfig}) {
  const [v, setV] = useState(c.value); const [raw, setRaw] = useState(String(c.value));
  return <Stage label={`${v} read as ${readChinese(v)}`} controls={<><label className="u-slider">Type a number <input style={{width: 180}} inputMode="numeric" value={raw} onChange={e => { const t = e.target.value.replace(/\D/g, '').slice(0, 12); setRaw(t); const n = Number(t); if (t && n < 1e12) setV(n); }}/></label>
    <Action onClick={() => { const n = Math.min(999999999999, v * 10); setV(n); setRaw(String(n)); }}>× 10</Action><Action onClick={() => { const n = Math.floor(v / 10); setV(n); setRaw(String(n)); }}>÷ 10</Action>
    <Readout>{readChinese(v)} · {fmt(v)}</Readout></>}><LargeView value={v} stage={3}/></Stage>;
}

function ShiftView({digit, place, places = 5}: {digit: number; place: number; places?: number}) {
  const w = 120;
  return <g>{range(places).map(j => { const i = places - 1 - j; return <g key={i}><rect x={100 + j * w} y={140} width={w - 8} height={120} rx={10} fill={C.panel} stroke={C.line}/><T x={100 + j * w + 56} y={160} size={12} color={pc(i)}>{PLACE_NAMES[i]}</T>
    {i < place && <T x={100 + j * w + 56} y={210} size={50} weight={700} color={C.faint}>0</T>}</g>; })}
    <T x={100 + (places - 1 - place) * w + 56} y={210} size={56} weight={700} color={pc(Math.round(place))}>{digit}</T>
    <T x={W / 2} y={320} size={30} weight={600}>{fmt(digit * 10 ** Math.round(place))}</T></g>;
}
function ShiftScene({c, scene, p}: {c: PlaceConfig; scene: number; p: number}) {
  const place = scene < 2 ? 0 : scene === 2 ? Math.min(3, p * 3.6) : scene === 3 ? 3 - eseg(p, .2, .8) : scene >= 4 ? 2 : 0;
  return <g><ShiftView digit={c.digit} place={place}/><T x={W / 2} y={70} size={24}>{scene === 3 ? '÷ 10: one place right' : scene >= 4 ? 'Each place = 10 × the place on its right' : '× 10: one place left'}</T></g>;
}
function ShiftExplore({c}: {c: PlaceConfig}) {
  const [place, setPlace] = useState(0); const sound = useSound();
  return <Stage label={`${c.digit} times ten to the ${place}`} controls={<><Action onClick={() => { if (place < 4) { setPlace(place + 1); sound('whoosh'); } }} disabled={place >= 4}>× 10</Action><Action onClick={() => { if (place > 0) { setPlace(place - 1); sound('whoosh'); } }} disabled={place === 0}>÷ 10</Action><Readout>{c.digit} × {fmt(10 ** place)} = {fmt(c.digit * 10 ** place)}</Readout></>}>
    <ShiftView digit={c.digit} place={place}/></Stage>;
}

export const placeValueView: EngineView<PlaceConfig> = {
  Scene: props => <Stage label={placeValue.describe(props.c)}>{props.c.mode === 'compare' ? <CompareScene {...props}/> : props.c.mode === 'digit' ? <DigitScene {...props}/> : props.c.mode === 'large' ? <LargeScene {...props}/> : props.c.mode === 'shift' ? <ShiftScene {...props}/> : <BuildScene {...props}/>}</Stage>,
  Explore: ({c}) => c.mode === 'compare' ? <CompareExplore c={c}/> : c.mode === 'digit' ? <DigitExplore c={c}/> : c.mode === 'large' ? <LargeExplore c={c}/> : c.mode === 'shift' ? <ShiftExplore c={c}/> : <BuildExplore c={c}/>,
};
