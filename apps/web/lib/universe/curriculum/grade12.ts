import {gradeBuilder, N, M} from './build';

const g = gradeBuilder(12);
const S3 = '选择性必修第三册';

g.chapter('g12-counting', 'Counting Principles', '计数原理', 'statistics', 'Add by cases, multiply by steps; permutations, combinations and the binomial theorem.', S3);
g.k('g12-counting-principles', 'Addition and multiplication principles', '分类加法与分步乘法计数原理', {
  d: 'Choose one way OR another: add. Do one step AND then another: multiply — a tree diagram shows why.', t: ['Addition principle', 'Multiplication principle', 'Tree diagrams'],
  o: ['Choose between adding and multiplying', 'Count with tree diagrams'], pre: ['g6-combinatorics', 'g9-probability'], rel: ['g12-perm-comb'],
  e: 'combin', c: {mode: 'tree', n: 3, k: 2}, m: ['Always multiply', 'Double-counting overlapping cases'],
  q: [N('3 shirts and 4 trousers. Outfits?', 12, '3 × 4.'), N('5 routes by bus or 3 by train. Ways to go?', 8, 'Add.')],
  x: ['How many 4-digit PINs have no repeated digit?'],
});
g.k('g12-perm-comb', 'Permutations and combinations', '排列与组合', {
  d: 'Arranging k of n in order: n!/(n − k)!; choosing without order divides by k! because each choice was counted k! times.', t: ['Permutations', 'Combinations', 'Formulas and properties', 'Applications'],
  o: ['Distinguish permutations from combinations', 'Use A(n, k) and C(n, k)'], pre: ['g12-counting-principles'], rel: ['g12-binomial-theorem', 'g12-binomial'],
  e: 'combin', c: {mode: 'perm-comb', n: 5, k: 3}, m: ['Order matters for committees', 'C(n, k) ≠ C(n, n − k)'],
  q: [N('A(5, 3) = ?', 60, '5 × 4 × 3.'), N('C(5, 3) = ?', 10, '60 ÷ 3!.')],
  x: ['Why is C(n, k) = C(n, n − k)? Explain with a committee and the people left out.'], f: 'C_n^k=\\frac{n!}{k!(n-k)!}',
});
g.k('g12-binomial-theorem', 'The binomial theorem', '二项式定理', {
  d: 'Each term of (a + b)ⁿ picks a or b from every bracket; C(n, k) counts the ways — Pascal’s (杨辉) triangle lists them.', t: ['Binomial theorem', 'Binomial coefficients', 'Yang Hui’s (Pascal’s) triangle'],
  o: ['Expand binomials', 'Use properties of binomial coefficients'], pre: ['g12-perm-comb', 'g8-expand'],
  e: 'combin', c: {mode: 'pascal', n: 6}, m: ['Coefficients are 1, n, n, …', 'The k-th term uses C(n, k) instead of C(n, k − 1)'],
  q: [N('Coefficient of x² in (1 + x)⁵?', 10, 'C(5, 2).'), N('Sum of the coefficients of (1 + x)⁶?', 64, '2⁶.')],
  x: ['Find patterns in Yang Hui’s triangle (powers of 11, Fibonacci).'], f: '(a+b)^n=\\sum_{k=0}^{n}C_n^k a^{n-k}b^k',
});

