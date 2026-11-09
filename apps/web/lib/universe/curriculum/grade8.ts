import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(8);
const UP = '八年级上册', DOWN = '八年级下册';

g.chapter('g8-triangles', 'Triangles', '三角形', 'geometry', 'Side and angle relationships in triangles and polygons.', UP);
g.k('g8-triangle-inequality', 'The triangle inequality', '三角形三边关系', {
  d: 'Two sides of a triangle always add to more than the third; otherwise the sides cannot meet.', t: ['Sides of a triangle', 'Triangle inequality', 'Altitudes, medians and angle bisectors', 'Stability of triangles'],
  o: ['Decide whether three lengths form a triangle', 'Find the range of a third side'], pre: ['g4-triangles'], rel: ['g8-polygon-angles'],
  e: 'geo2', c: {mode: 'triangle-inequality', a: 3, b: 5}, m: ['3, 4, 7 makes a flat triangle', 'Only the longest side matters (true, but check it)'],
  q: [M('Can 3, 4 and 8 form a triangle?', ['No', 'Yes'], 'No', '3 + 4 < 8.'), N('Sides 3 and 5: how many whole-number third sides are possible?', 5, '2 < c < 8: 3, 4, 5, 6, 7.')],
  x: ['Why are triangles used in bridges? Push a straw square and a straw triangle.'], f: '|a-b| < c < a+b',
});
g.k('g8-polygon-angles', 'Angles of polygons', '多边形及其内角和', {
  d: 'Diagonals from one vertex cut an n-gon into n − 2 triangles: the angle sum is (n − 2) × 180°; exterior angles always total 360°.', t: ['Exterior angle of a triangle', 'Polygon interior angle sum', 'Exterior angle sum'],
  o: ['Derive the interior angle sum', 'Use the 360° exterior sum'], pre: ['g4-angle-sum', 'g7-parallel-angles'],
  e: 'geo2', c: {mode: 'polygon', n: 6}, m: ['Angle sum = n × 180°', 'Exterior sum grows with n'],
  q: [N('Interior angle sum of a hexagon?', 720, '(6 − 2) × 180.'), N('Each exterior angle of a regular octagon?', 45, '360 ÷ 8.')],
  x: ['Walk around a polygon: how many degrees do you turn in total?'], f: '(n-2)\\cdot 180^\\circ',
});

g.chapter('g8-congruence', 'Congruent Triangles', '全等三角形', 'geometry', 'Decide congruence with minimal information.', UP);
g.k('g8-congruence', 'Tests for congruent triangles', '全等三角形的判定', {
  d: 'SSS, SAS, ASA, AAS (and HL for right triangles) each pin a triangle down; SSA does not.', t: ['Congruent triangles', 'SSS', 'SAS', 'ASA', 'AAS', 'HL'],
  o: ['Apply congruence tests', 'Explain why SSA fails'], pre: ['g8-triangle-inequality'], rel: ['g9-similar-triangles'],
  e: 'geo2', c: {mode: 'congruence'}, m: ['SSA proves congruence', 'AAA proves congruence'],
  q: [M('Which is NOT a valid congruence test?', ['SSA', 'SAS', 'ASA'], 'SSA', 'Two different triangles can share SSA.')],
  x: ['Build two different triangles with the same two sides and non-included angle.'],
});
g.k('g8-angle-bisector', 'Properties of the angle bisector', '角平分线的性质', {
  d: 'Every point on an angle bisector is equally far from both sides of the angle, and conversely.', t: ['Angle bisector', 'Distance from a point to a line', 'Constructing an angle bisector'],
  o: ['Use the bisector property', 'Construct a bisector with compass and ruler'], pre: ['g8-congruence'],
  e: 'geo2', c: {mode: 'bisector', deg: 70}, m: ['Distance measured along any segment', 'The converse needs the point inside the angle'],
  q: [M('A point is 4 cm from one side of an angle and on its bisector. Distance to the other side?', ['4 cm', '8 cm', 'Cannot tell'], '4 cm', 'Equal distances.')],
  x: ['Find the point inside a triangle equally far from all three sides.'],
});

