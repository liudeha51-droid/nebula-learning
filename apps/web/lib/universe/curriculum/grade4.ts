import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(4);

g.chapter('g4-large', 'Large Numbers', '大数的认识', 'number', 'Read and reason about numbers into the hundreds of millions.');
g.k('g4-large-numbers', 'Numbers in the hundreds of millions', '亿以内及亿以上的数', {
  d: 'Chinese place-value groups every four digits: 个级, 万级, 亿级.', t: ['Numbers up to hundreds of millions', 'Numbers beyond 100 million', 'Place-value tables', 'Ones, thousands and millions groups', 'Reading and writing large numbers', 'Comparing large numbers', 'Number composition'],
  o: ['Read and write numbers using the 万/亿 grouping', 'Compare large numbers by digit count and places'], pre: ['g3-place-value'], rel: ['g4-place-shift', 'g4-rounding'],
  e: 'place-value', c: {mode: 'large', value: 305060000}, m: ['Losing zeros when reading', 'Comparing by the first digit regardless of length'],
  q: [M('How is 305,060,000 read in Chinese grouping?', ['3亿506万', '30亿5060万', '3050万6000'], '3亿506万', '3 | 0506 | 0000.'), M('Which is greater?', ['98,000,000', '100,000,000'], '100,000,000', 'More digits means a greater whole number.')],
  x: ['Find the population of China and read it in 亿 and 万.'],
});
g.k('g4-place-shift', 'A digit’s journey across place values', '十进制计数法', {
  d: 'Moving a digit one place left multiplies its value by 10.', t: ['Decimal number system', 'Place-value tables'],
  o: ['Explain that each place is ten times the one to its right', 'Relate digit movement to ×10 and ÷10'], pre: ['g4-large-numbers'], rel: ['g5-point-shift'],
  e: 'place-value', c: {mode: 'shift', digit: 4}, m: ['Thinking ×10 “adds a zero” in every case', 'Each place is double the last'],
  q: [N('How many times larger is the 6 in 600 than in 60?', 10, 'One place left = ×10.')],
  x: ['How many ten-thousands are in one hundred million?'],
});
g.k('g4-rounding', 'Rounding large numbers', '近似数与改写', {
  d: 'Round to a chosen place using the next digit; rewrite with 万 or 亿.', t: ['Rounding', 'Approximation'],
  o: ['Round to the nearest 万 or 亿', 'Rewrite exact numbers with units'], pre: ['g4-large-numbers', 'g3-compare-estimate'], rel: ['g5-dec-estimate'],
  e: 'number-line', c: {mode: 'round', value: 3456789, to: 10000}, m: ['Looking at the wrong digit to decide', 'Confusing rewriting (exact) with rounding'],
  q: [N('Round 3,456,789 to the nearest ten thousand.', 3460000, 'The thousands digit 6 ≥ 5, so round up.')],
  x: ['Round the distance from Earth to the Moon (384,400 km) to the nearest 万.'],
});
g.k('g4-encoding', 'Numerical encoding', '数字编码', {
  d: 'Postal codes and IDs use digits as labels with positions that carry meaning.', t: ['Numerical encoding'],
  o: ['Interpret structured codes', 'Explain why codes must be unique'], pre: ['g3-codes'], rel: ['g6-coding'],
  e: 'reasoning', c: {mode: 'code', kind: 'student'}, m: ['Adding code digits', 'Codes do not need rules'],
  q: [M('Student code 20240315: year 2024, class 03, number 15. Code for class 7, number 2 in 2025?', ['20250702', '2025072', '20257002'], '20250702', 'Each part keeps its two-digit width.')],
  x: ['Design a library book code.'],
});

