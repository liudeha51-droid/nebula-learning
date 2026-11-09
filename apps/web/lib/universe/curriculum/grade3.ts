import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(3);

g.chapter('g3-numbers', 'Numbers and Place Value', '大数与数位', 'number', 'Zoom across place values and see a digit’s value depend on its position.');
g.k('g3-place-value', 'The same digit, different values', '数位与数值', {
  d: 'A digit’s value depends on its place: the 3 in 3,000 is a thousand times the 3 in 3.', t: ['Numbers up to 10,000', 'Larger whole numbers', 'Place-value structure', 'Number composition', 'Reading and writing numbers'],
  o: ['State the value of a digit in any place', 'Write numbers in expanded form'], pre: ['g2-thousands'], rel: ['g4-place-shift'],
  e: 'place-value', c: {mode: 'digit', digit: 3, places: 5}, m: ['A digit always means the same amount', 'Confusing digit and value'],
  q: [N('What is the value of 7 in 47,215?', 7000, '7 is in the thousands place.'), M('Which number has 5 in the hundreds place?', ['5,321', '3,512', '1,235'], '3,512', 'Hundreds is the third place from the right.')],
  x: ['Make the number 30,303. What is each 3 worth?'],
});
g.k('g3-compare-estimate', 'Comparing, estimating and approximating', '大数的比较与估计', {
  d: 'Locate numbers between landmarks on a number line to compare and estimate.', t: ['Comparing numbers', 'Number estimation', 'Approximate values'],
  o: ['Place numbers on a number line between thousands', 'Round to the nearest thousand'], pre: ['g2-estimate', 'g3-place-value'], rel: ['g4-rounding'],
  e: 'number-line', c: {mode: 'round', value: 3478, to: 1000}, m: ['Rounding 3,478 to 4,000 because 4 > 3', 'Thinking estimates must be exact'],
  q: [N('Round 6,512 to the nearest thousand.', 7000, '6,512 is past the halfway point 6,500.')],
  x: ['Estimate how many seats are in a stadium from a photo.'],
});
g.k('g3-codes', 'Number patterns and codes', '数字编码与规律', {
  d: 'Codes give each digit a job, like a seat number that tells row and seat.', t: ['Number patterns', 'Mathematical codes'],
  o: ['Decode a simple number code', 'Design a code with clear rules'], pre: ['g3-place-value'], rel: ['g4-encoding', 'g6-coding'],
  e: 'reasoning', c: {mode: 'code', kind: 'seat'}, m: ['Treating code digits as amounts', 'Making codes that two things could share'],
  q: [M('In a cinema, code 0512 means row 05, seat 12. What does 1103 mean?', ['Row 11, seat 3', 'Row 1, seat 103', 'Row 3, seat 11'], 'Row 11, seat 3', 'First two digits row, last two seat.')],
  x: ['Invent a locker code for your class.'],
});

