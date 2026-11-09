/**
 * Learning journeys: start from one simple idea, collect one tool per lesson (often across several
 * grades), then use every tool together in a capstone problem. Stations are existing knowledge points.
 */
export type CapstoneId = 'eratosthenes' | 'fair-game' | 'garden' | 'growth' | 'gps';
export interface Station {
  /** Knowledge point id. */
  id: string;
  /** The tool this station adds to the learner's toolkit (short). */
  tool: string;
  /** The tool as a formula or rule, shown in the toolkit. */
  rule: string;
  /** How this tool moves the journey forward. */
  why: string;
}
export interface LearningJourney {
  id: string; title: string; title_zh: string;
  /** The single idea everything starts from. */
  seed: string;
  /** The big question the journey answers at the end. */
  question: string;
  /** Where the tools end up being used. */
  destination: string;
  colour: string;
  stations: Station[];
  capstone: {id: CapstoneId; title: string; intro: string};
}

export const LEARNING_JOURNEYS: LearningJourney[] = [
  {id: 'measure-earth', title: 'Measure the Earth', title_zh: '测量地球', colour: '#3fb6ff',
    seed: 'An angle is an amount of turn.',
    question: 'About 2,200 years ago, Eratosthenes measured the whole Earth with a stick and its shadow. How?',
    destination: 'Work out the distance round the Earth from one shadow angle and one walking distance.',
    stations: [
      {id: 'g3-angles', tool: 'Angles', rule: 'an angle = an amount of turn', why: 'A shadow and a stick make an angle — the starting clue.'},
      {id: 'g4-angle-measure', tool: 'Degrees', rule: 'a full turn = 360°', why: 'Measuring angles in degrees lets us compare a small angle with a whole turn.'},
      {id: 'g6-circumference', tool: 'Circumference', rule: 'C = πd = 2πr', why: 'Once we know the distance round the Earth, π gives its radius.'},
      {id: 'g6-proportion', tool: 'Proportion', rule: 'a : b = c : d', why: 'A part of the angle matches the same part of the distance.'},
      {id: 'g7-parallel-angles', tool: 'Parallel lines', rule: 'parallel lines ⇒ alternate angles are equal', why: 'Sun rays arrive parallel, so the shadow angle equals the angle at the Earth’s centre.'},
      {id: 'g9-arc-length', tool: 'Arc length', rule: 'l = (n / 360) × C', why: 'An arc of n° is n/360 of the whole circle — the key equation.'},
    ],
    capstone: {id: 'eratosthenes', title: 'Eratosthenes’ stick and shadow', intro: 'At noon in Syene the sun shone straight down a well; in Alexandria a stick cast a shadow. Use every tool to find the size of the Earth.'}},
  {id: 'fair-game', title: 'Is this game fair?', title_zh: '这个游戏公平吗', colour: '#ff6fb5',
    seed: 'A whole can be shared into equal parts.',
    question: 'A stall offers a prize if your two dice add up to a lucky number. Who wins in the long run — you or the stall?',
    destination: 'Design a dice game, compute its expected value, and test it with a thousand simulated rolls.',
    stations: [
      {id: 'g3-equal-parts', tool: 'Fractions', rule: '1 of n equal parts = 1/n', why: 'Probabilities are fractions of all the equally likely outcomes.'},
      {id: 'g6-likelihood', tool: 'Chance', rule: 'impossible 0 ≤ chance ≤ 1 certain', why: 'Put events on a scale from impossible to certain.'},
      {id: 'g6-experiments', tool: 'Experiments', rule: 'frequency ≈ probability over many trials', why: 'Repeating an experiment lets us check a prediction.'},
      {id: 'g9-probability', tool: 'Listing outcomes', rule: 'use a table or a tree', why: 'Two dice have 6 × 6 = 36 equally likely results — list them all.'},
      {id: 'g10-sample-space', tool: 'Classical probability', rule: 'P(A) = favourable / total', why: 'Count the outcomes that win.'},
      {id: 'g12-expectation', tool: 'Expected value', rule: 'E = Σ value × probability', why: 'The average win per game decides who profits in the long run.'},
    ],
    capstone: {id: 'fair-game', title: 'Run the dice stall', intro: 'Choose the lucky sum, the prize and the price of a game. Is it fair, good for players, or good for the stall?'}},
  {id: 'biggest-garden', title: 'The biggest garden', title_zh: '最大的菜园', colour: '#5cc46a',
    seed: 'Perimeter is the distance around a shape.',
    question: 'You have 40 m of fence and a long wall. What rectangle gives the biggest garden?',
    destination: 'Solve one optimisation problem three ways — table, parabola, derivative — and see them agree.',
    stations: [
      {id: 'g3-perimeter', tool: 'Perimeter', rule: 'fence used = sum of the sides', why: 'The fence fixes the perimeter of three sides.'},
      {id: 'g5-equations', tool: 'Equations', rule: 'keep both sides balanced', why: 'If the width is x, the length must be 40 − 2x.'},
      {id: 'g7-algebraic-expr', tool: 'Expressions', rule: 'area = x(40 − 2x)', why: 'Letters let us write the area for every possible width at once.'},
      {id: 'g8-direct-function', tool: 'Functions', rule: 'each input x gives one output A(x)', why: 'The area is a function of the width — we can graph it.'},
      {id: 'g9-parabola', tool: 'Parabolas', rule: 'vertex at x = −b / 2a', why: 'A(x) = −2x² + 40x is a parabola; its top is the best garden.'},
      {id: 'g11-rate-of-change', tool: 'Rate of change', rule: 'slope of the tangent = A′(x)', why: 'At the top of the curve, the area stops increasing: slope 0.'},
      {id: 'g11-optimization', tool: 'Optimisation', rule: 'solve A′(x) = 0, check the ends', why: 'The general method that works for any shape and any fence.'},
    ],
    capstone: {id: 'garden', title: 'Fence the biggest garden', intro: 'Slide the width. The table, the parabola and the derivative must all point to the same best garden.'}},
  {id: 'growth', title: 'How fast do things grow?', title_zh: '增长有多快', colour: '#ff8a3d',
    seed: 'Multiplication is repeated equal groups.',
    question: 'Put ¥1000 in the bank at 5% a year. When does it double? And what if you add ¥1000 every year?',
    destination: 'Find a doubling time with logarithms and add up a lifetime of savings with a geometric series.',
    stations: [
      {id: 'g2-mult-meaning', tool: 'Multiplication', rule: 'n groups of a = n × a', why: 'Growth is multiplication, applied again and again.'},
      {id: 'g6-percent-change', tool: 'Percentage change', rule: 'up 5% means × 1.05', why: 'Each year the money is multiplied by the same factor.'},
      {id: 'g7-powers', tool: 'Powers', rule: '1.05 × 1.05 × … = 1.05ⁿ', why: 'Repeated multiplication is written as a power.'},
      {id: 'g10-exponential', tool: 'Exponential functions', rule: 'y = a · bᵗ', why: 'The balance after t years follows an exponential curve.'},
      {id: 'g10-logarithm', tool: 'Logarithms', rule: 'bᵗ = k  ⇔  t = log_b k', why: 'Logarithms undo powers: they tell us how long growth takes.'},
      {id: 'g11-geometric-seq', tool: 'Geometric series', rule: 'Sₙ = a(qⁿ − 1)/(q − 1)', why: 'Regular deposits each grow by a different power: add them with one formula.'},
    ],
    capstone: {id: 'growth', title: 'The savings machine', intro: 'Choose an interest rate. Watch a single deposit double, then watch yearly deposits snowball.'}},
  {id: 'gps', title: 'Where am I? How GPS works', title_zh: '我在哪里：GPS 的原理', colour: '#9b6bff',
    seed: 'A position can be written as a pair of numbers.',
    question: 'Your phone hears how far away three towers are. How does it work out exactly where it is?',
    destination: 'Turn three distances into three circles, the circles into two straight lines, and solve.',
    stations: [
      {id: 'g5-coordinates', tool: 'Ordered pairs', rule: 'a point = (column, row)', why: 'Every place gets a pair of numbers.'},
      {id: 'g7-cartesian', tool: 'The coordinate plane', rule: 'point P(x, y), negatives included', why: 'Axes in every direction cover the whole map.'},
      {id: 'g7-systems', tool: 'Systems of equations', rule: 'two lines meet at one point', why: 'The final step solves two equations at once.'},
      {id: 'g8-pythagorean', tool: 'Pythagoras', rule: 'a² + b² = c²', why: 'Straight-line distance comes from a right triangle.'},
      {id: 'g11-distance', tool: 'Distance formula', rule: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)', why: 'Pythagoras written with coordinates.'},
      {id: 'g11-circle-eq', tool: 'Circle equations', rule: '(x − a)² + (y − b)² = r²', why: 'All points at distance r from a tower form a circle.'},
    ],
    capstone: {id: 'gps', title: 'Find the phone', intro: 'Three towers report their distances. Subtracting circle equations leaves two straight lines — solve them to find the phone.'}},
];

