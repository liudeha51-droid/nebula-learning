import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(1);

g.chapter('g1-numbers', 'Numbers and Counting', '数与计数', 'number', 'Develop number sense: count, compose and compare numbers to 20.');
g.k('g1-count-to-10', 'Counting objects from 0 to 10', '数一数：0～10', {
  d: 'Count a set by touching each object once; the last number said tells how many.', t: ['Counting objects', 'Numbers from 0 to 10', 'Number sequences'],
  o: ['Count up to 10 objects with one-to-one correspondence', 'Understand that the last number counted gives the total, whatever the arrangement'],
  rel: ['g1-zero', 'g1-compare'], e: 'counting', c: {mode: 'count', n: 7, object: 'star'},
  m: ['Counting an object twice or skipping one', 'Thinking that spreading objects out makes more of them'],
  q: [N('Lily counts 1, 2, 3, 4, 5, 6 apples. How many apples are there?', 6, 'The last number counted, 6, tells how many.'), M('8 stars are moved into a long line. How many stars now?', ['More than 8', '8', 'Fewer than 8'], '8', 'Moving objects does not change how many there are.')],
  x: ['Count the same toys in a circle, a line and a pile. Does the number change?'],
});
g.k('g1-zero', 'The meaning of zero', '认识0', {
  d: 'Zero is the number for “none”, and it comes before 1 on the number line.', t: ['Meaning of zero'],
  o: ['Use 0 to describe an empty set', 'Place 0 on the number line before 1'], pre: ['g1-count-to-10'], rel: ['g6-negatives'],
  e: 'counting', c: {mode: 'zero', n: 4, object: 'apple'}, m: ['Believing zero is “not a number”', 'Starting the number line at 1'],
  q: [N('A basket had 5 eggs. All 5 were used. How many are left?', 0, '5 − 5 = 0.'), M('Which number comes just before 1?', ['0', '2', '10'], '0', 'Zero comes before one.')],
  x: ['Find three places where zero is used: a ruler, a thermometer, a lift.'],
});
g.k('g1-ordinal', 'How many and which one', '几个和第几', {
  d: 'Cardinal numbers tell how many; ordinal numbers tell position in an order.', t: ['Cardinal numbers and ordinal numbers'],
  o: ['Distinguish “4 children” from “the 4th child”', 'Find positions counted from either end'], pre: ['g1-count-to-10'],
  e: 'counting', c: {mode: 'ordinal', n: 7, a: 4, object: 'chick'}, m: ['Circling only one object for “4”', 'Counting from the wrong end'],
  q: [N('In a line of 9 children, Tom is 3rd from the front. What is his position from the back?', 7, '6 children are behind him, so he is 7th from the back.')],
  x: ['Line up 6 toys. Ask a friend: “Which is 2nd from the left?”'],
});
g.k('g1-number-bonds', 'Number bonds within 10', '10以内数的组成', {
  d: 'A number can be split into two parts and recombined; every split makes the same whole.', t: ['Number composition and decomposition', 'Number bonds within 10'],
  o: ['List all ways to split a number up to 10', 'Find a missing part of a number bond'], pre: ['g1-count-to-10'], rel: ['g1-make-ten', 'g1-add-meaning'],
  e: 'counting', c: {mode: 'bond', n: 8, a: 3, object: 'flower'}, m: ['Missing the splits with 0', 'Thinking 3 + 5 and 5 + 3 are different wholes'],
  q: [N('10 = 6 + ?', 4, '6 and 4 make 10.'), N('How many ways can 6 be split into two parts, including 0 + 6?', 7, '0+6, 1+5, 2+4, 3+3, 4+2, 5+1, 6+0.')],
  x: ['Use 10 fingers: show every way to make 10 with two hands.'], f: '8 = 3 + 5',
});
g.k('g1-teens', 'Numbers 11 to 20: tens and ones', '11～20：十和几', {
  d: 'Ten ones group into one ten; teen numbers are one ten and some ones.', t: ['Numbers from 11 to 20', 'Place-value introduction', 'Tens and ones'],
  o: ['Represent 11–20 as one ten and ones', 'Read the tens digit and ones digit'], pre: ['g1-count-to-10'], rel: ['g2-hundreds'],
  e: 'counting', c: {mode: 'teen', n: 14, object: 'star'}, m: ['Reading 14 as “four-one”', 'Thinking the 1 in 14 means one object'],
  q: [M('In 17, what does the 1 mean?', ['1 one', '1 ten', '7 tens'], '1 ten', 'The left digit counts tens.'), N('1 ten and 6 ones make what number?', 16, '10 + 6 = 16.')],
  x: ['Bundle 10 straws with a band. Make 13, 18 and 20.'], f: '14 = 10 + 4',
});
g.k('g1-compare', 'Comparing and ordering quantities', '比较多少和大小', {
  d: 'Match objects one to one; leftovers show which is more. Symbols >, < and = record comparisons.', t: ['Comparing quantities', 'Greater than, less than and equal to', 'Number ordering'],
  o: ['Compare two sets by one-to-one matching', 'Use >, < and = correctly', 'Order numbers to 20'], pre: ['g1-count-to-10'], rel: ['g2-compare-order'],
  e: 'counting', c: {mode: 'compare', a: 6, b: 4, object: 'fish'}, m: ['Judging by length of row instead of number', 'Reversing the > symbol'],
  q: [M('Choose the symbol: 9 ? 12', ['>', '<', '='], '<', '9 comes before 12, so 9 < 12.'), M('Which list is ordered from smallest to largest?', ['3, 8, 5', '3, 5, 8', '8, 5, 3'], '3, 5, 8', 'Each number is bigger than the one before.')],
  x: ['Spread 5 coins far apart and 7 coins close together. Which has more?'],
});
g.k('g1-number-patterns', 'Simple number patterns', '简单的数的规律', {
  d: 'Numbers can grow by the same step each time; spotting the step lets us predict what comes next.', t: ['Simple numerical patterns'],
  o: ['Continue a number pattern that adds the same amount', 'Describe the rule in words'], pre: ['g1-count-to-10'], rel: ['g1-patterns', 'g2-num-patterns'],
  e: 'sorting', c: {mode: 'number-pattern', start: 2, step: 2}, m: ['Looking only at the last number', 'Assuming every pattern adds 1'],
  q: [N('2, 4, 6, 8, ? What comes next?', 10, 'The pattern adds 2 each time.'), N('20, 18, 16, ? What comes next?', 14, 'The pattern takes away 2 each time.')],
  x: ['Make your own pattern on a number line and challenge a friend.'],
});

