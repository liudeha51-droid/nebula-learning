/** Exact, testable maths behind the Frontier explorers. */

/* ---------- primes (Riemann) ---------- */
export function primeSieve(n: number): Uint8Array { const s = new Uint8Array(n + 1).fill(1); s[0] = 0; if (n >= 1) s[1] = 0; for (let i = 2; i * i <= n; i++) if (s[i]) for (let j = i * i; j <= n; j += i) s[j] = 0; return s; }
/** Cumulative prime counts π(0..n). */
export function primeCounts(n: number): Uint32Array { const s = primeSieve(n), c = new Uint32Array(n + 1); for (let i = 1; i <= n; i++) c[i] = c[i - 1] + s[i]; return c; }
/** Logarithmic integral Li(x) = ∫₂ˣ dt/ln t (offset form), by Simpson's rule in log space. */
export function li(x: number): number {
  if (x <= 2) return 0;
  const a = Math.log(2), b = Math.log(x), n = 400, h = (b - a) / n; let s = 0;
  for (let i = 0; i <= n; i++) { const u = a + i * h, f = Math.exp(u) / u; s += f * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2); }
  return (s * h) / 3;
}

/* ---------- subset sum (P vs NP) ---------- */
/** Finds a subset hitting the target by exhaustive search; returns indices or null. */
export function subsetSum(nums: number[], target: number): number[] | null {
  const n = nums.length;
  for (let mask = 0; mask < 1 << n; mask++) { let s = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) s += nums[i]; if (s === target) return nums.map((_, i) => i).filter(i => mask & (1 << i)); }
  return null;
}

/* ---------- exact rationals and an elliptic curve (BSD) ---------- */
export type Q = [bigint, bigint];
const babs = (a: bigint) => (a < 0n ? -a : a);
const bgcd = (a: bigint, b: bigint): bigint => { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; };
export const q = (n: bigint, d: bigint = 1n): Q => { if (d === 0n) throw new Error('zero denominator'); const g = bgcd(n, d) || 1n; const s = d < 0n ? -1n : 1n; return [(s * n) / g, (s * d) / g]; };
export const qadd = (a: Q, b: Q) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
export const qsub = (a: Q, b: Q) => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
export const qmul = (a: Q, b: Q) => q(a[0] * b[0], a[1] * b[1]);
export const qdiv = (a: Q, b: Q) => q(a[0] * b[1], a[1] * b[0]);
export const qeq = (a: Q, b: Q) => a[0] === b[0] && a[1] === b[1];
export const qnum = (a: Q) => Number(a[0]) / Number(a[1]);
export const qstr = (a: Q) => (a[1] === 1n ? `${a[0]}` : `${a[0]}/${a[1]}`);
/** Points on y² = x³ + A x + B; null is the point at infinity. */
export type ECPoint = {x: Q; y: Q} | null;
export function ecAdd(P: ECPoint, R: ECPoint, A: Q): ECPoint {
  if (!P) return R; if (!R) return P;
  if (qeq(P.x, R.x) && qeq(P.y, q(-R.y[0], R.y[1]))) return null;
  const m = qeq(P.x, R.x) ? qdiv(qadd(qmul(q(3n), qmul(P.x, P.x)), A), qmul(q(2n), P.y)) : qdiv(qsub(R.y, P.y), qsub(R.x, P.x));
  const x = qsub(qsub(qmul(m, m), P.x), R.x); const y = qsub(qmul(m, qsub(P.x, x)), P.y);
  return {x, y};
}
export const onCurve = (P: {x: Q; y: Q}, A: Q, B: Q) => qeq(qmul(P.y, P.y), qadd(qadd(qmul(P.x, qmul(P.x, P.x)), qmul(A, P.x)), B));
/** Number of points on y² = x³ + a x + b over the field with p elements, including the point at infinity. */
export function pointsModP(a: number, b: number, p: number): number {
  const sq = new Uint16Array(p); for (let y = 0; y < p; y++) sq[(y * y) % p]++;
  let n = 1; for (let x = 0; x < p; x++) n += sq[(((x * x % p) * x + a * x + b) % p + p * p) % p];
  return n;
}

