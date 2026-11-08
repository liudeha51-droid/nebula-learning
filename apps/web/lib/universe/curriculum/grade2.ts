import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(2);

g.chapter('g2-numbers', 'Numbers up to 10,000', '万以内数的认识', 'number', 'See how ones, tens, hundreds and thousands are built by grouping in tens.');
g.k('g2-hundreds', 'Building numbers to 1,000', '千以内的数', {
  d: 'Ten ones make a ten, ten tens make a hundred; each digit counts groups of its place.', t: ['Numbers within 100', 'Numbers within 1,000', 'Ones, tens, hundreds and thousands', 'Place-value structure', 'Number composition', 'Number decomposition', 'Reading and writing numbers'],
  o: ['Build three-digit numbers with base-ten blocks', 'Read and write numbers to 1,000 in expanded form'], pre: ['g1-teens'], rel: ['g2-thousands', 'g2-add-carry'],
  e: 'place-value', c: {mode: 'build', places: 3, value: 254}, m: ['Writing “three hundred five” as 3005', 'Thinking the 5 in 254 is worth 5 ones'],
  q: [N('3 hundreds, 0 tens and 7 ones make what number?', 307, '300 + 0 + 7 = 307.'), M('In 482, the 8 is worth…', ['8', '80', '800'], '80', '8 is in the tens place.')],
  x: ['Make the largest and smallest three-digit numbers from the digits 4, 0, 9.'], f: '254 = 200 + 50 + 4',
});
g.k('g2-thousands', 'Numbers within 10,000', '万以内的数', {
  d: 'Ten hundreds make a thousand; zeros hold empty places.', t: ['Numbers within 10,000'],
  o: ['Build and read four-digit numbers', 'Explain the role of zero as a placeholder'], pre: ['g2-hundreds'], rel: ['g3-place-value'],
  e: 'place-value', c: {mode: 'build', places: 4, value: 3062}, m: ['Skipping the zero when reading 3062', 'Writing 3 thousands 6 tens as 36'],
  q: [N('Write “four thousand and twenty” in digits.', 4020, '4 thousands, 0 hundreds, 2 tens, 0 ones.')],
  x: ['How many hundreds are in 10,000?'],
});
g.k('g2-compare-order', 'Comparing and ordering numbers', '数的大小比较', {
  d: 'Compare digits from the highest place down; the first different place decides.', t: ['Comparing numbers', 'Ordering numbers'],
  o: ['Compare numbers place by place', 'Order a list of four-digit numbers'], pre: ['g2-hundreds', 'g1-compare'],
  e: 'place-value', c: {mode: 'compare', value: 4628, other: 4682}, m: ['Comparing the ones digits first', 'Thinking more digits shown on the left are smaller'],
  q: [M('Which is greater?', ['5,099', '5,190'], '5,190', 'Same thousands; 1 hundred > 0 hundreds.')],
  x: ['Arrange the heights of four mountains in order.'],
});
g.k('g2-estimate', 'Estimation and approximate numbers', '估数与近似数', {
  d: 'An approximate number is the nearest “round” number on the number line.', t: ['Estimation', 'Approximate numbers'],
  o: ['Locate a number between two hundreds', 'Choose the nearest hundred'], pre: ['g2-hundreds'], rel: ['g3-compare-estimate', 'g4-rounding'],
  e: 'number-line', c: {mode: 'round', value: 487, to: 100}, m: ['Always rounding down', 'Rounding to the wrong place'],
  q: [N('Which hundred is 487 closest to?', 500, '487 is 13 from 500 and 87 from 400.')],
  x: ['Estimate the number of words on a page, then count one line to check.'],
});
g.k('g2-num-patterns', 'Skip counting and number patterns', '数的规律', {
  d: 'Skip counting by the same number lights up a pattern on the hundred chart.', t: ['Numerical patterns'],
  o: ['Skip count by 2, 5 and 10', 'Describe a pattern on the hundred chart'], pre: ['g1-number-patterns'], rel: ['g2-times-tables', 'g5-factors'],
  e: 'factor', c: {mode: 'multiples', n: 5}, m: ['Losing count after crossing a hundred', 'Thinking all patterns go down columns'],
  q: [N('5, 10, 15, … what is the 8th number?', 40, '8 × 5 = 40.')],
  x: ['Colour multiples of 3 and 4 on a hundred chart. Which squares get both colours?'],
});

