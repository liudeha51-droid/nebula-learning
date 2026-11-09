import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(10);
const B1 = '必修第一册', B2 = '必修第二册';

g.chapter('g10-sets', 'Sets and Basic Logic', '集合与常用逻辑用语', 'number', 'The language of sets, conditions and quantifiers.', B1);
g.k('g10-set-operations', 'Sets and set operations', '集合的概念与运算', {
  d: 'Intersection is what two sets share, union is everything in either, the complement is what lies outside — Venn diagrams make each visible.', t: ['Sets and elements', 'Subsets', 'Intersection', 'Union', 'Complement'],
  o: ['Describe sets and subsets', 'Compute intersections, unions and complements'], pre: ['g1-multi-sort'], rel: ['g10-conditions'],
  e: 'sets', c: {mode: 'operations'}, m: ['∅ is the same as {0}', 'A ∪ B counts shared elements twice'],
  q: [N('A = {1, 2, 3, 4}, B = {3, 4, 5}. How many elements in A ∪ B?', 5, '{1, 2, 3, 4, 5}.'), N('How many subsets does {a, b, c} have?', 8, '2³.')],
  x: ['Survey: 30 like maths, 25 like music, 10 like both, 5 neither. How many students?'], f: '|A\\cup B|=|A|+|B|-|A\\cap B|',
});
g.k('g10-conditions', 'Sufficient and necessary conditions; quantifiers', '充分条件与必要条件、全称量词与存在量词', {
  d: 'p ⇒ q means p is sufficient for q and q is necessary for p — in sets, P ⊆ Q.', t: ['Sufficient conditions', 'Necessary conditions', 'Necessary and sufficient conditions', 'Universal and existential quantifiers', 'Negation of quantified statements'],
  o: ['Classify conditions using subsets', 'Negate quantified statements'], pre: ['g10-set-operations'],
  e: 'sets', c: {mode: 'conditions'}, m: ['Sufficient and necessary are the same', 'Negating “all” gives “none”'],
  q: [M('“x > 2” is ___ for “x > 1”.', ['Sufficient but not necessary', 'Necessary but not sufficient', 'Both'], 'Sufficient but not necessary', '{x > 2} ⊂ {x > 1}.'), M('Negation of “every square is a rectangle”:', ['Some square is not a rectangle', 'No square is a rectangle'], 'Some square is not a rectangle', '∀ becomes ∃.')],
  x: ['Write a necessary-and-sufficient condition for a number to be even.'],
});

g.chapter('g10-quadratic', 'Quadratic Functions, Equations and Inequalities', '一元二次函数、方程和不等式', 'relationships', 'Properties of inequalities, the AM–GM inequality and quadratic inequalities.', B1);
g.k('g10-am-gm', 'The basic inequality (AM–GM)', '基本不等式', {
  d: 'For a, b > 0, (a + b)/2 ≥ √(ab): four a×b rectangles fit inside a square of side a + b.', t: ['Properties of inequalities', 'Basic inequality', 'Maximum and minimum problems'],
  o: ['Prove AM–GM geometrically', 'Use it for optimisation (one positive, two fixed, three equal)'], pre: ['g8-expand', 'g7-inequality-props'],
  e: 'inequality', c: {mode: 'am-gm', a: 4, b: 9}, m: ['Equality whenever a and b are positive', 'Forgetting the positivity condition'],
  q: [N('Minimum of x + 4/x for x > 0?', 4, '2√4.'), N('a + b = 10, a, b > 0. Maximum ab?', 25, 'At a = b = 5.')],
  x: ['A 100 m fence along a wall: maximise area.'], f: '\\frac{a+b}{2}\\ge\\sqrt{ab}',
});
g.k('g10-quadratic-ineq', 'Quadratic inequalities', '一元二次不等式', {
  d: 'Solve ax² + bx + c > 0 by sketching the parabola and reading where it is above the x-axis.', t: ['Quadratic inequalities', 'Functions, equations and inequalities'],
  o: ['Solve quadratic inequalities with graphs', 'Relate roots, the discriminant and solution sets'], pre: ['g9-parabola', 'g7-linear-inequality'],
  e: 'func', c: {mode: 'quad-ineq', a: 1, b: -2, c: -3}, m: ['Solution of x² − 2x − 3 > 0 is −1 < x < 3', 'Δ < 0 means no solution always'],
  q: [M('Solve x² − 2x − 3 < 0.', ['−1 < x < 3', 'x < −1 or x > 3', 'x > 3'], '−1 < x < 3', 'Between the roots the parabola is below.')],
  x: ['When is x² + x + 1 > 0?'],
});

