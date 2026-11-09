import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(11);
const S1 = '选择性必修第一册', S2 = '选择性必修第二册';

g.chapter('g11-space-vectors', 'Space Vectors and Solid Geometry', '空间向量与立体几何', 'geometry', 'Coordinates and vectors in three dimensions.', S1);
g.k('g11-space-vectors', 'Space vectors and their coordinates', '空间向量及其运算', {
  d: 'Vectors in space add and scale exactly like plane vectors; three non-coplanar vectors form a basis, and (x, y, z) coordinates follow.', t: ['Space vectors', 'Linear operations', 'Dot product in space', 'Basis theorem', 'Space rectangular coordinates'],
  o: ['Compute with space vectors in coordinates', 'Express vectors in a basis'], pre: ['g10-vector-add', 'g10-dot-product', 'g10-space-relations'], rel: ['g11-normal-vectors'],
  e: 'space', c: {mode: 'vectors'}, m: ['Any three vectors form a basis', 'The z-coordinate can be ignored'],
  q: [N('|(1, 2, 2)| = ?', 3, '√(1 + 4 + 4).'), N('(1, 0, 2) · (3, 5, −1) = ?', 1, '3 + 0 − 2.')],
  x: ['Place a coordinate system on a cube and write all 8 vertices.'],
});
g.k('g11-normal-vectors', 'Angles and distances with vectors', '用空间向量研究距离与夹角', {
  d: 'A normal vector stands perpendicular to a plane; angles between lines and planes come from dot products with direction and normal vectors.', t: ['Direction vectors', 'Normal vectors', 'Parallel and perpendicular by vectors', 'Angles between lines and planes', 'Distances'],
  o: ['Find normal vectors', 'Compute angles and distances'], pre: ['g11-space-vectors', 'g10-perpendicular'],
  e: 'space', c: {mode: 'normal'}, m: ['Line–plane angle = angle with the normal', 'Normal vectors are unique'],
  q: [M('Plane z = 0 has normal vector…', ['(0, 0, 1)', '(1, 1, 0)', '(1, 0, 0)'], '(0, 0, 1)', 'Perpendicular to the xy-plane.')],
  x: ['Find the angle between a cube’s space diagonal and its base.'],
});

g.chapter('g11-lines-circles', 'Equations of Lines and Circles', '直线和圆的方程', 'geometry', 'Algebra meets geometry in the coordinate plane.', S1);
g.k('g11-slope', 'Inclination, slope and equations of lines', '直线的倾斜角、斜率与方程', {
  d: 'Slope k = tan α = rise/run; a point and a slope fix a line: y − y₀ = k(x − x₀).', t: ['Inclination angle', 'Slope', 'Point-slope, slope-intercept, two-point, intercept and general forms', 'Parallel and perpendicular lines'],
  o: ['Find slopes and equations', 'Test parallel (k₁ = k₂) and perpendicular (k₁k₂ = −1)'], pre: ['g8-direct-function', 'g9-trig-ratios'], rel: ['g11-distance'],
  e: 'conic', c: {mode: 'line', k: 2, b: 1}, m: ['Vertical lines have slope 0', 'Perpendicular slopes are equal'],
  q: [N('Slope through (1, 2) and (3, 8)?', 3, '6/2.'), N('Slope perpendicular to k = 2?', -0.5, 'k₁k₂ = −1.')],
  x: ['Which form of a line equation would you use for a ramp drawing?'], f: 'k=\\tan\\alpha=\\frac{y_2-y_1}{x_2-x_1}',
});
g.k('g11-distance', 'Distance formulas', '距离公式', {
  d: 'The distance between points is the Pythagorean theorem; the distance from a point to a line is |Ax₀ + By₀ + C|/√(A² + B²).', t: ['Intersection of lines', 'Distance between two points', 'Point-to-line distance', 'Distance between parallel lines'],
  o: ['Use the three distance formulas', 'Derive point-to-line distance'], pre: ['g11-slope', 'g8-pythagorean'], rel: ['g11-circle-eq'],
  e: 'conic', c: {mode: 'distance', x0: 3, y0: 4}, m: ['Distance to a line measured along a vertical', 'Forgetting absolute value'],
  q: [N('Distance from (3, 4) to the line 3x + 4y − 5 = 0?', 4, '|9 + 16 − 5| ÷ 5.')],
  x: ['Where on a road is closest to your house?'], f: 'd=\\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}',
});
g.k('g11-circle-eq', 'Equations of circles; lines and circles', '圆的方程与直线和圆的位置关系', {
  d: '(x − a)² + (y − b)² = r²; comparing the centre-to-line distance with r decides crossing, touching or missing.', t: ['Standard and general equations of a circle', 'Line–circle position', 'Circle–circle position'],
  o: ['Find a circle’s equation', 'Decide line–circle relationships'], pre: ['g11-distance', 'g9-tangent'],
  e: 'conic', c: {mode: 'circle', r: 3}, m: ['x² + y² + Dx + Ey + F = 0 is always a circle', 'Tangent means distance = 0'],
  q: [N('Radius of x² + y² − 4x + 6y − 3 = 0?', 4, '(x − 2)² + (y + 3)² = 16.')],
  x: ['A ship’s radar range is a circle. When does a straight course enter it?'], f: '(x-a)^2+(y-b)^2=r^2',
});