g.chapter('g2-addsub', 'Addition and Subtraction', '两位数、三位数加减法', 'operations', 'Regroup ten ones as a ten (and back) and match it to written calculation.');
g.k('g2-add-carry', 'Adding with regrouping', '进位加法', {
  d: 'When a column reaches ten or more, ten units exchange into one unit of the next place.', t: ['Two-digit addition', 'Carrying', 'Vertical calculations'],
  o: ['Explain carrying as an exchange of ten ones for one ten', 'Write vertical addition'], pre: ['g2-hundreds', 'g1-make-ten'], rel: ['g2-sub-borrow', 'g4-column-addsub'],
  e: 'column', c: {op: 'add', a: 47, b: 38}, m: ['Writing 15 in the ones column', 'Forgetting the carried ten'],
  q: [N('56 + 27 = ?', 83, '6 + 7 = 13: write 3, carry 1 ten. 5 + 2 + 1 = 8 tens.'), M('In 38 + 45, what is carried?', ['1 ten', '1 one', '13 ones'], '1 ten', '8 + 5 = 13 ones = 1 ten 3 ones.')],
  x: ['Find two numbers whose sum needs two carries.'],
});
g.k('g2-sub-borrow', 'Subtracting with regrouping', '退位减法', {
  d: 'When the top digit is too small, one ten breaks into ten ones.', t: ['Two-digit subtraction', 'Borrowing'],
  o: ['Explain borrowing as breaking a ten', 'Write vertical subtraction'], pre: ['g2-add-carry', 'g1-break-ten'], rel: ['g4-borrow-zeros'],
  e: 'column', c: {op: 'sub', a: 52, b: 27}, m: ['Subtracting the smaller digit from the larger in each column', 'Forgetting to reduce the tens after borrowing'],
  q: [N('63 − 28 = ?', 35, 'Break a ten: 13 − 8 = 5, 5 − 2 = 3 tens.'), N('80 − 34 = ?', 46, '10 − 4 = 6, 7 − 3 = 4.')],
  x: ['Why does 52 − 27 give the same answer as 55 − 30?'],
});
g.k('g2-three-digit', 'Three-digit addition and subtraction', '三位数加减法', {
  d: 'The same exchange rules work in every column: ten tens make a hundred.', t: ['Three-digit addition', 'Three-digit subtraction', 'Multi-step calculations'],
  o: ['Add and subtract three-digit numbers with regrouping', 'Handle two exchanges in one calculation'], pre: ['g2-add-carry', 'g2-sub-borrow'],
  e: 'column', c: {op: 'add', a: 368, b: 275}, m: ['Carrying only once when two columns overflow', 'Misaligning digits'],
  q: [N('368 + 275 = ?', 643, 'Two carries: ones and tens.'), N('500 − 164 = ?', 336, 'Break a hundred into tens and a ten into ones.')],
  x: ['Make the greatest sum using each of 1–6 once in two three-digit numbers.'],
});
g.k('g2-estimate-check', 'Estimating and checking', '估算与验算', {
  d: 'Estimate first to see if an answer is sensible; check subtraction by adding back.', t: ['Estimation', 'Verification', 'Real-world applications'],
  o: ['Estimate sums and differences', 'Verify subtraction with addition'], pre: ['g2-three-digit', 'g2-estimate'], rel: ['g3-mult-estimate'],
  e: 'column', c: {op: 'sub', a: 503, b: 268, check: true}, m: ['Thinking checking means redoing the same steps', 'Estimating with exact values'],
  q: [N('A student says 503 − 268 = 335. Add 268 + 335. What do you get?', 603, 'It is not 503, so 335 is wrong; the answer is 235.'), N('Estimate 398 + 211 to the nearest hundred.', 600, '400 + 200 = 600.')],
  x: ['Check last week’s homework by adding back.'],
});