g.chapter('g10-function-concept', 'Concepts and Properties of Functions', '函数的概念与性质', 'functions', 'Functions as mappings; monotonicity, parity and power functions.', B1);
g.k('g10-function-concept', 'The concept and representations of functions', '函数的概念及其表示', {
  d: 'A function assigns each x in the domain exactly one y; tables, graphs and formulas are three views of the same rule.', t: ['Concept of function', 'Domain and range', 'Representations', 'Piecewise functions'],
  o: ['Decide whether a correspondence is a function', 'Find domains and ranges'], pre: ['g8-direct-function'], rel: ['g10-monotonic-parity'],
  e: 'func', c: {mode: 'mapping'}, m: ['A vertical line may meet a graph twice', 'Domain is whatever x looks reasonable'],
  q: [M('Domain of f(x) = √(x − 2)?', ['x ≥ 2', 'x > 2', 'All reals'], 'x ≥ 2', 'Inside of the root ≥ 0.')],
  x: ['Write a taxi fare as a piecewise function.'],
});
g.k('g10-monotonic-parity', 'Monotonicity and parity', '单调性与奇偶性', {
  d: 'Increasing means larger x gives larger f(x); even functions mirror in the y-axis, odd functions rotate 180° about the origin.', t: ['Monotonicity', 'Maximum and minimum values', 'Even and odd functions'],
  o: ['Prove monotonicity by definition', 'Test parity algebraically and graphically'], pre: ['g10-function-concept', 'g9-rotation'],
  e: 'func', c: {mode: 'parity'}, m: ['f(−x) = −f(x) means even', 'A function must be either odd or even'],
  q: [M('f(x) = x³ − x is…', ['Odd', 'Even', 'Neither'], 'Odd', 'f(−x) = −f(x).')],
  x: ['Can a function be both odd and even?'],
});
g.k('g10-power-functions', 'Power functions', '幂函数', {
  d: 'y = x^α for α = 1, 2, 3, 1/2, −1: all pass through (1, 1); α decides the shape.', t: ['Power functions', 'Graphs for α = 1, 2, 3, 1/2, −1'],
  o: ['Sketch the five basic power functions', 'Compare their growth'], pre: ['g10-monotonic-parity'],
  e: 'func', c: {mode: 'power', n: 2}, m: ['y = 2^x is a power function', 'All power functions pass through the origin'],
  q: [M('Which passes through (1, 1) but not (0, 0)?', ['y = x⁻¹', 'y = x²', 'y = x^(1/2)'], 'y = x⁻¹', '0 is not in its domain.')],
  x: ['Plot y = x^α for α between 0 and 1. What do they share?'],
});

