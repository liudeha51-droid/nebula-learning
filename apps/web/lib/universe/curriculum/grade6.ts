import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(6);

g.chapter('g6-fraction-ops', 'Fraction Operations', '分数乘除法', 'operations', 'See how multiplying and dividing by fractions change quantities.');
g.k('g6-frac-of', 'A fraction of a quantity', '分数乘整数与求一个数的几分之几', {
  d: '3/4 of 12 splits 12 into 4 equal groups and takes 3 of them: 9. The “whole” is whatever we start with.', t: ['Fraction multiplication', 'Multiplying fractions by integers', 'Finding a fractional part of a quantity', 'The concept of the whole'],
  o: ['Find a fraction of a quantity', 'Identify the whole in a problem'], pre: ['g5-equivalent', 'g2-share'], rel: ['g6-whole-from-part', 'g6-percent-of'],
  e: 'fraction', c: {mode: 'of-quantity', n: 3, d: 4, whole: 12}, m: ['3/4 of 12 = 12/4 only', 'The whole is always 1'],
  q: [N('3/4 of 12 = ?', 9, '12 ÷ 4 × 3.'), N('2/5 of 30 kg = ? kg', 12, '30 ÷ 5 × 2.')],
  x: ['Is 3/4 of 12 the same as 12 of 3/4? Draw both.'], f: '\\tfrac34 \\times 12 = 9',
});
g.k('g6-frac-times-frac', 'Fraction × fraction with an area model', '分数乘分数', {
  d: 'Shade 3/4 of a square, then 2/3 of that: the overlap is 6 of 12 parts.', t: ['Multiplying fractions by fractions', 'Simplifying calculations'],
  o: ['Model fraction × fraction with overlapping areas', 'Explain numerator × numerator, denominator × denominator'], pre: ['g6-frac-of', 'g5-dec-times-dec'],
  e: 'fraction', c: {mode: 'multiply', a: [2, 3], b: [3, 4]}, m: ['Multiplying always makes bigger', 'Cross-multiplying instead'],
  q: [M('2/3 × 3/4 = ?', ['1/2', '6/7', '5/12'], '1/2', '6/12 = 1/2.')],
  x: ['When is a × b smaller than both a and b?'], f: '\\tfrac{a}{b}\\times\\tfrac{c}{d}=\\tfrac{ac}{bd}',
});
g.k('g6-frac-divide', 'Why dividing by a fraction can make it bigger', '分数除法', {
  d: '3 ÷ 1/4 asks how many quarters fit into 3: twelve. Dividing by a number less than 1 gives more groups.', t: ['Fraction division', 'Dividing integers by fractions', 'Dividing fractions by fractions'],
  o: ['Interpret division as “how many groups fit”', 'Explain multiplying by the reciprocal'], pre: ['g2-group', 'g6-frac-times-frac'], rel: ['g5-dec-divide'],
  e: 'fraction', c: {mode: 'divide', a: [3, 1], b: [1, 4]}, m: ['Division always makes smaller', 'Flipping the wrong fraction'],
  q: [N('3 ÷ 1/4 = ?', 12, 'Twelve quarters fit in 3.'), N('3/4 ÷ 1/8 = ?', 6, 'Six eighths fit in three quarters.')],
  x: ['How many 3/4-cup scoops in 6 cups of flour?'], f: 'a \\div \\tfrac{c}{d} = a \\times \\tfrac{d}{c}',
});
g.k('g6-whole-from-part', 'Finding the whole from a part', '已知一个数的几分之几求这个数', {
  d: 'If 3/5 of a class is 15 students, one fifth is 5, so the whole class is 25.', t: ['Finding the whole from a known part', 'Fraction word problems'],
  o: ['Find a whole from a fractional part', 'Choose multiplication or division by identifying the whole'], pre: ['g6-frac-of', 'g6-frac-divide'], rel: ['g6-percent-of'],
  e: 'fraction', c: {mode: 'whole-from-part', n: 3, d: 5, part: 15}, m: ['Multiplying 15 by 3/5', 'Mixing up the part and the whole'],
  q: [N('3/5 of a number is 15. The number is?', 25, '15 ÷ 3 × 5.')],
  x: ['A book: you have read 2/7, which is 40 pages. How long is it?'], f: 'x \\times \\tfrac35 = 15 \\Rightarrow x = 25',
});
g.k('g6-frac-mixed', 'Fraction mixed operations', '分数混合运算', {
  d: 'All earlier laws hold for fractions; common denominators and simplifying keep calculations tidy.', t: ['Fraction addition', 'Fraction subtraction', 'Fraction mixed operations', 'Fraction-decimal conversion'],
  o: ['Carry out mixed fraction calculations', 'Apply arithmetic laws to fractions'], pre: ['g5-add-unlike', 'g6-frac-times-frac'],
  e: 'fraction', c: {mode: 'add-diff', a: [3, 4], b: [1, 6], op: 'sub'}, m: ['Order of operations changes for fractions', 'Not simplifying at the end'],
  q: [M('3/4 − 1/6 = ?', ['7/12', '1/2', '2/10'], '7/12', '9/12 − 2/12.'), M('(1/2 + 1/3) × 6 = ?', ['5', '1', '6'], '5', '3 + 2 by the distributive law.')],
  x: ['Use the distributive law to compute (1/4 + 1/6) × 12.'],
});

