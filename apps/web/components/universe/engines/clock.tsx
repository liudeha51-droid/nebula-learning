'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Handle} from '../stage';
import {clock, hm, daysIn, isLeap, weekday, MONTHS, type ClockConfig} from '@/lib/universe/engines/clock';
import {eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const rad = (d: number) => (d - 90) * Math.PI / 180;
/** Clock face; time in minutes since 0:00, hands derived continuously. */
function Face({mins, cx = W / 2, cy = 230, r = 160, ring24 = false}: {mins: number; cx?: number; cy?: number; r?: number; ring24?: boolean}) {
  const mAng = (mins % 60) * 6, hAng = ((mins / 60) % 12) * 30;
  const hand = (ang: number, len: number, w: number, col: string) => <line x1={cx} y1={cy} x2={cx + len * Math.cos(rad(ang))} y2={cy + len * Math.sin(rad(ang))} stroke={col} strokeWidth={w} strokeLinecap="round"/>;
  return <g><circle cx={cx} cy={cy} r={r} fill="#f4f1fb" stroke={C.hundreds} strokeWidth={6}/>{range(60).map(i => <line key={i} x1={cx + (r - (i % 5 ? 8 : 16)) * Math.cos(rad(i * 6))} y1={cy + (r - (i % 5 ? 8 : 16)) * Math.sin(rad(i * 6))} x2={cx + (r - 3) * Math.cos(rad(i * 6))} y2={cy + (r - 3) * Math.sin(rad(i * 6))} stroke="#2a2638" strokeWidth={i % 5 ? 1 : 3}/>)}
    {range(12).map(i => <T key={i} x={cx + (r - 34) * Math.cos(rad((i + 1) * 30))} y={cy + (r - 34) * Math.sin(rad((i + 1) * 30))} size={22} weight={700} color="#2a2638">{i + 1}</T>)}
    {ring24 && range(12).map(i => <T key={'x' + i} x={cx + (r - 62) * Math.cos(rad((i + 1) * 30))} y={cy + (r - 62) * Math.sin(rad((i + 1) * 30))} size={12} color={C.thousands}>{i + 13 === 24 ? 0 : i + 13}</T>)}
    {hand(hAng, r * .5, 9, C.thousands)}{hand(mAng, r * .78, 5, '#2a2638')}<circle cx={cx} cy={cy} r={8} fill="#2a2638"/></g>;
}
function Timeline({start, end, upTo}: {start: number; end: number; upTo: number}) {
  const lo = Math.floor(start / 60) * 60, hi = Math.ceil(end / 60) * 60; const X = (m: number) => 90 + ((m - lo) / (hi - lo)) * 620; const firstHour = Math.ceil(start / 60) * 60;
  return <g><line x1={80} x2={720} y1={240} y2={240} stroke={C.muted} strokeWidth={2}/>{range((hi - lo) / 15 + 1).map(i => { const m = lo + i * 15; return <g key={i}><line x1={X(m)} x2={X(m)} y1={m % 60 ? 232 : 224} y2={m % 60 ? 248 : 256} stroke={C.muted}/>{m % 60 === 0 && <T x={X(m)} y={275} size={14}>{hm(m)}</T>}</g>; })}
    <circle cx={X(start)} cy={240} r={8} fill={C.ones}/><T x={X(start)} y={210} size={14} color={C.ones}>{hm(start)}</T><circle cx={X(end)} cy={240} r={8} fill={C.tens}/><T x={X(end)} y={210} size={14} color={C.tens}>{hm(end)}</T>
    {upTo >= 1 && <><path d={`M${X(start)} 230 Q${(X(start) + X(firstHour)) / 2} ${170} ${X(firstHour)} 230`} fill="none" stroke={C.unknown} strokeWidth={3}/><T x={(X(start) + X(firstHour)) / 2} y={160} size={16} color={C.unknown}>{firstHour - start} min</T></>}
    {upTo >= 2 && end > firstHour && <><path d={`M${X(firstHour)} 250 Q${(X(firstHour) + X(end)) / 2} ${320} ${X(end)} 250`} fill="none" stroke={C.accent} strokeWidth={3}/><T x={(X(firstHour) + X(end)) / 2} y={330} size={16} color={C.accent}>{end - firstHour} min</T></>}</g>;
}
function Calendar({year, month, upTo = 99}: {year: number; month: number; upTo?: number}) {
  const n = daysIn(year, month), first = weekday(year, month, 1); const x0 = 190, y0 = 120, cw = 60, ch = 44;
  return <g>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <T key={d} x={x0 + i * cw + cw / 2} y={y0 - 16} size={13} color={i % 6 === 0 ? C.thousands : C.muted}>{d}</T>)}
    {range(Math.min(n, upTo)).map(i => { const k = first + i; return <g key={i}><rect x={x0 + (k % 7) * cw + 2} y={y0 + Math.floor(k / 7) * ch + 2} width={cw - 4} height={ch - 4} rx={6} fill={C.panel} stroke={month === 2 && i === 28 ? C.ones : C.line}/><T x={x0 + (k % 7) * cw + cw / 2} y={y0 + Math.floor(k / 7) * ch + ch / 2} size={16}>{i + 1}</T></g>; })}</g>;
}

