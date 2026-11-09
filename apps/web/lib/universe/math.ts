/** Exact, dependency-free helpers shared by animation engines. */

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smooth ease-in-out (cubic). */
export const ease = (t: number) => { const x = clamp(t, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
/** Maps global progress p into a local [0,1] window [a,b]. */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
export const eseg = (p: number, a: number, b: number) => ease(seg(p, a, b));

export function gcd(a: number, b: number): number { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) [a, b] = [b, a % b]; return a; }
export const lcm = (a: number, b: number) => (a && b ? Math.abs(a * b) / gcd(a, b) : 0);
export function factors(n: number): number[] { const out: number[] = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; }
export function isPrime(n: number) { if (n < 2 || !Number.isInteger(n)) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
export function primeFactors(n: number): number[] { const out: number[] = []; let m = n; for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; } if (m > 1) out.push(m); return out; }
export function simplify(n: number, d: number): [number, number] { const g = gcd(n, d) || 1; return [n / g, d / g]; }
/** Rectangle arrangements of n tiles (rows ≤ cols). */
export function arrangements(n: number): [number, number][] { return factors(n).filter(r => r * r <= n).map(r => [r, n / r]); }

/** Rounds away binary floating error for display and comparison. */
export function fix(v: number, places = 10): number {
  if (!Number.isFinite(v)) return v;
  // Decimal-string shifting avoids 1.005 → 1.00 errors, but only works when String(v) has no exponent.
  if (/e/i.test(String(v))) return Math.round(v * 10 ** places) / 10 ** places || 0;
  return Number(Math.round(Number(v + 'e' + places)) + 'e-' + places);
}
export const approxEqual = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;
/** Formats a number without floating noise; integers get thin grouping. */
export function fmt(v: number, maxDecimals = 6): string {
  const x = fix(v, maxDecimals);
  if (Number.isInteger(x)) return x.toLocaleString('en-US');
  return x.toLocaleString('en-US', {maximumFractionDigits: maxDecimals});
}
/** Splits a non-negative integer into place-value digits, least significant first. */
export function digits(n: number, places: number): number[] { const out: number[] = []; let m = Math.floor(n); for (let i = 0; i < places; i++) { out.push(m % 10); m = Math.floor(m / 10); } return out; }

/** Column addition with carries. Returns digits and the carry entering each column (index = column). */
export function columnAdd(a: number, b: number) {
  const len = String(a + b).length; const da = digits(a, len), db = digits(b, len); const carries = new Array(len + 1).fill(0); const out: number[] = [];
  for (let i = 0; i < len; i++) { const s = da[i] + db[i] + carries[i]; out.push(s % 10); carries[i + 1] = s >= 10 ? 1 : 0; }
  return {len, da, db, carries, result: out, value: a + b};
}
/** Column subtraction (a ≥ b) with borrows. `borrows[i]` = 1 when column i borrowed from column i+1. */
export function columnSub(a: number, b: number) {
  if (b > a) throw new Error('columnSub expects a ≥ b');
  const len = String(a).length; const da = digits(a, len), db = digits(b, len); const borrows = new Array(len).fill(0); const out: number[] = []; let carryIn = 0;
  for (let i = 0; i < len; i++) { let top = da[i] - carryIn; if (top < db[i]) { top += 10; borrows[i] = 1; carryIn = 1; } else carryIn = 0; out.push(top - db[i]); }
  return {len, da, db, borrows, result: out, value: a - b};
}
/** Long division steps of a positive integer by a single/multi-digit divisor. */
export function longDivision(dividend: number, divisor: number) {
  const ds = String(dividend).split('').map(Number); const steps: {pos: number; bring: number; q: number; product: number; rem: number}[] = []; let rem = 0;
  ds.forEach((d, pos) => { const bring = rem * 10 + d; const q = Math.floor(bring / divisor); const product = q * divisor; rem = bring - product; steps.push({pos, bring, q, product, rem}); });
  const quotient = Math.floor(dividend / divisor);
  return {steps, quotient, remainder: dividend % divisor};
}

/** Deterministic PRNG (mulberry32) for reproducible challenges. */
export function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const pick = <T,>(r: () => number, items: readonly T[]): T => items[Math.floor(r() * items.length) % items.length];
export const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export function shuffle<T>(r: () => number, items: readonly T[]): T[] { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Builds 4 distinct numeric options including the answer. */
export function numericOptions(r: () => number, answer: number, distractors: number[]): string[] {
  const set = new Set<string>([fmt(answer)]);
  for (const d of distractors) { if (set.size >= 4) break; if (Number.isFinite(d) && d >= 0) set.add(fmt(d)); }
  let k = 1; while (set.size < 4) { set.add(fmt(answer + k)); k = k > 0 ? -k : -k + 1; }
  return shuffle(r, [...set]);
}

/** Config readers with defaults (engines never trust raw config shape). */
export const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
export const str = <T extends string>(v: unknown, d: T): T => (typeof v === 'string' ? (v as T) : d);
export const nums = (v: unknown, d: number[]) => (Array.isArray(v) && v.every(x => typeof x === 'number') ? (v as number[]) : d);
export const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);

/** Checks a learner's numeric or text answer. Accepts fractions like "3/4" and decimals. */
export function checkAnswer(input: string, answer: number | string, tolerance = 0): boolean {
  const raw = input.trim().replace(/，/g, ',').replace(/\s+/g, ' ');
  if (typeof answer === 'string') return raw.replace(/\s+/g, '').toLowerCase() === answer.replace(/\s+/g, '').toLowerCase();
  const tol = Math.max(tolerance, 1e-9);
  // "25%" may mean the number 25 (answer given in percent units) or the value 0.25.
  const percent = raw.replace(/\s+/g, '').match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percent && Math.abs(Number(percent[1]) - answer) <= tol) return true;
  const parsed = parseNumber(raw);
  return parsed !== null && Math.abs(parsed - answer) <= tol;
}
export function parseNumber(raw: string): number | null {
  const mixed = raw.replace(/,/g, '').trim().match(/^(-?\d+)(?:\s+|\s*\+\s*)(\d+)\s*\/\s*(\d+)$/);
  if (mixed) { const w = Number(mixed[1]); const f = Number(mixed[2]) / Number(mixed[3]); return w < 0 ? w - f : w + f; }
  const s = raw.replace(/,/g, '').replace(/\s+/g, '');
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2]);
  const pct = s.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (pct) return Number(pct[1]) / 100;
  if (/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(s)) return Number(s);
  return null;
}