g.chapter('g3-multiplication', 'Multiplication', '多位数乘一位数', 'operations', 'Use arrays and area models to explain multi-digit multiplication.');
g.k('g3-area-model', 'Multiplying by one digit with an area model', '两位数乘一位数', {
  d: 'Split a number into tens and ones; multiply each part and add the partial products.', t: ['Multi-digit multiplication by one digit', 'Two-digit multiplication by one digit', 'Carrying in multiplication'],
  o: ['Use an area model for 2-digit × 1-digit', 'Connect partial products to the written algorithm'], pre: ['g2-times-tables', 'g2-hundreds'], rel: ['g4-two-digit-mult', 'g4-distributive'],
  e: 'array', c: {mode: 'area', a: 23, b: 4}, m: ['Multiplying only the ones', 'Forgetting to add the carried tens'],
  q: [N('23 × 4 = ?', 92, '20 × 4 = 80, 3 × 4 = 12, 80 + 12 = 92.'), N('46 × 3 = ?', 138, '120 + 18 = 138.')],
  x: ['Draw an area model for 37 × 5.'], f: '23 \\times 4 = 20 \\times 4 + 3 \\times 4 = 92',
});
g.k('g3-three-by-one', 'Three-digit by one-digit, including zeros', '三位数乘一位数', {
  d: 'A zero digit gives a zero partial product but still holds its place.', t: ['Three-digit multiplication by one digit', 'Multiplication involving zero'],
  o: ['Multiply 3-digit by 1-digit numbers', 'Handle zeros correctly'], pre: ['g3-area-model'],
  e: 'array', c: {mode: 'area', a: 305, b: 3}, m: ['Dropping the zero: 305 × 3 = 95', 'Thinking 0 × 3 = 3'],
  q: [N('305 × 3 = ?', 915, '900 + 0 + 15.'), N('0 × 9 = ?', 0, 'Zero groups of 9 is 0.')],
  x: ['Compare 105 × 3, 150 × 3 and 510 × 3. What job does each zero do?'],
});
g.k('g3-mult-estimate', 'Estimating and checking products', '乘法估算与验算', {
  d: 'Round the multi-digit factor to estimate; the exact answer should be close.', t: ['Multiplication estimation', 'Verification', 'Word problems'],
  o: ['Estimate a product by rounding', 'Judge whether an answer is reasonable'], pre: ['g3-area-model'],
  e: 'array', c: {mode: 'area', a: 48, b: 6, estimate: true}, m: ['Rounding both numbers so far the estimate is useless', 'Ignoring estimates once you have an answer'],
  q: [N('Estimate 48 × 6 by rounding 48 to the nearest ten.', 300, '50 × 6 = 300.')],
  x: ['Estimate the cost of 7 books at 39 yuan each.'],
});

g.chapter('g3-division', 'Division', '除数是一位数的除法', 'operations', 'Divide place by place, exchanging leftovers into smaller units.');
g.k('g3-div-two-digit', 'Dividing two-digit numbers', '两位数除以一位数', {
  d: 'Share the tens first, exchange leftover tens for ones, then share the ones.', t: ['Two-digit division by one digit', 'Quotient positions'],
  o: ['Divide tens then ones', 'Explain where the first quotient digit goes'], pre: ['g2-mult-div', 'g2-hundreds'], rel: ['g3-long-division'],
  e: 'division', c: {mode: 'long', total: 72, divisor: 3}, m: ['Writing the first quotient digit in the wrong place', 'Forgetting to exchange the leftover ten'],
  q: [N('72 ÷ 3 = ?', 24, '6 tens ÷ 3 = 2 tens; 12 ones ÷ 3 = 4.')],
  x: ['Why is 72 ÷ 3 easier to share as 60 + 12?'],
});
g.k('g3-long-division', 'Long division of three-digit numbers', '三位数除以一位数', {
  d: 'Each step divides, multiplies, subtracts and brings down the next digit.', t: ['Three-digit division by one digit', 'Long division', 'Remainders'],
  o: ['Carry out long division with remainders', 'Link each step to multiplication'], pre: ['g3-div-two-digit', 'g2-remainder'], rel: ['g4-div-two-digit'],
  e: 'division', c: {mode: 'long', total: 658, divisor: 4}, m: ['Not bringing down the next digit', 'Remainder bigger than divisor'],
  q: [M('658 ÷ 4 = 164 R?', ['2', '4', '6'], '2', '164 × 4 = 656; 658 − 656 = 2.')],
  x: ['Check 658 ÷ 4 by computing 164 × 4 + 2.'],
});
g.k('g3-quotient-zero', 'Quotients containing zero', '商中间有0的除法', {
  d: 'When a place cannot be shared, write 0 in the quotient to hold the place.', t: ['Quotient containing zero', 'Estimation', 'Verification', 'Practical division problems'],
  o: ['Place zeros correctly in quotients', 'Verify with multiplication'], pre: ['g3-long-division'],
  e: 'division', c: {mode: 'long', total: 612, divisor: 3}, m: ['Writing 612 ÷ 3 = 24', 'Skipping a place that cannot be shared'],
  q: [N('612 ÷ 3 = ?', 204, '6 ÷ 3 = 2, 1 ÷ 3 = 0 r1, 12 ÷ 3 = 4.')],
  x: ['Find three dividends whose quotient by 4 has a zero in the middle.'],
});