export const getLearningJourney = (id: string) => LEARNING_JOURNEYS.find(j => j.id === id);
/** Every journey and position that a knowledge point appears in. */
export const journeysThrough = (pointId: string) => LEARNING_JOURNEYS.flatMap(j => { const i = j.stations.findIndex(s => s.id === pointId); return i >= 0 ? [{journey: j, index: i}] : []; });

/* ---------------- capstone mathematics ---------------- */
/** Circumference from a shadow angle (degrees) and the ground distance it corresponds to. */
export const earthCircumference = (angleDeg: number, distanceKm: number) => (360 / angleDeg) * distanceKm;
export const earthRadius = (circumferenceKm: number) => circumferenceKm / (2 * Math.PI);

/** Ways two dice make each sum 2–12. */
export const diceWays = (sum: number) => (sum < 2 || sum > 12 ? 0 : 6 - Math.abs(sum - 7));
/** Expected profit per game for the player: win `prize` (net of the price) with probability p, else lose the price. */
export function diceGame(sum: number, prize: number, price: number) {
  const p = diceWays(sum) / 36; const ev = p * (prize - price) + (1 - p) * -price;
  return {p, ev, verdict: Math.abs(ev) < 1e-9 ? 'fair' : ev > 0 ? 'good for players' : 'good for the stall'} as const;
}
/** Deterministic pseudo-random dice for the simulation (so the page renders the same every time). */
export function simulateDice(n: number, sum: number, seed = 7): number {
  let s = seed >>> 0, hits = 0; const r = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = 0; i < n; i++) if (1 + Math.floor(r() * 6) + 1 + Math.floor(r() * 6) === sum) hits++;
  return hits;
}

