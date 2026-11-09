import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(5);

g.chapter('g5-decimals', 'Decimal Operations', '小数乘除法', 'operations', 'See decimal operations as changes in place value, not tricks.');
g.k('g5-point-shift', 'Moving the decimal point', '小数点位置移动', {
  d: '×10 moves every digit one place left (the point stays, the digits move); ÷10 moves them right.', t: ['Decimal place values', 'Decimal properties', 'Decimal comparison', 'Moving the decimal point'],
  o: ['Explain ×10, ×100, ÷10 as place-value shifts', 'Predict the result of ×/÷ powers of ten'], pre: ['g4-place-shift', 'g4-decimal-places'], rel: ['g5-dec-times-dec'],
  e: 'decimal', c: {mode: 'shift', value: 3.47}, m: ['×10 means “add a zero”: 3.47 × 10 = 3.470', 'The point physically jumps'],
  q: [N('3.47 × 100 = ?', 347, 'Each digit moves two places left.'), N('52 ÷ 1000 = ?', 0.052, 'Each digit moves three places right.')],
  x: ['Convert 2.5 m to cm and mm. Which way do digits move?'],
});
g.k('g5-dec-times-int', 'Multiplying decimals by whole numbers', '小数乘整数', {
  d: '0.3 × 4 is four groups of 3 tenths: 12 tenths = 1.2.', t: ['Multiplying decimals by integers'],
  o: ['Model decimal × integer as repeated groups', 'Place the decimal point by counting tenths'], pre: ['g4-decimal-addsub', 'g2-mult-meaning'],
  e: 'decimal', c: {mode: 'multiply', a: 0.3, b: 4}, m: ['0.3 × 4 = 0.12', 'Ignoring the decimal point'],
  q: [N('0.3 × 4 = ?', 1.2, '12 tenths.'), N('2.5 × 6 = ?', 15, '25 tenths × 6 = 150 tenths.')],
  x: ['A pen costs 2.5 yuan. What do 8 pens cost?'],
});
g.k('g5-dec-times-dec', 'Multiplying decimals by decimals', '小数乘小数', {
  d: 'On a hundred grid, 0.6 × 0.4 is the overlap of 6 tenths by 4 tenths: 24 hundredths.', t: ['Multiplying decimals by decimals'],
  o: ['Model decimal × decimal with an area grid', 'Explain why the product can be smaller than both factors'], pre: ['g5-dec-times-int'], rel: ['g6-frac-times-frac'],
  e: 'decimal', c: {mode: 'multiply', a: 0.6, b: 0.4}, m: ['Multiplication always makes bigger', '0.6 × 0.4 = 2.4'],
  q: [N('0.6 × 0.4 = ?', 0.24, '24 hundredths.'), M('0.8 × 0.5 compared with 0.8:', ['Smaller', 'Bigger', 'Equal'], 'Smaller', 'Taking half of 0.8.')],
  x: ['Why does 0.1 × 0.1 = 0.01? Draw it.'],
});
g.k('g5-dec-divide', 'Dividing decimals', '小数除法', {
  d: 'Scale both numbers by 10 so the divisor is whole: 4.8 ÷ 0.6 = 48 ÷ 6 — the same number of groups.', t: ['Dividing decimals by integers', 'Dividing decimals by decimals', 'Approximate quotients'],
  o: ['Divide decimals by scaling', 'Explain why the quotient is unchanged'], pre: ['g5-point-shift', 'g4-div-two-digit'], rel: ['g6-frac-divide'],
  e: 'decimal', c: {mode: 'divide', a: 4.8, b: 0.6}, m: ['Scaling only the divisor', 'Division always makes smaller'],
  q: [N('4.8 ÷ 0.6 = ?', 8, '48 ÷ 6.'), N('7.2 ÷ 4 = ?', 1.8, '72 tenths ÷ 4 = 18 tenths.')],
  x: ['How many 0.25 L cups fill a 1.5 L bottle?'],
});
g.k('g5-dec-estimate', 'Estimation and mixed decimal operations', '小数的近似与混合运算', {
  d: 'Round decimals to a chosen place to estimate; keep exact values for final answers.', t: ['Decimal estimation', 'Decimal mixed operations', 'Practical applications'],
  o: ['Round decimals to a given place', 'Estimate decimal calculations'], pre: ['g5-dec-divide', 'g4-rounding'],
  e: 'number-line', c: {mode: 'round', value: 3.846, to: 0.01}, m: ['Rounding 3.846 to 3.84', 'Rounding every step and losing accuracy'],
  q: [N('Round 3.846 to the nearest hundredth.', 3.85, 'Thousandths digit 6 ≥ 5.')],
  x: ['Estimate a shopping bill and compare with the exact total.'],
});