g.chapter('g10-exp-log', 'Exponential and Logarithmic Functions', '指数函数与对数函数', 'functions', 'Growth, inverse functions and zeros.', B1);
g.k('g10-exponential', 'Exponential functions', '指数函数', {
  d: 'y = aˣ multiplies by a for each step in x: growth for a > 1, decay for 0 < a < 1; always above the x-axis.', t: ['Rational and real exponents', 'Exponential functions', 'Graphs and properties'],
  o: ['Sketch exponential graphs', 'Compare exponential growth'], pre: ['g7-powers', 'g10-power-functions'], rel: ['g10-logarithm'],
  e: 'func', c: {mode: 'exponential', a: 2}, m: ['2ˣ and x² are the same kind of function', 'aˣ can be negative'],
  q: [N('2^(-1) = ?', 0.5, 'Reciprocal.'), M('y = (1/2)ˣ is…', ['Decreasing', 'Increasing'], 'Decreasing', '0 < a < 1.')],
  x: ['A bacteria colony doubles every hour. When is it 1000 times bigger?'],
});
g.k('g10-logarithm', 'Logarithms and logarithmic functions', '对数与对数函数', {
  d: 'logₐN asks “which power of a gives N?”; y = logₐx is the mirror image of y = aˣ in y = x.', t: ['Logarithms', 'Laws of logarithms', 'Logarithmic functions', 'Inverse functions'],
  o: ['Use logarithm laws', 'Relate exponential and logarithmic graphs'], pre: ['g10-exponential'],
  e: 'func', c: {mode: 'log', a: 2}, m: ['log(a + b) = log a + log b', 'log of a negative number exists'],
  q: [N('log₂ 32 = ?', 5, '2⁵ = 32.'), N('lg 2 + lg 5 = ?', 1, 'lg 10.')],
  x: ['Why do earthquake and sound scales use logarithms?'], f: '\\log_a(MN)=\\log_aM+\\log_aN',
});
g.k('g10-growth', 'Applications: zeros, bisection and growth rates', '函数的应用：零点、二分法与增长比较', {
  d: 'A continuous function that changes sign has a zero in between; halving the interval traps it. Exponentials eventually outgrow powers, which outgrow logs.', t: ['Zeros of functions', 'Bisection method', 'Comparing linear, exponential and logarithmic growth', 'Mathematical modelling'],
  o: ['Locate zeros by bisection', 'Compare growth rates'], pre: ['g10-logarithm'],
  e: 'func', c: {mode: 'bisection'}, m: ['No sign change means no zero', 'x² always beats 2ˣ'],
  q: [N('f(1) = −1, f(2) = 2. After one bisection step, test f at x = ?', 1.5, 'The midpoint.')],
  x: ['Find √2 to 3 decimal places by bisection.'],
});

g.chapter('g10-trig-functions', 'Trigonometric Functions', '三角函数', 'functions', 'From the unit circle to periodic waves.', B1);
g.k('g10-radian', 'General angles and radian measure', '任意角和弧度制', {
  d: 'Angles can turn any amount either way; one radian is the angle whose arc equals the radius, so 180° = π.', t: ['General angles', 'Radian measure', 'Arc length in radians'],
  o: ['Convert degrees and radians', 'Use l = αr'], pre: ['g9-arc-length'], rel: ['g10-unit-circle'],
  e: 'trig', c: {mode: 'radian', deg: 120}, m: ['1 radian = 1°', 'π radians = 360°'],
  q: [N('120° in radians, as a multiple of π (give the coefficient as a decimal)?', 2 / 3, '120/180.', 0.001), N('Arc of 2 rad on radius 5?', 10, 'l = αr.')],
  x: ['Why do mathematicians prefer radians?'], f: '\\pi\\text{ rad}=180^\\circ',
});
g.k('g10-unit-circle', 'Trigonometric functions on the unit circle', '三角函数的概念', {
  d: 'For any angle, the point on the unit circle is (cos α, sin α); signs follow the quadrants.', t: ['Definition by the unit circle', 'Signs in quadrants', 'Basic identities', 'Reduction formulas'],
  o: ['Define sin and cos for any angle', 'Use sin² + cos² = 1 and reduction formulas'], pre: ['g10-radian', 'g9-trig-ratios'], rel: ['g10-sine-graph'],
  e: 'trig', c: {mode: 'unit-circle', deg: 150}, m: ['sin is always positive', 'sin(180° − α) = −sin α'],
  q: [N('sin 150° = ?', 0.5, 'Same as sin 30°.'), N('If sin α = 0.6 and α is acute, cos α = ?', 0.8, '√(1 − 0.36).')],
  x: ['Make a table of sin for 0°, 30°, …, 360° using the unit circle.'], f: '\\sin^2\\alpha+\\cos^2\\alpha=1',
});
g.k('g10-sine-graph', 'Graphs and properties of sine and cosine', '三角函数的图象与性质', {
  d: 'Unwrap the point’s height as the angle grows: the sine wave, period 2π, values between −1 and 1.', t: ['Graphs of sine, cosine and tangent', 'Period', 'Monotonic intervals', 'Maximum and minimum'],
  o: ['Sketch sine, cosine and tangent', 'Read period and range'], pre: ['g10-unit-circle'], rel: ['g10-sinusoid'],
  e: 'trig', c: {mode: 'wave'}, m: ['Period of sin x is π', 'tan x is defined everywhere'],
  q: [N('Maximum value of sin x?', 1, 'Unit circle height.'), M('Period of y = sin x?', ['2π', 'π', '360'], '2π', 'One full turn.')],
  x: ['Record day length over a year and fit a sine wave.'],
});
g.k('g10-sinusoid', 'The function y = A sin(ωx + φ)', '函数 y = A sin(ωx + φ)', {
  d: 'A stretches vertically, ω squeezes the period to 2π/ω, φ shifts the wave left or right.', t: ['Amplitude, period, phase', 'Graph transformations', 'Applications of trig functions'],
  o: ['Explain each parameter', 'Transform y = sin x step by step'], pre: ['g10-sine-graph'],
  e: 'trig', c: {mode: 'transform', A: 2, w: 2, phi: 30}, m: ['Period of sin 2x is 4π', 'Phase shift of sin(2x + π/3) is π/3'],
  q: [N('Period of y = 3 sin(2x + 1), as a multiple of π?', 1, '2π/2 = π.'), N('Amplitude?', 3, 'A = 3.')],
  x: ['Model a Ferris wheel seat height with a sinusoid.'], f: 'T=\\frac{2\\pi}{\\omega}',
});
g.k('g10-identities', 'Trigonometric identities', '三角恒等变换', {
  d: 'Rotating a unit vector by α then β gives the angle-sum formulas; double-angle formulas follow.', t: ['Sum and difference formulas', 'Double-angle formulas', 'Simple identity transformations'],
  o: ['Derive cos(α − β) with vectors or the unit circle', 'Apply sum and double-angle formulas'], pre: ['g10-unit-circle'], rel: ['g10-dot-product'],
  e: 'trig', c: {mode: 'sum-formula', deg: 30, deg2: 45}, m: ['sin(α + β) = sin α + sin β', 'cos 2α = 2 cos α'],
  q: [N('sin 75° (to 4 decimals)?', 0.9659, 'sin 45°cos 30° + cos 45°sin 30°.', 0.0005)],
  x: ['Prove sin 2α = 2 sin α cos α with the sum formula.'], f: '\\cos(\\alpha-\\beta)=\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta',
});