g.chapter('g11-conics', 'Equations of Conic Sections', '圆锥曲线的方程', 'geometry', 'Ellipses, hyperbolas and parabolas defined by distances.', S1);
g.k('g11-ellipse', 'The ellipse', '椭圆', {
  d: 'Pin a string at two foci and pull it tight while drawing: the sum of distances stays 2a.', t: ['Definition of an ellipse', 'Standard equation', 'Geometric properties', 'Eccentricity'],
  o: ['Derive x²/a² + y²/b² = 1', 'Relate a, b, c and eccentricity'], pre: ['g11-distance'], rel: ['g11-hyperbola', 'g11-parabola'],
  e: 'conic', c: {mode: 'ellipse', a: 5, b: 3}, m: ['a² = b² + c² is a² + b² = c²', 'Eccentricity can exceed 1 for an ellipse'],
  q: [N('Ellipse a = 5, b = 3. c = ?', 4, 'c² = a² − b².'), N('Eccentricity?', 0.8, 'c/a.')],
  x: ['Draw an ellipse with string and two pins.'], f: '\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1,\\;a^2=b^2+c^2',
});
g.k('g11-hyperbola', 'The hyperbola', '双曲线', {
  d: 'The difference of distances to two foci is constant; the branches approach the asymptotes y = ±(b/a)x.', t: ['Definition', 'Standard equation', 'Asymptotes', 'Eccentricity'],
  o: ['Use c² = a² + b²', 'Find asymptotes'], pre: ['g11-ellipse', 'g9-inverse-function'],
  e: 'conic', c: {mode: 'hyperbola', a: 3, b: 4}, m: ['Hyperbola uses a² = b² + c²', 'Branches cross the asymptotes'],
  q: [N('Hyperbola a = 3, b = 4. c = ?', 5, 'c² = 9 + 16.'), N('Slope of the positive asymptote?', 4 / 3, 'b/a.', 0.001)],
  x: ['Why is y = 1/x a hyperbola?'], f: '\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1,\\;c^2=a^2+b^2',
});
g.k('g11-parabola', 'The parabola', '抛物线', {
  d: 'Every point is as far from the focus as from the directrix; rays parallel to the axis reflect through the focus.', t: ['Definition', 'Standard equations', 'Focus and directrix', 'Reflective property'],
  o: ['Use y² = 2px', 'Find focus and directrix'], pre: ['g11-ellipse', 'g9-parabola'],
  e: 'conic', c: {mode: 'parabola', p: 2}, m: ['Focus of y² = 4x is (4, 0)', 'Parabolas from quadratic functions are different curves'],
  q: [N('Focus of y² = 8x: x-coordinate?', 2, '2p = 8, focus (p/2, 0).')],
  x: ['Why are satellite dishes parabolic?'], f: 'y^2=2px\\;(p>0),\\;F\\left(\\tfrac p2,0\\right)',
});