g.chapter('g2-multiplication', 'Multiplication', '表内乘法', 'operations', 'See multiplication as equal groups, then as arrays.');
g.k('g2-mult-meaning', 'Equal groups become multiplication', '乘法的初步认识', {
  d: 'Repeated addition of equal groups is written as multiplication: 3 groups of 4 = 3 × 4.', t: ['Meaning of multiplication', 'Repeated addition', 'Multiplication expressions', 'Factors and products'],
  o: ['Write repeated addition as multiplication', 'Name factors and product'], pre: ['g1-repeated'], rel: ['g2-commutative', 'g2-share'],
  e: 'array', c: {mode: 'groups', rows: 3, cols: 4, object: 'apple'}, m: ['Writing 3 + 4 for 3 groups of 4', 'Thinking multiplication always makes “a lot more”'],
  q: [N('4 + 4 + 4 + 4 + 4 = 5 × ? ', 4, 'Five groups of 4.'), M('In 6 × 3 = 18, what is 18 called?', ['Factor', 'Product', 'Addend'], 'Product', 'The result of multiplying is the product.')],
  x: ['Find equal groups at home: eggs in a box, wheels on cars.'], f: '4 + 4 + 4 = 3 \\times 4 = 12',
});
g.k('g2-commutative', 'Why 3 × 4 = 4 × 3', '乘法交换律的初步感知', {
  d: 'Rotating an array swaps rows and columns without changing the number of objects.', t: ['Commutative property', 'Multiplication and addition relationships'],
  o: ['Explain commutativity by rotating an array', 'Use one fact to know another'], pre: ['g2-mult-meaning'], rel: ['g4-comm-assoc-mul'],
  e: 'array', c: {mode: 'commute', rows: 3, cols: 4, object: 'star'}, m: ['Believing 3 × 4 and 4 × 3 describe the same picture', 'Thinking the product changes when order changes'],
  q: [N('7 × 6 = 42, so 6 × 7 = ?', 42, 'An array turned on its side has the same objects.')],
  x: ['Which times-table facts do you get “for free” once you know 2×, 5× and 10×?'], f: '3 \\times 4 = 4 \\times 3',
});
g.k('g2-times-tables', 'Times tables from 1 to 9', '乘法口诀', {
  d: 'Each row of a times table adds one more group; patterns help remember the facts.', t: ['Multiplication tables', 'Multiplication facts from 1 to 9'],
  o: ['Build a times table one group at a time', 'Use known facts to derive others'], pre: ['g2-mult-meaning'], rel: ['g2-num-patterns'],
  e: 'array', c: {mode: 'table', n: 6}, m: ['Treating facts as unrelated', 'Mixing up 6 × 8 and 6 + 8'],
  q: [N('6 × 8 = ?', 48, '6 × 8 = 6 × 5 + 6 × 3 = 30 + 18.'), N('9 × 7 = ?', 63, '10 × 7 − 7 = 63.')],
  x: ['Look at the ones digits of the 9 times table. What pattern appears?'],
});
g.k('g2-mult-problems', 'Multiplication in real situations', '用乘法解决问题', {
  d: 'Equal rows in gardens, seats and boxes are multiplication arrays.', t: ['Practical multiplication problems'],
  o: ['Recognise equal-group situations', 'Write and solve the matching multiplication'], pre: ['g2-mult-meaning'], rel: ['g3-area-model'],
  e: 'array', c: {mode: 'groups', rows: 5, cols: 6, object: 'flower'}, m: ['Multiplying numbers that are not group sizes', 'Adding when groups are equal'],
  q: [N('A cinema has 7 rows with 8 seats each. How many seats?', 56, '7 × 8 = 56.')],
  x: ['Count the windows of a building without counting one by one.'],
});