g.chapter('g8-symmetry', 'Axial Symmetry', '轴对称', 'geometry', 'Perpendicular bisectors and isosceles triangles.', UP);
g.k('g8-perp-bisector', 'Axial symmetry and the perpendicular bisector', '轴对称与线段的垂直平分线', {
  d: 'Points on the perpendicular bisector of AB are equally far from A and B; the mirror line is the perpendicular bisector of every point and its image.', t: ['Axial symmetry', 'Perpendicular bisector', 'Coordinates of symmetric points'],
  o: ['Use the perpendicular bisector property', 'Reflect points in the axes'], pre: ['g6-symmetry'], rel: ['g8-isosceles'],
  e: 'geo2', c: {mode: 'perp-bisector'}, m: ['Any line through the midpoint is the bisector', '(x, y) reflected in the x-axis is (−x, y)'],
  q: [M('(3, −2) reflected in the x-axis is…', ['(3, 2)', '(−3, −2)', '(−3, 2)'], '(3, 2)', 'y changes sign.')],
  x: ['Where should a station be built equally far from two villages?'],
});
g.k('g8-isosceles', 'Isosceles and equilateral triangles', '等腰三角形', {
  d: 'Equal sides face equal angles; in an isosceles triangle the bisector, median and altitude from the apex coincide.', t: ['Isosceles triangle properties', 'Tests for isosceles triangles', 'Equilateral triangles', '30°-60°-90° triangles'],
  o: ['Use base-angle and three-lines-coincide properties', 'Use the 30° side ratio'], pre: ['g8-perp-bisector'],
  e: 'geo2', c: {mode: 'isosceles', deg: 40}, m: ['The apex angle equals a base angle', 'Any median is an altitude'],
  q: [N('Isosceles triangle, apex 40°. Each base angle?', 70, '(180 − 40) ÷ 2.'), N('In a 30°-60°-90° triangle the hypotenuse is 10. Shortest side?', 5, 'Half the hypotenuse.')],
  x: ['Fold a paper isosceles triangle along its axis.'],
});