g.chapter('g4-addsub', 'Multi-Digit Addition and Subtraction', '多位数加减法', 'operations', 'Use place-value columns for any size of number.');
g.k('g4-column-addsub', 'Multi-digit addition and subtraction', '多位数的加减法', {
  d: 'Each column is a container; ten units overflow into the next column.', t: ['Multi-digit addition', 'Multi-digit subtraction', 'Carrying', 'Vertical algorithms', 'Estimation'],
  o: ['Add multi-digit numbers with several carries', 'Estimate to check'], pre: ['g2-three-digit'],
  e: 'column', c: {op: 'add', a: 4867, b: 3755}, m: ['Carrying more than 1 from a two-digit column sum', 'Misaligned digits'],
  q: [N('4,867 + 3,755 = ?', 8622, 'Carries in ones, tens and hundreds.')],
  x: ['Find two four-digit numbers with sum 10,000.'],
});
g.k('g4-borrow-zeros', 'Borrowing across zeros', '连续退位减法', {
  d: 'Borrowing from zeros cascades: a thousand breaks into hundreds, then tens, then ones.', t: ['Borrowing', 'Verification', 'Practical problems'],
  o: ['Subtract across zeros', 'Verify with addition'], pre: ['g2-sub-borrow', 'g4-column-addsub'],
  e: 'column', c: {op: 'sub', a: 5003, b: 1847}, m: ['5003 − 1847: writing 0 − 4 = 4', 'Forgetting to reduce after a chain of borrows'],
  q: [N('5,003 − 1,847 = ?', 3156, 'Break a thousand into 9 hundreds, 9 tens, 10 ones.')],
  x: ['Why is 5,003 − 1,847 the same as 5,002 − 1,846?'],
});

g.chapter('g4-muldiv', 'Multiplication and Division', '三位数乘两位数与除数是两位数的除法', 'operations', 'See the same calculation as objects, arrays, place value and written form.');
g.k('g4-two-digit-mult', 'Two-digit × two-digit in four representations', '两位数乘两位数', {
  d: 'An area model splits both factors; four partial products add to the product.', t: ['Two-digit multiplication', 'Multi-digit multiplication', 'Multiplication with zeros'],
  o: ['Compute 2-digit × 2-digit with partial products', 'Connect partial products to the written algorithm'], pre: ['g3-area-model'], rel: ['g4-distributive', 'g6-frac-times-frac'],
  e: 'array', c: {mode: 'area', a: 34, b: 26}, m: ['Multiplying tens by tens as 3 × 2 = 6', 'Forgetting the shifted row is tens'],
  q: [N('34 × 26 = ?', 884, '600 + 80 + 180 + 24 = 884.')],
  x: ['Why does 25 × 44 = 100 × 11?'], f: '(30+4)(20+6) = 600+180+80+24',
});
g.k('g4-three-digit-mult', 'Three-digit × two-digit', '三位数乘两位数', {
  d: 'The area model grows to six parts; estimation keeps the answer sensible.', t: ['Three-digit multiplication', 'Estimation and verification'],
  o: ['Multiply 3-digit by 2-digit numbers', 'Estimate products'], pre: ['g4-two-digit-mult'],
  e: 'array', c: {mode: 'area', a: 215, b: 34}, m: ['Misplacing partial products', 'Not estimating first'],
  q: [N('215 × 34 = ?', 7310, '215 × 30 = 6,450; 215 × 4 = 860.')],
  x: ['Estimate the number of hours in a year (365 × 24).'],
});
g.k('g4-div-two-digit', 'Dividing by two-digit numbers: trial quotients', '除数是两位数的除法', {
  d: 'Round the divisor to try a quotient, check the product and adjust up or down.', t: ['Two-digit division', 'Three-digit division', 'Long division', 'Trial quotient selection', 'Adjusting quotient estimates', 'Quotient containing zero'],
  o: ['Choose and adjust trial quotients', 'Divide 3-digit by 2-digit numbers'], pre: ['g3-long-division'], rel: ['g5-dec-divide'],
  e: 'division', c: {mode: 'long', total: 864, divisor: 32}, m: ['Not adjusting when the remainder ≥ divisor', 'Rounding the divisor and keeping that number'],
  q: [N('864 ÷ 32 = ?', 27, 'Try 86 ÷ 30 ≈ 2; 224 ÷ 32 = 7.')],
  x: ['Why does dividing by 29 often need adjusting when you round to 30?'],
});