g.chapter('g1-addsub', 'Addition and Subtraction', '加法和减法', 'operations', 'Understand adding as joining and subtracting as taking away, with flexible strategies to 20.');
g.k('g1-add-meaning', 'Putting together: addition', '合起来：加法', {
  d: 'Addition joins two groups into one; the total does not depend on which group comes first.', t: ['Meaning of addition', 'Addition within 5', 'Addition within 10'],
  o: ['Model addition by joining groups', 'Write an addition sentence for a picture'], pre: ['g1-number-bonds'], rel: ['g1-sub-meaning'],
  e: 'objects', c: {mode: 'add', a: 3, b: 2, object: 'apple'}, m: ['Counting the combined group from scratch every time', 'Thinking the + sign means “write the bigger number”'],
  q: [N('4 + 3 = ?', 7, 'Join 4 and 3: 7 altogether.'), N('There are 2 red balloons and 5 blue balloons. How many balloons?', 7, '2 + 5 = 7.')],
  x: ['Tell an addition story about your breakfast.'], f: '3 + 2 = 5',
});
g.k('g1-sub-meaning', 'Taking away: subtraction', '去掉：减法', {
  d: 'Subtraction removes part of a group; what is left is the difference.', t: ['Meaning of subtraction', 'Subtraction within 5', 'Subtraction within 10'],
  o: ['Model subtraction by removing objects', 'Connect subtraction to number bonds'], pre: ['g1-number-bonds'], rel: ['g1-add-meaning', 'g1-break-ten'],
  e: 'objects', c: {mode: 'subtract', a: 5, b: 2, object: 'fish'}, m: ['Subtracting the smaller from the larger whatever the order', 'Counting the removed objects as the answer'],
  q: [N('9 − 4 = ?', 5, 'Take 4 away from 9 and 5 remain.'), N('7 birds sit on a wire. 3 fly away. How many stay?', 4, '7 − 3 = 4.')],
  x: ['Show 8 − 3 with fingers, then 8 − 5. What do you notice?'], f: '5 - 2 = 3',
});
g.k('g1-make-ten', 'Making ten: adding within 20', '凑十法', {
  d: 'Move ones to complete a ten, then add the rest: 8 + 5 = 8 + 2 + 3 = 13.', t: ['Addition within 20', 'Making ten', 'Carrying in addition'],
  o: ['Use the make-ten strategy for sums over 10', 'Compare make-ten with counting on'], pre: ['g1-number-bonds', 'g1-teens', 'g1-add-meaning'], rel: ['g2-add-carry'],
  e: 'objects', c: {mode: 'make-ten', a: 8, b: 5, object: 'star'}, m: ['Splitting the wrong addend', 'Forgetting the leftover ones after making ten'],
  q: [N('9 + 6 = ?', 15, '9 + 1 = 10, then 10 + 5 = 15.'), M('To work out 7 + 5 by making ten, split 5 into…', ['3 and 2', '4 and 1', '5 and 0'], '3 and 2', '7 needs 3 to make 10; 2 are left.')],
  x: ['Find a sum where it is easier to make ten with the first number.'], f: '8 + 5 = 8 + 2 + 3 = 10 + 3 = 13',
});
g.k('g1-break-ten', 'Breaking ten: subtracting within 20', '破十法', {
  d: 'When there are not enough ones, take from the ten: 13 − 5 = 10 − 5 + 3 = 8.', t: ['Subtraction within 20', 'Breaking ten', 'Borrowing in subtraction'],
  o: ['Subtract across ten by breaking a ten', 'Check subtraction with addition'], pre: ['g1-teens', 'g1-sub-meaning'], rel: ['g2-sub-borrow', 'g1-make-ten'],
  e: 'objects', c: {mode: 'break-ten', a: 13, b: 5, object: 'ball'}, m: ['Computing 5 − 3 instead of 13 − 5', 'Losing the original ones'],
  q: [N('15 − 7 = ?', 8, '10 − 7 = 3, 3 + 5 = 8.'), N('12 − 9 = ?', 3, '10 − 9 = 1, 1 + 2 = 3.')],
  x: ['Try 14 − 6 two ways: break ten, and count back.'], f: '13 - 5 = (10 - 5) + 3 = 8',
});
g.k('g1-repeated', 'Repeated addition and subtraction', '连加与连减', {
  d: 'Adding equal groups again and again builds a total; taking the same amount repeatedly counts down.', t: ['Repeated addition', 'Repeated subtraction'],
  o: ['Compute 3 + 3 + 3 + 3 with equal groups', 'Count how many times a group can be taken away'], pre: ['g1-add-meaning', 'g1-sub-meaning'], rel: ['g2-mult-meaning', 'g2-group'],
  e: 'objects', c: {mode: 'repeated', a: 3, b: 4, object: 'flower'}, m: ['Losing count of how many groups were added', 'Adding the number of groups instead of group sizes'],
  q: [N('2 + 2 + 2 + 2 + 2 = ?', 10, 'Five groups of 2 make 10.'), N('Start at 12 and take away 3 again and again. How many times until you reach 0?', 4, '12 → 9 → 6 → 3 → 0: four times.')],
  x: ['Count pairs of socks by twos. How does this connect to multiplication?'],
});
g.k('g1-word-problems', 'Mixed operations and story problems', '加减混合与解决问题', {
  d: 'Story problems combine joining and taking away; act them out step by step.', t: ['Mixed addition and subtraction', 'Practical word problems'],
  o: ['Solve two-step stories with + and −', 'Decide which operation a story needs'], pre: ['g1-make-ten', 'g1-break-ten'], rel: ['g3-order-ops'],
  e: 'objects', c: {mode: 'mixed', a: 9, b: 4, c2: 3, object: 'chick'}, m: ['Using every number in the order it appears without thinking', 'Choosing + because of the word “more”'],
  q: [N('A bus has 9 people. 4 get off, then 3 get on. How many are on the bus?', 8, '9 − 4 + 3 = 8.'), N('8 + 7 − 5 = ?', 10, '8 + 7 = 15, 15 − 5 = 10.')],
  x: ['Write your own bus story and act it out with toys.'], f: '9 - 4 + 3 = 8',
});