g.chapter('g6-percent', 'Percentages', '百分数', 'relationships', 'Fill a 100-cell reference and use percentages in real situations.');
g.k('g6-percent-meaning', 'What a percentage means', '百分数的意义', {
  d: 'Percent means “per hundred”: 35% fills 35 of 100 equal cells of the whole.', t: ['Meaning of percentages', 'Percentage notation', 'Reading and writing percentages'],
  o: ['Represent percentages on a 100-grid', 'Explain that 100% is the whole reference quantity'], pre: ['g4-decimal-places'], rel: ['g6-percent-convert'],
  e: 'percent', c: {mode: 'grid', pct: 35}, m: ['A percent is a fixed amount', 'Percentages can never exceed 100%'],
  q: [N('How many cells of a 100-grid show 35%?', 35, 'Per hundred.'), M('Can a shop’s sales grow by 120%?', ['Yes', 'No'], 'Yes', 'It means more than doubling.')],
  x: ['Find five percentages on food labels.'],
});
g.k('g6-percent-convert', 'Fractions, decimals and percentages', '百分数与分数、小数的互化', {
  d: 'The same amount can be written 3/8 = 0.375 = 37.5%.', t: ['Fractions and percentages', 'Decimals and percentages', 'Converting between representations'],
  o: ['Convert among fractions, decimals and percentages', 'Compare quantities written differently'], pre: ['g6-percent-meaning', 'g5-frac-decimal'],
  e: 'percent', c: {mode: 'convert', n: 3, d: 8}, m: ['0.5 = 5%', '3/8 = 38%'],
  q: [N('3/8 = ?%', 37.5, '0.375 × 100.'), N('0.06 = ?%', 6, '6 hundredths.')],
  x: ['Which is more: 7/20, 0.34 or 36%?'],
});
g.k('g6-percent-of', 'Percentages of quantities and the original quantity', '求一个数的百分之几与已知百分数求原数', {
  d: '30% of 240 = 72; if 30% is 72, the whole is 72 ÷ 0.3 = 240.', t: ['Percentage calculations', 'Finding a percentage of a quantity', 'Finding the original quantity'],
  o: ['Find a percentage of a quantity', 'Find the original from a part and its percentage'], pre: ['g6-frac-of', 'g6-percent-convert'],
  e: 'percent', c: {mode: 'of-quantity', pct: 30, whole: 240}, m: ['30% of 240 = 30 × 240', 'Using the part as the whole'],
  q: [N('30% of 240 = ?', 72, '240 × 0.3.'), N('25% of a number is 40. The number?', 160, '40 ÷ 0.25.')],
  x: ['A survey says 45% of 120 students walk. How many?'],
});
g.k('g6-percent-change', 'Percentage increase and decrease', '增长率与下降率', {
  d: 'An increase of 25% on 80 adds a quarter of 80. Percentage change is always relative to the original.', t: ['Percentage increase', 'Percentage decrease'],
  o: ['Compute increases and decreases', 'Explain why +20% then −20% does not return to the start'], pre: ['g6-percent-of'],
  e: 'percent', c: {mode: 'change', base: 80, pct: 25}, m: ['+20% then −20% gives the original', 'Using the new value as the base'],
  q: [N('80 increased by 25% = ?', 100, '80 × 1.25.'), N('100 increased by 20% then decreased by 20% = ?', 96, '120 × 0.8.')],
  x: ['Enrichment: a rate rises from 3% to 4%. Is that 1 percentage point or 33% more?'],
});
g.k('g6-discount', 'Discounts, taxes and profit', '折扣、税率与利润', {
  d: '“八折” means pay 80% of the price; tax adds a percentage; profit compares selling and cost prices.', t: ['Discounts', 'Taxes', 'Simple financial applications', 'Discount and profit problems'],
  o: ['Compute discounted prices and taxes', 'Compare offers'], pre: ['g6-percent-of'], rel: ['g6-interest'],
  e: 'percent', c: {mode: 'discount', price: 240, pct: 80}, m: ['八折 means 8% off', 'Two discounts simply add'],
  q: [N('A 240-yuan coat at 八折 (80%) costs?', 192, '240 × 0.8.'), N('Cost 50 yuan, sold for 65 yuan. Profit percentage?', 30, '15 ÷ 50 = 30%.')],
  x: ['Which is better: 7折, or 100 off every 300?'],
});
g.k('g6-interest', 'Interest', '利率', {
  d: 'Simple interest = principal × rate × time; the account grows by the same amount each year.', t: ['Interest'],
  o: ['Calculate simple interest', 'Compare savings plans'], pre: ['g6-percent-of'],
  e: 'percent', c: {mode: 'interest', principal: 5000, rate: 2.75, years: 3}, m: ['Forgetting to multiply by time', 'Rate as a whole number'],
  q: [N('5,000 yuan at 2.75% per year for 3 years: interest (yuan)?', 412.5, '5000 × 0.0275 × 3.')],
  x: ['How long until 1,000 yuan earns 100 yuan at 2% simple interest?'], f: 'I = P\\times r \\times t',
});