g.k('g10-epicycles', 'Signature: Circles that draw waves', '招牌动画：画出波形的圆', {
  d: 'A spinning circle draws a sine wave. Ride smaller, faster circles on its tip and the wave stiffens into a square wave: sums of sinusoids build almost any shape.', t: ['Graphs of sine functions', 'y = A sin(ωx + φ)', 'Sums of waves (enrichment)'],
  o: ['Relate a rotating point to a sine graph', 'See how amplitude and frequency of added waves change a graph'], pre: ['g10-sine-graph', 'g10-sinusoid'], rel: ['g10-unit-circle'],
  e: 'journey', c: {mode: 'epicycles'}, m: ['Smooth waves can never make corners', 'Adding waves just makes a bigger wave'],
  q: [N('In the square-wave chain, how many times as fast as the first does the 4th circle spin?', 7, 'Odd speeds 1, 3, 5, 7.'), M('Adding more, smaller, faster circles makes the corners…', ['Sharper', 'Rounder'], 'Sharper', 'The sum approaches a square wave.')],
  x: ['Use a graphing tool to plot sin x + sin 3x/3 + sin 5x/5. Add more terms.'], f: '\\frac{4}{\\pi}\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots\\right)',
});
g.chapter('g10-vectors', 'Plane Vectors and Applications', '平面向量及其应用', 'geometry', 'Quantities with direction; solving triangles.', B2);
g.k('g10-vector-add', 'Vector addition, subtraction and scalar multiples', '向量的线性运算', {
  d: 'Vectors add head-to-tail (or by the parallelogram); scaling changes length and may reverse direction; coordinates add component-wise.', t: ['Concept of vectors', 'Addition and subtraction', 'Scalar multiplication', 'Basis and coordinates'],
  o: ['Add vectors geometrically and with coordinates', 'Decompose vectors in a basis'], pre: ['g7-translation', 'g7-cartesian'], rel: ['g10-dot-product', 'g11-space-vectors'],
  e: 'vector', c: {mode: 'add', ax: 3, ay: 1, bx: 1, by: 2}, m: ['|a + b| = |a| + |b| always', 'a − b points from a to b'],
  q: [M('(3, 1) + (1, 2) = ?', ['(4, 3)', '(3, 2)', '(4, 2)'], '(4, 3)', 'Add components.'), N('|(3, 4)| = ?', 5, '√(9 + 16).')],
  x: ['A boat crossing a river: add its velocity and the current.'],
});
g.k('g10-dot-product', 'The dot product', '平面向量的数量积', {
  d: 'a · b = |a||b|cos θ: the length of a’s shadow on b times |b|; zero exactly when perpendicular.', t: ['Dot product', 'Projection', 'Angle between vectors', 'Perpendicularity'],
  o: ['Compute dot products in coordinates', 'Find angles and test perpendicularity'], pre: ['g10-vector-add', 'g10-unit-circle'], rel: ['g10-law-of-sines'],
  e: 'vector', c: {mode: 'dot', ax: 4, ay: 0, bx: 2, by: 3}, m: ['a · b is a vector', 'Negative dot product is impossible'],
  q: [N('(1, 2) · (3, −1) = ?', 1, '3 − 2.'), M('a · b = 0 means…', ['Perpendicular (non-zero vectors)', 'Parallel', 'Equal'], 'Perpendicular (non-zero vectors)', 'cos 90° = 0.')],
  x: ['Work done by a force at an angle.'], f: 'a\\cdot b=|a||b|\\cos\\theta=x_1x_2+y_1y_2',
});
g.k('g10-law-of-sines', 'The laws of sines and cosines', '正弦定理与余弦定理', {
  d: 'a/sin A = b/sin B = c/sin C = 2R; c² = a² + b² − 2ab cos C extends Pythagoras to any triangle.', t: ['Law of cosines', 'Law of sines', 'Solving triangles', 'Applications in measurement'],
  o: ['Choose the right law for given data', 'Solve triangles and measurement problems'], pre: ['g10-dot-product', 'g9-solve-triangle'],
  e: 'trig', c: {mode: 'laws', a: 5, b: 7, deg: 60}, m: ['Law of cosines only for right triangles', 'Ignoring the ambiguous case of SSA'],
  q: [N('a = 5, b = 7, C = 60°. c²?', 39, '25 + 49 − 35.')],
  x: ['Measure the distance to an unreachable island from two points on shore.'], f: 'c^2=a^2+b^2-2ab\\cos C',
});