g.chapter('g3-mixed', 'Mixed Operations', '混合运算', 'operations', 'Understand why the order of operations matters.');
g.k('g3-order-ops', 'Order of operations and parentheses', '运算顺序与括号', {
  d: 'Multiplication and division happen before addition and subtraction; parentheses go first.', t: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Order of operations', 'Parentheses'],
  o: ['Evaluate expressions in the correct order', 'Use parentheses to change the order'], pre: ['g2-mult-div', 'g1-word-problems'], rel: ['g4-letters'],
  e: 'laws', c: {mode: 'order', expr: '24-6*3', alt: '(24-6)*3'}, m: ['Always working left to right', 'Ignoring parentheses'],
  q: [N('24 − 6 × 3 = ?', 6, '6 × 3 = 18 first, then 24 − 18.'), N('(24 − 6) × 3 = ?', 54, 'Parentheses first: 18 × 3.')],
  x: ['Use four 4s and any operations to make 1, 2 and 3.'], f: '24 - 6\\times 3 = 6 \\quad (24-6)\\times 3 = 54',
});
g.k('g3-two-step', 'Two-step problems and inverse operations', '两步计算解决问题', {
  d: 'Break a problem into steps; inverse operations check each step.', t: ['Relationships between operations', 'Two-step calculations', 'Estimation', 'Checking results'],
  o: ['Write a single expression for a two-step problem', 'Check with inverse operations'], pre: ['g3-order-ops'],
  e: 'laws', c: {mode: 'order', expr: '48/(2+6)', alt: '48/2+6'}, m: ['Writing steps without parentheses', 'Checking by redoing the same steps'],
  q: [N('48 ÷ (2 + 6) = ?', 6, '2 + 6 = 8, 48 ÷ 8 = 6.')],
  x: ['Write a two-step story for 5 × 6 − 8.'],
});

g.chapter('g3-fractions', 'Fractions', '分数的初步认识', 'number', 'Divide wholes into equal parts and name the parts.');
g.k('g3-equal-parts', 'Equal parts and unit fractions', '几分之一', {
  d: 'A fraction names equal parts of one whole; 1/4 is one of four equal parts.', t: ['Equal division', 'Meaning of fractions', 'Numerator', 'Denominator', 'Fraction units', 'Unit fractions'],
  o: ['Recognise equal and unequal parts', 'Name unit fractions'], pre: ['g2-share'], rel: ['g3-several-parts', 'g5-equivalent'],
  e: 'fraction', c: {mode: 'parts', n: 1, d: 4}, m: ['Any four pieces are quarters', 'A bigger denominator means a bigger piece'],
  q: [M('A pizza is cut into 4 unequal pieces. Is each piece 1/4?', ['Yes', 'No'], 'No', 'Fractions need equal parts.'), M('Which is bigger?', ['1/3', '1/5'], '1/3', 'Fewer equal parts means bigger parts.')],
  x: ['Fold a paper strip into halves, quarters and eighths.'], f: '\\tfrac{1}{4}',
});
g.k('g3-several-parts', 'Fractions with several parts', '几分之几', {
  d: '3/8 means three of eight equal parts: the denominator names the part, the numerator counts them.', t: ['Fractions with multiple parts'],
  o: ['Read and shade fractions like 3/8', 'Relate a fraction to its unit fraction'], pre: ['g3-equal-parts'],
  e: 'fraction', c: {mode: 'parts', n: 3, d: 8}, m: ['Reading 3/8 as “3 and 8”', 'Shading 3 parts out of 5 for 3/5 without equal parts'],
  q: [N('How many 1/8 pieces make 3/8?', 3, '3/8 = 3 × 1/8.'), N('A bar has 6 equal parts; 5 are coloured. The coloured fraction is 5/?', 6, 'Six equal parts.')],
  x: ['What fraction of a week is the weekend?'],
});
g.k('g3-compare-fractions', 'Comparing simple fractions', '比较分数大小', {
  d: 'With the same denominator compare numerators; with the same numerator, smaller parts lose.', t: ['Comparing simple fractions', 'Fractions with the same denominator'],
  o: ['Compare fractions with the same denominator', 'Compare unit fractions'], pre: ['g3-several-parts'], rel: ['g4-fraction-units'],
  e: 'fraction', c: {mode: 'compare', a: [3, 8], b: [5, 8]}, m: ['1/8 > 1/4 because 8 > 4', 'Comparing fractions of different-sized wholes'],
  q: [M('Which is greater?', ['3/8', '5/8'], '5/8', 'Same-size parts: 5 > 3.'), M('Which is greater?', ['1/6', '1/4'], '1/4', 'Quarters are bigger than sixths.')],
  x: ['Would you rather have 1/3 of a small cake or 1/4 of a huge cake?'],
});
g.k('g3-add-same', 'Adding and subtracting same-denominator fractions', '同分母分数加减', {
  d: 'Same-sized parts can be counted: 2 sevenths + 3 sevenths = 5 sevenths.', t: ['Simple fraction addition and subtraction'],
  o: ['Add and subtract fractions with equal denominators', 'Explain why the denominator stays the same'], pre: ['g3-several-parts'], rel: ['g5-add-unlike'],
  e: 'fraction', c: {mode: 'add-same', a: [2, 7], b: [3, 7]}, m: ['Adding denominators: 2/7 + 3/7 = 5/14', 'Thinking 1 − 3/7 needs a calculator'],
  q: [N('2/7 + 3/7 = ?/7', 5, '2 + 3 sevenths.'), N('1 − 3/8 = ?/8', 5, '8/8 − 3/8 = 5/8.')],
  x: ['Draw why 2/7 + 3/7 cannot be 5/14.'], f: '\\tfrac{2}{7}+\\tfrac{3}{7}=\\tfrac{5}{7}',
});