g.chapter('g2-division', 'Division', '表内除法', 'operations', 'Share equally and form equal groups; connect division back to multiplication.');
g.k('g2-share', 'Equal sharing', '平均分', {
  d: 'Sharing deals objects out one at a time so everyone gets the same amount.', t: ['Meaning of division', 'Equal sharing', 'Dividend', 'Divisor', 'Quotient'],
  o: ['Share objects equally', 'Name dividend, divisor and quotient'], pre: ['g2-mult-meaning'], rel: ['g2-group', 'g3-equal-parts'],
  e: 'division', c: {mode: 'share', total: 12, divisor: 3}, m: ['Unequal shares still count as division', 'Confusing divisor and quotient'],
  q: [N('12 cookies are shared equally by 4 children. How many each?', 3, '12 ÷ 4 = 3.'), M('In 15 ÷ 3 = 5, which is the divisor?', ['15', '3', '5'], '3', 'The divisor is what we divide by.')],
  x: ['Share 20 beans among 3, 4 and 5 cups. What happens with 3 cups?'], f: '12 \\div 3 = 4',
});
g.k('g2-group', 'Grouping: how many groups?', '包含除', {
  d: 'Division also asks “how many groups of this size fit?”.', t: ['Grouping'],
  o: ['Solve grouping problems', 'Compare grouping with sharing'], pre: ['g2-share'], rel: ['g6-frac-divide'],
  e: 'division', c: {mode: 'group', total: 15, divisor: 5}, m: ['Thinking division only means sharing between people', 'Confusing group size with number of groups'],
  q: [N('18 eggs go in boxes of 6. How many boxes?', 3, '18 ÷ 6 = 3.')],
  x: ['Write a sharing story and a grouping story for 24 ÷ 6.'],
});
g.k('g2-remainder', 'Remainders', '有余数的除法', {
  d: 'When objects do not divide equally, the leftover is the remainder and it is always smaller than the divisor.', t: ['Remainders', 'Remainder less than divisor'],
  o: ['Find quotient and remainder', 'Explain why remainder < divisor'], pre: ['g2-group'], rel: ['g3-long-division'],
  e: 'division', c: {mode: 'remainder', total: 17, divisor: 5}, m: ['Allowing a remainder equal to the divisor', 'Ignoring the remainder in context'],
  q: [M('17 ÷ 5 = 3 R?', ['2', '5', '3'], '2', '3 × 5 = 15; 17 − 15 = 2.'), M('Which remainder is impossible when dividing by 4?', ['3', '1', '5'], '5', 'Five left over would make another group of 4.')],
  x: ['22 children ride boats of 4. How many boats are needed? Why not 5?'], f: '17 = 5 \\times 3 + 2',
});
g.k('g2-mult-div', 'Multiplication and division are inverses', '乘除法的关系', {
  d: 'Playing a division backwards is a multiplication; one array gives four related facts.', t: ['Multiplication and division relationships', 'Division facts', 'Real-world division problems'],
  o: ['Write a fact family from one array', 'Use multiplication to check division'], pre: ['g2-share', 'g2-times-tables'], rel: ['g3-div-two-digit'],
  e: 'division', c: {mode: 'inverse', total: 24, divisor: 4}, m: ['Thinking 24 ÷ 4 = 4 ÷ 24', 'Not connecting known times facts'],
  q: [N('If 7 × 8 = 56, what is 56 ÷ 8?', 7, 'Division undoes multiplication.')],
  x: ['Make fact-family triangles for 3, 9 and 27.'], f: '4 \\times 6 = 24 \\iff 24 \\div 4 = 6',
});