g.chapter('g10-complex', 'Complex Numbers', '复数', 'number', 'Extend numbers so that x² = −1 has a solution.', B2);
g.k('g10-complex-plane', 'Complex numbers and the complex plane', '复数的概念与几何意义', {
  d: 'a + bi is the point (a, b); its modulus is the distance from 0 and conjugates reflect in the real axis.', t: ['Imaginary unit i', 'Complex numbers', 'Complex plane', 'Modulus', 'Conjugates'],
  o: ['Plot complex numbers', 'Compute modulus and conjugate'], pre: ['g7-irrational', 'g10-vector-add'], rel: ['g10-complex-multiply'],
  e: 'complex', c: {mode: 'plane', a: 3, b: 4}, m: ['i is a real number', '|3 + 4i| = 7'],
  q: [N('|3 + 4i| = ?', 5, '√(9 + 16).'), M('Conjugate of 2 − 5i?', ['2 + 5i', '−2 + 5i', '−2 − 5i'], '2 + 5i', 'Reflect in the real axis.')],
  x: ['Which complex numbers have modulus 1? Draw them.'],
});
g.k('g10-complex-multiply', 'Operations with complex numbers', '复数的四则运算', {
  d: 'Adding complex numbers adds vectors; multiplying by i rotates by 90°, so i² = −1 is two quarter turns.', t: ['Addition and subtraction', 'Multiplication and division', 'Geometric meaning of multiplication by i'],
  o: ['Calculate with complex numbers', 'Interpret multiplication by i as rotation'], pre: ['g10-complex-plane'],
  e: 'complex', c: {mode: 'multiply', a: 2, b: 1}, m: ['i² = 1', 'Dividing without using the conjugate'],
  q: [M('(1 + i)² = ?', ['2i', '2', '1 + i²'], '2i', '1 + 2i + i².'), M('i × (3 + 2i) = ?', ['−2 + 3i', '3i + 2', '−3 + 2i'], '−2 + 3i', '3i + 2i².')],
  x: ['What happens geometrically when you multiply by i four times?'], f: 'i^2=-1',
});