g.chapter('g6-ratio', 'Ratios and Proportions', '比和比例', 'relationships', 'Change one quantity and watch related quantities update in step.');
g.k('g6-ratio', 'Ratios in recipes and mixtures', '比的意义', {
  d: 'A ratio 2 : 3 says “for every 2 of these, 3 of those”; scaling keeps the taste the same.', t: ['Meaning of ratios', 'Ratio components', 'Ratios and fractions', 'Ratios and division'],
  o: ['Interpret ratios', 'Relate ratios to fractions and division'], pre: ['g5-fraction-division'], rel: ['g6-ratio-share', 'g6-direct'],
  e: 'proportion', c: {mode: 'ratio', a: 2, b: 3}, m: ['2 : 3 means 2 out of 3', 'Adding the same amount keeps the ratio'],
  q: [N('Juice : water = 2 : 3. With 8 cups juice, how much water?', 12, '×4 both.'), M('2 : 3 = ? as a fraction of juice in the whole mix', ['2/5', '2/3', '3/5'], '2/5', '2 parts of 5.')],
  x: ['Make paint shades with ratios 1:1, 1:2 and 2:1.'],
});
g.k('g6-ratio-simplify', 'Ratio values and simplifying ratios', '比的基本性质与化简', {
  d: 'Multiplying or dividing both terms by the same non-zero number keeps the ratio.', t: ['Ratio values', 'Simplifying ratios', 'Fundamental properties of ratios'],
  o: ['Simplify ratios', 'Find the value of a ratio'], pre: ['g6-ratio', 'g5-gcf'],
  e: 'proportion', c: {mode: 'simplify', a: 18, b: 24}, m: ['Ratio value and simplified ratio are the same thing', 'Subtracting to simplify'],
  q: [M('Simplify 18 : 24.', ['3 : 4', '9 : 12', '6 : 8'], '3 : 4', 'Divide by 6.'), N('The value of 18 : 24?', 0.75, '18 ÷ 24.')],
  x: ['Simplify 0.6 : 1.5 and 1/2 : 1/3.'],
});
g.k('g6-ratio-share', 'Dividing a quantity in a ratio', '按比分配', {
  d: 'Share 35 in the ratio 3 : 4 by splitting into 7 equal parts: 15 and 20.', t: ['Dividing quantities in a given ratio'],
  o: ['Divide quantities in a ratio', 'Check that parts add to the total'], pre: ['g6-ratio'],
  e: 'proportion', c: {mode: 'divide', total: 35, a: 3, b: 4}, m: ['Dividing the total by 3 and by 4', 'Forgetting to check the sum'],
  q: [N('Share 35 in the ratio 3 : 4. The larger share?', 20, '35 ÷ 7 × 4.')],
  x: ['Split 1 L of concrete mix in the ratio 1 : 2 : 3.'],
});
g.k('g6-proportion', 'Proportions and solving them', '比例与解比例', {
  d: 'A proportion states two ratios are equal; the product of outer terms equals the product of inner terms.', t: ['Meaning of proportions', 'Inner and outer terms', 'Properties of proportions', 'Solving proportions'],
  o: ['Identify inner and outer terms', 'Solve proportions'], pre: ['g6-ratio-simplify', 'g5-equations'], rel: ['g6-scale'],
  e: 'proportion', c: {mode: 'solve', a: 3, b: 4, c: 9}, m: ['Inner × outer instead of inner × inner', 'Any two ratios form a proportion'],
  q: [N('3 : 4 = 9 : x. x = ?', 12, '3x = 36.')],
  x: ['Check whether 2 : 5 and 6 : 15 form a proportion.'], f: 'a:b=c:d \\iff ad = bc',
});
g.k('g6-direct', 'Direct proportion and its graph', '正比例', {
  d: 'When y ÷ x stays constant, y grows in step with x and the graph is a straight line through the origin.', t: ['Direct proportion', 'Direct proportion relationships', 'Proportion graphs'],
  o: ['Recognise direct proportion from tables and graphs', 'Use the constant ratio'], pre: ['g6-ratio', 'g4-unit-price', 'g5-coordinates'], rel: ['g6-inverse'],
  e: 'proportion', c: {mode: 'direct', k: 3}, m: ['Any increasing relationship is proportional', 'Lines not through the origin are proportional'],
  q: [M('Pencils cost 3 yuan each. Are cost and number in direct proportion?', ['Yes', 'No'], 'Yes', 'Cost ÷ number = 3 always.'), M('Age and height are…', ['Not proportional', 'Directly proportional'], 'Not proportional', 'Height ÷ age is not constant.')],
  x: ['Plot your walking distance against time.'], f: '\\tfrac{y}{x}=k',
});
g.k('g6-inverse', 'Inverse proportion (enrichment)', '反比例（拓展）', {
  d: 'For a fixed 24 km trip, doubling speed halves time: speed × time stays 24.', t: ['Inverse proportion as an enrichment or textbook-dependent topic'],
  o: ['Recognise inverse proportion by a constant product', 'State the conditions under which it holds'], pre: ['g6-direct', 'g4-speed'],
  e: 'proportion', c: {mode: 'inverse', product: 24}, m: ['Any decreasing relationship is inverse proportion', 'Speed and time are inverse even when distance changes'],
  q: [N('24 workers finish a job in 5 days. At the same rate, how many days for 12 workers?', 10, 'Workers × days = 120.')],
  x: ['Rectangles with area 36: plot length against width.'], f: 'xy = k',
});

