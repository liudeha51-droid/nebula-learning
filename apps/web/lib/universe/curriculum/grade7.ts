import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(7);
const UP = '七年级上册', DOWN = '七年级下册';

g.chapter('g7-rational', 'Rational Numbers', '有理数', 'number', 'Extend numbers to negatives and place every rational number on the number line.', UP);
g.k('g7-rational-numbers', 'Positive numbers, negative numbers and rational numbers', '正数、负数与有理数', {
  d: 'Integers and fractions, positive and negative, together form the rational numbers; each has a point on the number line.', t: ['Positive and negative numbers', 'Rational numbers', 'Classification of rational numbers', 'The number line'],
  o: ['Classify rational numbers', 'Locate rational numbers on a number line'], pre: ['g6-negatives', 'g5-frac-decimal'], rel: ['g7-opposite-abs'],
  e: 'rational', c: {mode: 'line', a: -2.5, b: 1.5}, m: ['Negative fractions are not rational', '0 is positive'],
  q: [M('Which is not a rational number?', ['−3', '2/5', 'π'], 'π', 'π cannot be written as a fraction.'), M('Is 0 an integer?', ['Yes', 'No'], 'Yes', '0 is an integer, neither positive nor negative.')],
  x: ['Make a Venn diagram of integers, fractions and rational numbers.'],
});
g.k('g7-opposite-abs', 'Opposite numbers and absolute value', '相反数与绝对值', {
  d: 'Opposites lie the same distance from 0 on either side; absolute value is that distance.', t: ['Opposite numbers', 'Absolute value'],
  o: ['Find opposites and absolute values', 'Interpret |a| as a distance'], pre: ['g7-rational-numbers'], rel: ['g7-compare-rational'],
  e: 'rational', c: {mode: 'absolute', a: -3}, m: ['|−3| = −3', 'The opposite of a number is always negative'],
  q: [N('|−7| = ?', 7, '7 units from 0.'), N('The opposite of −4.5 is?', 4.5, 'Same distance, other side.')],
  x: ['Which numbers satisfy |x| = 3? Mark them.'], f: '|a| = \\begin{cases} a & a\\ge 0\\\\ -a & a<0\\end{cases}',
});
g.k('g7-compare-rational', 'Comparing rational numbers', '有理数的大小比较', {
  d: 'On the number line, numbers increase to the right; of two negatives, the one with the larger absolute value is smaller.', t: ['Comparing rational numbers', 'Ordering on the number line'],
  o: ['Compare any two rational numbers', 'Order lists including negatives'], pre: ['g7-opposite-abs', 'g6-negative-compare'],
  e: 'rational', c: {mode: 'compare', a: -3, b: -1.5}, m: ['−3 > −1.5 because 3 > 1.5', 'Fractions cannot be compared with negatives'],
  q: [M('Which is greater?', ['−3', '−1.5'], '−1.5', 'Closer to 0 on the right.')],
  x: ['Order −0.5, −1/3, −2/5 from least to greatest.'],
});

g.chapter('g7-rational-ops', 'Operations with Rational Numbers', '有理数的运算', 'operations', 'Move along the number line to add and subtract; scale and reflect to multiply.', UP);
g.k('g7-add-signed', 'Adding and subtracting rational numbers', '有理数的加减法', {
  d: 'Adding a positive moves right, adding a negative moves left; subtracting is adding the opposite.', t: ['Addition of rational numbers', 'Subtraction of rational numbers', 'Mixed addition and subtraction'],
  o: ['Add and subtract signed numbers', 'Rewrite subtraction as adding the opposite'], pre: ['g7-compare-rational'], rel: ['g7-multiply-signed'],
  e: 'rational', c: {mode: 'add', a: 3, b: -5}, m: ['(−3) + (−5) = 8', '5 − (−2) = 3'],
  q: [N('(−3) + (−5) = ?', -8, 'Both left: −8.'), N('5 − (−2) = ?', 7, '5 + 2.')],
  x: ['Track a lift: up 5, down 8, up 2. Where is it?'], f: 'a - b = a + (-b)',
});
g.k('g7-multiply-signed', 'Multiplying and dividing rational numbers', '有理数的乘除法', {
  d: 'Multiplying by −1 reflects a number through 0, so negative × negative is positive.', t: ['Multiplication of rational numbers', 'Sign rules', 'Division of rational numbers', 'Reciprocals'],
  o: ['Apply the sign rules', 'Explain why (−)(−) = (+) by reflection'], pre: ['g7-add-signed'],
  e: 'rational', c: {mode: 'multiply', a: -3, b: -2}, m: ['(−3)(−2) = −6', 'Dividing by a negative keeps the sign'],
  q: [N('(−3) × (−2) = ?', 6, 'Two reflections.'), N('(−12) ÷ 4 = ?', -3, 'Different signs: negative.')],
  x: ['Use patterns: 3×(−2), 2×(−2), 1×(−2), 0×(−2), (−1)×(−2)… what comes next?'],
});
g.k('g7-powers', 'Powers and scientific notation', '有理数的乘方与科学记数法', {
  d: 'Repeated multiplication grows (or shrinks) fast; scientific notation writes huge numbers as a × 10ⁿ.', t: ['Powers', 'Scientific notation', 'Approximate numbers', 'Mixed operations with rational numbers'],
  o: ['Evaluate powers with negative bases', 'Write numbers in scientific notation'], pre: ['g7-multiply-signed', 'g5-point-shift'],
  e: 'rational', c: {mode: 'power', a: 2, b: 10}, m: ['−2² = 4', '3.5 × 10⁵ = 35 000'],
  q: [N('(−2)³ = ?', -8, 'Three negative factors.'), N('3.5 × 10⁵ = ?', 350000, 'Move digits 5 places.')],
  x: ['Fold paper: how many layers after 10 folds?'],
});

