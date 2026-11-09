import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(9);
const UP = '九年级上册', DOWN = '九年级下册';

g.chapter('g9-quadratic-eq', 'Quadratic Equations', '一元二次方程', 'relationships', 'Complete the square, derive the formula, read the discriminant.', UP);
g.k('g9-complete-square', 'Solving by completing the square', '配方法', {
  d: 'x² + 6x is a square with two strips; adding the missing 3² corner completes (x + 3)².', t: ['Quadratic equations', 'Square-root method', 'Completing the square'],
  o: ['Complete the square geometrically and algebraically', 'Solve quadratics by completing the square'], pre: ['g8-expand', 'g7-square-roots'], rel: ['g9-quadratic-formula'],
  e: 'tiles', c: {mode: 'complete-square', b: 6, c: 7}, m: ['Adding the square to one side only', 'Taking only the positive root'],
  q: [M('x² + 6x = 7 → (x + 3)² = ?', ['16', '7', '13'], '16', 'Add 9 to both sides.'), M('Solutions?', ['1 and −7', '1 only', '4 and −4'], '1 and −7', 'x + 3 = ±4.')],
  x: ['Complete the square for x² − 10x.'], f: 'x^2+bx=\\left(x+\\tfrac b2\\right)^2-\\tfrac{b^2}{4}',
});
g.k('g9-quadratic-formula', 'The quadratic formula, discriminant and Vieta', '公式法、判别式与根与系数的关系', {
  d: 'Completing the square in general gives the formula; Δ = b² − 4ac decides whether the parabola meets the x-axis twice, once or never.', t: ['Quadratic formula', 'Discriminant', 'Factorisation method', 'Relationship between roots and coefficients'],
  o: ['Use the formula and discriminant', 'Use x₁ + x₂ = −b/a and x₁x₂ = c/a'], pre: ['g9-complete-square', 'g8-factorize'], rel: ['g9-parabola', 'g10-quadratic-ineq'],
  e: 'func', c: {mode: 'roots', a: 1, b: -2, c: -3}, m: ['Forgetting the ± sign', 'Δ < 0 still gives two real roots'],
  q: [N('Δ for x² − 2x − 3 = 0?', 16, '4 + 12.'), N('Sum of the roots of 2x² − 6x + 1 = 0?', 3, '−b/a = 6/2.')],
  x: ['Find k so that x² + kx + 9 = 0 has exactly one root.'], f: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
});

g.chapter('g9-quadratic-fn', 'Quadratic Functions', '二次函数', 'functions', 'Parabolas and maximum/minimum problems.', UP);
g.k('g9-parabola', 'Graphs and properties of quadratic functions', '二次函数的图象和性质', {
  d: 'y = a(x − h)² + k is y = x² stretched by a and shifted to the vertex (h, k).', t: ['Quadratic functions', 'Graph of y = ax²', 'Vertex form', 'Axis of symmetry', 'Quadratic functions and equations'],
  o: ['Describe the effect of a, h, k', 'Find vertex and axis'], pre: ['g8-direct-function', 'g9-quadratic-formula'], rel: ['g10-quadratic-ineq', 'g11-parabola'],
  e: 'func', c: {mode: 'quadratic', a: 1, h: 2, k: -1}, m: ['y = (x − 2)² shifts left', 'Bigger a makes the parabola wider'],
  q: [M('Vertex of y = 2(x − 3)² + 1?', ['(3, 1)', '(−3, 1)', '(3, −1)'], '(3, 1)', 'Read h and k.'), M('y = −x² + 4 opens…', ['Down', 'Up'], 'Down', 'a < 0.')],
  x: ['Trace a basketball shot: estimate its vertex from a video.'], f: 'y=a(x-h)^2+k',
});
g.k('g9-quadratic-apps', 'Practical problems with quadratic functions', '实际问题与二次函数', {
  d: 'Area, profit and projectile problems become quadratics; the vertex gives the best value.', t: ['Maximum and minimum', 'Profit problems', 'Projectile paths'],
  o: ['Model situations with quadratics', 'Find optima from the vertex'], pre: ['g9-parabola'], rel: ['g11-optimization'],
  e: 'func', c: {mode: 'quadratic-max', p: 40}, m: ['The maximum is always at x = 0', 'Ignoring the domain'],
  q: [N('A 40 m fence makes a rectangle. Maximum area (m²)?', 100, 'x(20 − x) peaks at x = 10.')],
  x: ['A shop sells 100 items at 10 yuan; each 1 yuan increase loses 5 sales. Best price?'],
});