g.chapter('g6-negatives', 'Positive and Negative Numbers', '负数', 'number', 'Extend the number line below zero for opposite quantities.');
g.k('g6-negatives', 'Positive and negative numbers', '负数的认识', {
  d: 'Negative numbers describe quantities in the opposite direction from zero, like −5 °C.', t: ['Positive numbers', 'Negative numbers', 'Zero', 'Opposite quantities', 'Temperature', 'Introductory number lines'],
  o: ['Use negative numbers for opposite quantities', 'Locate them on a number line'], pre: ['g1-zero'], rel: ['g6-negative-compare'],
  e: 'number-line', c: {mode: 'signed', context: 'temperature', value: -5}, m: ['Zero is positive', '−5 is greater than −2'],
  q: [M('Which is colder?', ['−8 °C', '−3 °C'], '−8 °C', 'Further below zero.'), M('Is 0 positive or negative?', ['Neither', 'Positive', 'Negative'], 'Neither', 'Zero separates them.')],
  x: ['Find the lowest temperature recorded in your city.'],
});
g.k('g6-negative-compare', 'Elevation, money and comparing', '负数的比较与应用', {
  d: 'On a number line, numbers increase to the right; −3 > −7.', t: ['Comparing positive and negative numbers', 'Elevation', 'Financial gains and losses'],
  o: ['Compare and order signed numbers', 'Interpret gains and losses'], pre: ['g6-negatives'],
  e: 'number-line', c: {mode: 'signed', context: 'elevation', value: -150}, m: ['−7 > −3 because 7 > 3', 'Losses cannot be written as numbers'],
  q: [M('Which is greater?', ['−3', '−7'], '−3', '−3 is to the right.'), N('From 8 m below sea level a diver rises 5 m. New level (m)?', -3, '−8 + 5.')],
  x: ['Track a week of pocket money as + and −.'],
});

g.chapter('g6-circles', 'Circles', '圆', 'geometry', 'Discover circumference and area by unrolling and rearranging.');
g.k('g6-circle-parts', 'Centre, radius and diameter', '圆的认识', {
  d: 'Every point on a circle is the same distance (radius) from the centre; the diameter is two radii.', t: ['Circle recognition', 'Center', 'Radius', 'Diameter', 'Relationship between radius and diameter', 'Symmetry', 'Drawing circles'],
  o: ['Identify centre, radius and diameter', 'Explain d = 2r and infinite lines of symmetry'], pre: ['g3-lines'], rel: ['g6-circumference'],
  e: 'circle', c: {mode: 'parts', r: 3}, m: ['A diameter can miss the centre', 'Circles have 4 lines of symmetry'],
  q: [N('Radius 3 cm. Diameter (cm)?', 6, 'd = 2r.'), M('How many lines of symmetry does a circle have?', ['Infinitely many', '4', '2'], 'Infinitely many', 'Every diameter is one.')],
  x: ['Draw a circle with string and a pin. Why does it work?'], f: 'd = 2r',
});
g.k('g6-circumference', 'Circumference and π', '圆的周长', {
  d: 'Roll a wheel once and unroll its edge: it is a little more than 3 diameters long. That ratio is π.', t: ['Pi', 'Circumference'],
  o: ['Discover C ≈ 3.14 × d by unrolling', 'Compute circumferences'], pre: ['g6-circle-parts', 'g3-perimeter'], rel: ['g6-cylinder-net'],
  e: 'circle', c: {mode: 'circumference', r: 2}, m: ['π is exactly 3.14', 'C = π r'],
  q: [N('Diameter 10 cm. Circumference using π ≈ 3.14 (cm)?', 31.4, '3.14 × 10.'), N('Radius 5 m. Circumference (π ≈ 3.14)?', 31.4, '2 × 3.14 × 5.')],
  x: ['Measure 5 round objects. Divide circumference by diameter each time.'], f: 'C = \\pi d = 2\\pi r',
});
g.k('g6-circle-area', 'Area of a circle: sectors into a rectangle', '圆的面积', {
  d: 'Cut a circle into thin sectors and alternate them: an almost-rectangle with length πr and width r.', t: ['Circle area'],
  o: ['Derive S = πr² by rearrangement', 'Explain why more sectors give a better rectangle'], pre: ['g6-circumference', 'g5-parallelogram'], rel: ['g6-cake', 'g6-cylinder-volume'],
  e: 'circle', c: {mode: 'area', r: 3}, m: ['Area = 2πr', 'Doubling radius doubles area'],
  q: [N('Radius 10 cm. Area with π ≈ 3.14 (cm²)?', 314, '3.14 × 100.'), N('Radius doubles. Area becomes how many times as large?', 4, '(2r)² = 4r².')],
  x: ['Estimate a circle’s area on cm-grid paper and compare with πr².'], f: 'S = \\pi r^2',
});
g.k('g6-cake', 'Signature: The Cake Transformation', '招牌动画：蛋糕变形记', {
  d: 'A 30 cm cake is twice as wide as a 15 cm cake — but holds four times as much. Area grows with the square of the diameter.', t: ['Practical circle problems', 'Circle area'],
  o: ['Predict and test how area scales with diameter', 'Use area-preserving rearrangements to compare circles'], pre: ['g6-circle-area'], rel: ['g6-enlarge', 'g6-cylinder-volume'],
  e: 'circle', c: {mode: 'cake', d1: 15, d2: 30}, m: ['Double the diameter, double the cake', 'Comparing by width only'],
  q: [N('How many 15 cm cakes have the same top area as one 30 cm cake?', 4, '(30 ÷ 15)² = 4.'), N('A 20 cm pizza costs 30 yuan; a 30 cm pizza costs 60 yuan. How many times as much area does the 30 cm have? (decimal)', 2.25, '(30/20)² = 2.25.')],
  x: ['Is a 30 cm pizza for 60 yuan better value than two 20 cm pizzas for 30 yuan each?'], f: '\\frac{S_2}{S_1} = \\left(\\frac{d_2}{d_1}\\right)^2',
});
g.k('g6-annulus', 'Rings, semicircles and sectors', '圆环、半圆与扇形', {
  d: 'A ring is a big circle minus a small one; a sector is a fraction of a circle set by its angle.', t: ['Semicircles', 'Sectors', 'Annuli', 'Composite circular shapes'],
  o: ['Find areas of rings, semicircles and sectors', 'Use the central angle as a fraction of 360°'], pre: ['g6-circle-area'],
  e: 'circle', c: {mode: 'annulus', R: 5, r: 3}, m: ['Ring area = π(R − r)²', 'A semicircle’s perimeter is half the circumference only'],
  q: [N('Ring with R = 5, r = 3. Area (π ≈ 3.14)?', 50.24, '3.14 × (25 − 9).'), N('A 90° sector of radius 4. Area (π ≈ 3.14)?', 12.56, 'One quarter of 50.24.')],
  x: ['Find the area of a running track shape.'], f: 'S_{\\text{ring}}=\\pi(R^2-r^2)',
});