g.chapter('g5-factors', 'Factors and Multiples', '因数与倍数', 'number', 'Discover structure in numbers by testing which groupings are possible.');
g.k('g5-factors', 'Factors and multiples from rectangles', '因数和倍数', {
  d: 'Every way to arrange n tiles in a rectangle gives a pair of factors.', t: ['Factors', 'Multiples'],
  o: ['Find all factors by arranging rectangles', 'Explain the factor-multiple relationship'], pre: ['g2-times-tables'], rel: ['g5-primes'],
  e: 'factor', c: {mode: 'rectangles', n: 12}, m: ['Missing factor pairs', 'Thinking 1 and n are not factors'],
  q: [N('How many factors does 12 have?', 6, '1, 2, 3, 4, 6, 12.'), M('Is 36 a multiple of 9?', ['Yes', 'No'], 'Yes', '9 × 4 = 36.')],
  x: ['Which numbers below 50 have exactly 3 factors?'],
});
g.k('g5-primes', 'Prime and composite numbers', '质数和合数', {
  d: 'A prime number makes only one rectangle (a single row); composites make more.', t: ['Prime numbers', 'Composite numbers'],
  o: ['Identify primes by testing arrangements', 'Use a sieve to find primes to 100'], pre: ['g5-factors'], rel: ['g5-prime-factorization'],
  e: 'factor', c: {mode: 'primes', n: 100}, m: ['1 is prime', 'All odd numbers are prime'],
  q: [M('Which is prime?', ['21', '23', '27'], '23', '23 has only 1 and 23 as factors.'), M('Is 1 prime?', ['Yes', 'No'], 'No', 'A prime has exactly two factors.')],
  x: ['Are there more primes between 1–50 or 51–100?'],
});
g.k('g5-divisibility', 'Divisibility by 2, 3 and 5; odd and even', '2、3、5的倍数特征', {
  d: 'Last digits decide divisibility by 2 and 5; the digit sum decides divisibility by 3.', t: ['Divisibility by 2', 'Divisibility by 3', 'Divisibility by 5', 'Odd and even numbers'],
  o: ['Test divisibility quickly', 'Explain the digit-sum rule with place value'], pre: ['g5-factors'], rel: ['g5-gcf'],
  e: 'factor', c: {mode: 'divisibility', n: 435}, m: ['Divisible by 3 if the last digit is 3', 'Even numbers end in 2'],
  q: [M('Is 435 divisible by 3?', ['Yes', 'No'], 'Yes', '4 + 3 + 5 = 12, a multiple of 3.'), M('Is 435 even?', ['Yes', 'No'], 'No', 'It ends in 5.')],
  x: ['Why does 10 leave remainder 1 when divided by 3? How does that explain the rule?'],
});
g.k('g5-gcf', 'Greatest common factor', '最大公因数', {
  d: 'The largest square tile that exactly tiles an a × b rectangle has side gcf(a, b).', t: ['Common factors', 'Greatest common factor'],
  o: ['Find common factors and the GCF', 'Use the GCF in tiling problems'], pre: ['g5-factors'], rel: ['g5-simplify'],
  e: 'factor', c: {mode: 'gcf', a: 12, b: 18}, m: ['GCF is the product of the numbers', 'Common factors include only primes'],
  q: [N('GCF of 12 and 18?', 6, 'Factors in common: 1, 2, 3, 6.')],
  x: ['A 24 × 36 floor: largest square tile with no cutting?'],
});
g.k('g5-lcm', 'Least common multiple', '最小公倍数', {
  d: 'Two flashing lights with periods 4 and 6 flash together every lcm(4, 6) = 12 seconds.', t: ['Common multiples', 'Least common multiple'],
  o: ['Find common multiples and the LCM', 'Use the LCM in timing problems'], pre: ['g5-factors'], rel: ['g5-common-denominator'],
  e: 'factor', c: {mode: 'lcm', a: 4, b: 6}, m: ['LCM is always the product', 'Confusing LCM and GCF'],
  q: [N('LCM of 4 and 6?', 12, 'Multiples of 6: 6, 12 — 12 is also a multiple of 4.')],
  x: ['Two buses leave every 15 and 20 minutes. When do they leave together again?'],
});
g.k('g5-prime-factorization', 'Prime factorization (enrichment)', '分解质因数（拓展）', {
  d: 'Every composite number splits into primes in exactly one way, shown by a factor tree.', t: ['Prime factorization as an enrichment concept'],
  o: ['Build factor trees', 'Use prime factors to find GCF and LCM'], pre: ['g5-primes'],
  e: 'factor', c: {mode: 'tree', n: 60}, m: ['Stopping at a composite', 'Different trees give different primes'],
  q: [M('Prime factorization of 60?', ['2 × 2 × 3 × 5', '6 × 10', '2 × 30'], '2 × 2 × 3 × 5', 'All factors must be prime.')],
  x: ['Factorise 360. Why is it so “friendly”?'], f: '60 = 2^2 \\times 3 \\times 5',
});

