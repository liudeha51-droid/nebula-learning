import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type MeasureMode = 'compare' | 'ruler' | 'units' | 'mass' | 'scale';
export interface MeasureConfig {mode: MeasureMode; length: number; focus: 'm' | 'km'; scale: number; map: number}
export const LENGTH_UNITS: [string, number][] = [['mm', 1], ['cm', 10], ['dm', 100], ['m', 1000], ['km', 1e6]];

export const measure: EngineLogic<MeasureConfig> = {
  type: 'measure', label: 'Measurement laboratory',
  parse: r => ({mode: str(r.mode, 'ruler'), length: num(r.length, 7), focus: str(r.focus, 'm'), scale: num(r.scale, 50000), map: num(r.map, 6)}),
  validate: c => (c.mode === 'ruler' && (c.length < 1 || c.length > 12) ? ['ruler lengths 1–12 cm'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'compare': return [
        sc('intro', 'introduce', 'Two pencils', 'A red pencil and a blue pencil lie on the desk.', 5),
        sc('problem', 'problem', 'Which is longer?', 'The blue one sticks out further on the right. Is it longer?', 6),
        sc('misaligned', 'explore', 'Different starts', 'Their left ends are not lined up, so the right ends tell us nothing.', 8),
        sc('align', 'manipulate', 'Line up the starts', 'Slide them so both start at the same line.', 8),
        sc('discover', 'discover', 'Now compare the ends', 'With a common start, the one that reaches further is longer.', 6),
        sc('explain', 'explain', 'Fair comparison', 'Compare lengths and heights from the same starting line.', 6),
        sc('apply', 'apply', 'Your turn', 'Compare lengths fairly.', 5)];
      case 'units': return [
        sc('intro', 'introduce', 'One road, many units', c.focus === 'km' ? 'From an ant’s step to a city road.' : 'From a grain of rice to a classroom.', 5),
        sc('problem', 'problem', 'Which unit fits?', 'Would you measure a road in millimetres?', 5),
        sc('zoom', 'explore', 'Zoom out', '10 mm = 1 cm, 10 cm = 1 dm, 10 dm = 1 m, 1000 m = 1 km.', 12),
        sc('same', 'manipulate', 'Same length, different numbers', '1 m = 10 dm = 100 cm = 1000 mm.', 8),
        sc('discover', 'discover', 'Bigger unit, smaller number', 'Measuring with a bigger unit needs fewer of them.', 6),
        sc('explain', 'explain', 'Length conversions', 'mm → cm → dm → m: × 10 each step; m → km: × 1000.', 7),
        sc('apply', 'apply', 'Your turn', 'Convert lengths.', 5)];
      case 'mass': return [
        sc('intro', 'introduce', 'A balance scale', 'A strawberry, a melon and a truck.', 5),
        sc('problem', 'problem', 'Which unit?', 'Grams, kilograms or tons?', 5),
        sc('grams', 'explore', 'Grams', 'A 1 yuan coin is about 6 g; a strawberry about 20 g.', 7),
        sc('kilo', 'manipulate', '1000 g = 1 kg', 'A thousand 1 g weights balance one kilogram.', 8),
        sc('discover', 'discover', '1000 kg = 1 t', 'A small car is about 1 ton: 1000 kg.', 6),
        sc('explain', 'explain', 'Mass units', '1 t = 1000 kg, 1 kg = 1000 g.', 6),
        sc('apply', 'apply', 'Your turn', 'Convert masses.', 5)];
      case 'scale': { const actual = c.map * c.scale; return [
        sc('intro', 'introduce', 'A map', `A park map with scale 1 : ${fmt(c.scale)}.`, 5),
        sc('problem', 'problem', 'How far really?', `Two gates are ${c.map} cm apart on the map. How far apart in reality?`, 6),
        sc('meaning', 'explore', 'What 1 : ' + fmt(c.scale) + ' means', `1 cm on the map stands for ${fmt(c.scale)} cm = ${fmt(c.scale / 100)} m.`, 8),
        sc('zoom', 'manipulate', 'Zoom to reality', `${c.map} cm × ${fmt(c.scale)} = ${fmt(actual)} cm.`, 8),
        sc('discover', 'discover', `${fmt(actual / 100000)} km`, `${fmt(actual)} cm = ${fmt(actual / 100)} m = ${fmt(actual / 100000)} km.`, 7),
        sc('explain', 'explain', 'Scale', 'scale = map distance : actual distance (same units). actual = map ÷ scale.', 7),
        sc('apply', 'apply', 'Your turn', 'Use scales.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'A crayon to measure', 'A crayon next to a centimetre ruler.', 5),
        sc('problem', 'problem', 'Guess first', 'Estimate: how many centimetres long is it?', 5),
        sc('wrong', 'explore', 'A wrong placement', 'Starting at the 1 mark adds a centimetre that is not there.', 8),
        sc('right', 'manipulate', 'Start at 0', `Line the end up with 0 and read the other end: ${c.length} cm.`, 8),
        sc('discover', 'discover', 'Count spaces, not marks', `${c.length} centimetre spaces fit along the crayon.`, 6),
        sc('explain', 'explain', 'Using a ruler', 'Align with 0, keep the ruler straight, read the mark at the other end. 100 cm = 1 m.', 7),
        sc('apply', 'apply', 'Your turn', 'Measure lengths.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'compare': return predict('Is the blue pencil longer just because its end sticks out further?', [['a', 'Not necessarily'], ['b', 'Yes']], 'a', 'The starts must line up.', 3);
      case 'units': return predict('1 m = ? cm', [['a', '100'], ['b', '10'], ['c', '1000']], 'a', '10 dm, each 10 cm.', 3);
      case 'mass': return predict('Which is heavier: 1 kg of cotton or 1 kg of iron?', [['a', 'The same'], ['b', 'Iron'], ['c', 'Cotton']], 'a', 'Both are 1 kg.', 3);
      case 'scale': return predict(`On a 1 : ${fmt(c.scale)} map, 1 cm is…`, [['a', `${fmt(c.scale / 100)} m`], ['b', `${fmt(c.scale)} m`], ['c', `${fmt(c.scale / 1000)} m`]], 'a', `${fmt(c.scale)} cm ÷ 100.`, 2);
      default: return predict(`A crayon from 1 to ${c.length + 1} on the ruler is…`, [['a', `${c.length} cm`], ['b', `${c.length + 1} cm`]], 'a', 'Count the spaces.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'units': { const [q, a] = pick(r, [[`${int(r, 2, 9)} m`, 0], [`${int(r, 2, 9)} km`, 1], [`${int(r, 2, 9)} cm`, 2]] as const); const n = Number(q.split(' ')[0]); const ans = a === 0 ? n * 100 : a === 1 ? n * 1000 : n * 10; const unit = a === 0 ? 'cm' : a === 1 ? 'm' : 'mm'; return {prompt: `${q} = ? ${unit}`, kind: 'number', answer: ans, hint: 'Bigger unit to smaller: multiply.', explanation: `${ans} ${unit}.`}; }
      case 'mass': { const k = int(r, 2, 9); return pick(r, [0, 1]) ? {prompt: `${k} kg = ? g`, kind: 'number', answer: k * 1000, hint: '× 1000', explanation: `${k * 1000} g.`} : {prompt: `${k * 1000} kg = ? t`, kind: 'number', answer: k, hint: '÷ 1000', explanation: `${k} t.`}; }
      case 'scale': { const s = pick(r, [1000, 5000, 10000, 100000]), m = int(r, 2, 9); return {prompt: `Scale 1 : ${fmt(s)}. Map distance ${m} cm. Actual distance in metres?`, kind: 'number', answer: m * s / 100, hint: 'map × scale, then cm → m.', explanation: `${m} × ${fmt(s)} = ${fmt(m * s)} cm = ${fmt(m * s / 100)} m.`}; }
      case 'compare': return {prompt: 'To compare two heights fairly, the two people must stand…', kind: 'choice', options: ['On the same floor level', 'Far apart', 'On chairs'], answer: 'On the same floor level', hint: 'Same starting line.', explanation: 'Same base.'};
      default: { const s = int(r, 0, 4), l = int(r, 2, 8); return {prompt: `An object starts at ${s} cm and ends at ${s + l} cm. Length?`, kind: 'number', answer: l, unit: 'cm', hint: 'End − start.', explanation: `${s + l} − ${s} = ${l}.`}; }
    }
  },
  describe: c => `Measurement (${c.mode}) with rulers, balances and zoomable scales.`,
};