g.chapter('g3-decimals', 'Introductory Decimals', '小数的初步认识', 'number', 'Divide one whole into tenths and hundredths and connect to money and measures.');
g.k('g3-tenths', 'One whole into tenths', '一位小数', {
  d: 'Divide one whole into ten equal parts: each part is 0.1, one tenth.', t: ['Meaning of decimals', 'Decimal points', 'Integer and decimal parts', 'Tenths', 'Reading and writing decimals'],
  o: ['Represent tenths as decimals', 'Read the integer and decimal parts'], pre: ['g3-equal-parts'], rel: ['g4-decimal-places'],
  e: 'decimal', c: {mode: 'subdivide', places: 1, value: 0.7}, m: ['Thinking 0.7 is less than 0.07 because it has fewer digits', 'Reading 0.7 as “zero point seven ones”'],
  q: [N('7 tenths written as a decimal is?', 0.7, '7/10 = 0.7.'), N('1.4 has how many tenths in total?', 14, '1 whole = 10 tenths, plus 4.')],
  x: ['Measure your pencil in cm with one decimal place.'], f: '\\tfrac{7}{10} = 0.7',
});
g.k('g3-hundredths-intro', 'Hundredths through money', '小数与人民币', {
  d: '1 yuan = 100 fen, so 3.45 yuan = 3 yuan 4 jiao 5 fen.', t: ['Hundredths as an introductory concept', 'Money and measurement applications'],
  o: ['Read prices with two decimal places', 'Convert yuan-jiao-fen to decimal yuan'], pre: ['g3-tenths', 'g1-yuan'],
  e: 'decimal', c: {mode: 'money', value: 3.45}, m: ['Reading 3.45 yuan as 3 yuan 45 jiao', 'Writing 3 yuan 5 fen as 3.5'],
  q: [M('3 yuan 5 fen written in yuan is…', ['3.5', '3.05', '3.50'], '3.05', '5 fen is 0.05 yuan.')],
  x: ['Find three price tags and say each in yuan, jiao and fen.'],
});
g.k('g3-decimal-addsub', 'Comparing, adding and subtracting simple decimals', '简单的小数加减', {
  d: 'Line up the decimal points so tenths add to tenths.', t: ['Comparing simple decimals', 'Decimal addition', 'Decimal subtraction'],
  o: ['Add and subtract one-place decimals', 'Compare decimals by place'], pre: ['g3-tenths', 'g2-add-carry'], rel: ['g4-decimal-addsub'],
  e: 'column', c: {op: 'add', a: 2.6, b: 1.8, places: 1}, m: ['Lining up the last digits instead of the points', 'Writing 0.6 + 0.8 = 0.14'],
  q: [N('2.6 + 1.8 = ?', 4.4, '6 + 8 tenths = 14 tenths = 1.4.'), N('5.3 − 2.7 = ?', 2.6, 'Exchange 1 for 10 tenths.')],
  x: ['Add the prices 3.6 yuan and 4.8 yuan in your head.'],
});