g.chapter('g7-expressions', 'Algebraic Expressions', '代数式', 'relationships', 'Use letters to write general rules and evaluate them.', UP);
g.k('g7-algebraic-expr', 'Algebraic expressions and their values', '代数式及其值', {
  d: 'An algebraic expression combines numbers and letters with operations; substituting values gives its value.', t: ['Using letters for numbers', 'Algebraic expressions', 'Evaluating expressions'],
  o: ['Write expressions for situations', 'Evaluate expressions by substitution'], pre: ['g5-letters', 'g7-multiply-signed'], rel: ['g7-like-terms'],
  e: 'balance', c: {mode: 'expression', coef: 4, constant: 3}, m: ['4a means 4 + a', 'a² = 2a'],
  q: [N('If a = −2, what is 4a + 3?', -5, '4 × (−2) + 3.')],
  x: ['Write an expression for the cost of n tickets at 15 yuan with a 5 yuan booking fee.'],
});

g.chapter('g7-polynomials', 'Addition and Subtraction of Polynomials', '整式的加减', 'relationships', 'Combine like terms with algebra tiles.', UP);
g.k('g7-like-terms', 'Like terms and combining them', '同类项与合并同类项', {
  d: 'Only tiles of the same shape (same letters, same powers) can be combined, by adding their coefficients.', t: ['Monomials', 'Polynomials', 'Like terms', 'Combining like terms'],
  o: ['Identify like terms', 'Combine like terms'], pre: ['g7-algebraic-expr'], rel: ['g7-add-polynomials'],
  e: 'tiles', c: {mode: 'like-terms', a: 3, b: 2}, m: ['3x + 2y = 5xy', 'x² + x = x³'],
  q: [M('3x + 2x² − x = ?', ['2x + 2x²', '4x²', '5x²'], '2x + 2x²', 'Only x terms combine.')],
  x: ['Sort tiles by shape and simplify 2x² + 3x − x² + 1 − 4x.'], f: '3x + 2x = 5x',
});
g.k('g7-add-polynomials', 'Removing brackets and adding polynomials', '去括号与整式的加减', {
  d: 'A minus sign before brackets flips every tile inside; then combine like terms.', t: ['Removing brackets', 'Addition and subtraction of polynomials'],
  o: ['Remove brackets correctly', 'Add and subtract polynomials'], pre: ['g7-like-terms'],
  e: 'tiles', c: {mode: 'brackets', a: 2, b: 3}, m: ['−(x − 3) = −x − 3', 'Forgetting to change every sign'],
  q: [M('(3x + 2) − (x − 5) = ?', ['2x + 7', '2x − 3', '4x − 3'], '2x + 7', '−(x − 5) = −x + 5.')],
  x: ['Check by substituting x = 1 into both forms.'],
});