g.k('g6-rolling-pi', 'Signature: Unrolling π', '招牌动画：滚出圆周率', {
  d: 'A wheel one metre across rolls one turn and paints a line just over 3.14 m long; then Liu Hui’s polygons (割圆术) squeeze π from inside and outside.', t: ['Circumference', 'π', 'History of mathematics: Liu Hui and Zu Chongzhi'],
  o: ['Explain why C = πd for every circle', 'Estimate π with inscribed and circumscribed polygons'], pre: ['g6-circumference'], rel: ['g6-cake', 'g6-circle-area'],
  e: 'journey', c: {mode: 'pi'}, m: ['π is exactly 3.14', 'Bigger wheels have a bigger π'],
  q: [N('A wheel 50 cm across rolls one turn. Distance in cm (π ≈ 3.14)?', 157, '3.14 × 50.'), N('A regular hexagon fits inside a circle. Its perimeter ÷ the circle’s diameter = ?', 3, 'Six sides each equal to r: 6r ÷ 2r.')],
  x: ['Roll a can along a ruler and measure one turn. Divide by its diameter.'], f: 'C = \\pi d',
});
g.chapter('g6-solids', 'Cylinders and Cones', '圆柱与圆锥', 'geometry', 'Unfold cylinders and pour cones to discover surface and volume.');
g.k('g6-cylinder-net', 'Unfolding a cylinder: surface area', '圆柱的表面积', {
  d: 'Unroll the curved surface: a rectangle whose length is the circumference and width is the height.', t: ['Cylinders', 'Circular bases', 'Curved surfaces', 'Cylinder height', 'Cylinder nets', 'Lateral surface area', 'Total surface area'],
  o: ['Relate the net rectangle to circumference and height', 'Calculate lateral and total surface area'], pre: ['g6-circumference', 'g5-nets'], rel: ['g6-cylinder-volume'],
  e: 'solid', c: {mode: 'cylinder-net', r: 2, h: 5}, m: ['The rectangle’s length is the diameter', 'Forgetting one base'],
  q: [N('r = 2 cm, h = 5 cm. Lateral area with π ≈ 3.14 (cm²)?', 62.8, '2 × 3.14 × 2 × 5.')],
  x: ['Wrap paper around a can to check the formula.'], f: 'S_{\\text{lat}} = 2\\pi r h,\\quad S = 2\\pi r h + 2\\pi r^2',
});
g.k('g6-cylinder-volume', 'Cylinder volume', '圆柱的体积', {
  d: 'Slice a cylinder into sectors and rearrange into an almost-cuboid: base area × height.', t: ['Cylinder volume', 'Measuring irregular volumes', 'Composite solids'],
  o: ['Derive V = S × h', 'Measure an irregular volume by water displacement'], pre: ['g6-circle-area', 'g5-volume-meaning'], rel: ['g6-cone-pour'],
  e: 'solid', c: {mode: 'cylinder-volume', r: 3, h: 4}, m: ['V = 2πrh', 'Displacement measures mass'],
  q: [N('r = 3 cm, h = 4 cm. Volume with π ≈ 3.14 (cm³)?', 113.04, '3.14 × 9 × 4.')],
  x: ['Measure the volume of a stone using a measuring cylinder.'], f: 'V = \\pi r^2 h',
});
g.k('g6-cone-pour', 'Signature: Three cones fill one cylinder', '招牌动画：圆锥倒水实验', {
  d: 'With equal base and height, it takes three cones of water to fill the cylinder.', t: ['Cones', 'Cone bases', 'Cone height', 'Cone volume', 'Relationship between cylinders and cones', 'Equal-base and equal-height volume comparison'],
  o: ['Discover V_cone = 1/3 V_cylinder experimentally', 'Apply the cone volume formula'], pre: ['g6-cylinder-volume'], rel: ['g5-capacity'],
  e: 'solid', c: {mode: 'cone-pour', r: 3, h: 6}, m: ['A cone is half a cylinder', 'The 1/3 rule holds for any cone and cylinder'],
  q: [N('A cylinder holds 90 mL. A cone with the same base and height holds? (mL)', 30, '1/3 of 90.'), N('Cone r = 3 cm, h = 6 cm. Volume (π ≈ 3.14, cm³)?', 56.52, '3.14 × 9 × 6 ÷ 3.')],
  x: ['A cone and cylinder have equal volume and equal base. How do their heights compare?'], f: 'V_{\\text{cone}} = \\tfrac13 \\pi r^2 h',
});