g.chapter('g2-geometry', 'Geometry and Direction', '图形与方向', 'geometry', 'Build a city from shapes, observe solids and navigate with compass directions.');
g.k('g2-shape-city', 'The geometric city', '图形的拼组与分解', {
  d: 'Buildings decompose into rectangles, squares, triangles, parallelograms and circles.', t: ['Rectangles', 'Squares', 'Triangles', 'Parallelograms', 'Circles', 'Shape composition', 'Shape decomposition'],
  o: ['Decompose a figure into basic shapes', 'Count the shapes in a composite figure'], pre: ['g1-compose-shapes'], rel: ['g3-rearrange'],
  e: 'shapes', c: {mode: 'city'}, m: ['Missing overlapping shapes', 'Counting a square as not a rectangle'],
  q: [N('A house is a square with a triangle roof and a rectangle door. How many shapes?', 3, 'Square, triangle, rectangle.')],
  x: ['Design a building and count its shapes.'],
});
g.k('g2-solid-views', 'Observing solid objects', '观察物体', {
  d: 'The same object looks different from the front, side and top.', t: ['Solid-object observation'],
  o: ['Match views to viewpoints', 'Predict a view before rotating'], pre: ['g1-solids'], rel: ['g4-views'],
  e: 'solid', c: {mode: 'views', shape: 'cylinder'}, m: ['Thinking you can see the back of an object', 'Drawing depth in a flat view'],
  q: [M('A cylinder standing upright, seen from the top, looks like a…', ['Circle', 'Rectangle', 'Triangle'], 'Circle', 'From above you see its circular face.')],
  x: ['Photograph a mug from three directions.'],
});
g.k('g2-directions', 'East, west, north and south', '认识方向', {
  d: 'Compass directions are fixed: north is opposite south, east opposite west; maps put north at the top.', t: ['Cardinal directions', 'East, west, north and south', 'Maps and simple routes'],
  o: ['Follow and give direction instructions', 'Describe a route on a map'], pre: ['g1-position'], rel: ['g5-coordinates', 'g6-routes'],
  e: 'coordinate', c: {mode: 'directions'}, m: ['Thinking “left” and “west” are the same', 'Placing east on the left of a map'],
  q: [M('On a map, north is at the top. Which direction is on the right?', ['East', 'West', 'South'], 'East', 'Facing north, east is on the right.')],
  x: ['Draw a map from your home to school with four directions.'],
});