g.chapter('g9-rotation', 'Rotation', '旋转', 'geometry', 'Rotations and central symmetry.', UP);
g.k('g9-rotation', 'Rotation and central symmetry', '旋转与中心对称', {
  d: 'A 180° rotation about a point is central symmetry: (x, y) ↦ (−x, −y) about the origin.', t: ['Rotation', 'Central symmetry', 'Centrally symmetric figures', 'Coordinates of symmetric points'],
  o: ['Rotate figures', 'Find centrally symmetric points'], pre: ['g6-rotation', 'g7-cartesian'],
  e: 'transform', c: {mode: 'rotate', angle: 180}, m: ['Central symmetry is a reflection', '(x, y) ↦ (−x, y) about the origin'],
  q: [M('(2, −5) rotated 180° about the origin is…', ['(−2, 5)', '(2, 5)', '(−2, −5)'], '(−2, 5)', 'Both coordinates change sign.')],
  x: ['Which letters of the alphabet are centrally symmetric?'],
});

g.k('g9-wallpaper', 'Signature: Seventeen ways to repeat', '招牌动画：十七种壁纸图案', {
  d: 'Slides, turns and mirrors copy one motif across the plane. Only 2-, 3-, 4- and 6-fold turns can repeat without gaps, and there are exactly 17 kinds of wallpaper pattern.', t: ['Translation', 'Rotation and central symmetry', 'Reflections', 'Symmetry groups (enrichment)'],
  o: ['Identify translations, rotations and reflections in repeating patterns', 'Explain why fivefold patterns cannot tile'], pre: ['g7-translation', 'g9-rotation'], rel: ['g6-snowflake-group'],
  e: 'journey', c: {mode: 'wallpaper'}, m: ['Any regular polygon can tile a floor', 'Infinitely many kinds of wallpaper exist'],
  q: [M('Which regular polygon cannot tile a floor on its own?', ['Triangle', 'Square', 'Pentagon', 'Hexagon'], 'Pentagon', '108° does not divide 360°.'), N('How many wallpaper symmetry groups are there?', 17, 'Fedorov, 1891.')],
  x: ['Photograph a tiled floor or a fabric pattern. Which turns and mirrors does it have?'],
});
g.chapter('g9-circle', 'Circles', '圆', 'geometry', 'Angles, tangents and arc lengths.', UP);
g.k('g9-inscribed-angle', 'The inscribed angle theorem', '圆周角定理', {
  d: 'An inscribed angle is half the central angle on the same arc, so all inscribed angles on that arc are equal; a diameter subtends 90°.', t: ['Chords, arcs and central angles', 'Inscribed angles', 'Angle in a semicircle', 'Cyclic quadrilaterals'],
  o: ['Use the inscribed angle theorem', 'Use the angle in a semicircle'], pre: ['g6-circle-parts', 'g8-isosceles'], rel: ['g9-tangent'],
  e: 'geo2', c: {mode: 'inscribed', deg: 100}, m: ['Inscribed angle equals central angle', 'Only some inscribed angles on an arc are equal'],
  q: [N('Central angle 100°. Inscribed angle on the same arc?', 50, 'Half.'), N('Opposite angles of a cyclic quadrilateral: one is 70°. The other?', 110, 'They add to 180°.')],
  x: ['Find a circle’s centre using a set square.'],
});
g.k('g9-tangent', 'Tangents to a circle', '切线与切线长定理', {
  d: 'A tangent is perpendicular to the radius at the touching point; the two tangents from an outside point are equal.', t: ['Positions of a point, line and circle', 'Tangent properties and tests', 'Tangent length theorem', 'Inscribed circle of a triangle'],
  o: ['Use radius ⊥ tangent', 'Use equal tangent lengths'], pre: ['g9-inscribed-angle'],
  e: 'geo2', c: {mode: 'tangent'}, m: ['Any line touching the circle is perpendicular to every radius', 'Tangent lengths differ'],
  q: [N('Radius 5, distance from P to centre 13. Tangent length?', 12, '√(169 − 25).')],
  x: ['Why does a wheel touch the road at a point directly below its axle?'],
});
g.k('g9-arc-length', 'Arc length, sector area and cone surfaces', '弧长、扇形面积与圆锥', {
  d: 'An n° arc is n/360 of the circumference; a cone’s curved surface unrolls into a sector.', t: ['Arc length', 'Sector area', 'Lateral area of a cone', 'Regular polygons and circles'],
  o: ['Compute arc lengths and sector areas', 'Relate a cone to its net'], pre: ['g6-annulus', 'g9-inscribed-angle'],
  e: 'geo2', c: {mode: 'arc-length', deg: 120}, m: ['Arc length = n × r', 'The cone’s sector radius is its height'],
  q: [N('Radius 6, 120° arc. Length (in terms of π, give the coefficient)?', 4, '120/360 × 2π × 6 = 4π.')],
  x: ['Make a party hat from a sector. Which angle gives a 10 cm base diameter?'], f: 'l=\\frac{n\\pi r}{180},\\;S=\\frac{n\\pi r^2}{360}',
});