g.chapter('g4-laws', 'Arithmetic Properties', '运算律', 'operations', 'Rearrange and regroup quantities to see why results stay the same.');
g.k('g4-comm-assoc-add', 'Commutative and associative laws of addition', '加法交换律和结合律', {
  d: 'Swapping or regrouping addends moves objects around but never changes the total.', t: ['Commutative property of addition', 'Associative property of addition'],
  o: ['State the laws with letters', 'Use them to compute cleverly'], pre: ['g2-three-digit'], rel: ['g4-comm-assoc-mul'],
  e: 'laws', c: {mode: 'assoc-add', a: 37, b: 48, c: 52}, m: ['Thinking subtraction is commutative too', 'Regrouping changes the result'],
  q: [N('37 + 48 + 52 = ?', 137, '48 + 52 = 100 first.')],
  x: ['Add 1 + 2 + … + 20 by pairing.'], f: 'a+b=b+a,\\quad (a+b)+c=a+(b+c)',
});
g.k('g4-comm-assoc-mul', 'Commutative and associative laws of multiplication', '乘法交换律和结合律', {
  d: 'A box of cubes can be counted layer by layer in any grouping.', t: ['Commutative property of multiplication', 'Associative property of multiplication'],
  o: ['Explain associativity with a cuboid of cubes', 'Find friendly pairs like 25 × 4'], pre: ['g2-commutative'], rel: ['g5-volume-meaning'],
  e: 'laws', c: {mode: 'assoc-mul', a: 25, b: 7, c: 4}, m: ['Division is associative too', 'Multiplying friendly pairs changes the order unfairly'],
  q: [N('25 × 7 × 4 = ?', 700, '25 × 4 = 100, × 7 = 700.')],
  x: ['Compute 125 × 32 using 125 × 8.'], f: 'ab=ba,\\quad (ab)c = a(bc)',
});
g.k('g4-distributive', 'The distributive law', '乘法分配律', {
  d: 'Split one array into two smaller arrays: a × (b + c) = a × b + a × c.', t: ['Distributive property'],
  o: ['Model distribution with arrays', 'Use it to simplify calculations'], pre: ['g3-area-model', 'g4-comm-assoc-mul'], rel: ['g5-letters'],
  e: 'array', c: {mode: 'distributive', a: 6, b: 8, c: 2}, m: ['a × (b + c) = a × b + c', 'Only works with small numbers'],
  q: [N('6 × (8 + 2) = 6 × 8 + 6 × ?', 2, 'Both parts are multiplied by 6.'), N('99 × 7 = ?', 693, '100 × 7 − 1 × 7.')],
  x: ['Compute 102 × 45 mentally.'], f: 'a(b+c)=ab+ac',
});
g.k('g4-letters', 'Laws with letters and clever calculation', '用字母表示运算律与简便计算', {
  d: 'Letters let us state a law for every number at once.', t: ['Mathematical expressions using letters', 'Simplifying calculations', 'Parentheses and brackets', 'Order of operations'],
  o: ['Read and write laws with letters', 'Choose the law that simplifies a calculation'], pre: ['g4-comm-assoc-add', 'g4-distributive', 'g3-order-ops'], rel: ['g5-letters'],
  e: 'laws', c: {mode: 'letters'}, m: ['a + b = b + a only for some numbers', 'Removing brackets without changing signs'],
  q: [M('Which law is 125 × 8 × 7 = (125 × 8) × 7?', ['Associative', 'Distributive', 'Commutative of addition'], 'Associative', 'Grouping changes, order of factors does not.')],
  x: ['Find a calculation that the distributive law makes easier.'],
});