g.chapter('g1-shapes', 'Shapes and Spatial Awareness', '认识图形与位置', 'geometry', 'Recognise solids and flat shapes, compose them, and describe position.');
g.k('g1-solids', 'Solid shapes', '认识立体图形', {
  d: 'Cubes, cuboids, cylinders and spheres have different faces; rotating them reveals their properties.', t: ['Cubes', 'Cuboids', 'Cylinders', 'Spheres', 'Plane shapes and solid objects'],
  o: ['Name the four basic solids', 'Describe whether a solid rolls, stacks or slides'], rel: ['g1-plane-shapes', 'g2-solid-views'],
  e: 'solid', c: {mode: 'explore', shape: 'cube'}, m: ['Calling a cube a square', 'Thinking a cylinder has no flat faces'],
  q: [M('Which solid can roll in any direction?', ['Cube', 'Cylinder', 'Sphere'], 'Sphere', 'A sphere is curved everywhere.'), M('Which solid has 6 square faces?', ['Cube', 'Cuboid with different lengths', 'Cylinder'], 'Cube', 'All six faces of a cube are equal squares.')],
  x: ['Find a cuboid, a cylinder and a sphere in your kitchen.'],
});
g.k('g1-plane-shapes', 'Flat shapes from solid faces', '认识平面图形', {
  d: 'Tracing the faces of solids reveals rectangles, squares, triangles, circles and parallelograms.', t: ['Rectangles', 'Squares', 'Triangles', 'Circles', 'Parallelograms', 'Shape classification'],
  o: ['Name flat shapes by sides and corners', 'Classify shapes by properties, not by turning'], pre: ['g1-solids'], rel: ['g3-polygons'],
  e: 'shapes', c: {mode: 'classify'}, m: ['A turned square is a “diamond”, not a square', 'A long thin triangle is not a triangle'],
  q: [M('How many corners does a triangle have?', ['3', '4', '0'], '3', 'Tri- means three.'), M('Tracing the bottom of a cylinder makes which shape?', ['Circle', 'Square', 'Triangle'], 'Circle', 'Its flat faces are circles.')],
  x: ['Print shapes by stamping the faces of blocks in paint.'],
});
g.k('g1-compose-shapes', 'Building and splitting shapes', '图形的拼组', {
  d: 'Shapes combine into new shapes and split into smaller ones; two triangles can make a square.', t: ['Shape composition', 'Shape decomposition', 'Basic spatial patterns'],
  o: ['Compose a picture from basic shapes', 'Predict which shapes fit together'], pre: ['g1-plane-shapes'], rel: ['g2-shape-city', 'g5-triangle'],
  e: 'shapes', c: {mode: 'compose'}, m: ['Thinking a shape changes when it is turned', 'Assuming only identical shapes fit together'],
  q: [N('How many identical triangles can make a square if you cut it corner to corner once?', 2, 'One diagonal cut makes 2 triangles.'), M('Two equal squares placed side by side make a…', ['Rectangle', 'Circle', 'Triangle'], 'Rectangle', 'The new shape is twice as long as it is wide.')],
  x: ['Make a rocket from 1 rectangle and 3 triangles.'],
});
g.k('g1-position', 'Above, below, left, right, in front and behind', '位置：上下、左右、前后', {
  d: 'Position words describe where something is compared to something else and depend on viewpoint.', t: ['Position: above, below, left, right, in front and behind'],
  o: ['Describe position with the correct word', 'Recognise that left and right depend on the viewer'], rel: ['g2-directions'],
  e: 'shapes', c: {mode: 'position'}, m: ['Mixing up the viewer’s left with another person’s left', 'Describing position without a reference object'],
  q: [M('A cat sits on a box. The box is ___ the cat.', ['above', 'below', 'left of'], 'below', 'The cat is above, so the box is below.')],
  x: ['Play “I spy” using only position words.'],
});