g.k('g5-clock-stars', 'Signature: Clock arithmetic and the circle of fifths', '招牌动画：时钟算术与五度圈', {
  d: 'On a clock 9 + 5 = 2. Hop round a circle of points by a fixed step and a star appears; it visits every point exactly when the step and the number of points share no common factor.', t: ['Remainders', 'Greatest common factor', 'Patterns in music (enrichment)'],
  o: ['Add on a clock by wrapping round', 'Predict when hops visit every point using the greatest common factor'], pre: ['g5-gcf', 'g2-elapsed'], rel: ['g4-times-circle'],
  e: 'journey', c: {mode: 'clock', n: 12, m: 7}, m: ['Clock time can go past 12', 'Every step size visits every point'],
  q: [N('It is 10 o’clock. What time will it be in 7 hours? (1–12)', 5, '17 − 12 = 5.'), N('Hopping 3 at a time around 12 points, how many hops until you are back?', 4, '12 ÷ gcd(12, 3) = 4.')],
  x: ['On a piano, start at C and keep going up 7 semitones (C, G, D, …). How many steps until you reach a C again?'], f: 'a + b \\pmod{12}',
});
g.chapter('g5-fractions', 'Fractions', '分数的意义和性质与加减法', 'number', 'Subdivide, regroup and compare fractions.');
g.k('g5-fraction-division', 'Fractions as division', '分数与除法', {
  d: 'Sharing 3 cakes among 4 people gives each 3/4 of a cake: a ÷ b = a/b.', t: ['Meaning of fractions', 'Fraction units', 'Fractions and division'],
  o: ['Explain a ÷ b = a/b by sharing', 'Write division results as fractions'], pre: ['g3-several-parts', 'g2-share'], rel: ['g5-improper'],
  e: 'fraction', c: {mode: 'division-link', n: 3, d: 4}, m: ['Each person gets 1/4', '3 ÷ 4 is impossible'],
  q: [N('3 cakes shared among 4 people: each gets ?/4 of a cake.', 3, '3 ÷ 4 = 3/4.')],
  x: ['Share 5 pizzas among 3 people. Draw it.'], f: 'a \\div b = \\tfrac{a}{b}\\;(b\\ne 0)',
});
g.k('g5-improper', 'Proper, improper and mixed numbers', '真分数、假分数和带分数', {
  d: 'When parts exceed one whole, fill wholes first: 7/3 = 2 wholes and 1/3.', t: ['Proper fractions', 'Improper fractions', 'Mixed numbers'],
  o: ['Convert between improper fractions and mixed numbers', 'Place them on a number line'], pre: ['g5-fraction-division'],
  e: 'fraction', c: {mode: 'improper', n: 7, d: 3}, m: ['A fraction cannot be more than 1', '7/3 = 7 1/3'],
  q: [M('7/3 as a mixed number is…', ['2 1/3', '1 4/3', '3 1/7'], '2 1/3', 'Two wholes use 6 thirds; 1 third remains.'), N('2 3/4 = ?/4', 11, '8 + 3 quarters.')],
  x: ['Is 5/5 proper or improper? Defend your answer.'],
});
g.k('g5-equivalent', 'Equivalent fractions', '分数的基本性质', {
  d: 'Cutting every part into k pieces multiplies the numerator and denominator by k without changing the amount.', t: ['Equivalent fractions', 'Fundamental properties of fractions'],
  o: ['Generate equivalent fractions by subdividing', 'State the fundamental property'], pre: ['g3-several-parts'], rel: ['g5-simplify', 'g5-common-denominator'],
  e: 'fraction', c: {mode: 'equivalent', n: 2, d: 3}, m: ['Adding the same number to top and bottom', 'More pieces means more cake'],
  q: [N('2/3 = ?/12', 8, '×4 top and bottom.')],
  x: ['Fold a strip into thirds, then fold each third in half.'], f: '\\tfrac{a}{b}=\\tfrac{a\\times k}{b\\times k}\\;(k\\ne 0)',
});
g.k('g5-simplify', 'Simplifying fractions', '约分', {
  d: 'Merge small equal parts into bigger equal parts: 6/8 = 3/4 by grouping pairs.', t: ['Simplifying fractions', 'Reducing fractions'],
  o: ['Simplify fractions with the GCF', 'Recognise simplest form'], pre: ['g5-equivalent', 'g5-gcf'],
  e: 'fraction', c: {mode: 'simplify', n: 6, d: 8}, m: ['Simplifying changes the size', 'Dividing only the numerator'],
  q: [M('Simplest form of 6/8?', ['3/4', '6/8', '2/3'], '3/4', 'Divide both by 2.'), M('Simplest form of 12/18?', ['2/3', '4/6', '6/9'], '2/3', 'GCF is 6.')],
  x: ['Which fractions with denominator 12 are already in simplest form?'],
});
g.k('g5-common-denominator', 'Common denominators and comparison', '通分与比较', {
  d: 'Overlay two grids so both fractions use the same-sized parts; then compare numerators.', t: ['Common denominators', 'Comparing fractions'],
  o: ['Find common denominators with the LCM', 'Compare unlike fractions'], pre: ['g5-equivalent', 'g5-lcm'], rel: ['g5-add-unlike'],
  e: 'fraction', c: {mode: 'common', a: [2, 3], b: [3, 4]}, m: ['Compare by numerators only', 'Common denominator must be the product'],
  q: [M('Which is greater?', ['2/3', '3/4'], '3/4', '8/12 < 9/12.')],
  x: ['Order 3/5, 5/8 and 7/10.'],
});
g.k('g5-add-unlike', 'Adding and subtracting unlike fractions', '异分母分数加减法', {
  d: 'Re-cut both fractions into common parts, then count the parts.', t: ['Adding fractions with the same denominator', 'Subtracting fractions with the same denominator', 'Adding and subtracting fractions with different denominators'],
  o: ['Add and subtract unlike fractions', 'Explain why denominators are not added'], pre: ['g5-common-denominator', 'g3-add-same'], rel: ['g6-frac-mixed'],
  e: 'fraction', c: {mode: 'add-diff', a: [1, 2], b: [1, 3]}, m: ['1/2 + 1/3 = 2/5', 'Forgetting to simplify'],
  q: [M('1/2 + 1/3 = ?', ['5/6', '2/5', '1/6'], '5/6', '3/6 + 2/6.'), M('3/4 − 1/6 = ?', ['7/12', '2/2', '1/2'], '7/12', '9/12 − 2/12.')],
  x: ['Why is 1/2 + 1/3 bigger than 1/2 but less than 1?'], f: '\\tfrac12+\\tfrac13=\\tfrac36+\\tfrac26=\\tfrac56',
});
g.k('g5-frac-decimal', 'Converting fractions and decimals', '分数与小数的互化', {
  d: 'Divide the numerator by the denominator; denominators made of 2s and 5s give terminating decimals.', t: ['Converting fractions and decimals'],
  o: ['Convert fractions to decimals and back', 'Predict which fractions terminate'], pre: ['g4-unified', 'g5-fraction-division'], rel: ['g6-percent-convert'],
  e: 'number-line', c: {mode: 'unified', n: 3, d: 8}, m: ['3/8 = 3.8', '0.375 cannot be a fraction'],
  q: [N('3/8 as a decimal?', 0.375, '3 ÷ 8.'), M('0.6 as a fraction in simplest form?', ['3/5', '6/100', '6/1'], '3/5', '6/10 = 3/5.')],
  x: ['Which unit fractions 1/2 … 1/12 give terminating decimals?'],
});