g.chapter('g3-geometry', 'Geometry and Measurement', '线、角、周长与面积', 'geometry', 'Explore lines and angles, perimeter and the beginnings of area.');
g.k('g3-lines', 'Points, segments, rays and lines', '线段、射线和直线', {
  d: 'A segment has two endpoints, a ray has one, and a line extends forever both ways.', t: ['Points and lines', 'Line segments', 'Rays and straight lines'],
  o: ['Distinguish segments, rays and lines', 'Count segments between points'], rel: ['g3-angles', 'g4-lines-distance'],
  e: 'angle', c: {mode: 'lines'}, m: ['A longer drawing of a line is a longer line', 'Rays can be measured'],
  q: [M('Which has exactly one endpoint?', ['Segment', 'Ray', 'Line'], 'Ray', 'A ray starts at a point and goes on forever.'), N('How many segments join 4 points on a line?', 6, '3 + 2 + 1 = 6.')],
  x: ['Find rays and segments in a torch beam and a pencil.'],
});
g.k('g3-angles', 'Right, acute, obtuse, straight and full angles', '角的分类', {
  d: 'An angle measures turning between two rays; arm length does not matter.', t: ['Angles', 'Right angles', 'Acute angles', 'Obtuse angles', 'Straight angles', 'Full angles'],
  o: ['Classify angles by size', 'Explain that longer arms do not make a bigger angle'], pre: ['g3-lines'], rel: ['g3-protractor', 'g4-angle-measure'],
  e: 'angle', c: {mode: 'angle', deg: 60}, m: ['Longer arms mean a bigger angle', 'A straight angle is not an angle'],
  q: [M('An angle of 120° is…', ['Acute', 'Right', 'Obtuse'], 'Obtuse', 'Between 90° and 180°.'), N('How many right angles make a full turn?', 4, '4 × 90° = 360°.')],
  x: ['Find a right angle, an acute angle and an obtuse angle in the classroom.'], f: '\\text{right}=90^\\circ,\\ \\text{straight}=180^\\circ,\\ \\text{full}=360^\\circ',
});
g.k('g3-protractor', 'Measuring angles with a protractor', '用量角器量角', {
  d: 'Put the centre on the vertex, one arm on 0°, and read the scale that starts at 0.', t: ['Measuring angles', 'Using a protractor'],
  o: ['Measure angles to the nearest degree', 'Choose the correct scale'], pre: ['g3-angles'],
  e: 'angle', c: {mode: 'protractor', deg: 50}, m: ['Reading the wrong scale (130° instead of 50°)', 'Misplacing the centre'],
  q: [M('An acute angle reads 50° on one scale and 130° on the other. Its size is…', ['50°', '130°'], '50°', 'Acute angles are less than 90°.')],
  x: ['Estimate, then measure, the angle of an open door.'],
});
g.k('g3-polygons', 'Triangles and quadrilaterals', '三角形与四边形', {
  d: 'Polygons are named by their sides; rectangles and squares are special quadrilaterals.', t: ['Triangles', 'Quadrilaterals', 'Rectangles and squares'],
  o: ['Identify properties of rectangles and squares', 'Classify quadrilaterals'], pre: ['g1-plane-shapes', 'g3-angles'], rel: ['g4-quadrilaterals'],
  e: 'angle', c: {mode: 'quadrilateral', family: false}, m: ['A square is not a rectangle', 'All four-sided shapes have right angles'],
  q: [M('Is every square a rectangle?', ['Yes', 'No'], 'Yes', 'A square has four right angles, so it is a special rectangle.')],
  x: ['Sort shapes on a Venn diagram: “four right angles” and “four equal sides”.'],
});
g.k('g3-perimeter', 'Perimeter of rectangles and squares', '周长', {
  d: 'Perimeter is the length of the boundary: walk around and add the sides.', t: ['Perimeter', 'Rectangle perimeter', 'Square perimeter'],
  o: ['Calculate perimeters of rectangles and squares', 'Explain the formula from walking the boundary'], pre: ['g3-polygons', 'g1-ruler'], rel: ['g4-perim-vs-area', 'g6-circumference'],
  e: 'area', c: {mode: 'perimeter', l: 6, w: 4}, m: ['Adding only two sides', 'Confusing perimeter with area'],
  q: [N('Perimeter of a 6 cm × 4 cm rectangle (cm)?', 20, '(6 + 4) × 2 = 20.'), N('A square has perimeter 36 m. Side length (m)?', 9, '36 ÷ 4 = 9.')],
  x: ['Measure the perimeter of your desk with string.'], f: 'C_{\\text{rect}} = (l+w)\\times 2,\\quad C_{\\text{square}} = 4a',
});
g.k('g3-area-intro', 'Area with unit squares', '面积的认识', {
  d: 'Area counts how many unit squares cover a surface; a rectangle is rows × columns of squares.', t: ['Introduction to area', 'Square units', 'Rectangle area', 'Square area'],
  o: ['Measure area by counting unit squares', 'Discover area = length × width'], pre: ['g2-mult-meaning', 'g3-perimeter'], rel: ['g4-area-units', 'g5-parallelogram'],
  e: 'area', c: {mode: 'grid', l: 5, w: 3}, m: ['Counting edges instead of squares', 'Using cm instead of cm²'],
  q: [N('Area of a 5 cm × 3 cm rectangle (cm²)?', 15, '5 × 3 = 15 squares.'), N('Area of a square with side 7 m (m²)?', 49, '7 × 7 = 49.')],
  x: ['Cover a book with sticky notes. How many does it take?'], f: 'S = l \\times w',
});
g.k('g3-rearrange', 'Same area, different shape', '图形的拼组与等积变形', {
  d: 'Cutting and rearranging a shape changes how it looks but keeps its area.', t: ['Shape composition and decomposition'],
  o: ['Show equal areas by rearranging', 'Find areas of L-shapes by splitting'], pre: ['g3-area-intro'], rel: ['g5-parallelogram', 'g5-composite'],
  e: 'area', c: {mode: 'composite', shape: 'L'}, m: ['A taller shape always has more area', 'Rearranging changes area'],
  q: [N('An L-shape is a 4 × 2 rectangle joined to a 2 × 3 rectangle. Area (squares)?', 14, '8 + 6 = 14.')],
  x: ['Cut a rectangle into two pieces that make a different shape.'],
});