g.chapter('g1-measure', 'Measurement', '认识长度', 'relationships', 'Compare lengths directly and measure them with centimetres and metres.');
g.k('g1-compare-length', 'Comparing lengths, heights and distances', '比较长短、高矮', {
  d: 'To compare lengths fairly, line up the starting ends.', t: ['Comparing lengths', 'Comparing heights', 'Comparing distances'],
  o: ['Compare two lengths by aligning one end', 'Explain why misaligned starts mislead'], rel: ['g1-ruler'],
  e: 'measure', c: {mode: 'compare'}, m: ['Comparing only the right-hand ends', 'Thinking a bent string is shorter'],
  q: [M('Two pencils are placed with different starting points. What must you do first?', ['Line up one end', 'Look at the colours', 'Count the pencils'], 'Line up one end', 'A common starting line makes the comparison fair.')],
  x: ['Compare your hand span and foot length with a string.'],
});
g.k('g1-ruler', 'Measuring with a ruler: centimetres and metres', '用尺子量：厘米和米', {
  d: 'A ruler counts equal centimetre spaces from 0; 100 centimetres make 1 metre.', t: ['Centimeters', 'Meters', 'Using a ruler', 'Measuring objects', 'Estimating lengths', 'Basic length conversions'],
  o: ['Measure from the 0 mark', 'Estimate before measuring', 'Know 1 m = 100 cm'], pre: ['g1-compare-length'], rel: ['g2-length-units'],
  e: 'measure', c: {mode: 'ruler', length: 7}, m: ['Starting from the 1 mark', 'Counting tick marks instead of spaces'],
  q: [N('A crayon starts at 2 cm and ends at 9 cm. How long is it (cm)?', 7, '9 − 2 = 7 spaces.'), N('How many centimetres are in 1 metre?', 100, '1 m = 100 cm.')],
  x: ['Estimate, then measure, 5 things on your desk.'], f: '1\\,\\text{m} = 100\\,\\text{cm}',
});