g.chapter('g6-transform', 'Position, Scale and Transformations', '位置、比例尺与图形的运动', 'geometry', 'Zoom maps, scale shapes and move them precisely.');
g.k('g6-scale', 'Scale: map distance and actual distance', '比例尺', {
  d: 'A scale 1 : 50,000 means 1 cm on the map is 50,000 cm (500 m) in reality.', t: ['Scale', 'Map distance', 'Actual distance', 'Scale calculations'],
  o: ['Convert map distances using a scale', 'Choose scales for maps'], pre: ['g6-proportion', 'g2-length-units'], rel: ['g6-enlarge'],
  e: 'measure', c: {mode: 'scale', scale: 50000, map: 6}, m: ['Forgetting unit conversion', 'Larger denominator means more detail'],
  q: [N('Scale 1 : 50,000. 6 cm on the map = ? km', 3, '300,000 cm = 3 km.')],
  x: ['Draw your classroom at a scale of 1 : 100.'],
});
g.k('g6-enlarge', 'Enlargement and reduction', '图形的放大与缩小', {
  d: 'Enlarging by 2 doubles every length, keeps angles, and makes area four times as large.', t: ['Enlargement', 'Reduction'],
  o: ['Enlarge and reduce shapes by a scale factor', 'Relate length and area scale factors'], pre: ['g6-ratio'], rel: ['g6-cake'],
  e: 'transform', c: {mode: 'scale', k: 2}, m: ['Area doubles when lengths double', 'Angles grow when enlarged'],
  q: [N('A 3 × 2 rectangle enlarged by factor 2. New area?', 24, '6 × 4.')],
  x: ['Photocopy a picture at 50%. What happens to its area?'],
});
g.k('g6-rotation', 'Rotation', '图形的旋转', {
  d: 'Rotation turns every point about a centre through the same angle; distances to the centre stay fixed.', t: ['Rotation', 'Translation'],
  o: ['Rotate shapes 90° about a point', 'Identify centre, direction and angle'], pre: ['g4-transformations'],
  e: 'transform', c: {mode: 'rotate', angle: 90}, m: ['Rotating about the wrong point', 'Mixing clockwise and anticlockwise'],
  q: [M('After a 90° clockwise rotation, an arrow pointing up points…', ['Right', 'Left', 'Down'], 'Right', 'Clockwise from up is right.')],
  x: ['Design a windmill pattern with four 90° rotations.'],
});
g.k('g6-symmetry', 'Reflection, symmetry and pattern design', '轴对称与图案设计', {
  d: 'Reflection flips a shape across a line; each point and its image are equally far from the line.', t: ['Reflection', 'Symmetry', 'Completing symmetric figures', 'Geometric pattern design'],
  o: ['Reflect shapes and complete symmetric figures', 'Design patterns with transformations'], pre: ['g4-transformations'],
  e: 'transform', c: {mode: 'reflect'}, m: ['Reflection is the same as translation', 'Measuring along the grid diagonally'],
  q: [M('A point is 3 squares left of a vertical mirror. Its image is…', ['3 squares right', '6 squares right', '3 squares left'], '3 squares right', 'Equal distance on the other side.')],
  x: ['Create a symmetric paper-cut pattern.'],
});
g.k('g6-routes', 'Direction, position and route maps', '位置与方向（路线图）', {
  d: 'Describe positions by direction and distance, like “30° east of north, 300 m”.', t: ['Direction and position', 'Position using coordinates', 'Route maps'],
  o: ['Describe and draw routes with bearings and distances', 'Read route maps'], pre: ['g2-directions', 'g5-coordinates', 'g3-protractor'],
  e: 'coordinate', c: {mode: 'bearing', angle: 30, distance: 300}, m: ['北偏东30° measured from east', 'Ignoring the distance scale'],
  q: [M('“北偏东30°” is measured from…', ['North, turning toward east', 'East, turning toward north'], 'North, turning toward east', 'Start at north, turn 30° toward east.')],
  x: ['Describe your route to school using directions and distances.'],
});

