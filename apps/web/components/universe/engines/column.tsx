'use client';
import {useState} from 'react';
import {Stage, T, C, W, Stepper, Readout, Segmented, Action} from '../stage';
import {column, steps, scaled, placeName, showNum, type ColumnConfig} from '@/lib/universe/engines/column';
import {digits, eseg, lerp, columnAdd, columnSub} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const PCOL = [C.ones, C.tens, C.hundreds, C.thousands, C.accent];
const colorFor = (i: number, places: number) => (i < places ? PCOL[4] : PCOL[(i - places) % 4]);

/** Column state after `done` columns are fully processed and the current column at sub-progress t. */
function state(c: ColumnConfig, done: number, t: number) {
  const {A, B} = scaled(c); const add = c.op === 'add'; const s = steps(c); const len = s.len;
  const result: (number | null)[] = Array(len).fill(null); const marks: number[] = Array(len + 1).fill(0);
  const bins: {count: number; out: number; incoming: number; broken: boolean}[] = range(len).map(i => ({count: add ? digits(A, len)[i] + digits(B, len)[i] : digits(A, len)[i], out: 0, incoming: 0, broken: false}));
  if (add) {
    const sa = s as ReturnType<typeof columnAdd>;
    for (let i = 0; i < len; i++) {
      if (i < done) { bins[i].count = sa.result[i]; result[i] = sa.result[i]; if (sa.carries[i + 1]) { marks[i + 1] = 1; if (i + 1 < len) bins[i + 1].count += 1; } }
      else if (i === done) { const total = bins[i].count; if (total >= 10) { bins[i].out = Math.round(10 * Math.min(1, t * 1.4)); } }
    }
  } else {
    const ss = s as ReturnType<typeof columnSub>; const da = digits(A, len), db = digits(B, len);
    for (let i = 0; i < len; i++) {
      if (ss.borrows[i] && (i < done || (i === done && t > .3))) marks[i + 1] = -1;
      if (i < done) { bins[i].count = ss.result[i]; result[i] = ss.result[i]; continue; }
      let base = da[i] - (i > 0 && ss.borrows[i - 1] ? 1 : 0);
      if (i === done) { if (ss.borrows[i] && t > .3) { base += 10; bins[i].broken = true; } if (t > .6) bins[i].out = db[i]; }
      if (i === done + 1 && ss.borrows[done] && t > .3) base = da[i] - 1;
      if (i > done + 1 || (i === done + 1 && !(ss.borrows[done] && t > .3))) base = da[i];
      bins[i].count = base;
    }
  }
  return {len, bins, result, marks};
}

function Board({c, done, t}: {c: ColumnConfig; done: number; t: number}) {
  const {A, B} = scaled(c); const add = c.op === 'add'; const st = state(c, done, t); const len = st.len;
  const da = digits(A, len), db = digits(B, len); const cw = 46, x0 = 60 + (6 - len) * cw * .5;
  const colX = (i: number) => x0 + (len - 1 - i) * cw;
  const binW = 330 / len, bx = (i: number) => 440 + (len - 1 - i) * binW;
  const point = c.places; // decimal point sits between place index `places` and `places-1`
  const show = (ds: number[], i: number) => { const v = ds.reduce((acc, d, k) => acc + d * 10 ** k, 0); return i < Math.max(String(v).length, point + 1) ? String(ds[i]) : ''; };
  return <g>
    {/* written calculation */}
    {range(len).map(i => <g key={i}>
      <T x={colX(i)} y={110} size={14} color={colorFor(i, point)}>{placeName(i, point).slice(0, 4)}</T>
      <T x={colX(i)} y={160} size={36} mono>{show(da, i)}</T>
      <T x={colX(i)} y={210} size={36} mono>{show(db, i)}</T>
      {st.marks[i] !== 0 && <T x={colX(i) + 2} y={132} size={18} color={st.marks[i] > 0 ? C.good : C.warn} weight={700}>{st.marks[i] > 0 ? '1' : '−1'}</T>}
      {st.result[i] !== null && <T x={colX(i)} y={275} size={36} mono color={colorFor(i, point)}>{st.result[i]}</T>}
    </g>)}
    {add && st.marks[len] > 0 && <T x={colX(len)} y={275} size={36} mono color={C.thousands}>1</T>}
    {point > 0 && <>{[160, 210, 275].map(y => <circle key={y} cx={colX(point - 1) - cw / 2} cy={y + 12} r={3.5} fill={C.ink}/>)}</>}
    <T x={colX(len - 1) - cw} y={210} size={36}>{add ? '+' : '−'}</T>
    <line x1={colX(len) - 10} x2={colX(0) + 22} y1={238} y2={238} stroke={C.ink} strokeWidth={2}/>
    {/* blocks */}
    {range(len).map(i => { const b = st.bins[i]; const x = bx(i); const col = colorFor(i, point);
      return <g key={'b' + i}><rect x={x} y={90} width={binW - 8} height={250} rx={8} fill={C.panel} stroke={b.broken ? C.warn : C.line}/>
        <T x={x + (binW - 8) / 2} y={108} size={11} color={col}>{placeName(i, point)}</T>
        {range(b.count).map(k => { const leaving = add ? k >= b.count - b.out : k >= b.count - b.out; const tt = add && b.out ? eseg(t, .35, .9) : 0;
          const px = x + 10 + (k % 4) * 15, py = 320 - Math.floor(k / 4) * 15;
          if (leaving && add) return <rect key={k} x={lerp(px, bx(i + 1) + 10, tt)} y={lerp(py, 320, tt)} width={11} height={11} rx={2} fill={col} opacity={1 - tt * .8}/>;
          return <rect key={k} x={px} y={py} width={11} height={11} rx={2} fill={col} opacity={leaving && !add ? .15 : 1} stroke={leaving && !add ? C.bad : 'none'}/>; })}
        <T x={x + (binW - 8) / 2} y={360} size={18} weight={600} color={col}>{b.count - (add ? 0 : b.out)}</T></g>; })}
  </g>;
}

