/**
 * The Frontier: mathematics problems OpenAI models have tackled, explained for high-school students
 * and ordered from hardest (the Millennium Prize Problems) to the olympiad level.
 *
 * Every claim below is stated as a claim, with its verification status and sources. Repository facts
 * come from github.com/openai/math at commit 4eaee87 (29 October 2026).
 */
export type FrontierStatus = 'open' | 'solved-by-humans' | 'claim-disputed' | 'claim-lean' | 'claim' | 'competition';
export type ExplorerId = 'blowup' | 'primes' | 'subset' | 'elliptic' | 'loops' | 'moser' | 'pi' | 'egypt' | 'lpf' | 'snaky' | 'sunny' | 'bonza' | 'game' | 'divisors';

export interface Source {label: string; url: string}
export interface FrontierItem {
  id: string; level: 1 | 2 | 3 | 4; title: string; title_zh: string;
  /** The problem in plain language. */
  question: string;
  /** Why it matters, or why it is hard. */
  why: string;
  /** What OpenAI claimed or did, stated precisely. */
  openai: string;
  status: FrontierStatus;
  /** For olympiad problems: the verified final answer and the key idea. */
  answer?: string; idea?: string[];
  explorer?: ExplorerId;
  /** Universe knowledge points that help a student read this problem. */
  learn: string[];
  sources: Source[];
}

export const REPO = 'https://github.com/openai/math';
const repo = (path: string, label: string): Source => ({label, url: `${REPO}/blob/main/${path}`});
const lean = (id: string) => repo(`lean/docs/${id}.md`, `Lean formalisation notes (#${id})`);
const CATALOGUE = repo('CONTENTS.md', 'openai/math manuscript map');
const HISTORY = repo('history.md', 'openai/math release history');
const MILLENNIUM: Source = {label: 'Millennium Prize Problems (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Millennium_Prize_Problems'};
const IMO_PROBLEMS: Source = {label: 'IMO 2025 official problems', url: 'https://www.imo-official.org/problems/2025/'};
const IMO_AOPS: Source = {label: 'IMO 2025 problems and discussion (AoPS)', url: 'https://artofproblemsolving.com/wiki/index.php/2025_IMO_Problems'};
const IMO_AI: Source = {label: 'Coverage of AI results at IMO 2025 (NYU Shanghai RITS)', url: 'https://rits.shanghai.nyu.edu/ai/ai-wins-gold-at-2025-international-mathematical-olympiad/'};
const IMO_OPENAI = 'In July 2025 OpenAI reported that an experimental reasoning model solved Problems 1–5 of IMO 2025 (35 of 42 points, the gold-medal threshold), graded by three former IMO medallists. The IMO did not officially certify OpenAI’s result; the model was a research system, not a product. It did not solve Problem 6.';

export const LEVELS: {level: 1 | 2 | 3 | 4; title: string; title_zh: string; blurb: string}[] = [
  {level: 1, title: 'The summit: the seven Millennium Prize Problems', title_zh: '顶峰：七个千禧年大奖难题', blurb: 'Chosen in 2000 by the Clay Mathematics Institute, each carries a $1 million prize. Only one has been solved — by a human. OpenAI has claimed one of the others, and partial results on several more.'},
  {level: 2, title: 'Famous conjectures', title_zh: '著名猜想', blurb: 'Questions that leading mathematicians posed decades ago. OpenAI’s catalogue claims proofs; many come with computer-checked Lean formalisations, but none has yet been through peer review.'},
  {level: 3, title: 'Research puzzles you can play with', title_zh: '可以动手玩的研究题', blurb: 'Open problems whose statements fit in a sentence. You can experiment with them before reading any proof.'},
  {level: 4, title: 'Olympiad problems', title_zh: '奥林匹克竞赛题', blurb: 'Written for the world’s strongest high-school students. Answers here have been re-checked by computation in this app.'},
];