g.chapter('g3-units', 'Units and Time', '质量、时间与单位换算', 'relationships', 'Measure mass, read calendars and use 24-hour time.');
g.k('g3-mass', 'Grams, kilograms and tons', '克、千克和吨', {
  d: 'Mass units scale by 1,000: 1 kg = 1,000 g and 1 t = 1,000 kg.', t: ['Grams', 'Kilograms', 'Tons', 'Mass conversions'],
  o: ['Choose suitable mass units', 'Convert between g, kg and t'], pre: ['g2-length-units'], rel: ['g3-length-km'],
  e: 'measure', c: {mode: 'mass'}, m: ['Bigger objects always weigh more', '1 kg = 100 g'],
  q: [N('How many grams in 3 kg?', 3000, '3 × 1,000.'), N('A truck carries 4,000 kg. How many tons?', 4, '4,000 ÷ 1,000.')],
  x: ['Find something that weighs about 1 kg at home.'], f: '1\\,\\text{t}=1000\\,\\text{kg},\\;1\\,\\text{kg}=1000\\,\\text{g}',
});
g.k('g3-length-km', 'Length at every scale', '长度单位换算', {
  d: 'Zooming from millimetres to kilometres shows when each unit is useful.', t: ['Millimeters, centimeters, decimeters and meters', 'Kilometers'],
  o: ['Convert across all length units', 'Pick sensible units for real distances'], pre: ['g2-length-units'],
  e: 'measure', c: {mode: 'units', focus: 'km'}, m: ['Using km for a pencil', 'Moving the decimal the wrong way'],
  q: [N('3 km 200 m = ? m', 3200, '3,000 + 200.')],
  x: ['How far is school from home in metres? In kilometres?'],
});
g.k('g3-calendar', 'Years, months, days and leap years', '年、月、日', {
  d: 'A common year has 365 days; a leap year has 366 with 29 days in February.', t: ['Year, month and day', 'Leap years', 'Common years', 'Date calculations'],
  o: ['Identify leap years', 'Calculate days between dates'], pre: ['g2-calendar'], rel: ['g5-divisibility'],
  e: 'clock', c: {mode: 'calendar', year: 2028, month: 2}, m: ['Every 4th year is always a leap year (century rule)', 'February always has 28 days'],
  q: [M('Is 2028 a leap year?', ['Yes', 'No'], 'Yes', '2028 is divisible by 4 and not a century year.'), N('How many days in a leap year?', 366, '365 + 1.')],
  x: ['Was 1900 a leap year? Find out why not.'],
});
g.k('g3-24h', '12-hour and 24-hour time; intervals', '24时计时法', {
  d: 'The 24-hour clock continues past 12: 3 p.m. is 15:00.', t: ['12-hour and 24-hour clocks', 'Time intervals'],
  o: ['Convert between 12-hour and 24-hour time', 'Calculate intervals across noon'], pre: ['g2-elapsed'],
  e: 'clock', c: {mode: '24h', h: 15, m: 30}, m: ['15:00 is 5 p.m.', 'Adding 12 to morning times'],
  q: [N('Write 7:20 p.m. in 24-hour time: ?:20', 19, '7 + 12 = 19.'), N('A train leaves 09:45 and arrives 13:15. How many minutes?', 210, '3 h 30 min = 210 min.')],
  x: ['Rewrite a TV schedule in 24-hour time.'],
});

