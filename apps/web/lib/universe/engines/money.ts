import type {EngineLogic} from '../types';
import {int, pick, str} from '../math';
import {sc, predict} from './util';

export type MoneyMode = 'coins' | 'shop';
export interface MoneyConfig {mode: MoneyMode}
/** Chinese currency in fen. */
export const DENOMS: {fen: number; label: string; kind: 'note' | 'coin'}[] = [
  {fen: 2000, label: '20元', kind: 'note'}, {fen: 1000, label: '10元', kind: 'note'}, {fen: 500, label: '5元', kind: 'note'}, {fen: 100, label: '1元', kind: 'coin'},
  {fen: 50, label: '5角', kind: 'coin'}, {fen: 10, label: '1角', kind: 'coin'}, {fen: 5, label: '5分', kind: 'coin'}, {fen: 1, label: '1分', kind: 'coin'}];
export const yuanStr = (fen: number) => { const y = Math.floor(fen / 100), j = Math.floor((fen % 100) / 10), f = fen % 10; return [y && `${y} yuan`, j && `${j} jiao`, f && `${f} fen`].filter(Boolean).join(' ') || '0 yuan'; };
/** Fewest notes/coins for an amount (greedy is optimal for these denominations). */
export function makeChange(fen: number) { const out: number[] = []; let left = fen; for (const d of DENOMS) while (left >= d.fen) { out.push(d.fen); left -= d.fen; } return out; }
export const SHOP = [{name: 'Pencil', fen: 150}, {name: 'Eraser', fen: 80}, {name: 'Notebook', fen: 350}, {name: 'Ruler', fen: 220}, {name: 'Sticker', fen: 50}];

export const money: EngineLogic<MoneyConfig> = {
  type: 'money', label: 'Shopping street',
  parse: r => ({mode: str(r.mode, 'coins')}),
  validate: () => [],
  scenes: c => c.mode === 'shop' ? [
    sc('intro', 'introduce', 'The shopping street', 'A stationery stall with price tags.', 5),
    sc('problem', 'problem', 'Pencil and eraser', 'You buy a pencil (1 yuan 5 jiao) and an eraser (8 jiao). How much? What change from 5 yuan?', 7),
    sc('add', 'explore', 'Add the prices', '1 yuan 5 jiao + 8 jiao = 2 yuan 3 jiao.', 8),
    sc('pay', 'manipulate', 'Pay with 5 yuan', 'Hand over a 5-yuan note.', 6),
    sc('discover', 'discover', 'Change: 2 yuan 7 jiao', '5 yuan − 2 yuan 3 jiao = 2 yuan 7 jiao. Count up from 2.3 to 5 to check.', 8),
    sc('explain', 'explain', 'Paying and change', 'Total = sum of prices; change = paid − total. Convert to jiao if it helps: 50 − 23 = 27 jiao.', 8),
    sc('apply', 'apply', 'Your turn', 'Shop and give change.', 5)] : [
    sc('intro', 'introduce', 'Notes and coins', 'Chinese money: yuan (元), jiao (角) and fen (分).', 5),
    sc('problem', 'problem', 'Which is worth more?', 'Is a big coin always worth more than a small one?', 5),
    sc('jiao', 'explore', '10 jiao = 1 yuan', 'Ten 1-jiao coins exchange for one 1-yuan coin.', 8),
    sc('fen', 'manipulate', '10 fen = 1 jiao', 'Ten 1-fen coins exchange for one 1-jiao coin.', 7),
    sc('discover', 'discover', 'Value is printed, not size', 'The number on a note or coin tells its value.', 6),
    sc('explain', 'explain', 'Currency units', '1 yuan = 10 jiao, 1 jiao = 10 fen, so 1 yuan = 100 fen.', 7),
    sc('apply', 'apply', 'Your turn', 'Convert money units.', 5)],
  prediction: c => c.mode === 'shop' ? predict('Change from 5 yuan for 2 yuan 3 jiao?', [['a', '2 yuan 7 jiao'], ['b', '3 yuan 7 jiao'], ['c', '2 yuan 3 jiao']], 'a', '50 − 23 = 27 jiao.', 4) : predict('How many jiao make 1 yuan?', [['a', '10'], ['b', '100'], ['c', '5']], 'a', '1 yuan = 10 jiao.', 2),
  challenge: (c, r) => {
    if (c.mode === 'shop') { const a = pick(r, SHOP), b = pick(r, SHOP.filter(x => x !== a)); const total = a.fen + b.fen; const paid = Math.ceil(total / 500) * 500 + (total % 500 === 0 ? 500 : 0); return {prompt: `${a.name} (${yuanStr(a.fen)}) + ${b.name} (${yuanStr(b.fen)}). You pay ${paid / 100} yuan. Change in jiao?`, kind: 'number', answer: (paid - total) / 10, hint: 'Convert everything to jiao.', explanation: `${paid / 10} − ${total / 10} = ${(paid - total) / 10} jiao = ${yuanStr(paid - total)}.`}; }
    const y = int(r, 2, 9); return pick(r, [0, 1]) ? {prompt: `${y} yuan = ? jiao`, kind: 'number', answer: y * 10, hint: '× 10', explanation: `${y * 10} jiao.`} : {prompt: `${y * 10 + 5} jiao = ? yuan ? jiao. How many whole yuan?`, kind: 'number', answer: y, hint: '10 jiao per yuan.', explanation: `${y} yuan 5 jiao.`};
  },
  describe: c => c.mode === 'shop' ? 'A stationery stall: choose items, pay with notes and coins, receive change.' : 'Chinese notes and coins exchanging: 10 fen = 1 jiao, 10 jiao = 1 yuan.',
};