export const STATUS_LABEL: Record<FrontierStatus, {label: string; note: string}> = {
  'open': {label: 'Still open', note: 'Nobody — human or AI — has solved it.'},
  'solved-by-humans': {label: 'Solved by a human', note: 'Accepted by the mathematical community.'},
  'claim-disputed': {label: 'OpenAI claim · disputed, unverified', note: 'Announced, but not yet independently verified, and the credit is contested.'},
  'claim-lean': {label: 'OpenAI claim · Lean formalisation listed', note: 'A computer-checked formal proof is listed. Experts still need to confirm the formal statement says what the paper claims, and the work has not been peer reviewed.'},
  'claim': {label: 'OpenAI claim · not yet formalised', note: 'Released as a manuscript without a Lean formalisation; not peer reviewed.'},
  'competition': {label: 'Solved in competition conditions', note: 'Graded by former medallists, not officially certified by the IMO.'},
};

export const FRONTIER: FrontierItem[] = [
  /* ---------------- Level 1: Millennium Prize Problems ---------------- */
  {id: 'navier-stokes', level: 1, title: 'Navier–Stokes existence and smoothness', title_zh: '纳维–斯托克斯方程解的存在性与光滑性',
    question: 'The Navier–Stokes equations describe how water and air flow. Start a smooth, gentle flow in three dimensions. Does it stay smooth forever, or can the speed become infinite at some point after a finite time (a “blowup”)?',
    why: 'Engineers solve these equations on computers every day, yet nobody could prove the solutions always make sense. A blowup would mean the equations themselves break down.',
    openai: 'On 8 September 2026 OpenAI announced a claimed proof of finite-time blowup in a version with a smooth driving force (Clay’s statements C and D), with a Lean formalisation; reports describe thousands of copies of an unreleased model working for about 88 hours. Mathematicians Tristan Buckmaster and Javier Alpöge, who had related results, dispute the credit. Buckmaster has said the formal check is incomplete, and an independent preprint reports differences between the formal and the written proof. The Clay Institute considers solutions only two years after publication.',
    status: 'claim-disputed', explorer: 'blowup', learn: ['g11-rate-of-change', 'g10-exponential'],
    sources: [{label: 'OpenAI: On the Navier–Stokes Millennium Prize Problem', url: 'https://openai.com/index/navier-stokes-solution/'}, {label: 'Quanta Magazine (8 Sep 2026)', url: 'https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/'}, {label: 'Scientific American: the inside story', url: 'https://www.scientificamerican.com/article/the-inside-story-behind-openais-million-dollar-math-proof/'}, {label: 'Navier–Stokes priority controversy (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_priority_controversy'}, MILLENNIUM]},
  {id: 'riemann', level: 1, title: 'The Riemann Hypothesis', title_zh: '黎曼猜想',
    question: 'Primes look random, yet they thin out in a very regular way: there are about x / ln x primes below x. The Riemann Hypothesis says the error in the best such estimate is as small as it could possibly be. Formally, every “non-trivial zero” of the zeta function ζ(s) has real part exactly 1/2.',
    why: 'Thousands of theorems begin “assuming the Riemann Hypothesis…”. Proving it would pin down the distribution of primes almost perfectly.',
    openai: 'Not solved. OpenAI’s catalogue (result #003) claims that ζ(s) and every Dirichlet L-function have no zeros with real part greater than 7/8 — the so-called quasi-Riemann hypothesis. That is a far weaker statement than real part exactly 1/2, but any such zero-free strip had been out of reach. A Lean formalisation is listed.',
    status: 'open', explorer: 'primes', learn: ['g5-primes', 'g10-logarithm'],
    sources: [CATALOGUE, lean('003'), MILLENNIUM]},
  {id: 'p-vs-np', level: 1, title: 'P versus NP', title_zh: 'P 与 NP 问题',
    question: 'Some puzzles are easy to check but seem hard to solve. Given a list of numbers, can you pick some that add up exactly to a target? Checking a proposed answer is quick; finding one may mean trying every subset. Is every quickly checkable problem also quickly solvable?',
    why: 'Most of computer security assumes the answer is “no”. A “yes” would make many hard problems easy overnight.',
    openai: 'Not solved. The catalogue claims nearby results: #378 says the Exponential Time Hypothesis is false (3-SAT can be solved in slightly sub-exponential time), now being examined by a working group led by Russell Impagliazzo, Ramamohan Paturi and Ryan Williams; #138 claims Subset Sum in about 2^(0.49n) steps, beating the 2^(n/2) “meet in the middle” method. Neither settles P vs NP: these algorithms are still slower than any polynomial.',
    status: 'open', explorer: 'subset', learn: ['g12-counting-principles', 'g10-exponential'],
    sources: [CATALOGUE, lean('378'), HISTORY, MILLENNIUM]},
  {id: 'bsd', level: 1, title: 'The Birch and Swinnerton-Dyer Conjecture', title_zh: '贝赫和斯维讷通-戴尔猜想',
    question: 'Curves such as y² = x³ − 2 (elliptic curves) can have infinitely many points with fraction coordinates. Starting from (3, 5), drawing tangents and chords produces more: (129/100, −383/1000), … The conjecture predicts how many independent starting points a curve needs by counting its solutions modulo primes.',
    why: 'It links two very different worlds — exact fractions and arithmetic “clock” counting — and is central to modern number theory.',
    openai: 'Not solved in general. #002 claims the full BSD formula for every elliptic curve over ℚ whose Selmer group has corank 0 or 1 at some prime; with #006 this covers almost all “quadratic twists” of every curve. No Lean formalisation is listed for #002.',
    status: 'open', explorer: 'elliptic', learn: ['g11-slope', 'g10-power-functions'],
    sources: [CATALOGUE, MILLENNIUM]},
  {id: 'hodge', level: 1, title: 'The Hodge Conjecture', title_zh: '霍奇猜想',
    question: 'Complicated high-dimensional shapes defined by polynomial equations contain special “holes” (Hodge classes). Can every such hole be built from smaller shapes that are themselves defined by polynomial equations?',
    why: 'It would explain when geometry that we can only detect through calculus is really made of algebra.',
    openai: 'Not solved in general. #032 claims the rational Hodge conjecture for CM abelian varieties, an important special family, and a Lean formalisation was added on 26 October 2026. On 7 October OpenAI withdrew three related manuscripts after a sign error was found — a reminder that these are claims under review.',
    status: 'open', learn: ['g10-complex-plane', 'g11-space-vectors'],
    sources: [CATALOGUE, lean('032'), HISTORY, MILLENNIUM]},
  {id: 'yang-mills', level: 1, title: 'Yang–Mills existence and the mass gap', title_zh: '杨–米尔斯存在性与质量间隙',
    question: 'The theory that holds atomic nuclei together (built on Yang–Mills theory, named after Chen-Ning Yang and Robert Mills) predicts that its lightest particles have a strictly positive mass — a “mass gap”. Can the theory be built with complete mathematical rigour in four-dimensional spacetime, and does the gap really exist?',
    why: 'Physicists use the theory with great success, but nobody can yet define it rigorously.',
    openai: 'Not solved. #215 claims to construct a two-dimensional “O(3) model” with a positive mass gap — a much simpler cousin that physicists use as a toy version of the four-dimensional problem. A Lean formalisation is listed.',
    status: 'open', learn: ['g10-function-concept'],
    sources: [CATALOGUE, lean('215'), MILLENNIUM]},
  {id: 'poincare', level: 1, title: 'The Poincaré Conjecture', title_zh: '庞加莱猜想',
    question: 'On the surface of a ball, every loop of string can be pulled tight to a point; on a doughnut, a loop around the hole cannot. Is every closed three-dimensional space in which all loops can be shrunk really just a (three-dimensional) sphere?',
    why: 'It was the central question of topology for a century.',
    openai: 'Solved by Grigori Perelman in 2002–2003, without AI. He declined the Millennium Prize in 2010. It is the only Millennium Problem accepted as solved.',
    status: 'solved-by-humans', explorer: 'loops', learn: ['g1-solids', 'g10-polyhedra-volume'],
    sources: [MILLENNIUM]},

  /* ---------------- Level 2: famous conjectures ---------------- */
  {id: 'plane-colouring', level: 2, title: 'Colouring the plane (Hadwiger–Nelson)', title_zh: '平面染色问题',
    question: 'Paint every point of the plane so that any two points exactly 1 unit apart get different colours. How few colours suffice?',
    why: 'Seven colours always work. In 2018 Aubrey de Grey showed four are not enough. The true answer has to be 5, 6 or 7.',
    openai: '#158 claims five colours are not enough either, leaving only 6 or 7. A Lean formalisation is listed.',
    status: 'claim-lean', explorer: 'moser', learn: ['g6-circle-parts', 'g12-counting-principles'],
    sources: [CATALOGUE, lean('158')]},
  {id: 'pi-exponent', level: 2, title: 'How well can fractions approximate π?', title_zh: '分数能多好地逼近 π？',
    question: '22/7 and 355/113 are famously close to π. Can some fractions p/q be much closer than about 1/q², the accuracy you would expect?',
    why: 'This “irrationality exponent” of π had been bounded only above about 7.1; its true value was unknown.',
    openai: '#017 claims the exponent is exactly 2: no fractions are much better than expected. It also claims the strange series Σ 1/(n³ sin² n) converges (the Flint Hills problem). A Lean formalisation is listed.',
    status: 'claim-lean', explorer: 'pi', learn: ['g6-rolling-pi', 'g5-equivalent'],
    sources: [CATALOGUE, lean('017'), repo('reasoning_traces/irrationality-exponent-of-pi.pdf', 'Abridged reasoning summary (#017)')]},
  {id: 'erdos-ap', level: 2, title: 'Erdős’s arithmetic-progression conjecture', title_zh: '埃尔德什等差数列猜想',
    question: 'Take any set of positive whole numbers whose reciprocals add up to infinity (like the primes: 1/2 + 1/3 + 1/5 + … diverges). Must it contain evenly spaced runs of every length — like 3, 5, 7 or 5, 11, 17, 23, 29?',
    why: 'It was among the problems Erdős attached his largest cash prizes to. The Green–Tao theorem (2004) settled the case of the primes.',
    openai: '#159 claims a proof of the full conjecture, via much stronger bounds for sets without arithmetic progressions. A Lean formalisation is listed.',
    status: 'claim-lean', learn: ['g11-arithmetic-seq', 'g11-halving'],
    sources: [CATALOGUE, lean('159'), repo('reasoning_traces/quasipolynomial-arithmetic-progressions.pdf', 'Abridged reasoning summary (#159)')]},
  {id: 'egyptian', level: 2, title: 'Short Egyptian fractions', title_zh: '简短的埃及分数',
    question: 'Ancient Egyptians wrote fractions as sums of different unit fractions: 4/13 = 1/4 + 1/18 + 1/468. How many terms might you need for a fraction a/b?',
    why: 'The obvious greedy method can need many terms with gigantic denominators. Erdős conjectured that you never need more than about log log b terms.',
    openai: '#025 claims that every a/b < 1 is a sum of O(log log b) distinct unit fractions, and that this is the right order. A Lean formalisation is listed.',
    status: 'claim-lean', explorer: 'egypt', learn: ['g3-equal-parts', 'g10-logarithm'],
    sources: [CATALOGUE, lean('025')]},
  {id: 'crossing', level: 2, title: 'Crossing numbers of complete graphs (Harary–Hill)', title_zh: '完全图的交叉数',
    question: 'Draw n dots and connect every pair with a curve. What is the smallest number of crossings any drawing can have? A conjectured formula has existed since the 1960s, together with drawings that achieve it.',
    why: 'Turán first asked the related “brick factory problem” while working in a WWII labour camp; it was proved only for small n.',
    openai: '#165 claims the conjectured formulas are correct for every complete graph and complete bipartite graph. A Lean formalisation is listed.',
    status: 'claim-lean', learn: ['g12-counting-principles'],
    sources: [CATALOGUE, lean('165')]},
  {id: 'multiplication', level: 2, title: 'Multiplying faster than n log n', title_zh: '比 n log n 更快的乘法',
    question: 'School multiplication of two n-digit numbers takes about n² steps. Clever methods are far faster; since 2019 there has been an n log n method, widely believed to be the best possible. Is it?',
    why: 'Multiplication is the most basic algorithm there is; its true cost is a fundamental question.',
    openai: '#109 claims an algorithm slightly faster than n log n, which would disprove the long-standing belief that n log n is optimal. The improvement is extraordinarily small (an exponent of 2^−182). No Lean formalisation is listed.',
    status: 'claim', learn: ['g4-two-digit-mult', 'g10-logarithm'],
    sources: [CATALOGUE]},

  /* ---------------- Level 3: research puzzles ---------------- */
  {id: 'snaky', level: 3, title: 'Snaky: the last unknown hexomino game', title_zh: '“蛇形”六连块游戏',
    question: 'Two players take turns colouring squares on an infinite grid. The “Maker” wants their squares to contain a copy of the six-square Snaky shape (turned or flipped is fine); the other player tries to stop them. Can Maker always win?',
    why: 'Frank Harary’s game was settled for every small shape except Snaky, which stayed open for decades.',
    openai: '#187 claims Maker can always build Snaky within 21 of Maker’s moves. A Lean formalisation is listed.',
    status: 'claim-lean', explorer: 'snaky', learn: ['g12-counting-principles', 'g2-solid-views'],
    sources: [CATALOGUE, lean('187')]},
  {id: 'lpf', level: 3, title: 'Largest prime factors of neighbours', title_zh: '相邻整数的最大质因数',
    question: 'Compare the largest prime factor of n with that of n + 1. For 14 = 2·7 and 15 = 3·5, it falls from 7 to 5. How often does it rise?',
    why: 'Erdős and Pomerance conjectured that the sizes are asymptotically independent, so it rises exactly half the time in the long run.',
    openai: '#012 claims a proof: the share of n with a rising largest prime factor tends to 1/2. A Lean formalisation is listed.',
    status: 'claim-lean', explorer: 'lpf', learn: ['g5-prime-factorization', 'g10-sample-space'],
    sources: [CATALOGUE, lean('012')]},
  {id: 'heilbronn', level: 3, title: 'Heilbronn’s triangle problem', title_zh: '海尔布伦三角形问题',
    question: 'Place n points in a unit square so that the smallest triangle formed by any three of them is as large as possible. How large can that smallest area be?',
    why: 'A natural guess was that the best is about 1/n² (up to small factors).',
    openai: '#191 claims configurations doing better by a power of n, disproving that guess. No Lean formalisation is listed.',
    status: 'claim', learn: ['g5-triangle', 'g11-distance'],
    sources: [CATALOGUE]},
  {id: 'scheduling', level: 3, title: 'Scheduling on three machines', title_zh: '三台机器的排程问题',
    question: 'Jobs each take one hour, and some must finish before others start. With three identical machines, what is the shortest total time? Is there a fast method?',
    why: 'Garey and Johnson listed it in 1979 among famous problems of unknown difficulty. Two machines were solved long ago.',
    openai: '#124 claims a polynomial-time algorithm for three machines. A Lean formalisation is listed.',
    status: 'claim-lean', learn: ['g12-counting-principles'],
    sources: [CATALOGUE, lean('124')]},

  /* ---------------- Level 4: IMO 2025 (hardest first) ---------------- */
  {id: 'imo-p3', level: 4, title: 'IMO 2025 Problem 3: bonza functions', title_zh: '2025 IMO 第 3 题：“bonza” 函数',
    question: 'A function f from positive integers to positive integers is called bonza if f(a) divides bᵃ − f(b)^{f(a)} for all positive integers a and b. Find the smallest constant c such that f(n) ≤ c·n for every bonza function f and every n.',
    why: 'Problem 3 is traditionally one of the two hardest problems of the contest.',
    openai: IMO_OPENAI, status: 'competition', explorer: 'bonza',
    answer: 'c = 4.',
    idea: ['Putting b = a shows f(a) divides aᵃ, so f(a) can only use the primes of a.', 'Odd primes turn out to be very restricted, so all the growth comes from powers of 2.', 'An example reaches 4: f(n) = 1 for odd n, 2 when n is twice an odd number, and 2^(v+2) when n = 2^v·(odd) with v ≥ 2. Then f(4) = 16 = 4·4.', 'The hard part is the upper bound, a careful analysis of how many factors of 2 f(n) can contain.'],
    learn: ['g5-factors', 'g10-exponential'], sources: [IMO_PROBLEMS, IMO_AOPS, IMO_AI]},
  {id: 'imo-p5', level: 4, title: 'IMO 2025 Problem 5: the inekoalaty game', title_zh: '2025 IMO 第 5 题：inekoalaty 游戏',
    question: 'Alice and Bazza take turns choosing numbers x₁, x₂, … ≥ 0, with a fixed positive number λ. On odd turns Alice must keep x₁ + … + xₙ ≤ λn; on even turns Bazza must keep x₁² + … + xₙ² ≤ n. A player who cannot move loses; if the game goes on forever, nobody wins. For which λ can Alice force a win, and for which can Bazza?',
    why: 'Each player’s constraint uses a different kind of size (sum versus sum of squares), and the threshold comes from their comparison.',
    openai: IMO_OPENAI, status: 'competition', explorer: 'game',
    answer: 'Alice wins exactly when λ > 1/√2, Bazza wins exactly when λ < 1/√2, and at λ = 1/√2 neither player can force a win.',
    idea: ['Bazza’s best move fills his budget: x = √(n − sum of squares so far).', 'Whatever Alice plays, x + √(2 − x²) ≥ √2, so each pair of turns adds at least √2 to the sum. If λ < 1/√2, Alice’s budget λn eventually runs out.', 'If λ > 1/√2, Alice waits with zeros; by the Cauchy–Schwarz inequality Bazza’s numbers add up to at most about k√2. Then one big move from Alice pushes the sum of squares beyond what Bazza can survive.'],
    learn: ['g10-am-gm', 'g7-inequality-props'], sources: [IMO_PROBLEMS, IMO_AOPS, IMO_AI]},
  {id: 'imo-p1', level: 4, title: 'IMO 2025 Problem 1: sunny lines', title_zh: '2025 IMO 第 1 题：“阳光”直线',
    question: 'A line is sunny if it is not parallel to the x-axis, the y-axis or the line x + y = 0. For n ≥ 3, find all k such that there are n distinct lines covering every point (a, b) with positive integers a, b and a + b ≤ n + 1, exactly k of which are sunny.',
    why: 'The points form a triangle; non-sunny lines are the natural rows, columns and diagonals.',
    openai: IMO_OPENAI, status: 'competition', explorer: 'sunny',
    answer: 'k = 0, 1 or 3 (for every n ≥ 3).',
    idea: ['Constructions: n vertical lines (k = 0); n − 1 vertical lines plus one sunny line through (n, 1) (k = 1); diagonals x + y = n + 1, …, 5 and then three sunny lines through pairs of the remaining six points (k = 3).', 'The outermost row, column or diagonal of the triangle must itself be one of the lines, otherwise too many points are left. Removing it reduces n by 1, down to n = 3.', 'For n = 3, a direct check shows exactly two sunny lines is impossible.'],
    learn: ['g11-slope', 'g4-parallel'], sources: [IMO_PROBLEMS, IMO_AOPS, IMO_AI]},
  {id: 'imo-p4', level: 4, title: 'IMO 2025 Problem 4: three largest divisors', title_zh: '2025 IMO 第 4 题：三个最大真因数',
    question: 'A proper divisor of N is a positive divisor other than N. An infinite sequence a₁, a₂, … of positive integers, each with at least three proper divisors, satisfies aₙ₊₁ = the sum of the three largest proper divisors of aₙ. Find all possible a₁.',
    why: 'You can explore it with nothing more than divisibility — then the answer turns out to have a beautiful form.',
    openai: IMO_OPENAI, status: 'competition', explorer: 'divisors',
    answer: 'a₁ = 6 · 12ᵉ · m, where e ≥ 0 and m is not divisible by 2 or 5.',
    idea: ['If N is divisible by 6 (but not 4 or 5), its three largest proper divisors are N/2, N/3, N/6, which add up to N: the sequence stands still.', 'If N is divisible by 12, the sum is N/2 + N/3 + N/4 = 13N/12: one factor 12 becomes 13.', 'Every other case makes the terms shrink or lose their divisibility, so the sequence eventually stops. Running the sequence for every start below 6000 in this app’s tests matches the formula.'],
    learn: ['g5-factors', 'g5-prime-factorization'], sources: [IMO_PROBLEMS, IMO_AOPS, IMO_AI]},
];

export const frontierByLevel = (level: 1 | 2 | 3 | 4) => FRONTIER.filter(f => f.level === level);
export const REPO_NOTE = 'OpenAI describes the 721 manuscripts in github.com/openai/math as “raw research data rather than polished academic papers”. About 42% of the headline results have Lean formalisations; three manuscripts were withdrawn on 7 October 2026 after an error was found. OpenAI says it defers to the mathematical community on credit and correctness.';