g.chapter('g3-stats', 'Statistics', '复式统计表与条形图', 'statistics', 'Turn collected data into bar charts and draw conclusions.');
g.k('g3-bar-chart', 'From data to bar charts', '条形统计图', {
  d: 'Each bar’s length represents a count on a scale; change the data and the bar changes.', t: ['Data collection', 'Data organization', 'Tables', 'Bar charts', 'Reading charts', 'Comparing quantities'],
  o: ['Draw and read bar charts with a scale', 'Compare categories using bars'], pre: ['g2-tables'], rel: ['g4-bar-read', 'g5-line-charts'],
  e: 'data', c: {mode: 'bar', values: [12, 18, 6, 10], labels: ['Walk', 'Bus', 'Bike', 'Car'], scale: 2}, m: ['Reading bar height without the scale', 'Unequal scale steps'],
  q: [N('A bar reaches halfway between 10 and 14. What does it show?', 12, 'Halfway between 10 and 14 is 12.')],
  x: ['Survey how classmates travel to school and draw the chart.'],
});
g.k('g3-investigation', 'A statistical investigation', '统计调查', {
  d: 'Ask a question, collect data, organise it and draw a conclusion supported by the data.', t: ['Drawing conclusions', 'Mathematical investigations'],
  o: ['Plan a simple investigation', 'State a conclusion based on data'], pre: ['g3-bar-chart'], rel: ['g6-compare-datasets'],
  e: 'data', c: {mode: 'collect', topic: 'transport'}, m: ['Conclusions that the data do not support', 'Too little data to decide'],
  q: [M('Which question can a class survey answer?', ['What is the favourite sport in our class?', 'What will the weather be next year?'], 'What is the favourite sport in our class?', 'We can collect that data ourselves.')],
  x: ['Run a week-long weather observation and chart it.'],
});

export const grade3 = g.done();