g.chapter('g5-algebra', 'Introductory Algebra', '简易方程', 'relationships', 'Use a balance to make unknowns visible and solve equations.');
g.k('g5-letters', 'Letters stand for numbers', '用字母表示数', {
  d: 'A letter stands for a number that can change; an expression like 3a + 2 describes a rule.', t: ['Using letters to represent numbers', 'Variables', 'Mathematical expressions', 'Relationships represented by letters', 'Substitution', 'Evaluating expressions'],
  o: ['Write expressions with letters', 'Evaluate expressions by substitution'], pre: ['g4-letters', 'g4-distributive'], rel: ['g5-equations'],
  e: 'balance', c: {mode: 'expression', coef: 3, constant: 2}, m: ['3a means 3 + a', 'a must always be 1'],
  q: [N('If a = 5, what is 3a + 2?', 17, '3 × 5 + 2.'), M('Which means “x times 4”?', ['4x', 'x + 4', 'x4'], '4x', 'We write the number first.')],
  x: ['Write an expression for the perimeter of a square with side a.'], f: '3a+2,\\; a=5 \\Rightarrow 17',
});
g.k('g5-equality', 'Properties of equality', '等式的性质', {
  d: 'A balanced scale stays balanced when we add, remove, multiply or divide both sides equally.', t: ['Properties of equality'],
  o: ['State the properties of equality', 'Predict whether a balance tips'], pre: ['g5-letters'], rel: ['g5-equations'],
  e: 'balance', c: {mode: 'equality'}, m: ['Only changing one side', 'Thinking = means “the answer is”'],
  q: [M('x + 3 = 10. Subtract 3 from the left only. Is it still balanced?', ['Yes', 'No'], 'No', 'Both sides must change equally.')],
  x: ['Explain the equals sign to a younger student.'],
});
g.k('g5-equations', 'Solving simple equations', '解简易方程', {
  d: 'Undo operations on both sides until the unknown is alone: 3x + 4 = 19 → 3x = 15 → x = 5.', t: ['Simple equations', 'Solutions of equations', 'Solving simple equations'],
  o: ['Solve one- and two-step equations', 'Check solutions by substitution'], pre: ['g5-equality'], rel: ['g6-proportion'],
  e: 'balance', c: {mode: 'equation', a: 3, b: 4, c: 19}, m: ['Dividing before removing the constant', 'Not checking the solution'],
  q: [N('Solve 3x + 4 = 19.', 5, 'Remove 4 from both sides, then divide by 3.'), N('Solve x ÷ 4 = 6.', 24, 'Multiply both sides by 4.')],
  x: ['Make up an equation whose solution is 7.'], f: '3x+4=19\\Rightarrow 3x=15\\Rightarrow x=5',
});
g.k('g5-equation-word', 'Equations in word problems', '列方程解决问题', {
  d: 'Name the unknown with a letter, translate the story into an equation and solve.', t: ['Using equations in word problems'],
  o: ['Translate stories into equations', 'Solve and interpret solutions'], pre: ['g5-equations'], rel: ['g6-chicken-rabbit'],
  e: 'balance', c: {mode: 'equation', a: 2, b: 6, c: 30}, m: ['Writing the equation in the order words appear', 'Forgetting units'],
  q: [N('Twice a number plus 6 is 30. Find the number.', 12, '2x + 6 = 30, x = 12.')],
  x: ['Solve a chicken-and-rabbit problem with an equation.'],
});