g.chapter('g11-sequences', 'Sequences', '数列', 'functions', 'Arithmetic and geometric sequences and induction.', S2);
g.k('g11-arithmetic-seq', 'Arithmetic sequences and their sums', '等差数列及其前 n 项和', {
  d: 'Add d each step: aₙ = a₁ + (n − 1)d. Pair first with last, like young Gauss, to sum.', t: ['Concept of sequences', 'Arithmetic sequences', 'General term', 'Sum of the first n terms'],
  o: ['Find terms and sums', 'Derive the sum by reverse-and-add'], pre: ['g5-growing-patterns', 'g8-direct-function'], rel: ['g11-geometric-seq'],
  e: 'sequence', c: {mode: 'arithmetic', a1: 2, d: 3, n: 8}, m: ['aₙ = a₁ + nd', 'Sum = n × aₙ'],
  q: [N('1 + 2 + … + 100 = ?', 5050, '50 pairs of 101.'), N('a₁ = 2, d = 3. a₁₀ = ?', 29, '2 + 27.')],
  x: ['Stack logs in rows of 10, 9, …, 1. How many logs?'], f: 'S_n=\\frac{n(a_1+a_n)}{2}',
});
g.k('g11-geometric-seq', 'Geometric sequences and their sums', '等比数列及其前 n 项和', {
  d: 'Multiply by q each step; Sₙ − qSₙ telescopes to a₁ − a₁qⁿ.', t: ['Geometric sequences', 'General term', 'Sum of the first n terms', 'Applications (loans, growth)'],
  o: ['Find terms and sums', 'Derive the sum by multiply-and-subtract'], pre: ['g11-arithmetic-seq', 'g10-exponential'],
  e: 'sequence', c: {mode: 'geometric', a1: 1, q: 2, n: 8}, m: ['Sum formula works for q = 1', 'aₙ = a₁qⁿ'],
  q: [N('1 + 2 + 4 + … + 2⁹ = ?', 1023, '2¹⁰ − 1.'), N('1/2 + 1/4 + 1/8 + … (infinitely many) approaches?', 1, 'Fill a square by halves.')],
  x: ['Rice on a chessboard: how much rice?'], f: 'S_n=\\frac{a_1(1-q^n)}{1-q}\\;(q\\ne1)',
});
g.k('g11-induction', 'Mathematical induction', '数学归纳法', {
  d: 'Knock over the first domino, and show each falling domino knocks the next: then every domino falls.', t: ['Mathematical induction', 'Proofs about sequences'],
  o: ['Write induction proofs', 'Explain why both steps are needed'], pre: ['g11-arithmetic-seq'],
  e: 'sequence', c: {mode: 'induction', n: 10}, m: ['Checking many cases is a proof', 'The base case is optional'],
  q: [M('Which step is missing in “If P(k) then P(k + 1)” alone?', ['The base case P(1)', 'Nothing', 'P(k − 1)'], 'The base case P(1)', 'The first domino.')],
  x: ['Prove 1 + 3 + 5 + … + (2n − 1) = n².'],
});