g.chapter('g4-decfrac', 'Decimals and Fractions', '小数的意义和性质', 'number', 'Use one number model with fraction bars, decimal grids and number lines.');
g.k('g4-decimal-places', 'Decimal place values and properties', '小数的意义与性质', {
  d: 'Each decimal place is one-tenth of the place to its left; zeros at the end do not change value.', t: ['Decimal place values', 'Decimal reading and writing', 'Decimal properties'],
  o: ['Name tenths, hundredths and thousandths', 'Explain 0.3 = 0.30'], pre: ['g3-tenths'], rel: ['g4-compare-decimals'],
  e: 'decimal', c: {mode: 'subdivide', places: 2, value: 0.36}, m: ['0.30 is bigger than 0.3', '0.36 is 36 tenths'],
  q: [N('0.36 has how many hundredths?', 36, '3 tenths = 30 hundredths, plus 6.'), M('Is 0.5 equal to 0.50?', ['Yes', 'No'], 'Yes', 'Five tenths = fifty hundredths.')],
  x: ['Write 1.2 m in cm and mm. What stays the same?'],
});
g.k('g4-compare-decimals', 'Comparing decimals', '小数的大小比较', {
  d: 'Compare from the left place by place; length of the decimal is not size.', t: ['Comparing decimals'],
  o: ['Compare decimals using place value', 'Order decimals on a number line'], pre: ['g4-decimal-places'],
  e: 'decimal', c: {mode: 'compare', a: 0.7, b: 0.65}, m: ['0.65 > 0.7 because 65 > 7', 'More decimal digits means bigger'],
  q: [M('Which is greater?', ['0.7', '0.65'], '0.7', '7 tenths > 6 tenths.')],
  x: ['Order the 100 m times 12.31, 12.3, 12.13 seconds.'],
});
g.k('g4-decimal-addsub', 'Decimal addition and subtraction', '小数加减法', {
  d: 'Align decimal points so the same places add; empty places act as zeros.', t: ['Decimal addition', 'Decimal subtraction'],
  o: ['Add and subtract decimals with different numbers of places', 'Estimate decimal sums'], pre: ['g3-decimal-addsub', 'g4-decimal-places'], rel: ['g5-dec-times-int'],
  e: 'column', c: {op: 'add', a: 12.5, b: 3.78, places: 2}, m: ['Right-aligning digits', 'Dropping the decimal point'],
  q: [N('12.5 + 3.78 = ?', 16.28, '12.50 + 3.78.'), N('10 − 2.45 = ?', 7.55, '10.00 − 2.45.')],
  x: ['Add a shopping receipt with decimals.'],
});
g.k('g4-unified', 'One number, many representations', '分数、小数与数轴', {
  d: 'The same quantity appears as a fraction, a decimal and a point on a number line.', t: ['Simple fraction-decimal relationships'],
  o: ['Move between fraction, decimal and number-line forms', 'Recognise common equivalents like 1/4 = 0.25'], pre: ['g4-decimal-places', 'g3-several-parts'], rel: ['g5-frac-decimal', 'g6-percent-convert'],
  e: 'number-line', c: {mode: 'unified', n: 1, d: 4}, m: ['1/4 = 0.4', 'Fractions and decimals are different amounts'],
  q: [N('1/4 as a decimal is?', 0.25, '1 ÷ 4 = 0.25.'), N('0.5 = ?/2', 1, 'One half.')],
  x: ['List all fractions with denominator 10 as decimals.'],
});
g.k('g4-fraction-units', 'Fraction units and comparison', '分数单位与比较', {
  d: 'A fraction counts fraction units; same numerators compare by unit size.', t: ['Fraction units', 'Fraction comparison', 'Same-denominator addition and subtraction'],
  o: ['Compare fractions with the same numerator', 'Add and subtract same-denominator fractions'], pre: ['g3-compare-fractions', 'g3-add-same'], rel: ['g5-common-denominator'],
  e: 'fraction', c: {mode: 'compare', a: [2, 5], b: [2, 3]}, m: ['2/5 > 2/3 because 5 > 3', 'Adding denominators'],
  q: [M('Which is greater?', ['2/5', '2/3'], '2/3', 'Thirds are bigger units than fifths.'), N('5/9 − 2/9 = ?/9', 3, 'Count ninths.')],
  x: ['Make a fraction wall from paper strips.'],
});