g.chapter('g5-area', 'Area of Plane Shapes', '多边形的面积', 'geometry', 'Derive area formulas by cutting, rotating and translating.');
g.k('g5-parallelogram', 'Area of a parallelogram', '平行四边形的面积', {
  d: 'Cut a triangle from one side and slide it across: the parallelogram becomes a rectangle with the same base and height.', t: ['Parallelogram area', 'Area formula derivation', 'Geometric rearrangement'],
  o: ['Derive S = a × h by rearrangement', 'Identify a base and its height'], pre: ['g3-area-intro', 'g4-quadrilaterals'], rel: ['g5-triangle', 'g6-circle-area'],
  e: 'area', c: {mode: 'parallelogram', base: 8, h: 5, slant: 3}, m: ['Using the slanted side instead of height', 'Rearranging changes area'],
  q: [N('Base 8 cm, height 5 cm. Area (cm²)?', 40, '8 × 5.'), M('A parallelogram is pushed so its height shrinks, sides unchanged. Its area…', ['Decreases', 'Stays the same', 'Increases'], 'Decreases', 'Base same, height smaller.')],
  x: ['Push a straw parallelogram flat. What happens to its area?'], f: 'S = a \\times h',
});
g.k('g5-triangle', 'Area of a triangle', '三角形的面积', {
  d: 'Two identical triangles fit together into a parallelogram, so a triangle is half: S = a × h ÷ 2.', t: ['Triangle area', 'Equivalent areas'],
  o: ['Derive the triangle formula by doubling', 'Find areas of triangles with any base'], pre: ['g5-parallelogram'], rel: ['g5-trapezoid'],
  e: 'area', c: {mode: 'triangle', base: 8, h: 5, apex: 3}, m: ['Forgetting ÷ 2', 'Using a side that is not perpendicular to the base'],
  q: [N('Base 8 cm, height 5 cm. Area (cm²)?', 20, '8 × 5 ÷ 2.')],
  x: ['Do all triangles with the same base and height have the same area? Drag the apex to test.'], f: 'S = a\\times h \\div 2',
});
g.k('g5-trapezoid', 'Area of a trapezoid', '梯形的面积', {
  d: 'Duplicate the trapezoid, rotate it 180° and join: a parallelogram with base (a + b).', t: ['Trapezoid area', 'Geometric decomposition', 'Mathematical transformation'],
  o: ['Derive S = (a + b) × h ÷ 2', 'Apply it to real shapes'], pre: ['g5-triangle'],
  e: 'area', c: {mode: 'trapezoid', a: 4, b: 8, h: 5}, m: ['Multiplying top and bottom', 'Forgetting to halve'],
  q: [N('Top 4 cm, bottom 8 cm, height 5 cm. Area (cm²)?', 30, '(4 + 8) × 5 ÷ 2.')],
  x: ['Show the trapezoid formula works when the top shrinks to 0. What shape is that?'], f: 'S=(a+b)\\times h\\div 2',
});
g.k('g5-composite', 'Composite and irregular areas', '组合图形的面积', {
  d: 'Split a composite figure into known shapes, or subtract a missing part.', t: ['Composite area', 'Irregular shape estimation'],
  o: ['Find composite areas by addition or subtraction', 'Choose a convenient decomposition'], pre: ['g5-trapezoid', 'g4-irregular'],
  e: 'area', c: {mode: 'composite', shape: 'house'}, m: ['Counting overlaps twice', 'Missing a piece'],
  q: [N('A house is a 6 × 4 rectangle with a triangle roof of base 6 and height 3. Area?', 33, '24 + 9.')],
  x: ['Find the area of your bedroom floor plan.'],
});