g.chapter('g12-random-variables', 'Random Variables and Distributions', '随机变量及其分布', 'statistics', 'Conditional probability, expectation, binomial and normal distributions.', S3);
g.k('g12-conditional', 'Conditional probability and total probability', '条件概率与全概率公式', {
  d: 'P(B|A) restricts the sample space to A; a tree diagram multiplies along branches and adds across them.', t: ['Conditional probability', 'Multiplication formula', 'Law of total probability', 'Bayes’ formula (enrichment)'],
  o: ['Compute conditional probabilities', 'Use the total probability formula'], pre: ['g10-independence'], rel: ['g12-expectation'],
  e: 'distribution', c: {mode: 'conditional'}, m: ['P(B|A) = P(A|B)', 'Rare-disease tests are almost always right when positive'],
  q: [N('Box: 3 red, 2 blue. Draw two without replacement. P(second red | first red)?', 0.5, '2 of the remaining 4.')],
  x: ['A test is 99% accurate for a 1% disease. If positive, how likely is the disease?'], f: 'P(B|A)=\\frac{P(AB)}{P(A)}',
});
g.k('g12-expectation', 'Discrete random variables: mean and variance', '离散型随机变量的均值与方差', {
  d: 'The expectation is the balance point of the distribution: Σ xᵢpᵢ. Variance measures spread around it.', t: ['Random variables', 'Distribution lists', 'Expectation', 'Variance'],
  o: ['Build a distribution list', 'Compute E(X) and D(X)'], pre: ['g12-conditional', 'g8-variance'], rel: ['g12-binomial'],
  e: 'distribution', c: {mode: 'expectation'}, m: ['E(X) must be a possible value', 'Probabilities need not sum to 1'],
  q: [N('A fair die: E(X)?', 3.5, '(1 + … + 6)/6.'), N('E(2X + 1) if E(X) = 3?', 7, '2E(X) + 1.')],
  x: ['Is a lottery with a 1 yuan ticket worth playing? Compute the expectation.'], f: 'E(X)=\\sum x_ip_i',
});
g.k('g12-binomial', 'Binomial and hypergeometric distributions', '二项分布与超几何分布', {
  d: 'n independent yes/no trials with probability p: P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ, mean np. Without replacement gives the hypergeometric distribution.', t: ['Bernoulli trials', 'Binomial distribution', 'Hypergeometric distribution', 'Mean and variance'],
  o: ['Recognise binomial situations', 'Compute binomial probabilities and np'], pre: ['g12-expectation', 'g12-perm-comb'], rel: ['g12-normal'],
  e: 'distribution', c: {mode: 'binomial', n: 10, p: 0.5}, m: ['Drawing without replacement is binomial', 'Most likely value is always n/2'],
  q: [N('10 fair coin tosses. Expected number of heads?', 5, 'np.'), N('P(exactly 2 heads in 3 tosses)?', 0.375, 'C(3, 2)/8.')],
  x: ['Shoot 10 free throws at 70%: what is the most likely number of baskets?'], f: 'P(X=k)=C_n^kp^k(1-p)^{n-k}',
});
g.k('g12-normal', 'The normal distribution', '正态分布', {
  d: 'Balls bouncing left or right through many pegs pile into a bell curve; about 68%, 95% and 99.7% lie within 1, 2 and 3 standard deviations.', t: ['Normal curve', 'Properties', 'The 3σ rule'],
  o: ['Describe the normal curve with μ and σ', 'Use the 3σ rule'], pre: ['g12-binomial', 'g10-percentiles'],
  e: 'distribution', c: {mode: 'normal', n: 12}, m: ['Larger σ makes the curve taller', 'Every distribution is normal'],
  q: [N('Heights ~ N(170, 5²). Approximately what percent are between 165 and 175?', 68, 'Within 1σ (≈68.3%).', 1)],
  x: ['Build a Galton board from nails and marbles.'], f: 'P(\\mu-\\sigma\\le X\\le\\mu+\\sigma)\\approx 0.6827',
});

g.chapter('g12-paired-data', 'Statistical Analysis of Paired Data', '成对数据的统计分析', 'statistics', 'Correlation, regression and independence tests.', S3);
g.k('g12-correlation', 'Correlation of paired data', '成对数据的相关关系', {
  d: 'A scatter plot shows the trend; the correlation coefficient r measures how tightly points hug a line (−1 to 1).', t: ['Scatter plots', 'Positive and negative correlation', 'Correlation coefficient r'],
  o: ['Read scatter plots', 'Interpret r'], pre: ['g5-line-charts', 'g8-variance'], rel: ['g12-regression'],
  e: 'regression', c: {mode: 'correlation'}, m: ['Correlation proves causation', 'r = 0 means no relationship at all'],
  q: [M('r = −0.92 means…', ['Strong negative linear correlation', 'Weak correlation', 'No correlation'], 'Strong negative linear correlation', '|r| close to 1.')],
  x: ['Find an example where two things correlate but neither causes the other.'],
});
g.k('g12-regression', 'Linear regression', '一元线性回归模型', {
  d: 'The least-squares line minimises the total of squared vertical gaps; it passes through (x̄, ȳ).', t: ['Linear regression model', 'Least squares', 'Residuals', 'Prediction'],
  o: ['Fit and use a regression line', 'Analyse residuals'], pre: ['g12-correlation', 'g8-direct-function'],
  e: 'regression', c: {mode: 'least-squares'}, m: ['The regression line goes through every point', 'Predictions far outside the data are reliable'],
  q: [M('The least-squares line always passes through…', ['(x̄, ȳ)', 'The origin', 'The first data point'], '(x̄, ȳ)', 'A property of least squares.')],
  x: ['Fit a line to arm span vs height in your class.'], f: '\\hat b=\\frac{\\sum(x_i-\\bar x)(y_i-\\bar y)}{\\sum(x_i-\\bar x)^2},\\;\\hat a=\\bar y-\\hat b\\bar x',
});
g.k('g12-independence-test', 'Contingency tables and the χ² test', '列联表与独立性检验', {
  d: 'Compare observed counts in a 2 × 2 table with the counts expected if the variables were independent; a large χ² is evidence of association.', t: ['2 × 2 contingency tables', 'χ² statistic', 'Independence test'],
  o: ['Compute χ² for a 2 × 2 table', 'State a conclusion with its error risk'], pre: ['g12-regression', 'g10-independence'],
  e: 'regression', c: {mode: 'contingency'}, m: ['A small χ² proves independence', 'χ² tells the direction of the effect'],
  q: [M('If χ² = 10.8 > 6.635 (α = 0.01), we…', ['Reject independence at the 0.01 level', 'Prove independence', 'Cannot compute'], 'Reject independence at the 0.01 level', 'Exceeds the critical value.')],
  x: ['Is wearing glasses associated with reading time? Collect a 2 × 2 table.'], f: '\\chi^2=\\frac{n(ad-bc)^2}{(a+b)(c+d)(a+c)(b+d)}',
});

export const grade12 = g.done();