/* ---------- π approximations ---------- */
export const PI_50 = '3.14159265358979323846264338327950288419716939937510';
const PI_SCALE = 10n ** 50n, PI_INT = BigInt(PI_50.replace('.', ''));
/** Continued-fraction convergents p/q of π (exact to the 50 digits stored). */
export function piConvergents(count: number): [bigint, bigint][] {
  let num = PI_INT, den = PI_SCALE; const out: [bigint, bigint][] = []; let [p0, p1, q0, q1] = [0n, 1n, 1n, 0n];
  for (let i = 0; i < count; i++) { const a = num / den; [p0, p1] = [p1, a * p1 + p0]; [q0, q1] = [q1, a * q1 + q0]; out.push([p1, q1]); [num, den] = [den, num - a * den]; if (den === 0n) break; }
  return out;
}
/** |π − p/q| as a float (computed from the exact 50-digit expansion). */
export const piError = (p: bigint, q: bigint) => { const diff = PI_INT * q - p * PI_SCALE; return Number(babs(diff) * 10n ** 20n / (q * PI_SCALE)) / 1e20; };

/* ---------- Egyptian fractions ---------- */
/** Greedy (Fibonacci–Sylvester) expansion of a/b into distinct unit fractions; returns denominators. */
export function egyptianGreedy(a: bigint, b: bigint, maxTerms = 12): bigint[] {
  const out: bigint[] = []; let [x, y] = [a, b];
  while (x > 0n && out.length < maxTerms) { const d = (y + x - 1n) / x; out.push(d); [x, y] = q(x * d - y, y * d); }
  return out;
}

/* ---------- largest prime factors of consecutive integers ---------- */
export function largestPrimeFactors(n: number): Uint32Array { const l = new Uint32Array(n + 1); for (let i = 2; i <= n; i++) if (!l[i]) for (let j = i; j <= n; j += i) l[j] = i; return l; }
/** Fraction of 2 ≤ m ≤ N with P⁺(m) < P⁺(m + 1). */
export function lpfRisingShare(N: number): number { const l = largestPrimeFactors(N + 1); let c = 0; for (let m = 2; m <= N; m++) if (l[m] < l[m + 1]) c++; return c / (N - 1); }

/* ---------- IMO 2025 Problem 4: three largest proper divisors ---------- */
export function threeLargestProperDivisors(x: number): number[] | null {
  const ds: number[] = []; for (let d = 1; d * d <= x; d++) if (x % d === 0) { ds.push(d); if (d * d !== x) ds.push(x / d); }
  const proper = ds.filter(d => d !== x).sort((a, b) => b - a);
  return proper.length >= 3 ? proper.slice(0, 3) : null;
}
export interface DivisorRun {terms: number[]; fate: 'cycle' | 'stuck' | 'unknown'}
export function divisorSequence(a1: number, maxSteps = 60): DivisorRun {
  const terms = [a1]; const seen = new Set([a1]);
  for (let i = 0; i < maxSteps; i++) { const t = threeLargestProperDivisors(terms[terms.length - 1]); if (!t) return {terms, fate: 'stuck'}; const next = t[0] + t[1] + t[2]; terms.push(next); if (seen.has(next)) return {terms, fate: 'cycle'}; seen.add(next); }
  return {terms, fate: 'unknown'};
}
/** The IMO 2025 answer: a₁ = 6 · 12ᵉ · m with e ≥ 0 and gcd(m, 10) = 1 (checked by computation in tests). */
export function imoP4Answer(a: number): boolean { for (let e = 0; 6 * 12 ** e <= a; e++) { const qd = 6 * 12 ** e; if (a % qd === 0) { const m = a / qd; if (m % 2 !== 0 && m % 5 !== 0) return true; } } return false; }