function Scene({c, scene, p}: {c: ClockConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'elapsed': return <g><Timeline start={c.start} end={c.end} upTo={scene < 2 ? 0 : scene === 2 ? (p > .3 ? 1 : 0) : scene === 3 ? 1 + (p > .3 ? 1 : 0) : 2}/><T x={W / 2} y={60} size={24} weight={600}>{scene >= 4 ? `${hm(c.start)} → ${hm(c.end)}: ${c.end - c.start} minutes` : `${hm(c.start)} → ${hm(c.end)}: ?`}</T></g>;
    case '24h': { const t = scene < 2 ? c.h * 60 + c.m : scene === 2 ? lerp(0, 720, eseg(p, .05, .95)) : scene === 3 ? lerp(720, c.h * 60 + c.m, eseg(p, .05, .9)) : c.h * 60 + c.m;
      return <g><Face mins={t} cx={260} ring24/><rect x={480} y={140} width={260} height={30} rx={6} fill="#1f1d2b"/><rect x={480} y={140} width={260 * (t / 1440)} height={30} rx={6} fill={t < 720 ? C.accent : C.thousands}/><T x={610} y={190} size={14} color={C.muted}>0:00 ········ 12:00 ········ 24:00</T>
        <T x={610} y={260} size={44} weight={700}>{hm(Math.round(t))}</T><T x={610} y={310} size={18} color={C.muted}>{t < 720 ? 'a.m.' : `${Math.floor(t / 60) - 12 || 12}:${String(Math.round(t) % 60).padStart(2, '0')} p.m.`}</T></g>; }
    case 'calendar': return <g><T x={W / 2} y={50} size={24} weight={600}>{MONTHS[c.month - 1]} {c.year}{scene >= 4 ? ` — ${isLeap(c.year) ? 'leap year (366 days)' : 'common year (365 days)'}` : ''}</T>
      {scene === 3 ? range(12).map(m => <g key={m}><rect x={70 + (m % 6) * 112} y={130 + Math.floor(m / 6) * 120} width={100} height={100} rx={10} fill={C.panel} stroke={daysIn(c.year, m + 1) === 31 ? C.ones : C.line}/><T x={120 + (m % 6) * 112} y={160 + Math.floor(m / 6) * 120} size={14} color={C.muted}>{MONTHS[m].slice(0, 3)}</T><T x={120 + (m % 6) * 112} y={195 + Math.floor(m / 6) * 120} size={28} weight={700}>{daysIn(c.year, m + 1)}</T></g>)
        : <Calendar year={c.year} month={c.month} upTo={scene < 2 ? 0 : scene === 2 ? Math.ceil(p * 31) : 99}/>}</g>;
    default: { const target = c.h * 60 + c.m; const t = scene < 2 ? 180 + p * 2 : scene === 2 ? lerp(180, 240, eseg(p, .05, .95)) : scene === 3 ? lerp(240, target + (target < 240 ? 720 : 0), eseg(p, .1, .9)) : target;
      return <g><Face mins={t} cx={300}/><T x={600} y={200} size={44} weight={700}>{hm(Math.round(t) % 720 || 720).replace(/^0:/, '12:')}</T><T x={600} y={250} size={16} color={C.muted}>{scene === 2 ? 'minute hand: one full turn = 60 min' : 'hour hand: short · minute hand: long'}</T></g>; }
  }
}