g.chapter('g5-solids', 'Three-Dimensional Geometry', '长方体和正方体', 'geometry', 'Build with unit cubes, unfold nets and separate surface area from volume.');
g.k('g5-volume-meaning', 'Volume with unit cubes', '体积与体积单位', {
  d: 'Volume counts unit cubes: one layer has l × w cubes, and h layers make l × w × h.', t: ['Meaning of volume', 'Cubic centimeters', 'Cubic decimeters', 'Cubic meters', 'Cuboid volume', 'Cube volume'],
  o: ['Build cuboids from unit cubes', 'Discover V = l × w × h'], pre: ['g3-area-intro', 'g4-comm-assoc-mul'], rel: ['g5-surface-area', 'g6-cylinder-volume'],
  e: 'solid', c: {mode: 'unit-cubes', l: 4, w: 3, h: 2}, m: ['Counting only visible cubes', 'cm³ and cm² are the same'],
  q: [N('A 4 × 3 × 2 cuboid of 1 cm cubes. Volume (cm³)?', 24, '4 × 3 × 2.'), N('1 dm³ = ? cm³', 1000, '10 × 10 × 10.')],
  x: ['Double one edge of a cuboid. What happens to the volume? Double all three?'], f: 'V = l\\times w\\times h,\\quad V_{\\text{cube}}=a^3',
});
g.k('g5-faces-edges', 'Faces, edges and vertices', '长方体的面、棱、顶点', {
  d: 'A cuboid has 6 faces, 12 edges and 8 vertices; opposite faces match.', t: ['Cuboids', 'Cubes', 'Faces', 'Edges', 'Vertices'],
  o: ['Count faces, edges and vertices', 'Find total edge length'], pre: ['g1-solids'],
  e: 'solid', c: {mode: 'fev', shape: 'cuboid'}, m: ['Counting hidden edges twice or not at all', 'A cube has 6 edges'],
  q: [N('How many edges does a cube have?', 12, '4 top, 4 bottom, 4 vertical.'), N('Total edge length of a 5 × 4 × 3 cuboid?', 48, '(5 + 4 + 3) × 4.')],
  x: ['Make a cuboid frame from straws. How much straw?'],
});
g.k('g5-nets', 'Nets of cubes and cuboids', '长方体和正方体的展开图', {
  d: 'A net is a flat pattern that folds into a solid; not every arrangement of six squares works.', t: ['Nets of cuboids', 'Nets of cubes'],
  o: ['Fold and unfold nets', 'Predict which nets make a cube'], pre: ['g5-faces-edges'], rel: ['g6-cylinder-net'],
  e: 'solid', c: {mode: 'net', shape: 'cube'}, m: ['Any six squares fold into a cube', 'Opposite faces are adjacent in the net'],
  q: [N('How many different cube nets are there?', 11, 'There are exactly 11.')],
  x: ['Draw all 11 cube nets.'],
});
g.k('g5-surface-area', 'Surface area versus volume', '表面积与体积', {
  d: 'Surface area wraps the outside in squares; volume fills the inside with cubes.', t: ['Cuboid surface area', 'Cube surface area'],
  o: ['Calculate surface area from a net', 'Explain why surface area and volume differ'], pre: ['g5-nets', 'g5-volume-meaning'], rel: ['g6-cylinder-net'],
  e: 'solid', c: {mode: 'surface', l: 4, w: 3, h: 2}, m: ['Surface area = volume', 'Counting only three faces'],
  q: [N('Surface area of a 4 × 3 × 2 cuboid?', 52, '2 × (12 + 8 + 6).'), N('Surface area of a cube with edge 3?', 54, '6 × 9.')],
  x: ['Arrange 12 cubes into cuboids. Which has the smallest surface area?'], f: 'S = 2(lw+lh+wh)',
});
g.k('g5-capacity', 'Capacity: litres and millilitres', '容积和容积单位', {
  d: 'Capacity is the volume a container holds inside: 1 L = 1 dm³ and 1 mL = 1 cm³.', t: ['Capacity', 'Liters', 'Milliliters', 'Volume and capacity conversions'],
  o: ['Relate litres and millilitres to cubic units', 'Convert between capacity units'], pre: ['g5-volume-meaning'], rel: ['g6-cone-pour'],
  e: 'solid', c: {mode: 'capacity', l: 10, w: 10, h: 10}, m: ['1 L = 100 mL', 'Capacity uses outside measurements'],
  q: [N('1 L = ? mL', 1000, '1 dm³ = 1000 cm³.'), N('A tank inside measures 20 × 10 × 10 cm. Capacity (L)?', 2, '2000 cm³ = 2 L.')],
  x: ['Measure your water bottle’s capacity with a measuring jug.'], f: '1\\,\\text{L}=1\\,\\text{dm}^3=1000\\,\\text{mL}',
});