g.chapter('g9-probability', 'Introduction to Probability', '概率初步', 'statistics', 'Lists, tree diagrams and frequencies.', UP);
g.k('g9-probability', 'Probability by listing and tree diagrams', '用列举法求概率', {
  d: 'List every equally likely outcome in a table or tree; probability = favourable ÷ total.', t: ['Random events', 'Probability', 'Listing method', 'Tree diagrams'],
  o: ['Compute probabilities by listing', 'Use tables and trees for two-step experiments'], pre: ['g6-likelihood'], rel: ['g12-counting-principles', 'g10-sample-space'],
  e: 'combin', c: {mode: 'dice'}, m: ['Sum 7 and sum 2 are equally likely', 'Listing outcomes that are not equally likely'],
  q: [N('Two dice: probability of sum 7 (decimal)?', 1 / 6, '6 of 36.', 0.001)],
  x: ['Is “two heads, two tails, one of each” a fair three-way game?'],
});
g.k('g9-frequency', 'Estimating probability with frequency', '用频率估计概率', {
  d: 'When outcomes are not equally likely, many repetitions make the frequency settle near the probability.', t: ['Frequency and probability', 'Simulation'],
  o: ['Estimate probabilities from experiments', 'Judge when estimates are reliable'], pre: ['g6-balls', 'g9-probability'], rel: ['g12-normal'],
  e: 'probability', c: {mode: 'balls', red: 2, blue: 3}, m: ['A few trials give the exact probability', 'Frequency must equal probability eventually'],
  q: [N('A pin lands point-up 330 times in 1000 throws. Estimated probability?', 0.33, '330/1000.')],
  x: ['Estimate the probability a bottle cap lands face up.'],
});

g.chapter('g9-inverse-fn', 'Inverse Proportion Functions', '反比例函数', 'functions', 'Hyperbolas y = k/x.', DOWN);
g.k('g9-inverse-function', 'Graphs and properties of y = k/x', '反比例函数的图象和性质', {
  d: 'y = k/x makes a hyperbola in two quadrants; every point gives a rectangle of area |k| with the axes.', t: ['Inverse proportion functions', 'Graphs and properties', 'Applications'],
  o: ['Sketch y = k/x', 'Use |k| as a rectangle area'], pre: ['g6-inverse', 'g8-direct-function'],
  e: 'func', c: {mode: 'inverse', k: 6}, m: ['The graph touches the axes', 'y decreases everywhere for k > 0 (only within each branch)'],
  q: [M('y = −6/x lies in quadrants…', ['II and IV', 'I and III', 'I and II'], 'II and IV', 'k < 0.'), N('A point on y = 6/x forms a rectangle with the axes. Area?', 6, '|k|.')],
  x: ['Pressure and area: model with an inverse function.'], f: 'y=\\frac kx\\;(k\\ne 0)',
});