g.k('g10-quintic-roots', 'Signature: Roots that dance', '招牌动画：舞动的根', {
  d: 'Slowly change the constant in x⁵ − x − c = 0 around a loop: the five complex roots move and trade places. These swaps make up all 120 rearrangements — Galois’s reason why degree five has no formula.', t: ['Complex numbers in the plane', 'Roots of polynomial equations', 'Permutations and groups (enrichment)'],
  o: ['Plot roots of an equation in the complex plane', 'Relate the rearrangements of roots to a group'], pre: ['g10-complex-plane', 'g9-quadratic-formula'], rel: ['g12-perm-comb'],
  e: 'journey', c: {mode: 'quintic'}, m: ['Every polynomial equation has a formula like the quadratic formula', 'Roots always stay in their own place'],
  q: [N('In how many ways can 5 roots be rearranged?', 120, '5! = 120.'), N('x² − 7x + 12 = 0. Sum of the two roots?', 7, 'The roots 3 and 4 add up to 7.')],
  x: ['Look up Évariste Galois. What did he write the night before his duel in 1832?'],
});
g.chapter('g10-solid-geometry', 'Introduction to Solid Geometry', '立体几何初步', 'geometry', 'Solids, volumes and spatial relationships of points, lines and planes.', B2);
g.k('g10-polyhedra-volume', 'Surface areas and volumes of solids', '柱、锥、台、球的表面积与体积', {
  d: 'Three pyramids of equal volume fill a prism, so a pyramid is ⅓Sh; frustums are big minus small pyramids.', t: ['Prisms, pyramids, frustums, spheres', 'Oblique drawing', 'Surface areas', 'Volumes'],
  o: ['Compute surface areas and volumes', 'Explain the 1/3 factor by dissection'], pre: ['g6-cone-pour', 'g5-volume-meaning'], rel: ['g10-space-relations'],
  e: 'space', c: {mode: 'pyramid'}, m: ['A pyramid is half a prism', 'Sphere volume = 4πr²'],
  q: [N('Pyramid with base area 12 and height 5. Volume?', 20, '⅓ × 12 × 5.'), N('Sphere radius 3: volume as a multiple of π?', 36, '4/3 × 27.')],
  x: ['Cut a cube into three equal pyramids (Yang Hui’s method).'], f: 'V_{\\text{pyramid}}=\\tfrac13Sh,\\;V_{\\text{sphere}}=\\tfrac43\\pi R^3',
});
g.k('g10-space-relations', 'Points, lines and planes in space', '空间点、直线、平面之间的位置关系', {
  d: 'Two lines in space can intersect, be parallel or be skew; a line and plane can lie in, cross or be parallel.', t: ['Basic facts (axioms)', 'Skew lines', 'Line–plane relationships', 'Plane–plane relationships'],
  o: ['Classify spatial relationships', 'Recognise skew lines in a cube'], pre: ['g10-polyhedra-volume', 'g4-parallel'], rel: ['g10-perpendicular'],
  e: 'space', c: {mode: 'relations'}, m: ['Non-intersecting lines are parallel', 'Three points always determine a plane'],
  q: [N('In a cube, how many edges are skew to a given edge?', 4, 'Not parallel, not meeting.')],
  x: ['Find skew lines in your classroom.'],
});
g.k('g10-perpendicular', 'Parallel and perpendicular lines and planes', '空间中的平行与垂直', {
  d: 'A line perpendicular to two intersecting lines in a plane is perpendicular to the whole plane.', t: ['Line–plane parallel', 'Plane–plane parallel', 'Line–plane perpendicular', 'Plane–plane perpendicular', 'Dihedral angles'],
  o: ['Use tests and properties of parallel/perpendicular', 'Find simple dihedral angles'], pre: ['g10-space-relations'], rel: ['g11-normal-vectors'],
  e: 'space', c: {mode: 'perpendicular'}, m: ['Perpendicular to one line in the plane is enough', 'Two planes perpendicular to a third are parallel'],
  q: [M('A line ⊥ two intersecting lines of plane α. Then the line is…', ['⊥ α', '∥ α', 'In α'], '⊥ α', 'Line–plane perpendicular test.')],
  x: ['Why does a door hinge make the door perpendicular to the floor?'],
});