function Explore({c}: {c: ClockConfig}) {
  const [mins, setMins] = useState(c.h * 60 + c.m); const [s, setS] = useState(c.start), [e, setE] = useState(c.end); const [y, setY] = useState(c.year), [mo, setMo] = useState(c.month);
  if (c.mode === 'elapsed') return <Stage label="Elapsed time" controls={<><Slider label="Start" value={s} min={360} max={e - 5} step={5} onChange={setS} format={hm}/><Slider label="End" value={e} min={s + 5} max={1080} step={5} onChange={setE} format={hm}/><Readout>{hm(s)} → {hm(e)} = {e - s} min = {Math.floor((e - s) / 60)} h {(e - s) % 60} min</Readout></>}><Timeline start={s} end={e} upTo={2}/></Stage>;
  if (c.mode === 'calendar') return <Stage label="Calendar" controls={<><Stepper label="Year" value={y} min={1896} max={2104} onChange={setY}/><Stepper label="Month" value={mo} min={1} max={12} onChange={setMo} format={v => MONTHS[v - 1].slice(0, 3)}/><Readout>{MONTHS[mo - 1]} {y}: {daysIn(y, mo)} days · {y} is {isLeap(y) ? 'a leap' : 'a common'} year</Readout></>}><T x={W / 2} y={50} size={22} weight={600}>{MONTHS[mo - 1]} {y}</T><Calendar year={y} month={mo}/></Stage>;
  const cx = c.mode === '24h' ? 260 : 300, cy = 230, len = 160 * .78; const ma = ((mins % 60) * 6 - 90) * Math.PI / 180;
  return <Stage label={`Time ${hm(mins)}`} controls={<><Slider label="Time" value={mins} min={0} max={c.mode === '24h' ? 1439 : 719} step={c.step >= 60 ? 60 : 1} onChange={setMins} format={hm}/><Readout>{hm(mins)}{c.mode === '24h' ? ` = ${mins >= 720 ? `${Math.floor(mins / 60) - 12 || 12}:${String(mins % 60).padStart(2, '0')} p.m.` : 'a.m.'}` : ''} · the hour hand moves {(mins % 60) / 2}° past the hour</Readout></>}>
    <Face mins={mins} cx={cx} ring24={c.mode === '24h'}/><T x={620} y={220} size={44} weight={700}>{hm(mins)}</T>
    <Handle x={cx + len * Math.cos(ma)} y={cy + len * Math.sin(ma)} label="Drag the minute hand" onMove={(x, yy) => { const a = (Math.atan2(yy - cy, x - cx) * 180 / Math.PI + 90 + 360) % 360; const newM = Math.round(a / 6) % 60; let h = Math.floor(mins / 60); const oldM = mins % 60; if (oldM > 45 && newM < 15) h++; if (oldM < 15 && newM > 45) h--; const lim = c.mode === '24h' ? 24 : 12; setMins(((h + lim) % lim) * 60 + newM); }}/></Stage>;
}

export const clockView: EngineView<ClockConfig> = {Scene: props => <Stage label={clock.describe(props.c)}><Scene {...props}/></Stage>, Explore};