g.chapter('g4-geometry', 'Geometry', '平行与垂直、三角形与四边形', 'geometry', 'Drag points and see which properties hold and which change.');
g.k('g4-lines-distance', 'Lines, rays, segments and distance', '两点间的距离', {
  d: 'The segment between two points is the shortest path; its length is the distance.', t: ['Points', 'Lines', 'Rays', 'Line segments', 'Distance between points'],
  o: ['Explain why the segment is the shortest route', 'Measure distance between points'], pre: ['g3-lines'],
  e: 'angle', c: {mode: 'lines', distance: true}, m: ['Any path between points is the distance', 'Lines have length'],
  q: [M('Why do paths across lawns cut corners?', ['The segment is the shortest path', 'Grass is softer'], 'The segment is the shortest path', 'Distance is the straight segment.')],
  x: ['Measure two routes between doors in school.'],
});
g.k('g4-parallel', 'Parallel, perpendicular and intersecting lines', '平行与垂直', {
  d: 'Parallel lines never meet; perpendicular lines meet at right angles.', t: ['Parallel lines', 'Perpendicular lines', 'Intersecting lines'],
  o: ['Identify parallel and perpendicular lines', 'Explain perpendicular distance between parallels'], pre: ['g4-lines-distance', 'g3-angles'], rel: ['g4-quadrilaterals'],
  e: 'angle', c: {mode: 'parallel'}, m: ['Lines that do not meet on the page are parallel', 'Perpendicular lines must be vertical and horizontal'],
  q: [N('Two perpendicular lines form how many right angles?', 4, 'All four angles are 90°.')],
  x: ['Find parallel and perpendicular lines on a street map.'],
});
g.k('g4-angle-measure', 'Measuring and classifying angles', '角的度量', {
  d: 'Angles are measured in degrees from 0° to 360° with a protractor.', t: ['Angle measurement', 'Acute, right and obtuse angles', 'Straight and full angles'],
  o: ['Measure and draw angles', 'Classify any angle'], pre: ['g3-protractor'],
  e: 'angle', c: {mode: 'protractor', deg: 125}, m: ['Reading the inner scale for an obtuse angle', 'A reflex angle cannot exist'],
  q: [N('A straight angle minus a right angle = ?°', 90, '180° − 90°.')],
  x: ['Measure the angles the clock hands make at 2:00 and 4:00.'],
});
g.k('g4-triangles', 'Classifying triangles', '三角形的分类', {
  d: 'Triangles are classified by angles (acute, right, obtuse) and by sides (isosceles, equilateral).', t: ['Triangles', 'Triangle classification', 'Acute triangles', 'Right triangles', 'Obtuse triangles', 'Isosceles triangles', 'Equilateral triangles'],
  o: ['Classify triangles by angles and sides', 'Explain why a triangle has at most one obtuse angle'], pre: ['g3-polygons', 'g4-angle-measure'], rel: ['g4-angle-sum'],
  e: 'angle', c: {mode: 'triangle'}, m: ['An equilateral triangle is not isosceles', 'A triangle can have two right angles'],
  q: [M('A triangle has angles 90°, 45°, 45°. It is…', ['Right isosceles', 'Obtuse', 'Equilateral'], 'Right isosceles', 'One right angle and two equal angles.')],
  x: ['Can you draw an obtuse equilateral triangle? Why not?'],
});
g.k('g4-angle-sum', 'The angles of a triangle', '三角形的内角和', {
  d: 'Tear off the three corners and they line up into a straight angle: 180°.', t: ['Triangles'],
  o: ['Discover the 180° angle sum', 'Find a missing angle'], pre: ['g4-triangles'], rel: ['g4-quadrilaterals'],
  e: 'angle', c: {mode: 'triangle-sum'}, m: ['Bigger triangles have bigger angle sums', 'Measuring errors disprove the rule'],
  q: [N('Two angles of a triangle are 50° and 70°. The third is?', 60, '180 − 50 − 70.')],
  x: ['Use the triangle sum to find the angle sum of a quadrilateral.'], f: '\\angle A+\\angle B+\\angle C=180^\\circ',
});
g.k('g4-quadrilaterals', 'The quadrilateral family', '平行四边形和梯形', {
  d: 'Dragging vertices shows which quadrilaterals keep parallel sides and which keep right angles.', t: ['Quadrilaterals', 'Parallelograms', 'Trapezoids', 'Rectangles', 'Squares'],
  o: ['Classify quadrilaterals by parallel sides and angles', 'Explain the family hierarchy'], pre: ['g4-parallel', 'g3-polygons'], rel: ['g5-parallelogram', 'g5-trapezoid'],
  e: 'angle', c: {mode: 'quadrilateral', family: true}, m: ['A rectangle is not a parallelogram', 'A trapezoid has two pairs of parallel sides'],
  q: [M('How many pairs of parallel sides does a trapezoid have?', ['Exactly 1', '2', '0'], 'Exactly 1', 'Chinese textbooks define trapezoids with exactly one pair.')],
  x: ['Make a parallelogram from straws and push it. What changes?'],
});
g.k('g4-views', 'Observing objects from different directions', '观察物体（二）', {
  d: 'Stacks of cubes look different from the front, left and top; views can rebuild the stack.', t: ['Observing three-dimensional objects'],
  o: ['Draw front, side and top views', 'Determine possible stacks from views'], pre: ['g2-solid-views'], rel: ['g5-volume-meaning'],
  e: 'solid', c: {mode: 'views', shape: 'stack'}, m: ['Hidden cubes are ignored', 'Views show depth'],
  q: [N('A stack shows 3 squares from the front and 1 from the side. At least how many cubes?', 3, 'One row of 3.')],
  x: ['Build a stack from given views with real cubes.'],
});
g.k('g4-transformations', 'Translation and rotation on a grid', '图形的平移与旋转', {
  d: 'Translation slides every point the same way; rotation turns around a fixed point; size and shape stay the same.', t: ['Basic geometric transformations'],
  o: ['Translate shapes on a grid', 'Rotate shapes by 90°'], pre: ['g3-polygons'], rel: ['g6-rotation', 'g6-symmetry'],
  e: 'transform', c: {mode: 'translate', dx: 5, dy: -2}, m: ['Counting the gap between shapes instead of how far a point moved', 'Rotation changes size'],
  q: [M('After a translation, a shape’s area…', ['Stays the same', 'Doubles', 'Changes'], 'Stays the same', 'Translations preserve size and shape.')],
  x: ['Design a border pattern using translations.'],
});