g.chapter('g5-position-stats', 'Position and Statistics', '位置与折线统计图', 'geometry', 'Locate points with ordered pairs and read trends in line charts.');
g.k('g5-coordinates', 'Positions as ordered pairs', '用数对确定位置', {
  d: 'An ordered pair (column, row) pins a point on a grid; order matters.', t: ['Coordinates using ordered pairs', 'Rows and columns', 'Coordinate grids', 'Position on graph paper'],
  o: ['Locate and plot points with ordered pairs', 'Explain why (2, 5) ≠ (5, 2)'], pre: ['g2-directions'], rel: ['g6-direct', 'g6-routes'],
  e: 'coordinate', c: {mode: 'pairs', x: 3, y: 5}, m: ['Writing (row, column)', '(2, 5) and (5, 2) are the same place'],
  q: [M('(3, 5) means…', ['Column 3, row 5', 'Row 3, column 5'], 'Column 3, row 5', 'Chinese textbooks use (column, row).')],
  x: ['Draw a picture by connecting ordered pairs and send it to a friend.'],
});
g.k('g5-line-charts', 'Line charts and trends', '折线统计图', {
  d: 'Points joined in time order show rising and falling trends.', t: ['Data collection', 'Tables', 'Line charts', 'Reading trends'],
  o: ['Draw line charts from tables', 'Describe trends'], pre: ['g3-bar-chart', 'g5-coordinates'], rel: ['g6-compare-datasets'],
  e: 'data', c: {mode: 'line', values: [12, 15, 19, 24, 22, 27], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}, m: ['Using line charts for unordered categories', 'Steeper means larger value'],
  q: [M('Between Thu (24) and Fri (22) the line…', ['Falls', 'Rises', 'Stays flat'], 'Falls', '22 < 24.')],
  x: ['Record a plant’s height daily for two weeks.'],
});
g.k('g5-mean-interpret', 'Comparing data with the mean', '平均数与统计分析', {
  d: 'Means summarise groups so we can compare them fairly, even with different sizes.', t: ['Bar charts', 'Comparing data', 'Arithmetic mean', 'Statistical interpretation'],
  o: ['Compare two groups using means', 'Recognise when a mean can mislead'], pre: ['g4-mean'], rel: ['g6-compare-datasets'],
  e: 'data', c: {mode: 'compare', values: [8, 9, 7, 8], values2: [12, 4, 6, 10, 8]}, m: ['Comparing totals of different-sized groups', 'Means show the spread'],
  q: [N('Group A: 8, 9, 7, 8. Mean?', 8, '32 ÷ 4.')],
  x: ['Compare two classes’ reading with means. Is it fair?'],
});