g.chapter('g7-linear-eq', 'Linear Equations in One Variable', '一元一次方程', 'relationships', 'Solve equations with the balance and model real situations.', UP);
g.k('g7-linear-equation', 'Solving linear equations', '一元一次方程的解法', {
  d: 'Use properties of equality to move terms and divide by the coefficient.', t: ['Linear equations in one variable', 'Moving terms', 'Removing brackets and denominators'],
  o: ['Solve linear equations systematically', 'Check solutions'], pre: ['g5-equations', 'g7-add-polynomials'], rel: ['g7-systems'],
  e: 'balance', c: {mode: 'equation', a: 5, b: 3, c: 28}, m: ['Moving a term without changing its sign', 'Dividing only one side'],
  q: [N('Solve 5x + 3 = 28.', 5, '5x = 25.'), N('Solve 3(x − 2) = 2x + 1.', 7, '3x − 6 = 2x + 1.')],
  x: ['Solve (x + 1)/2 = (2x − 1)/3 by clearing denominators.'],
});
g.k('g7-equation-apps', 'Linear equations in real problems', '实际问题与一元一次方程', {
  d: 'Find the equal quantities in a story, name the unknown, write the equation and interpret the answer.', t: ['Practical problems and linear equations', 'Distribution problems', 'Travel and work problems'],
  o: ['Model stories with linear equations', 'Interpret solutions in context'], pre: ['g7-linear-equation'],
  e: 'balance', c: {mode: 'equation', a: 2, b: 10, c: 50}, m: ['Equations in the order words appear', 'Answers that make no sense in context'],
  q: [N('A pen costs 3 yuan more than a pencil; together 11 yuan. Price of the pencil?', 4, 'x + x + 3 = 11.')],
  x: ['Write and solve your own equation story.'],
});

g.chapter('g7-geometry', 'Introduction to Geometric Figures', '几何图形初步', 'geometry', 'Solid and plane figures, lines, segments and angles.', UP);
g.k('g7-solid-nets', 'Solid figures, views and nets', '立体图形与展开图', {
  d: 'Solids unfold into plane nets and are seen as flat views; points, lines and planes build every figure.', t: ['Solid and plane figures', 'Nets', 'Points, lines, planes and solids'],
  o: ['Match solids to nets', 'Describe solids by faces, edges and vertices'], pre: ['g5-nets'],
  e: 'solid', c: {mode: 'net', shape: 'cube'}, m: ['Any six squares fold into a cube', 'Views show hidden edges'],
  q: [N('How many faces does a hexagonal prism have?', 8, '6 sides + 2 bases.')],
  x: ['Design a net for a box with a lid.'],
});
g.k('g7-lines-angles', 'Lines, segments, angles; complements and supplements', '直线、射线、线段与角', {
  d: 'Complementary angles add to 90°, supplementary angles to 180°; equal angles have equal complements.', t: ['Lines, rays and segments', 'Comparing segments', 'Angles and degrees', 'Complementary and supplementary angles'],
  o: ['Use complements and supplements', 'Measure and compare angles'], pre: ['g4-angle-measure'], rel: ['g7-vertical-angles'],
  e: 'geo2', c: {mode: 'complement', deg: 35}, m: ['Complement of 35° is 145°', 'Supplementary angles must be adjacent'],
  q: [N('Complement of 35°?', 55, '90 − 35.'), N('Supplement of 35°?', 145, '180 − 35.')],
  x: ['Why do two angles with the same complement have to be equal?'],
});