g.chapter('g4-area', 'Area and Measurement', '面积与面积单位', 'geometry', 'Separate boundary length from surface size and convert area units.');
g.k('g4-perim-vs-area', 'Perimeter and area are different', '周长与面积的区别', {
  d: 'Shapes with the same perimeter can have different areas.', t: ['Difference between perimeter and area', 'Rectangle area', 'Square area'],
  o: ['Compare perimeter and area of rectangles', 'Find the rectangle with the biggest area for a fixed perimeter'], pre: ['g3-perimeter', 'g3-area-intro'], rel: ['g6-optimize'],
  e: 'area', c: {mode: 'perimeter-vs-area', perimeter: 24}, m: ['Same perimeter means same area', 'Perimeter and area use the same units'],
  q: [N('A 24 cm fence makes a square. Area (cm²)?', 36, 'Side 6 cm.'), N('Same fence as a 10 cm × 2 cm rectangle. Area (cm²)?', 20, '10 × 2.')],
  x: ['With 36 m of fence, which rectangle gives the biggest garden?'],
});
g.k('g4-area-units', 'Square centimetres, decimetres and metres', '面积单位换算', {
  d: '1 dm² is a 10 × 10 grid of cm², so 1 dm² = 100 cm²; area units scale by 100.', t: ['Area units', 'Square centimeters', 'Square decimeters', 'Square meters', 'Area conversions'],
  o: ['Convert between cm², dm² and m²', 'Explain the factor 100'], pre: ['g3-area-intro', 'g2-length-units'], rel: ['g5-volume-meaning'],
  e: 'area', c: {mode: 'units'}, m: ['1 dm² = 10 cm²', 'Applying length conversion to area'],
  q: [N('1 m² = ? dm²', 100, '10 × 10.'), N('3 dm² = ? cm²', 300, '3 × 100.')],
  x: ['Mark out 1 m² on the floor. How many children fit?'], f: '1\\,\\text{m}^2=100\\,\\text{dm}^2=10000\\,\\text{cm}^2',
});
g.k('g4-irregular', 'Composite shapes and area estimation', '组合图形与面积估算', {
  d: 'Count full squares, then pair partial squares to estimate irregular areas.', t: ['Composite shapes', 'Basic area estimation'],
  o: ['Estimate irregular areas with a grid', 'Split composite shapes'], pre: ['g4-area-units'], rel: ['g5-composite'],
  e: 'area', c: {mode: 'irregular'}, m: ['Ignoring partial squares', 'Counting partial squares as full'],
  q: [N('A leaf covers 20 full squares and 12 partial squares. Estimate (squares) by counting each partial as half.', 26, '20 + 12 ÷ 2.')],
  x: ['Trace your hand on cm-grid paper and estimate its area.'],
});