/* ---------- IMO 2025 Problem 1: sunny lines ---------- */
/** A line ax + by = c with integer coefficients. */
export interface Line {a: number; b: number; c: number}
/** Sunny: not parallel to the x-axis, the y-axis or the line x + y = 0. */
export const isSunny = (l: Line) => l.a !== 0 && l.b !== 0 && l.a !== l.b;
export const trianglePoints = (n: number) => { const out: [number, number][] = []; for (let a = 1; a <= n; a++) for (let b = 1; a + b <= n + 1; b++) out.push([a, b]); return out; };
export const covers = (lines: Line[], n: number) => trianglePoints(n).every(([x, y]) => lines.some(l => l.a * x + l.b * y === l.c));
/** The standard constructions with k = 0, 1 or 3 sunny lines for any n ≥ 3. */
export function sunnyConstruction(n: number, k: 0 | 1 | 3): Line[] {
  if (k === 0) return Array.from({length: n}, (_, i) => ({a: 1, b: 0, c: i + 1}));
  if (k === 1) return [...Array.from({length: n - 1}, (_, i) => ({a: 1, b: 0, c: i + 1})), {a: 2, b: -1, c: 2 * n - 1}];
  // Peel off the outer diagonals x + y = n + 1, …, 5 (non-sunny), leaving the n = 3 triangle for three sunny lines.
  return [...Array.from({length: n - 3}, (_, i) => ({a: 1, b: 1, c: n + 1 - i})), {a: 1, b: -1, c: 0}, {a: 1, b: 2, c: 5}, {a: 2, b: 1, c: 5}];
}

/* ---------- IMO 2025 Problem 3: bonza functions ---------- */
export type IntFn = (n: number) => number;
const powmod = (b: bigint, e: bigint, m: bigint) => { let r = 1n % m; b %= m; while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
/** First (a, b) ≤ limit violating f(a) | bᵃ − f(b)^{f(a)}, or null if none. */
export function bonzaViolation(f: IntFn, limit: number): [number, number] | null {
  for (let a = 1; a <= limit; a++) { const m = BigInt(f(a)); if (m <= 0n) return [a, a]; for (let b = 1; b <= limit; b++) { const lhs = (powmod(BigInt(b), BigInt(a), m) - powmod(BigInt(f(b)), m, m)) % m; if (lhs !== 0n) return [a, b]; } }
  return null;
}
/** The extremal example: 1 on odd numbers, 2 when 2 ∥ n, and 2^(v₂(n)+2) when 4 | n. */
export const bonzaExtremal: IntFn = n => { if (n % 2) return 1; let v = 0, m = n; while (m % 2 === 0) { m /= 2; v++; } return v === 1 ? 2 : 2 ** (v + 2); };

/* ---------- IMO 2025 Problem 5: the inekoalaty game ---------- */
export interface GameTurn {n: number; player: 'Alice' | 'Bazza'; x: number; sum: number; squares: number}
export interface GameResult {turns: GameTurn[]; winner: 'Alice' | 'Bazza' | null}
/**
 * Plays the known optimal strategies. Bazza always plays the largest legal number √(n − Σx²).
 * Alice plays 0 until a single large move leaves Bazza no legal reply, then makes it.
 */
export function inekoalaty(lambda: number, maxTurns = 400): GameResult {
  const turns: GameTurn[] = []; let S = 0, Q = 0;
  for (let n = 1; n <= maxTurns; n++) {
    if (n % 2) { const room = lambda * n - S; if (room < -1e-12) return {turns, winner: 'Bazza'}; const x = room * room > n + 1 - Q ? room : 0; S += x; Q += x * x; turns.push({n, player: 'Alice', x, sum: S, squares: Q}); }
    else { const room = n - Q; if (room < -1e-12) return {turns, winner: 'Alice'}; const x = Math.sqrt(Math.max(0, room)); S += x; Q += x * x; turns.push({n, player: 'Bazza', x, sum: S, squares: Q}); }
  }
  return {turns, winner: null};
}

/* ---------- Hadwiger–Nelson: the Moser spindle ---------- */
/** Seven points, eleven unit-distance edges. No 3-colouring avoids a same-colour edge. */
export function moserSpindle(): {pts: [number, number][]; edges: [number, number][]} {
  const tip = Math.sqrt(3), half = Math.asin(1 / (2 * Math.sqrt(3))), base = Math.PI / 2;
  const pts: [number, number][] = [[0, 0]];
  for (const th of [base - half, base + half]) { const at = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)]; pts.push(at(1, th - Math.PI / 6), at(1, th + Math.PI / 6), at(tip, th)); }
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [0, 4], [0, 5], [4, 5], [4, 6], [5, 6], [3, 6]];
  return {pts, edges};
}
export const properColouring = (edges: [number, number][], colours: number[]) => edges.every(([a, b]) => colours[a] !== colours[b]);