g.chapter('g5-reasoning', 'Mathematical Reasoning', '数学广角', 'relationships', 'Test assumptions, list systematically and spot patterns.');
g.k('g5-growing-patterns', 'Numerical and geometric patterns', '图形与数的规律', {
  d: 'Growing patterns add a fixed amount each step; a rule predicts the 100th term.', t: ['Numerical patterns', 'Geometric patterns', 'Transformation', 'Equivalent relationships'],
  o: ['Find the rule for a growing pattern', 'Predict far terms'], pre: ['g1-patterns', 'g5-letters'],
  e: 'sorting', c: {mode: 'growing', first: 4, step: 3}, m: ['Counting the 100th term step by step', 'Assuming the pattern doubles'],
  q: [N('Squares made of matchsticks in a row: 1 square uses 4, each new square adds 3. How many for 10 squares?', 31, '4 + 3 × 9.')],
  x: ['Find a formula for n squares.'], f: 'a_n = 4 + 3(n-1) = 3n+1',
});
g.k('g5-planting', 'Planting trees: listing and diagrams', '植树问题', {
  d: 'Draw it! Trees on a 20 m road every 5 m: 4 gaps but 5 trees if both ends are planted.', t: ['Listing strategies', 'Diagram-based reasoning', 'Classification'],
  o: ['Relate gaps and trees in three cases', 'Use diagrams to avoid off-by-one errors'], pre: ['g2-share'], rel: ['g6-optimize'],
  e: 'reasoning', c: {mode: 'planting', length: 20, gap: 5, ends: 'both'}, m: ['Trees = length ÷ gap always', 'Ignoring whether ends are planted'],
  q: [N('A 30 m path has trees every 5 m at both ends. How many trees?', 7, '6 gaps, 7 trees.'), N('Same path, a circular track of 30 m, trees every 5 m. How many?', 6, 'On a loop, trees = gaps.')],
  x: ['How many fence posts for a square garden of side 12 m, posts every 3 m?'],
});
g.k('g5-logic', 'Logical reasoning with assumptions', '逻辑推理与假设', {
  d: 'Use clues to eliminate possibilities in a grid until only one arrangement fits.', t: ['Assumptions', 'Logical reasoning'],
  o: ['Use elimination grids', 'Test an assumption and follow its consequences'], pre: ['g1-multi-sort'], rel: ['g6-pigeonhole'],
  e: 'reasoning', c: {mode: 'logic'}, m: ['Guessing instead of eliminating', 'Using a clue only once'],
  q: [M('A, B, C own a cat, dog and fish. A has no fur pet. B is not the dog owner. Who owns the dog?', ['A', 'B', 'C'], 'C', 'A has the fish; B not dog → C.')],
  x: ['Write your own three-clue logic puzzle.'],
});

export const grade5 = g.done();