g.chapter('g1-time-money', 'Time and Money', '认识钟表和人民币', 'relationships', 'Read whole hours and use yuan, jiao and fen.');
g.k('g1-clock', 'Reading the clock: whole hours', '认识整时', {
  d: 'At a whole hour the minute hand points to 12 and the hour hand points to the hour.', t: ['Clock faces', 'Hour hands', 'Minute hands', 'Reading whole hours'],
  o: ['Tell the two hands apart', 'Read and set whole hours'], rel: ['g2-time'],
  e: 'clock', c: {mode: 'read', step: 60, h: 3, m: 0}, m: ['Swapping the hour and minute hands', 'Thinking the hour hand jumps instead of moving smoothly'],
  q: [M('The minute hand points to 12 and the hour hand points to 7. What time is it?', ['7:00', '12:07', '12:00'], '7:00', 'Minute hand on 12 means a whole hour.')],
  x: ['Draw the clock at the time you wake up and go to bed.'],
});
g.k('g1-yuan', 'Yuan, jiao and fen', '认识人民币', {
  d: 'Chinese money uses 1 yuan = 10 jiao and 1 jiao = 10 fen.', t: ['Chinese currency', 'Yuan, jiao and fen', 'Currency conversion'],
  o: ['Recognise notes and coins', 'Convert between yuan, jiao and fen'], rel: ['g3-hundredths-intro'],
  e: 'money', c: {mode: 'coins'}, m: ['Thinking a larger coin is worth more', 'Believing 1 yuan = 100 jiao'],
  q: [N('How many jiao make 1 yuan?', 10, '1 yuan = 10 jiao.'), N('3 yuan is how many jiao?', 30, '3 × 10 = 30 jiao.')],
  x: ['Make 1 yuan using coins in three different ways.'], f: '1\\text{ 元} = 10\\text{ 角},\\; 1\\text{ 角} = 10\\text{ 分}',
});
g.k('g1-shopping', 'Shopping and making change', '简单的购物', {
  d: 'Paying combines money to reach a price; change is the amount paid minus the price.', t: ['Comparing prices', 'Simple shopping', 'Making change'],
  o: ['Combine notes and coins to pay a price', 'Calculate change'], pre: ['g1-yuan', 'g1-sub-meaning'], rel: ['g4-unit-price'],
  e: 'money', c: {mode: 'shop'}, m: ['Adding the price and payment for change', 'Ignoring unit differences between yuan and jiao'],
  q: [N('A pencil costs 3 yuan. You pay with a 5-yuan note. How much change (yuan)?', 2, '5 − 3 = 2 yuan.'), M('Which costs more?', ['8 jiao', '1 yuan', 'They are equal'], '1 yuan', '1 yuan = 10 jiao, which is more than 8 jiao.')],
  x: ['Set up a toy shop with price tags under 20 yuan.'],
});