g.chapter('g7-parallel', 'Intersecting and Parallel Lines', '相交线与平行线', 'geometry', 'Angles made by crossing and parallel lines.', DOWN);
g.k('g7-vertical-angles', 'Vertical angles and perpendicular lines', '对顶角与垂线', {
  d: 'Two crossing lines make two pairs of equal vertical angles; the perpendicular segment is the shortest distance.', t: ['Intersecting lines', 'Vertical angles', 'Perpendicular lines', 'Distance from a point to a line'],
  o: ['Explain why vertical angles are equal', 'Use the shortest-distance property'], pre: ['g7-lines-angles'],
  e: 'geo2', c: {mode: 'vertical', deg: 50}, m: ['Adjacent angles are vertical angles', 'Any segment to a line is the distance'],
  q: [N('Two lines cross; one angle is 50°. Its vertical angle?', 50, 'Vertical angles are equal.'), N('Its neighbour?', 130, 'Supplementary.')],
  x: ['Rotate scissors: watch the vertical angles stay equal.'],
});
g.k('g7-parallel-angles', 'Parallel lines and transversals', '平行线的判定与性质', {
  d: 'A transversal across parallel lines makes equal corresponding angles and equal alternate angles; co-interior angles add to 180°.', t: ['Corresponding angles', 'Alternate interior angles', 'Co-interior angles', 'Tests for parallel lines', 'Properties of parallel lines'],
  o: ['Identify angle pairs', 'Use them to prove lines parallel and find angles'], pre: ['g7-vertical-angles', 'g4-parallel'], rel: ['g8-polygon-angles'],
  e: 'geo2', c: {mode: 'parallel', deg: 65}, m: ['Corresponding angles are always equal (even without parallel lines)', 'Co-interior angles are equal'],
  q: [N('Parallel lines, corresponding angle 65°. Co-interior angle?', 115, '180 − 65.')],
  x: ['Use alternate angles to prove the triangle angle sum.'],
});
g.k('g7-translation', 'Translations', '平移', {
  d: 'Translation moves every point the same distance in the same direction; corresponding segments stay parallel and equal.', t: ['Translation'],
  o: ['Translate figures', 'State translation properties'], pre: ['g4-transformations'],
  e: 'transform', c: {mode: 'translate', dx: 4, dy: 2}, m: ['Translation changes shape', 'Distance measured between shapes'],
  q: [M('After translation, a segment and its image are…', ['Parallel (or collinear) and equal', 'Perpendicular', 'Different lengths'], 'Parallel (or collinear) and equal', 'Every point moves the same.')],
  x: ['Design a frieze pattern by translation.'],
});

g.chapter('g7-real', 'Real Numbers', '实数', 'number', 'Square roots, cube roots and irrational numbers.', DOWN);
g.k('g7-square-roots', 'Square roots and cube roots', '平方根与立方根', {
  d: 'A square with area 9 has side 3: the arithmetic square root. Every positive number has two square roots ±√a.', t: ['Arithmetic square roots', 'Square roots', 'Cube roots'],
  o: ['Find square and cube roots', 'Estimate square roots between integers'], pre: ['g3-area-intro', 'g7-powers'], rel: ['g7-irrational'],
  e: 'pythag', c: {mode: 'sqrt', n: 20}, m: ['√9 = ±3', 'Negative numbers have square roots'],
  q: [N('√81 = ?', 9, '9² = 81.'), N('Cube root of −8?', -2, '(−2)³ = −8.')],
  x: ['Estimate √20 to one decimal place by squaring guesses.'], f: '(\\sqrt a)^2 = a\\;(a\\ge 0)',
});
g.k('g7-irrational', 'Irrational numbers and real numbers', '无理数与实数', {
  d: 'The diagonal of a unit square has length √2, a point on the number line that no fraction reaches.', t: ['Irrational numbers', 'Real numbers', 'Real numbers and the number line'],
  o: ['Recognise irrational numbers', 'Locate √2 on the number line'], pre: ['g7-square-roots'], rel: ['g8-radicals'],
  e: 'pythag', c: {mode: 'irrational'}, m: ['All roots are irrational', 'Infinite decimals are always irrational'],
  q: [M('Which is irrational?', ['√16', '0.3333…', '√5'], '√5', '5 is not a perfect square.')],
  x: ['Construct √3 and √5 on the number line with right triangles.'],
});

g.chapter('g7-coordinates', 'The Cartesian Plane', '平面直角坐标系', 'functions', 'Extend the grid to four quadrants.', DOWN);
g.k('g7-cartesian', 'The Cartesian coordinate plane', '平面直角坐标系', {
  d: 'Two perpendicular number lines locate every point by an ordered pair (x, y); signs tell the quadrant.', t: ['Ordered pairs', 'The coordinate plane', 'Quadrants', 'Describing position and translation with coordinates'],
  o: ['Plot points in four quadrants', 'Describe translations with coordinates'], pre: ['g5-coordinates', 'g7-rational-numbers'], rel: ['g8-direct-function'],
  e: 'func', c: {mode: 'quadrants', x: -3, y: 2}, m: ['(−3, 2) is in quadrant IV', 'Points on axes belong to a quadrant'],
  q: [M('Which quadrant is (−3, 2) in?', ['I', 'II', 'III', 'IV'], 'II', 'x negative, y positive.')],
  x: ['Draw a picture by joining points in all four quadrants.'],
});