/** Garden against a wall with fence L on three sides: width x, length L − 2x. */
export const gardenArea = (L: number, x: number) => x * (L - 2 * x);
export const gardenSlope = (L: number, x: number) => L - 4 * x;
export const gardenBest = (L: number) => ({x: L / 4, area: (L * L) / 8});

/** Compound growth. */
export const balanceAfter = (P: number, rate: number, years: number) => P * (1 + rate) ** years;
export const doublingTime = (rate: number) => Math.log(2) / Math.log(1 + rate);
/** Deposit `a` at the start of every year for n years: a(1+r)((1+r)ⁿ − 1)/r. */
export const savingsAfter = (a: number, rate: number, n: number) => (rate === 0 ? a * n : (a * (1 + rate) * ((1 + rate) ** n - 1)) / rate);

/** Trilateration: three towers (x, y) with distances r; subtract circle equations and solve the 2×2 system. */
export type Tower = {x: number; y: number; r: number};
export function trilaterate([A, B, Cc]: [Tower, Tower, Tower]) {
  // (x−xA)² + (y−yA)² = rA² minus the same for B gives a linear equation a₁x + b₁y = c₁ (and A − C gives the second).
  const line = (P: Tower, Q: Tower) => ({a: 2 * (Q.x - P.x), b: 2 * (Q.y - P.y), c: P.r ** 2 - Q.r ** 2 - P.x ** 2 + Q.x ** 2 - P.y ** 2 + Q.y ** 2});
  const l1 = line(A, B), l2 = line(A, Cc); const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < 1e-12) return {l1, l2, point: null};
  return {l1, l2, point: {x: (l1.c * l2.b - l2.c * l1.b) / det, y: (l1.a * l2.c - l2.a * l1.c) / det}};
}