g.k('g6-snowflake-group', 'Signature: A snowflake’s symmetries', '招牌动画：雪花的对称群', {
  d: 'Turn a snowflake by 60° or flip it over a mirror line and it looks the same. Its 12 moves combine like numbers do — the first taste of a group, the core idea of abstract algebra.', t: ['Rotation and axial symmetry', 'Composing moves', 'Groups (enrichment)'],
  o: ['Find every rotation and reflection that leaves a shape unchanged', 'Combine two symmetry moves into one'], pre: ['g6-rotation', 'g6-symmetry'], rel: ['g9-wallpaper'],
  e: 'journey', c: {mode: 'symmetry'}, m: ['Turning by 360° is a new move', 'The order of two moves never matters'],
  q: [N('How many symmetries (turns and flips, including doing nothing) does a square have?', 8, '4 turns + 4 flips.'), N('Turn a snowflake by 240°, then by 180°. What single turn between 0° and 359° does the same?', 60, '420° − 360° = 60°.')],
  x: ['Cut a paper snowflake. Mark one arm and find all 12 positions in which it fits back into its outline.'], f: '|D_6| = 12',
});
g.chapter('g6-stats', 'Statistics and Probability', '统计与可能性', 'statistics', 'Choose charts and run experiments to compare theory with observation.');
g.k('g6-pie', 'Pie charts and choosing a chart', '扇形统计图', {
  d: 'A pie chart shows each part as a percentage of the whole; bar and line charts suit other questions.', t: ['Statistical tables', 'Bar charts', 'Line charts', 'Pie charts', 'Percentage statistics'],
  o: ['Read and draw pie charts', 'Choose the best chart for a question'], pre: ['g6-percent-meaning', 'g5-line-charts', 'g6-annulus'],
  e: 'data', c: {mode: 'pie', values: [45, 30, 15, 10], labels: ['Reading', 'Sport', 'Music', 'Art']}, m: ['Pie charts show change over time', 'Slices from different wholes can be compared'],
  q: [N('A 90° slice of a pie chart is what percentage?', 25, '90 ÷ 360.')],
  x: ['Make a pie chart of how you spend a day.'],
});
g.k('g6-compare-datasets', 'Comparing datasets and trends', '数据比较与解释', {
  d: 'Compare means, totals and trends; ask whether the data really supports a conclusion.', t: ['Data collection', 'Data organization', 'Arithmetic mean', 'Data trends', 'Comparing datasets', 'Data interpretation', 'Reasoning from data'],
  o: ['Compare datasets using means and charts', 'Critique conclusions'], pre: ['g5-mean-interpret', 'g5-line-charts'],
  e: 'data', c: {mode: 'compare', values: [72, 75, 80, 78, 85], values2: [90, 60, 70, 95, 65]}, m: ['Same mean means same data', 'A trend proves a cause'],
  q: [N('Mean of 72, 75, 80, 78, 85?', 78, '390 ÷ 5.')],
  x: ['Find a misleading chart in an advertisement.'],
});
g.k('g6-likelihood', 'Certain, impossible and likely', '可能性', {
  d: 'Some events are certain, some impossible, and others more or less likely depending on the counts.', t: ['Random events', 'Certain and impossible events', 'Likelihood'],
  o: ['Classify events as certain, impossible or possible', 'Compare likelihoods from counts'], pre: ['g1-sorting'], rel: ['g6-experiments'],
  e: 'probability', c: {mode: 'certain', red: 6, blue: 2}, m: ['Unlikely means impossible', 'After 3 reds, blue is “due”'],
  q: [M('A bag has only red balls. Drawing red is…', ['Certain', 'Impossible', 'Possible'], 'Certain', 'Every ball is red.')],
  x: ['Design a spinner where blue is twice as likely as red.'],
});
g.k('g6-experiments', 'Coins, dice and spinners', '随机试验', {
  d: 'Repeat an experiment many times: the observed fraction settles near the theoretical probability.', t: ['Simple random experiments', 'Experimental probability'],
  o: ['Run and record random experiments', 'Compare experimental and theoretical results'], pre: ['g6-likelihood', 'g6-percent-meaning'],
  e: 'probability', c: {mode: 'dice', target: 6}, m: ['10 throws must give exactly 5 heads', 'Small samples are reliable'],
  q: [M('A fair die is thrown 600 times. About how many sixes?', ['About 100', 'Exactly 100', 'About 300'], 'About 100', '1/6 of 600, but not exactly.')],
  x: ['Toss a coin 50 times and record the running proportion of heads.'],
});
g.k('g6-balls', 'Coloured balls and experimental probability', '摸球实验', {
  d: 'With 3 red and 1 blue ball, red is drawn about 3/4 of the time in many draws.', t: ['Experimental probability', 'Random experiments'],
  o: ['Estimate bag contents from draws', 'Distinguish theoretical and observed results'], pre: ['g6-experiments'],
  e: 'probability', c: {mode: 'balls', red: 3, blue: 1}, m: ['Observed results equal theory exactly', 'Every colour is equally likely'],
  q: [N('3 red and 1 blue ball. Theoretical probability of red as a decimal?', 0.75, '3/4.')],
  x: ['Guess the contents of a hidden bag from 40 draws with replacement.'],
});