g.k('g11-halving', 'Signature: Halving forever', '招牌动画：无穷的一半', {
  d: 'Paint half a square, then half of what is left, forever, while the camera dives into the corner that never runs out: infinitely many pieces add up to exactly 1.', t: ['Sum of a geometric sequence', 'Infinite geometric series (enrichment)', 'Self-similarity'],
  o: ['Use Sₙ = a₁(1 − qⁿ)/(1 − q) for halving', 'Explain why the sum approaches 1'], pre: ['g11-geometric-seq'], rel: ['g11-sunflower'],
  e: 'journey', c: {mode: 'halving'}, m: ['Infinitely many positive numbers always add to infinity', 'The sum gets close to 1 but the answer is “just under 1”'],
  q: [N('1/2 + 1/4 + 1/8 + 1/16 = ? (decimal)', 0.9375, '15/16.'), N('1/3 + 1/9 + 1/27 + … forever = ? (decimal)', 0.5, '(1/3) ÷ (1 − 1/3).')],
  x: ['Zeno’s paradox: Achilles races a tortoise with a head start. Explain with a geometric series why he catches it.'], f: '\\sum_{k=1}^{\\infty} \\frac{1}{2^k} = 1',
});
g.k('g11-sunflower', 'Signature: The sunflower’s secret angle', '招牌动画：向日葵的黄金角', {
  d: 'Turn every new seed by the same angle. Sweep that angle slowly: spirals swirl and tangle, then lock into perfect packing at the golden angle — showing 13 and 21 Fibonacci spirals.', t: ['Recursive sequences', 'Fibonacci sequence', 'Golden ratio (enrichment)'],
  o: ['Generate a sequence from a recurrence', 'See that Fibonacci ratios approach φ'], pre: ['g11-geometric-seq', 'g10-radian'], rel: ['g11-halving'],
  e: 'journey', c: {mode: 'sunflower'}, m: ['Any simple fraction of a turn packs seeds well', 'Every sequence needs a formula for aₙ'],
  q: [N('Next term: 5, 8, 13, 21, ?', 34, '13 + 21.'), N('The golden angle to the nearest degree?', 138, '360°(1 − 1/φ) ≈ 137.5°.')],
  x: ['Count the spirals on a pine cone or a sunflower photo, clockwise and anticlockwise.'], f: 'a_{n+2} = a_{n+1} + a_n,\\quad \\frac{a_{n+1}}{a_n} \\to \\varphi',
});
g.chapter('g11-derivatives', 'Derivatives and Their Applications', '一元函数的导数及其应用', 'functions', 'Instantaneous rates, tangents, monotonicity and optimisation.', S2);
g.k('g11-rate-of-change', 'Rates of change and the derivative', '变化率与导数的概念', {
  d: 'Zoom the secant through two points closer and closer: its slope approaches the tangent slope, the derivative.', t: ['Average rate of change', 'Instantaneous rate of change', 'Concept of derivative', 'Geometric meaning: tangent slope'],
  o: ['Compute average rates', 'Interpret the derivative as a tangent slope'], pre: ['g11-slope', 'g9-parabola'], rel: ['g11-derivative-rules'],
  e: 'derivative', c: {mode: 'secant', x0: 1}, m: ['The derivative is the average rate', 'A tangent touches only once'],
  q: [N('f(x) = x². Average rate from 1 to 3?', 4, '(9 − 1)/2.'), N('f′(1) for f(x) = x²?', 2, 'Tangent slope 2x.')],
  x: ['Estimate a car’s speed at an instant from a distance–time graph.'], f: "f'(x_0)=\\lim_{\\Delta x\\to 0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}",
});
g.k('g11-derivative-rules', 'Derivatives of basic functions and rules', '导数的运算', {
  d: 'Watch f′ trace the slope of f: (xⁿ)′ = nxⁿ⁻¹, (sin x)′ = cos x, (eˣ)′ = eˣ; sum, product, quotient and chain rules combine them.', t: ['Basic derivative formulas', 'Sum, product and quotient rules', 'Derivatives of composite functions'],
  o: ['Differentiate using rules', 'Sketch f′ from f'], pre: ['g11-rate-of-change', 'g10-exponential'],
  e: 'derivative', c: {mode: 'rules'}, m: ['(fg)′ = f′g′', '(e^{2x})′ = e^{2x}'],
  q: [N('d/dx (x³) at x = 2?', 12, '3x² = 12.'), N('d/dx (sin x) at x = 0?', 1, 'cos 0.')],
  x: ['Sketch the derivative of sin x by eye. What curve appears?'], f: "(x^n)'=nx^{n-1}",
});
g.k('g11-monotonicity', 'Monotonicity and extrema', '导数与函数的单调性、极值', {
  d: 'Where f′ > 0 the graph climbs, where f′ < 0 it falls; a sign change marks a local maximum or minimum.', t: ['Monotonicity and derivatives', 'Local extrema', 'Maximum and minimum on an interval'],
  o: ['Find monotonic intervals', 'Find and classify extrema'], pre: ['g11-derivative-rules'], rel: ['g11-optimization'],
  e: 'derivative', c: {mode: 'monotonic'}, m: ['f′(x₀) = 0 always means an extremum', 'Local max is the global max'],
  q: [N('f(x) = x³ − 3x. x-coordinate of the local maximum?', -1, 'f′ = 3x² − 3 changes + to − at −1.')],
  x: ['Does x³ have an extremum at 0? Check the sign of f′.'],
});
g.k('g11-optimization', 'Optimisation with derivatives', '导数在实际问题中的应用', {
  d: 'Model a quantity as a function, find where f′ = 0, compare with endpoints: the best box, the cheapest can.', t: ['Optimisation problems', 'Mathematical modelling with derivatives'],
  o: ['Set up and solve optimisation problems', 'Justify the optimum'], pre: ['g11-monotonicity', 'g9-quadratic-apps'],
  e: 'derivative', c: {mode: 'optimize', side: 12}, m: ['Forgetting the domain endpoints', 'Every stationary point is the answer'],
  q: [N('Cut squares of side x from a 12 × 12 sheet to make an open box. Best x?', 2, 'V = x(12 − 2x)², V′ = 0 at x = 2.')],
  x: ['Find the can shape that uses least metal for 1 L.'],
});

export const grade11 = g.done();