g.chapter('g7-systems', 'Systems of Linear Equations', '二元一次方程组', 'relationships', 'Two equations, two unknowns: eliminate or intersect.', DOWN);
g.k('g7-systems', 'Systems of two linear equations', '二元一次方程组及其解法', {
  d: 'Each equation is a line; the solution is where they cross. Substitution and elimination find it algebraically.', t: ['Linear equations in two variables', 'Systems of equations', 'Substitution', 'Elimination', 'Applications'],
  o: ['Solve systems by substitution and elimination', 'Interpret the solution as an intersection'], pre: ['g7-linear-equation', 'g7-cartesian'], rel: ['g8-linear-eq-ineq'],
  e: 'func', c: {mode: 'system', a: 1, b: 1, c: 10, d: 2, e: -1, f: 2}, m: ['A single linear equation in two variables has one solution', 'Adding equations without lining up terms'],
  q: [N('x + y = 10, 2x − y = 2. x = ?', 4, 'Add: 3x = 12.'), N('Then y = ?', 6, '10 − 4.')],
  x: ['Chickens and rabbits again: solve with a system.'],
});

g.chapter('g7-inequalities', 'Inequalities', '不等式与不等式组', 'relationships', 'Properties of inequalities and solution sets on the number line.', DOWN);
g.k('g7-inequality-props', 'Properties of inequalities', '不等式的性质', {
  d: 'Adding the same number keeps an inequality; multiplying by a negative flips it.', t: ['Inequalities', 'Properties of inequalities'],
  o: ['Apply the three properties', 'Explain the sign flip with the number line'], pre: ['g5-equality', 'g7-multiply-signed'], rel: ['g7-linear-inequality'],
  e: 'inequality', c: {mode: 'properties', a: 2, b: 5}, m: ['Multiplying by −1 keeps the direction', 'Inequalities behave exactly like equations'],
  q: [M('If a < b, then −2a ? −2b', ['>', '<', '='], '>', 'Multiplying by a negative flips.')],
  x: ['Test with numbers: 2 < 5; multiply both by −3.'],
});
g.k('g7-linear-inequality', 'Linear inequalities and their systems', '一元一次不等式（组）', {
  d: 'A solution set is a ray on the number line; a system’s solution is where the rays overlap.', t: ['Linear inequalities', 'Solution sets', 'Systems of linear inequalities'],
  o: ['Solve and graph linear inequalities', 'Find the common part of a system'], pre: ['g7-inequality-props'], rel: ['g10-quadratic-ineq'],
  e: 'inequality', c: {mode: 'line', a: -1, b: 3}, m: ['Open vs closed dots', 'Overlap taken as union'],
  q: [M('Solve 3 − 2x > 1.', ['x < 1', 'x > 1', 'x < −1'], 'x < 1', '−2x > −2, divide by −2 and flip.'), N('How many integers satisfy −1 < x ≤ 3?', 4, '0, 1, 2, 3.')],
  x: ['Write a system with no solution.'],
});

g.chapter('g7-data', 'Collecting, Organising and Describing Data', '数据的收集、整理与描述', 'statistics', 'Surveys, samples and histograms.', DOWN);
g.k('g7-sampling', 'Census and sample surveys', '全面调查与抽样调查', {
  d: 'A random sample lets us estimate a population; bigger random samples are more reliable.', t: ['Census', 'Sample surveys', 'Population, individual, sample, sample size'],
  o: ['Choose census or sample appropriately', 'Explain why random samples matter'], pre: ['g6-compare-datasets'], rel: ['g10-sampling-methods'],
  e: 'analysis', c: {mode: 'sampling'}, m: ['A sample of volunteers represents everyone', 'Bigger samples are always unbiased'],
  q: [M('Testing every light bulb’s lifetime should be done by…', ['Sampling', 'Census'], 'Sampling', 'Testing destroys the bulbs.')],
  x: ['Estimate the proportion of red beads in a jar with samples of 10, 30 and 100.'],
});
g.k('g7-histogram', 'Frequency distributions and histograms', '直方图与频数分布', {
  d: 'Group data into equal intervals and draw adjacent bars: the histogram shows the shape of a distribution.', t: ['Frequency distribution tables', 'Histograms', 'Class width'],
  o: ['Build frequency tables', 'Draw and read histograms'], pre: ['g7-sampling', 'g3-bar-chart'], rel: ['g8-center'],
  e: 'analysis', c: {mode: 'histogram'}, m: ['Histogram bars have gaps', 'Different class widths compared by height'],
  q: [N('Data range 150–180 cm, class width 5. How many classes?', 6, '30 ÷ 5.')],
  x: ['Collect classmates’ heights and draw a histogram.'],
});

export const grade7 = g.done();