g.chapter('g10-statistics', 'Statistics', '统计', 'statistics', 'Random sampling, percentiles and dispersion.', B2);
g.k('g10-sampling-methods', 'Random sampling methods', '随机抽样', {
  d: 'Simple random sampling gives everyone an equal chance; stratified sampling keeps each subgroup’s share.', t: ['Simple random sampling', 'Stratified random sampling', 'Collecting data'],
  o: ['Choose a sampling method', 'Allocate a stratified sample'], pre: ['g7-sampling'], rel: ['g10-percentiles'],
  e: 'analysis', c: {mode: 'stratified'}, m: ['Volunteer samples are random', 'Strata sizes are equal'],
  q: [N('A school: 600 juniors, 400 seniors. Stratified sample of 50: juniors?', 30, '50 × 600/1000.')],
  x: ['Design a survey of screen time in your school.'],
});
g.k('g10-percentiles', 'Percentiles and dispersion', '用样本估计总体：百分位数与离散程度', {
  d: 'The p-th percentile has p% of the data at or below it; box plots and standard deviation describe spread.', t: ['Percentiles', 'Box plots and quartiles', 'Standard deviation', 'Estimating the population from samples'],
  o: ['Compute percentiles', 'Compare spreads with box plots and standard deviations'], pre: ['g8-variance', 'g10-sampling-methods'], rel: ['g12-normal'],
  e: 'analysis', c: {mode: 'boxplot'}, m: ['50th percentile ≠ median', 'Outliers do not affect standard deviation'],
  q: [N('Data 1–10 (ten values). 50th percentile?', 5.5, 'Average of 5th and 6th values.')],
  x: ['Compare two classes’ test scores with box plots.'],
});

g.chapter('g10-probability', 'Probability', '概率', 'statistics', 'Sample spaces, classical probability and independence.', B2);
g.k('g10-sample-space', 'Sample spaces and classical probability', '样本空间与古典概型', {
  d: 'List the sample space; with equally likely outcomes P(A) = |A|/|Ω|; complements and mutually exclusive events add simply.', t: ['Sample space', 'Events and operations', 'Classical probability', 'Basic properties of probability'],
  o: ['Write sample spaces', 'Compute classical probabilities'], pre: ['g9-probability'], rel: ['g10-independence'],
  e: 'distribution', c: {mode: 'classical'}, m: ['Mutually exclusive means independent', 'P(A ∪ B) = P(A) + P(B) always'],
  q: [N('Two dice: P(sum ≥ 10) (decimal)?', 1 / 6, '6 of 36.', 0.001)],
  x: ['Which is more likely with two dice: sum 9 or sum 10?'],
});
g.k('g10-independence', 'Independent events and frequency', '事件的相互独立性与频率', {
  d: 'A and B are independent when P(AB) = P(A)P(B): knowing one does not change the other.', t: ['Independent events', 'Frequency and probability', 'Random simulation'],
  o: ['Test and use independence', 'Distinguish independent from mutually exclusive'], pre: ['g10-sample-space'], rel: ['g12-conditional'],
  e: 'distribution', c: {mode: 'independence', p: 0.6, q: 0.5}, m: ['Independent events cannot happen together', 'Dependence means causation'],
  q: [N('P(A) = 0.6, P(B) = 0.5, independent. P(both)?', 0.3, '0.6 × 0.5.')],
  x: ['Are “first coin heads” and “both coins match” independent?'],
});

export const grade10 = g.done();