g.chapter('g2-measure-time', 'Measurement and Time', '长度单位与时间', 'relationships', 'Choose suitable units and calculate elapsed time.');
g.k('g2-length-units', 'From millimetres to kilometres', '长度单位：毫米到千米', {
  d: 'The same length can be described with different units; smaller units need bigger numbers.', t: ['Millimeters', 'Centimeters', 'Decimeters', 'Meters', 'Kilometers', 'Length conversions'],
  o: ['Choose appropriate units', 'Convert between mm, cm, dm, m and km'], pre: ['g1-ruler'], rel: ['g3-length-km', 'g6-scale'],
  e: 'measure', c: {mode: 'units', focus: 'm'}, m: ['Larger unit means larger number', 'Thinking 1 km = 100 m'],
  q: [N('How many millimetres in 3 cm?', 30, '1 cm = 10 mm.'), N('How many metres in 2 km?', 2000, '1 km = 1000 m.')],
  x: ['Measure a step length and estimate how many steps make 1 km.'], f: '1\\,\\text{km}=1000\\,\\text{m},\\;1\\,\\text{m}=10\\,\\text{dm}=100\\,\\text{cm}=1000\\,\\text{mm}',
});
g.k('g2-time', 'Hours, minutes and seconds', '认识时、分、秒', {
  d: 'The minute hand goes round once each hour while the hour hand moves one number.', t: ['Hours', 'Minutes', 'Seconds', 'Time conversions'],
  o: ['Read time to the minute', 'Convert between hours, minutes and seconds'], pre: ['g1-clock'], rel: ['g2-elapsed'],
  e: 'clock', c: {mode: 'read', step: 5, h: 8, m: 40}, m: ['Reading 8:40 as 9:40 because the hour hand is near 9', 'Thinking 1 hour = 100 minutes'],
  q: [N('How many minutes are in 2 hours?', 120, '2 × 60 = 120.'), M('The hour hand is between 3 and 4; the minute hand is on 6. What time is it?', ['3:30', '4:30', '6:15'], '3:30', 'Halfway past 3.')],
  x: ['Count how many times your heart beats in one minute.'], f: '1\\,\\text{h} = 60\\,\\text{min},\\; 1\\,\\text{min} = 60\\,\\text{s}',
});
g.k('g2-elapsed', 'Elapsed time on a timeline', '经过的时间', {
  d: 'Elapsed time is the distance between two points on a timeline; jump to whole hours first.', t: ['Elapsed time'],
  o: ['Calculate elapsed time using jumps', 'Find an end time from a start time and duration'], pre: ['g2-time'], rel: ['g3-24h', 'g4-speed'],
  e: 'clock', c: {mode: 'elapsed', start: 470, end: 615}, m: ['Subtracting times as decimals', 'Crossing an hour incorrectly'],
  q: [N('A lesson starts at 9:40 and ends at 10:25. How many minutes long is it?', 45, '20 minutes to 10:00, then 25 more.')],
  x: ['Make a timeline of your Saturday.'],
});
g.k('g2-calendar', 'Calendar basics', '认识日历', {
  d: 'A year has 12 months; months have 28–31 days and weeks have 7 days.', t: ['Calendar basics'],
  o: ['Read dates on a calendar', 'Count days between dates'], pre: ['g2-time'], rel: ['g3-calendar'],
  e: 'clock', c: {mode: 'calendar', year: 2026, month: 9}, m: ['Every month has 30 days', 'Counting both start and end days without thinking'],
  q: [N('How many days are in a week?', 7, '7 days.'), N('How many months have 31 days?', 7, 'Jan, Mar, May, Jul, Aug, Oct, Dec.')],
  x: ['Use your knuckles to remember which months have 31 days.'],
});

g.chapter('g2-data', 'Data and Statistics', '数据收集整理', 'statistics', 'Collect data from a scene and organise it into tables.');
g.k('g2-collect', 'Collecting and organising data', '数据的收集与整理', {
  d: 'Tally marks record observations; a table organises the counts so we can answer questions.', t: ['Data classification', 'Data collection', 'Data organization', 'Simple tables'],
  o: ['Tally observations by category', 'Turn tallies into a table'], pre: ['g1-sorting'], rel: ['g2-tables', 'g3-bar-chart'],
  e: 'data', c: {mode: 'collect', topic: 'animals'}, m: ['Counting the same observation twice', 'Writing tallies without groups of five'],
  q: [N('A tally shows one bundle of five marks and 3 single marks. How many is that?', 8, 'One group of five plus 3.')],
  x: ['Survey your class: favourite fruit. Make a table.'],
});
g.k('g2-tables', 'Reading tables and comparing categories', '看表回答问题', {
  d: 'Tables and simple charts let us compare categories and answer “how many more?”.', t: ['Counting categories', 'Comparing quantities', 'Answering questions using data'],
  o: ['Compare categories in a table', 'Answer “how many more/fewer” questions'], pre: ['g2-collect'], rel: ['g3-bar-chart'],
  e: 'data', c: {mode: 'bar', values: [6, 9, 4, 7], labels: ['Apple', 'Banana', 'Pear', 'Grape'], scale: 1}, m: ['Reading the wrong row', 'Adding when asked how many more'],
  q: [N('Bananas: 9, pears: 4. How many more bananas than pears?', 5, '9 − 4 = 5.')],
  x: ['Ask a question your table cannot answer. What data would you need?'],
});

export const grade2 = g.done();