g.chapter('g9-similarity', 'Similarity', '相似', 'geometry', 'Similar triangles and dilations.', DOWN);
g.k('g9-similar-triangles', 'Similar triangles', '相似三角形的判定与性质', {
  d: 'Two equal angles force similarity; ratios of lengths are k, of areas k².', t: ['Similar figures', 'Proportional segments', 'Tests for similar triangles', 'Properties of similar triangles'],
  o: ['Prove triangles similar', 'Use length and area ratios'], pre: ['g6-enlarge', 'g8-congruence'], rel: ['g9-trig-ratios'],
  e: 'geo2', c: {mode: 'similar', k: 2}, m: ['Area ratio = k', 'Any two triangles with one equal angle are similar'],
  q: [N('Similar triangles, ratio 2 : 3, small area 8. Large area?', 18, '8 × 9/4.')],
  x: ['Measure a tree’s height with its shadow.'],
});
g.k('g9-homothety', 'Dilations (homothety)', '位似', {
  d: 'A dilation from a centre scales every distance by k; lines through corresponding points meet at the centre.', t: ['Homothetic figures', 'Coordinates under dilation'],
  o: ['Enlarge and reduce figures from a centre', 'Use (x, y) ↦ (kx, ky)'], pre: ['g9-similar-triangles'],
  e: 'transform', c: {mode: 'scale', k: 2}, m: ['Dilation preserves lengths', 'Negative k is impossible'],
  q: [M('(3, −1) dilated from the origin by k = 2 is…', ['(6, −2)', '(5, 1)', '(1.5, −0.5)'], '(6, −2)', 'Multiply both coordinates.')],
  x: ['Explain how a projector uses a dilation.'],
});

g.chapter('g9-trig', 'Trigonometric Ratios of Acute Angles', '锐角三角函数', 'geometry', 'Ratios that depend only on the angle.', DOWN);
g.k('g9-trig-ratios', 'Sine, cosine and tangent of acute angles', '锐角三角函数', {
  d: 'All right triangles with the same acute angle are similar, so opposite/hypotenuse is a property of the angle: sin A.', t: ['Sine', 'Cosine', 'Tangent', 'Special angles 30°, 45°, 60°'],
  o: ['Define sin, cos, tan', 'Recall special values'], pre: ['g9-similar-triangles', 'g8-pythagorean'], rel: ['g10-unit-circle'],
  e: 'trig', c: {mode: 'right', deg: 30}, m: ['sin 30° depends on the triangle size', 'sin A = adjacent/hypotenuse'],
  q: [N('sin 30° = ?', 0.5, 'Half the hypotenuse.'), N('tan 45° = ?', 1, 'Legs equal.')],
  x: ['Make a clinometer and measure a flagpole angle.'], f: '\\sin A=\\frac{a}{c},\\;\\cos A=\\frac{b}{c},\\;\\tan A=\\frac{a}{b}',
});
g.k('g9-solve-triangle', 'Solving right triangles in applications', '解直角三角形及其应用', {
  d: 'Angles of elevation, slopes and bearings become right triangles solved with trig ratios.', t: ['Solving right triangles', 'Angle of elevation and depression', 'Slope', 'Bearings'],
  o: ['Solve right triangles', 'Model heights and distances'], pre: ['g9-trig-ratios'],
  e: 'trig', c: {mode: 'height', deg: 35, d: 20}, m: ['Using the wrong side as adjacent', 'Elevation measured from the vertical'],
  q: [N('From 20 m away the angle of elevation to a top is 45°. Height (m)?', 20, 'tan 45° = 1.')],
  x: ['Estimate your school building’s height.'],
});

g.chapter('g9-projection', 'Projections and Views', '投影与视图', 'geometry', 'Parallel and central projection; three views.', DOWN);
g.k('g9-three-views', 'Projections and three views', '投影与三视图', {
  d: 'Sunlight gives parallel projection, a lamp central projection; front, top and left views describe a solid.', t: ['Parallel projection', 'Central projection', 'Orthographic projection', 'Three views'],
  o: ['Draw three views', 'Reconstruct solids from views'], pre: ['g4-views'],
  e: 'solid', c: {mode: 'views', shape: 'stack'}, m: ['The left view is drawn on the left of the front view', 'Hidden edges are ignored'],
  q: [M('In standard layout, the top view is placed…', ['Below the front view', 'Above the front view', 'Right of the front view'], 'Below the front view', 'Chinese convention: 长对正.')],
  x: ['Draw the three views of your pencil box.'],
});

export const grade9 = g.done();