g.chapter('g1-classify', 'Classification and Patterns', '分类与找规律', 'statistics', 'Sort by rules and predict what comes next in patterns.');
g.k('g1-sorting', 'Sorting by one rule', '按一个标准分类', {
  d: 'A sorting rule decides which group each object goes in; changing the rule changes the groups.', t: ['Color classification', 'Shape classification', 'Size classification', 'Quantity classification'],
  o: ['Sort objects by colour, shape or size', 'Count each group after sorting'], rel: ['g1-multi-sort', 'g2-collect'],
  e: 'sorting', c: {mode: 'sort', rule: 'color'}, m: ['Switching rules halfway', 'Putting an object in two groups'],
  q: [M('You sort buttons by colour. Then you sort the same buttons by size. What changes?', ['The groups', 'The number of buttons', 'Nothing'], 'The groups', 'The same objects regroup under a new rule.')],
  x: ['Sort your crayons two different ways.'],
});
g.k('g1-multi-sort', 'Sorting with two conditions', '按两个条件分类', {
  d: 'Objects can satisfy two conditions at once, like “red and round”.', t: ['Multiple classification conditions'],
  o: ['Sort using two conditions', 'Read a two-way sorting table'], pre: ['g1-sorting'], rel: ['g6-pigeonhole'],
  e: 'sorting', c: {mode: 'multi'}, m: ['Checking only one condition', 'Thinking “not red” means “blue”'],
  q: [M('Which shape is both red and a circle?', ['A red square', 'A blue circle', 'A red circle'], 'A red circle', 'Both conditions must be true.')],
  x: ['Make a 2 × 2 sorting mat: big/small × red/not red.'],
});
g.k('g1-patterns', 'Repeating patterns', '找规律', {
  d: 'A repeating pattern has a unit that repeats; finding the unit predicts any position.', t: ['Repeating patterns', 'Number patterns', 'Shape patterns'],
  o: ['Identify the repeating unit', 'Predict a missing element'], pre: ['g1-sorting'], rel: ['g1-number-patterns', 'g5-growing-patterns'],
  e: 'sorting', c: {mode: 'pattern', unit: 3}, m: ['Continuing from the last element only', 'Mistaking a growing pattern for a repeating one'],
  q: [M('▲ ● ■ ▲ ● ■ ▲ ? What comes next?', ['▲', '●', '■'], '●', 'The unit is ▲ ● ■.'), N('In “red, blue, red, blue, …”, what position is the 4th blue?', 8, 'Blues are at positions 2, 4, 6, 8.')],
  x: ['Clap a rhythm pattern and ask a friend to continue it.'],
});

export const grade1 = g.done();