g.chapter('g4-stats', 'Statistics and Quantitative Relationships', '平均数与常见数量关系', 'statistics', 'Level data into means and model speed and price relationships.');
g.k('g4-mean', 'The mean as levelling', '平均数', {
  d: 'Move amounts from tall columns to short ones until all are level: that level is the mean.', t: ['Arithmetic mean', 'Calculating the mean', 'Meaning of averages'],
  o: ['Find the mean by levelling and by total ÷ count', 'Interpret the mean'], pre: ['g3-bar-chart', 'g2-share'], rel: ['g5-mean-interpret'],
  e: 'data', c: {mode: 'mean', values: [6, 2, 5, 3]}, m: ['The mean must be one of the data values', 'The mean is the middle value'],
  q: [N('Mean of 6, 2, 5, 3?', 4, 'Total 16 ÷ 4.'), M('Can a mean be 4.5 people?', ['Yes, as a description of the data', 'No, never'], 'Yes, as a description of the data', 'The mean is a statistic, not an actual person.')],
  x: ['Find the mean number of books read by your group.'], f: '\\bar{x} = \\frac{\\text{total}}{\\text{count}}',
});
g.k('g4-bar-read', 'Reading statistical charts', '复式条形统计图', {
  d: 'Read scales carefully and compare bars to answer questions.', t: ['Data collection', 'Data organization', 'Bar charts', 'Reading statistical charts'],
  o: ['Read charts with scales of 5 or 10', 'Answer comparison questions'], pre: ['g3-bar-chart'],
  e: 'data', c: {mode: 'bar', values: [35, 50, 20, 45], labels: ['Mon', 'Tue', 'Wed', 'Thu'], scale: 5}, m: ['Counting grid lines instead of reading values', 'Scale starting not at zero'],
  q: [N('Tue = 50, Wed = 20. How many more on Tuesday?', 30, '50 − 20.')],
  x: ['Find a chart in the news. Is its scale fair?'],
});
g.k('g4-speed', 'Speed, time and distance', '速度、时间与路程', {
  d: 'A vehicle at constant speed covers the same distance each hour: distance = speed × time.', t: ['Speed', 'Time', 'Distance', 'Basic mathematical modeling', 'Total quantity and partial quantity'],
  o: ['Use distance = speed × time', 'Compare speeds'], pre: ['g2-elapsed', 'g3-area-model'], rel: ['g6-travel', 'g6-direct'],
  e: 'proportion', c: {mode: 'speed', speed: 60, time: 3}, m: ['Adding speed and time', 'Speed is the same as distance'],
  q: [N('A car travels 60 km/h for 3 hours. Distance (km)?', 180, '60 × 3.'), N('240 km in 4 hours: speed (km/h)?', 60, '240 ÷ 4.')],
  x: ['Time yourself walking 50 m and find your speed.'], f: 's = v\\times t',
});
g.k('g4-unit-price', 'Unit price, quantity and total price', '单价、数量与总价', {
  d: 'Total price = unit price × quantity; buy more and the total grows in step.', t: ['Unit price', 'Quantity', 'Total price'],
  o: ['Use total = unit price × quantity', 'Compare value for money'], pre: ['g1-shopping', 'g3-area-model'], rel: ['g6-direct'],
  e: 'proportion', c: {mode: 'unit-price', price: 6, qty: 5}, m: ['Dividing quantity by price', 'Bigger packets are always cheaper per item'],
  q: [N('5 notebooks cost 30 yuan. Unit price (yuan)?', 6, '30 ÷ 5.')],
  x: ['Compare the price per 100 g of two cereal boxes.'], f: '\\text{total}=\\text{unit price}\\times\\text{quantity}',
});

export const grade4 = g.done();