g.chapter('g8-polynomial-mult', 'Multiplying and Factorising Polynomials', '整式的乘法与因式分解', 'relationships', 'Area models for expanding and factorising.', UP);
g.k('g8-expand', 'Multiplying polynomials and the perfect-square formula', '整式乘法与完全平方公式', {
  d: 'A (x + a)(x + b) rectangle splits into x², ax, bx and ab; a square of side (a + b) shows (a + b)² = a² + 2ab + b².', t: ['Laws of exponents', 'Multiplying monomials and polynomials', 'Perfect-square formula'],
  o: ['Expand products with area models', 'Use the perfect-square formula'], pre: ['g4-distributive', 'g7-like-terms'], rel: ['g8-factorize', 'g9-complete-square'],
  e: 'tiles', c: {mode: 'expand', a: 2, b: 3}, m: ['(a + b)² = a² + b²', '(x + 2)(x + 3) = x² + 6'],
  q: [M('(x + 3)² = ?', ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9'], 'x² + 6x + 9', 'Two 3x rectangles.'), N('103² = 100² + 2 × 100 × 3 + 9 = ?', 10609, '10000 + 600 + 9.')],
  x: ['Draw (a − b)² as an area model.'], f: '(a+b)^2 = a^2 + 2ab + b^2',
});
g.k('g8-difference-squares', 'The difference of squares', '平方差公式', {
  d: 'Cut b² from a² and slide the strip: the L-shape becomes an (a + b) × (a − b) rectangle.', t: ['Difference of squares formula'],
  o: ['Derive the formula by rearrangement', 'Use it to compute quickly'], pre: ['g8-expand'],
  e: 'tiles', c: {mode: 'diff-squares', a: 7, b: 3}, m: ['(a + b)(a − b) = a² + b²', 'Applies only to integers'],
  q: [N('51 × 49 = 50² − 1² = ?', 2499, '2500 − 1.')],
  x: ['Compute 98 × 102 in your head.'], f: '(a+b)(a-b) = a^2 - b^2',
});
g.k('g8-factorize', 'Factorisation', '因式分解', {
  d: 'Factorising reverses expansion: arrange the tiles of x² + bx + c into a rectangle and read its sides.', t: ['Common factors', 'Factorising with formulas', 'Cross multiplication (x² + bx + c)'],
  o: ['Factor by common factor and by formulas', 'Factor trinomials by rectangle arrangement'], pre: ['g8-expand', 'g8-difference-squares'], rel: ['g9-quadratic-formula'],
  e: 'tiles', c: {mode: 'factor', a: 2, b: 3}, m: ['Stopping before factors are irreducible', 'x² + 5x + 6 = (x + 1)(x + 6)'],
  q: [M('x² + 5x + 6 = ?', ['(x + 2)(x + 3)', '(x + 1)(x + 6)', '(x + 5)(x + 1)'], '(x + 2)(x + 3)', '2 + 3 = 5, 2 × 3 = 6.'), M('x² − 9 = ?', ['(x + 3)(x − 3)', '(x − 3)²', 'x(x − 9)'], '(x + 3)(x − 3)', 'Difference of squares.')],
  x: ['Factor 2x² − 8 completely.'],
});

g.chapter('g8-fractions-alg', 'Rational Expressions', '分式', 'relationships', 'Fractions with letters and fractional equations.', UP);
g.k('g8-rational-expr', 'Rational expressions and simplification', '分式及其基本性质', {
  d: 'A rational expression is undefined where its denominator is 0; common factors cancel just like numerical fractions.', t: ['Rational expressions', 'Basic property', 'Simplifying', 'Operations with rational expressions'],
  o: ['State when a rational expression is defined', 'Simplify by factorising and cancelling'], pre: ['g8-factorize', 'g5-simplify'], rel: ['g8-fractional-eq'],
  e: 'tiles', c: {mode: 'simplify', a: 3}, m: ['(x + 3)/(x + 5) = 3/5', 'Cancelling terms instead of factors'],
  q: [M('(x² − 9)/(x − 3) = ?', ['x + 3 (x ≠ 3)', 'x − 3', 'x² − 3'], 'x + 3 (x ≠ 3)', 'Factor the numerator.')],
  x: ['Why is (x² − 9)/(x − 3) not the same function as x + 3?'],
});
g.k('g8-fractional-eq', 'Fractional equations and extraneous roots', '分式方程', {
  d: 'Multiplying by the denominator can introduce a root that makes the original denominator 0 — always check.', t: ['Fractional equations', 'Extraneous roots', 'Applications'],
  o: ['Solve fractional equations', 'Check for extraneous roots'], pre: ['g8-rational-expr', 'g7-linear-equation'],
  e: 'func', c: {mode: 'fractional', a: 2}, m: ['Skipping the check', 'Multiplying only some terms by the common denominator'],
  q: [N('Solve 3/(x − 1) = 6/(x + 1).', 3, '3(x + 1) = 6(x − 1), x = 3; check x ≠ ±1.')],
  x: ['Make up an equation whose only candidate root is extraneous.'],
});

g.chapter('g8-radicals', 'Quadratic Radicals', '二次根式', 'number', 'Simplify and operate on square roots.', DOWN);
g.k('g8-radicals', 'Simplifying and operating with radicals', '二次根式的化简与运算', {
  d: '√8 is the side of a square of area 8 = 4 × 2: two copies of √2. √(ab) = √a·√b for a, b ≥ 0.', t: ['Quadratic radicals', 'Simplest radical form', 'Multiplication and division of radicals', 'Addition and subtraction of radicals'],
  o: ['Simplify radicals', 'Add, subtract, multiply and divide radicals'], pre: ['g7-irrational'], rel: ['g8-pythagorean'],
  e: 'pythag', c: {mode: 'radical', n: 8}, m: ['√2 + √3 = √5', '√(a²) = a for every a'],
  q: [M('√8 = ?', ['2√2', '4√2', '2√4'], '2√2', '√(4 × 2).'), M('√2 × √8 = ?', ['4', '√10', '16'], '4', '√16.')],
  x: ['Show that √2 + √3 ≠ √5 with a calculator and a right triangle.'], f: '\\sqrt{ab}=\\sqrt a\\sqrt b\\;(a,b\\ge 0)',
});

g.chapter('g8-pythagoras', 'The Pythagorean Theorem', '勾股定理', 'geometry', 'Discover, prove and apply a² + b² = c².', DOWN);
g.k('g8-pythagorean', 'The Pythagorean theorem and a proof', '勾股定理及其证明', {
  d: 'Four copies of a right triangle arranged in a square leave either one c² hole or a² + b² holes: so a² + b² = c² (the 赵爽弦图 idea).', t: ['Pythagorean theorem', 'Proof by rearrangement (Zhao Shuang’s diagram)', 'Applications'],
  o: ['Prove the theorem by area rearrangement', 'Find missing sides'], pre: ['g7-square-roots', 'g5-triangle'], rel: ['g9-trig-ratios', 'g11-distance'],
  e: 'pythag', c: {mode: 'proof', a: 3, b: 4}, m: ['Works for all triangles', 'c is any side'],
  q: [N('Legs 6 and 8. Hypotenuse?', 10, '√(36 + 64).'), N('Hypotenuse 13, leg 5. Other leg?', 12, '√(169 − 25).')],
  x: ['How long a ladder reaches 4 m up a wall from 3 m away?'], f: 'a^2 + b^2 = c^2',
});
g.k('g8-pythagorean-converse', 'The converse and Pythagorean triples', '勾股定理的逆定理', {
  d: 'If a² + b² = c², the triangle has a right angle opposite c — ancient builders used 3-4-5 ropes.', t: ['Converse of the Pythagorean theorem', 'Pythagorean triples', 'Converse propositions'],
  o: ['Test for right triangles', 'Recognise Pythagorean triples'], pre: ['g8-pythagorean'],
  e: 'pythag', c: {mode: 'converse', a: 5, b: 12}, m: ['Every theorem’s converse is true', 'Testing with the wrong side as c'],
  q: [M('Is 7, 24, 25 a right triangle?', ['Yes', 'No'], 'Yes', '49 + 576 = 625.')],
  x: ['Find three more Pythagorean triples by scaling 3-4-5.'],
});

g.chapter('g8-parallelograms', 'Parallelograms', '平行四边形', 'geometry', 'Properties and tests for special quadrilaterals.', DOWN);
g.k('g8-parallelogram-props', 'Properties and tests for parallelograms', '平行四边形的性质与判定', {
  d: 'Opposite sides equal, opposite angles equal, diagonals bisect each other; rectangles, rhombi and squares add more.', t: ['Properties of parallelograms', 'Tests for parallelograms', 'Rectangles', 'Rhombi', 'Squares'],
  o: ['Use parallelogram properties', 'Prove a quadrilateral is a parallelogram'], pre: ['g4-quadrilaterals', 'g8-congruence'], rel: ['g8-midline'],
  e: 'angle', c: {mode: 'quadrilateral', family: true}, m: ['Diagonals of every parallelogram are equal', 'A rhombus is a square'],
  q: [M('Which shape has diagonals that are equal AND perpendicular?', ['Square', 'Rectangle', 'Rhombus'], 'Square', 'It is both a rectangle and a rhombus.')],
  x: ['Join the midpoints of any quadrilateral. What shape appears?'],
});
g.k('g8-midline', 'The triangle midline theorem', '三角形的中位线', {
  d: 'Joining the midpoints of two sides gives a segment parallel to the third side and half as long.', t: ['Midline of a triangle', 'Median to the hypotenuse'],
  o: ['Use the midline theorem', 'Prove it by doubling into a parallelogram'], pre: ['g8-parallelogram-props'],
  e: 'geo2', c: {mode: 'midline'}, m: ['Midline is half of any side', 'Midline is a median'],
  q: [N('Third side 14 cm. Midline?', 7, 'Half.')],
  x: ['Estimate the width of a pond with the midline theorem.'],
});

g.chapter('g8-linear-function', 'Linear Functions', '一次函数', 'functions', 'Variables, functions and straight-line graphs.', DOWN);
g.k('g8-direct-function', 'Functions, proportional and linear functions', '函数与一次函数', {
  d: 'y = kx + b: k sets the slope, b the y-intercept. When b = 0 the line passes through the origin (direct proportion).', t: ['Variables and functions', 'Representations of functions', 'Direct proportion functions', 'Linear functions', 'Graphs and properties'],
  o: ['Graph linear functions', 'Explain the roles of k and b'], pre: ['g7-cartesian', 'g6-direct'], rel: ['g10-function-concept'],
  e: 'func', c: {mode: 'linear', k: 2, b: -1}, m: ['Larger b means steeper', 'k < 0 lines rise'],
  q: [M('y = −2x + 3: as x increases, y…', ['Decreases', 'Increases', 'Stays the same'], 'Decreases', 'k < 0.'), N('y-intercept of y = 2x − 1?', -1, 'b = −1.')],
  x: ['Model a taxi fare as a linear function.'], f: 'y = kx + b',
});
g.k('g8-linear-eq-ineq', 'Linear functions, equations and inequalities', '一次函数与方程、不等式', {
  d: 'kx + b = 0 is where the line crosses the x-axis; kx + b > 0 is where it is above; a system is two lines crossing.', t: ['Linear functions and linear equations', 'Linear functions and inequalities', 'Linear functions and systems'],
  o: ['Read solutions from graphs', 'Connect the three viewpoints'], pre: ['g8-direct-function', 'g7-systems', 'g7-linear-inequality'],
  e: 'func', c: {mode: 'linear-ineq', k: 2, b: -4}, m: ['The x-intercept is b', 'Above the axis means x > 0'],
  q: [N('Where does y = 2x − 4 cross the x-axis? x = ?', 2, '2x − 4 = 0.')],
  x: ['Two phone plans as two lines: when is each cheaper?'],
});

g.chapter('g8-data-analysis', 'Analysing Data', '数据的分析', 'statistics', 'Centre and spread.', DOWN);
g.k('g8-center', 'Mean, median and mode', '平均数、中位数和众数', {
  d: 'The mean balances the data, the median splits it in half, the mode is most frequent; an outlier pulls the mean most.', t: ['Weighted mean', 'Median', 'Mode'],
  o: ['Compute the three averages', 'Choose the right average'], pre: ['g4-mean', 'g7-histogram'], rel: ['g8-variance'],
  e: 'analysis', c: {mode: 'center'}, m: ['Median is the middle of the unsorted list', 'The mean resists outliers'],
  q: [N('Median of 3, 9, 4, 7, 5?', 5, 'Sorted: 3, 4, 5, 7, 9.'), N('Weighted mean: exam 90 (weight 3), homework 80 (weight 2)?', 86, '(270 + 160) ÷ 5.')],
  x: ['Why do reports quote median income?'],
});
g.k('g8-variance', 'Variance and spread', '方差与数据的波动', {
  d: 'Variance averages squared distances from the mean; two sets with the same mean can spread very differently.', t: ['Range', 'Variance', 'Standard deviation idea'],
  o: ['Compute variance', 'Compare stability of data sets'], pre: ['g8-center'], rel: ['g10-percentiles'],
  e: 'analysis', c: {mode: 'variance'}, m: ['Same mean means same data', 'Variance can be negative'],
  q: [N('Variance of 2, 4, 6?', 8 / 3, 'Mean 4; (4 + 0 + 4) ÷ 3.', 0.01)],
  x: ['Compare two archers’ scores: who is more consistent?'], f: 's^2=\\frac1n\\sum(x_i-\\bar x)^2',
});

export const grade8 = g.done();