function Scene({c, scene, p}: {c: ColumnConfig; scene: number; p: number}) {
  const len = steps(c).len;
  const done = scene < 2 ? 0 : scene === 2 ? (p >= .98 ? 1 : 0) : scene === 3 ? 1 + Math.floor(p * (len - 1)) : len;
  const t = scene < 2 ? 0 : scene === 2 ? p : scene === 3 ? (p * (len - 1)) % 1 : 0;
  const {A, B} = scaled(c); const res = c.op === 'add' ? A + B : A - B;
  return <g><Board c={c} done={Math.min(done, len)} t={t}/>
    <T x={W / 2} y={45} size={24} weight={600}>{scene >= 4 ? `${showNum(A, c.places)} ${c.op === 'add' ? '+' : '−'} ${showNum(B, c.places)} = ${showNum(res, c.places)}` : `${showNum(A, c.places)} ${c.op === 'add' ? '+' : '−'} ${showNum(B, c.places)} = ?`}</T>
    {scene === 5 && c.check && <T x={W / 2} y={410} size={20} color={C.good}>Check: {showNum(res, c.places)} + {showNum(B, c.places)} = {showNum(A, c.places)}</T>}
    {scene === 5 && !c.check && <T x={W / 2} y={410} size={17} color={C.muted}>{c.op === 'add' ? 'Small 1 above a column = one exchanged group of ten.' : '−1 above a column = one unit broken into ten.'}</T>}</g>;
}

function Explore({c}: {c: ColumnConfig}) {
  const k = 10 ** c.places;
  const [op, setOp] = useState(c.op); const [a, setA] = useState(c.a); const [b, setB] = useState(c.b); const [done, setDone] = useState(0);
  const cfg: ColumnConfig = {...c, op, a: op === 'sub' && b > a ? b : a, b: op === 'sub' && b > a ? a : b};
  const len = steps(cfg).len; const {A, B} = scaled(cfg);
  const step = 1 / k; const max = c.places ? 99.99 : 9999;
  return <Stage label={`${cfg.a} ${op === 'add' ? 'plus' : 'minus'} ${cfg.b}, ${done} of ${len} columns done`} controls={<>
    <Segmented label="Operation" value={op} onChange={v => { setOp(v); setDone(0); }} options={[['add', 'Add'], ['sub', 'Subtract']]}/>
    <Stepper label="Top" value={a} min={0} max={max} step={step * (c.places ? 1 : 1)} onChange={v => { setA(v); setDone(0); }} format={v => v.toFixed(c.places)}/>
    <Stepper label="Bottom" value={b} min={0} max={max} step={step} onChange={v => { setB(v); setDone(0); }} format={v => v.toFixed(c.places)}/>
    <Action primary onClick={() => setDone(Math.min(len, done + 1))} disabled={done >= len}>Next column</Action><Action onClick={() => setDone(0)}>Start over</Action>
    <Readout>{done >= len ? `${showNum(A, c.places)} ${op === 'add' ? '+' : '−'} ${showNum(B, c.places)} = ${showNum(op === 'add' ? A + B : A - B, c.places)}` : `Working on the ${placeName(done, c.places)} column`}</Readout></>}>
    <Board c={cfg} done={done} t={0}/>
  </Stage>;
}

export const columnView: EngineView<ColumnConfig> = {Scene: props => <Stage label={column.describe(props.c)}><Scene {...props}/></Stage>, Explore};
