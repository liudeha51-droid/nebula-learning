import type {EngineLogic} from '../types';
import {fmt, int, num, pick, rng, str} from '../math';
import {sc, predict} from './util';

export type ProbMode = 'certain' | 'dice' | 'balls' | 'coin';
export interface ProbConfig {mode: ProbMode; red: number; blue: number; target: number}
/** Theoretical probability of the tracked outcome. */
export const theory = (c: ProbConfig) => (c.mode === 'dice' ? 1 / 6 : c.mode === 'coin' ? .5 : c.red / (c.red + c.blue));
/** Deterministic trials so the animation can be scrubbed: 1 = tracked outcome happened. */
export function trials(c: ProbConfig, n = 600, seed = 7): number[] { const r = rng(seed + c.red * 31 + c.blue * 7 + c.target); const p = theory(c); return Array.from({length: n}, () => (c.mode === 'dice' ? Math.floor(r() * 6) + 1 === c.target : r() < p) ? 1 : 0); }

export const probability: EngineLogic<ProbConfig> = {
  type: 'probability', label: 'Probability laboratory',
  parse: r => ({mode: str(r.mode, 'dice'), red: num(r.red, 3), blue: num(r.blue, 1), target: num(r.target, 6)}),
  validate: c => (c.red + c.blue <= 0 ? ['bag cannot be empty'] : []),
  scenes: c => {
    const p = theory(c); const what = c.mode === 'dice' ? `a ${c.target}` : c.mode === 'coin' ? 'heads' : 'red';
    if (c.mode === 'certain') return [
      sc('intro', 'introduce', 'Three bags', `Bag A: only red. Bag B: only blue. Bag C: ${c.red} red and ${c.blue} blue.`, 6),
      sc('problem', 'problem', 'Draw a red ball?', 'From which bag is red certain, impossible, or possible?', 6),
      sc('draw', 'explore', 'Draw many times', 'Draw and replace, again and again, from each bag.', 10),
      sc('count', 'manipulate', 'Count the reds', `Bag C gives red about ${fmt(p * 100, 0)}% of the time.`, 8),
      sc('discover', 'discover', 'Certain, impossible, possible', 'A: always red (certain). B: never red (impossible). C: sometimes — red is more likely because there are more reds.', 8),
      sc('explain', 'explain', 'Likelihood', 'Likelihood depends on how many outcomes favour the event. A past result does not change the next draw.', 8),
      sc('apply', 'apply', 'Your turn', 'Judge likelihood.', 5)];
    return [
      sc('intro', 'introduce', c.mode === 'dice' ? 'A fair die' : c.mode === 'coin' ? 'A fair coin' : 'A bag of balls', c.mode === 'balls' ? `${c.red} red and ${c.blue} blue balls; draw one and put it back.` : 'Every face is equally likely.', 5),
      sc('problem', 'problem', `How often ${what}?`, `In many trials, what fraction will be ${what}?`, 6),
      sc('few', 'explore', '10 trials', 'With only a few trials, the fraction jumps around a lot.', 8),
      sc('many', 'manipulate', '600 trials', 'Keep going: the running fraction wobbles less and less.', 10),
      sc('discover', 'discover', `Close to ${fmt(p, 3)}`, `The experimental fraction settles near ${fmt(p, 3)} but rarely equals it exactly.`, 7),
      sc('explain', 'explain', 'Theory vs experiment', `Theoretical probability = favourable ÷ total = ${c.mode === 'dice' ? '1/6' : c.mode === 'coin' ? '1/2' : `${c.red}/${c.red + c.blue}`}. Experimental probability = observed ÷ trials.`, 8),
      sc('apply', 'apply', 'Your turn', 'Predict experimental results.', 5)];
  },
  prediction: c => c.mode === 'certain' ? predict('From the bag with 6 red and 2 blue, drawing red is…', [['a', 'More likely'], ['b', 'Less likely'], ['c', 'Certain']], 'a', 'More reds than blues, but blue is still possible.', 2)
    : predict(`After 600 trials, the fraction of ${c.mode === 'dice' ? `${c.target}s` : c.mode === 'coin' ? 'heads' : 'reds'} will be…`, [['a', `About ${fmt(theory(c), 2)}`], ['b', `Exactly ${fmt(theory(c), 2)}`], ['c', 'Anything at all']], 'a', 'Close, but not exact.', 3),
  challenge: (c, r) => {
    const n = int(r, 3, 9) * 100;
    if (c.mode === 'certain') { const [q, a] = pick(r, [['The sun rises tomorrow', 'Certain'], ['Rolling a 7 on a normal die', 'Impossible'], ['A coin lands heads', 'Possible']] as const); return {prompt: `${q}: certain, impossible or possible?`, kind: 'choice', options: ['Certain', 'Impossible', 'Possible'], answer: a, hint: 'Can it fail? Can it happen at all?', explanation: `${a}.`}; }
    if (c.mode === 'dice') return {prompt: `A fair die is rolled ${n} times. About how many sixes would you expect?`, kind: 'number', answer: n / 6, tolerance: n / 60, hint: '1/6 of the trials.', explanation: `${n} ÷ 6 ≈ ${fmt(n / 6, 1)} (not exactly).`};
    const red = int(r, 1, 5), blue = int(r, 1, 5); return {prompt: `${red} red and ${blue} blue balls. Probability of red (as a fraction or decimal)?`, kind: 'number', answer: red / (red + blue), tolerance: 1e-6, hint: 'favourable ÷ total', explanation: `${red}/${red + blue}.`};
  },
  describe: c => `Random experiment (${c.mode}) with a running relative-frequency line approaching the theoretical value ${fmt(theory(c), 3)}.`,
};
