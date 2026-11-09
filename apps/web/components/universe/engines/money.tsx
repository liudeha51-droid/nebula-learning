'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Action, useSound} from '../stage';
import {money, DENOMS, SHOP, makeChange, yuanStr, type MoneyConfig} from '@/lib/universe/engines/money';
import {eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Piece({fen, x, y, opacity = 1, onClick}: {fen: number; x: number; y: number; opacity?: number; onClick?: () => void}) {
  const d = DENOMS.find(q => q.fen === fen)!; const note = d.kind === 'note';
  const col = fen >= 2000 ? '#b38fd6' : fen >= 1000 ? '#6fa8d6' : fen >= 500 ? '#b97fd0' : fen >= 100 ? '#d6d0c4' : fen >= 10 ? '#d9b85c' : '#bfc6cf';
  return <g opacity={opacity} onClick={onClick} className={onClick ? 'u-hit' : undefined} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `Pay ${d.label}` : undefined} onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}>
    {note ? <rect x={x - 44} y={y - 24} width={88} height={48} rx={6} fill={col} stroke="#fff4"/> : <circle cx={x} cy={y} r={fen >= 100 ? 24 : fen >= 10 ? 20 : 15} fill={col} stroke="#0003"/>}
    <T x={x} y={y} size={note ? 15 : 12} color="#15141d" weight={700}>{d.label}</T></g>;
}

function Scene({c, scene, p}: {c: MoneyConfig; scene: number; p: number}) {
  if (c.mode === 'shop') { const items = [SHOP[0], SHOP[1]]; const total = items[0].fen + items[1].fen; const change = makeChange(500 - total); const pay = scene === 3 ? eseg(p, .1, .7) : scene > 3 ? 1 : 0;
    return <g>{SHOP.map((it, i) => <g key={it.name} opacity={scene >= 2 && i > 1 ? .35 : 1}><rect x={60 + i * 140} y={80} width={120} height={90} rx={10} fill={C.panel} stroke={i < 2 && scene >= 1 ? C.ones : C.line}/><T x={120 + i * 140} y={110} size={15}>{it.name}</T><T x={120 + i * 140} y={145} size={15} color={C.ones}>{(it.fen / 100).toFixed(2)} 元</T></g>)}
      {scene >= 2 && <T x={W / 2} y={215} size={20}>{yuanStr(items[0].fen)} + {yuanStr(items[1].fen)} = {yuanStr(total)}</T>}
      {scene >= 3 && <Piece fen={500} x={lerp(160, 400, pay)} y={300}/>}
      {scene >= 4 && change.map((f, i) => <Piece key={i} fen={f} x={480 + i * 60} y={360}/>)}
      {scene >= 4 && <T x={W / 2} y={420} size={18} color={C.good}>change: {yuanStr(500 - total)}</T>}</g>; }
  const ex = scene === 2 ? eseg(p, .2, .8) : scene > 2 ? 1 : 0; const ex2 = scene === 3 ? eseg(p, .2, .8) : scene > 3 ? 1 : 0;
  return <g>{scene < 2 ? DENOMS.map((d, i) => <Piece key={d.fen} fen={d.fen} x={100 + (i % 4) * 190} y={150 + Math.floor(i / 4) * 130}/>)
    : <>{range(10).map(i => <Piece key={'j' + i} fen={10} x={lerp(100 + i * 50, 300, ex)} y={lerp(160, 160, ex)} opacity={1 - ex * .85}/>)}{ex > .5 && <Piece fen={100} x={300} y={160}/>}<T x={600} y={160} size={20}>10 × 1角 = 1元</T>
      {scene >= 3 && <>{range(10).map(i => <Piece key={'f' + i} fen={1} x={lerp(100 + i * 40, 300, ex2)} y={300} opacity={1 - ex2 * .85}/>)}{ex2 > .5 && <Piece fen={10} x={300} y={300}/>}<T x={600} y={300} size={20}>10 × 1分 = 1角</T></>}</>}
    {scene >= 4 && <T x={W / 2} y={410} size={20} color={C.accent}>1 元 = 10 角 = 100 分</T>}</g>;
}

function Explore({c}: {c: MoneyConfig}) {
  const sound = useSound();
  const [cart, setCart] = useState<number[]>(c.mode === 'shop' ? [0, 1] : []); const [paid, setPaid] = useState<number[]>([]);
  const total = c.mode === 'shop' ? cart.reduce((s, i) => s + SHOP[i].fen, 0) : 0; const given = paid.reduce((s, f) => s + f, 0);
  const pay = (f: number) => { setPaid([...paid, f]); sound('click'); };
  if (c.mode === 'coins') return <Stage label={`Total ${yuanStr(given)}`} controls={<><Action onClick={() => setPaid([])}>Clear</Action><Readout>{yuanStr(given)} = {given} fen = {(given / 100).toFixed(2)} yuan · fewest pieces: {makeChange(given).length}</Readout></>}>
    {DENOMS.map((d, i) => <Piece key={d.fen} fen={d.fen} x={80 + i * 92} y={90} onClick={() => pay(d.fen)}/>)}<T x={W / 2} y={150} size={14} color={C.muted}>tap notes and coins to add them</T>
    {paid.slice(-24).map((f, i) => <Piece key={i} fen={f} x={90 + (i % 8) * 90} y={220 + Math.floor(i / 8) * 70}/>)}</Stage>;
  const change = given - total;
  return <Stage label={`Cart ${yuanStr(total)}, paid ${yuanStr(given)}`} controls={<>{SHOP.map((it, i) => <Action key={it.name} onClick={() => setCart(cart.includes(i) ? cart.filter(x => x !== i) : [...cart, i])}>{cart.includes(i) ? '✓ ' : ''}{it.name}</Action>)}<Action onClick={() => setPaid([])}>Take money back</Action>
    <Readout>{given < total ? `Still to pay: ${yuanStr(total - given)}` : `Paid ${yuanStr(given)} for ${yuanStr(total)} → change ${yuanStr(change)}`}</Readout></>}>
    {SHOP.map((it, i) => <g key={it.name} opacity={cart.includes(i) ? 1 : .35}><rect x={60 + i * 140} y={40} width={120} height={70} rx={10} fill={C.panel} stroke={cart.includes(i) ? C.ones : C.line}/><T x={120 + i * 140} y={62} size={14}>{it.name}</T><T x={120 + i * 140} y={90} size={14} color={C.ones}>{(it.fen / 100).toFixed(2)} 元</T></g>)}
    {DENOMS.slice(0, 6).map((d, i) => <Piece key={d.fen} fen={d.fen} x={90 + i * 120} y={170} onClick={() => pay(d.fen)}/>)}
    {paid.slice(-12).map((f, i) => <Piece key={i} fen={f} x={90 + i * 56} y={280}/>)}
    {given >= total && total > 0 && makeChange(change).map((f, i) => <Piece key={'c' + i} fen={f} x={90 + i * 60} y={380}/>)}</Stage>;
}

export const moneyView: EngineView<MoneyConfig> = {Scene: props => <Stage label={money.describe(props.c)}><Scene {...props}/></Stage>, Explore};