g.chapter('g6-reasoning', 'Mathematical Reasoning and Enrichment', '数学广角与综合应用', 'relationships', 'Explore real-world puzzles with multiple solution strategies.');
g.k('g6-chicken-rabbit', 'Chickens and rabbits', '鸡兔同笼', {
  d: '10 heads, 28 legs: assume all chickens (20 legs), each swap to a rabbit adds 2 legs → 4 rabbits.', t: ['Chicken and rabbit problems', 'Multiple solution strategies'],
  o: ['Solve with listing, assumption and equations', 'Compare strategies'], pre: ['g5-equation-word', 'g5-logic'],
  e: 'reasoning', c: {mode: 'chicken-rabbit', heads: 10, legs: 28}, m: ['Dividing legs by heads', 'Swapping in the wrong direction'],
  q: [N('10 heads and 28 legs. How many rabbits?', 4, '(28 − 20) ÷ 2.')],
  x: ['Make your own version with tricycles and bicycles.'],
});
g.k('g6-pigeonhole', 'The pigeonhole principle', '鸽巢问题', {
  d: 'Put 5 letters into 4 boxes and some box must hold at least 2.', t: ['Pigeonhole principle', 'Logical reasoning'],
  o: ['State and apply the pigeonhole principle', 'Find the worst case'], pre: ['g2-remainder'],
  e: 'reasoning', c: {mode: 'pigeonhole', items: 5, boxes: 4}, m: ['Every box must have 2', 'Confusing “at least” with “exactly”'],
  q: [N('13 students: at least how many share a birth month?', 2, '13 > 12 months.'), N('How many socks to be sure of a pair from 3 colours?', 4, 'Worst case: 3 different, then a 4th matches.')],
  x: ['Why must two people in your school share a birthday?'],
});
g.k('g6-combinatorics', 'Permutations and combinations', '排列与组合', {
  d: 'Ordered arrangements of A, B, C: 6; unordered pairs from 4 people: 6 handshakes.', t: ['Permutations', 'Combinations'],
  o: ['Count systematically with trees and tables', 'Tell when order matters'], pre: ['g5-planting'],
  e: 'reasoning', c: {mode: 'combinations', n: 4}, m: ['Counting AB and BA as different handshakes', 'Missing cases without a system'],
  q: [N('Handshakes among 5 people, once each?', 10, '4 + 3 + 2 + 1.'), N('Ways to arrange 3 books in a row?', 6, '3 × 2 × 1.')],
  x: ['How many 2-scoop cones from 5 flavours (order doesn’t matter)?'],
});
g.k('g6-work-rate', 'Work-rate problems', '工程问题', {
  d: 'If A finishes in 6 days and B in 3 days, each day they do 1/6 + 1/3 = 1/2 of the job together.', t: ['Work-rate problems', 'Ratios and mixtures'],
  o: ['Treat the whole job as 1', 'Combine rates'], pre: ['g5-add-unlike'],
  e: 'reasoning', c: {mode: 'work', a: 6, b: 3}, m: ['Adding days: 6 + 3', 'Averaging days'],
  q: [N('A finishes in 6 days, B in 3 days. Together, how many days?', 2, '1 ÷ (1/6 + 1/3).')],
  x: ['Two taps fill a tank in 4 h and 12 h. Together?'],
});
g.k('g6-travel', 'Travel and meeting problems', '行程问题', {
  d: 'Two vehicles approaching each other close the gap at the sum of their speeds.', t: ['Travel problems'],
  o: ['Solve meeting and catching-up problems', 'Use timelines and diagrams'], pre: ['g4-speed'],
  e: 'reasoning', c: {mode: 'travel', distance: 300, v1: 60, v2: 40}, m: ['Using one speed only', 'Subtracting speeds when meeting'],
  q: [N('300 km apart, speeds 60 and 40 km/h towards each other. Hours to meet?', 3, '300 ÷ 100.')],
  x: ['What if they drive in the same direction? When does the faster catch up?'],
});
g.k('g6-optimize', 'Optimization and planning', '最优化问题', {
  d: 'With 20 m of fence, try different rectangles: the square encloses the most area.', t: ['Optimization', 'Planting and spacing problems', 'Numerical patterns'],
  o: ['Compare outcomes systematically', 'Explain why one arrangement is best'], pre: ['g4-perim-vs-area'],
  e: 'reasoning', c: {mode: 'optimize', perimeter: 20}, m: ['Every rectangle with the same perimeter has the same area', 'Testing only a few cases'],
  q: [N('With 20 m of fence, what is the largest rectangular area (m²)?', 25, 'A 5 × 5 square.')],
  x: ['Fence against a wall (3 sides only). Which shape is best now?'],
});
g.k('g6-coding', 'Number coding', '数字编码', {
  d: 'A Chinese ID number encodes region, birth date, order and a check digit.', t: ['Number coding'],
  o: ['Decode the structure of an ID number', 'Explain the purpose of a check digit'], pre: ['g4-encoding'],
  e: 'reasoning', c: {mode: 'code', kind: 'id'}, m: ['ID digits are random', 'The last digit is part of the birthday'],
  q: [M('In an 18-digit ID, digits 7–14 show…', ['Date of birth', 'Region', 'Check digit'], 'Date of birth', 'YYYYMMDD.')],
  x: ['Invent a code for your class library with a check digit.'],
});

export const grade6 = g.done();
