"""Bounded deterministic verification. Never sympify arbitrary user expressions."""
import ast
import hashlib
import json
import operator
import re
from typing import Literal, Protocol
from pydantic import BaseModel, ConfigDict, Field, model_validator
import sympy as sp
import pint

units = pint.UnitRegistry()


class QuestionSpec(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    stem: str = Field(min_length=10, max_length=2000)
    options: dict[str, str]
    answer: Literal['A', 'B', 'C', 'D']
    solution: str = Field(min_length=10, max_length=4000)
    node_id: str
    subject: Literal['math', 'physics']
    tier: int = Field(ge=1, le=5)
    expression: str = Field(max_length=100)
    expected_unit: str = Field(default='', max_length=30)
    provenance: str
    variant_family: str

    @model_validator(mode='after')
    def options_valid(self):
        if set(self.options) != set('ABCD') or any(not v or len(v) > 120 for v in self.options.values()):
            raise ValueError('Exactly four nonempty options A/B/C/D are required')
        if len({v.strip().lower() for v in self.options.values()}) != 4:
            raise ValueError('Duplicate options')
        return self


def fingerprint(q: QuestionSpec):
    normalized = re.sub(r'\s+', ' ', q.stem.strip().lower())
    return hashlib.sha256(json.dumps([normalized, q.options], sort_keys=True).encode()).hexdigest()


def arithmetic(text: str):
    """Small rational arithmetic grammar; no calls, names, attributes or exponent bombs."""
    if len(text) > 100:
        raise ValueError('Expression too long')
    tree = ast.parse(text, mode='eval')
    if len(list(ast.walk(tree))) > 40:
        raise ValueError('Expression too complex')
    ops = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}

    def visit(n):
        if isinstance(n, ast.Constant) and type(n.value) in (int, float) and abs(n.value) <= 1e9:
            return sp.Rational(str(n.value))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.USub):
            return -visit(n.operand)
        if isinstance(n, ast.BinOp) and type(n.op) in ops:
            result = ops[type(n.op)](visit(n.left), visit(n.right))
            if not result.is_finite:
                raise ValueError('Non-finite result')
            return result
        raise ValueError('Unsupported expression')
    return visit(tree.body)


def deterministic(q: QuestionSpec):
    try:
        expected = arithmetic(q.expression)
        matches = []
        for key, option in q.options.items():
            if q.subject == 'physics':
                # Only scalar quantities with simple SI units are supported.
                if not re.fullmatch(r'-?\d+(?:\.\d+)? (?:m|m/s|m/s\^2|N|J|kg|s)', option):
                    return {'status': 'inconclusive', 'reason': 'Unsupported quantity format'}
                quantity = units.Quantity(option).to(q.expected_unit)
                value = sp.Rational(str(quantity.magnitude))
            else:
                value = arithmetic(option)
            if sp.simplify(value - expected) == 0:
                matches.append(key)
        return {'status': 'verified' if matches == [q.answer] else 'failed', 'matches': matches, 'method': 'bounded-rational-v1 + Pint SI units'}
    except Exception as exc:
        return {'status': 'inconclusive', 'reason': type(exc).__name__}


class BlindInput(BaseModel):
    """Deliberately excludes key, solution and deterministic verification expression."""
    model_config = ConfigDict(extra='forbid')
    stem: str
    options: dict[str, str]
    subject: str


class Solver(Protocol):
    name: str
    def solve(self, question: BlindInput) -> dict: ...


class Reviewer(Protocol):
    name: str
    def review(self, question: QuestionSpec) -> dict: ...


class FixtureSolver:
    name = 'mock:template-blind-solver-v1'

    def solve(self, question: BlindInput):
        s = question.stem
        nums = [sp.Rational(n) for n in re.findall(r'\d+', s)]
        if s.startswith('Calculate'):
            result = nums[0] + nums[1]
        elif s.startswith('Solve'):
            result = (nums[2] - nums[1]) / nums[0]
        elif s.startswith('A rectangle'):
            result = nums[0] * nums[1]
        elif s.startswith('A cart'):
            result = nums[0] * nums[1]
        elif s.startswith('A constant net force'):
            result = nums[0] / nums[1]
        elif s.startswith('A constant force'):
            result = nums[0] * nums[1]
        else:
            return {'status': 'inconclusive', 'reason': 'Outside deterministic fixture templates'}
        matches = [k for k, v in question.options.items() if sp.Rational(v.split(' ')[0]) == result]
        return {'status': 'solved', 'answer': matches[0] if len(matches) == 1 else None, 'derived': str(result)}


class FixtureReviewer:
    name = 'mock:fixture-review-v1'

    def review(self, question: QuestionSpec):
        # A mock reviewer cannot certify novel prose. Only sealed fixture grammar
        # and its canonical explanation pass; altered explanations fail closed.
        s=question.stem.removesuffix(' Give the requested value.')
        nums=[int(n) for n in re.findall(r'\d+',s)]
        explanation=None
        if re.fullmatch(r'Calculate \d+ \+ \d+\.',s):
            a,b=nums; explanation=f'Add the two integers: {a} + {b} = {a+b}.'
        elif re.fullmatch(r'Solve \d+x \+ \d+ = \d+ for real x\.',s):
            a,b,c=nums
            if c==a*3+b: explanation=f'Subtract {b} from both sides, then divide by {a}. x = 3.'
        elif re.fullmatch(r'A rectangle has side lengths \d+ and \d+ units\. Find its area in square units\.',s):
            a,b=nums; explanation=f'Area is length times width: {a} × {b} = {a*b} square units.'
        elif re.fullmatch(r'A cart moves at a constant \d+ m/s for \d+ s along a straight line\. What distance does it travel\?',s):
            a,b=nums; explanation=f'For constant speed, distance = speed × time = {a} × {b} = {a*b} m.'
        elif re.fullmatch(r'A constant net force of \d+ N acts on a \d+ kg mass\. What is its acceleration in the force direction\?',s):
            force,b=nums
            if b and force%b==0: explanation=f'Newton’s second law gives acceleration = net force / mass = {force}/{b} = {force//b} m/s².'
        elif re.fullmatch(r'A constant force of \d+ N acts parallel to a displacement of \d+ m\. What work is done by this force\?',s):
            a,b=nums; explanation=f'Work = force × displacement when parallel: {a} × {b} = {a*b} J.'
        accepted=explanation is not None and explanation==question.solution
        return {'status': 'accepted' if accepted else 'rejected', 'findings': ['Sealed template and explanation check only; DEVELOPMENT FIXTURE, not independent AI review'], 'mock': True}


def pipeline(raw: dict, solver: Solver | None = None, reviewer: Reviewer | None = None):
    solver = solver or FixtureSolver()
    reviewer = reviewer or FixtureReviewer()
    report = {'schema': 'failed', 'blind': {}, 'review': {}, 'deterministic': {}, 'approved': False, 'mock': True}
    try:
        q = QuestionSpec.model_validate(raw)
        report['schema'] = 'verified'
        # Serialize a fresh allowlisted DTO, never the full question object.
        report['blind'] = solver.solve(BlindInput(stem=q.stem, options=q.options.copy(), subject=q.subject))
        report['review'] = reviewer.review(q)
        report['deterministic'] = deterministic(q)
        report['providers'] = [solver.name, reviewer.name]
        report['approved'] = (report['blind'].get('status') == 'solved' and report['blind'].get('answer') == q.answer and report['review'].get('status') == 'accepted' and report['deterministic']['status'] == 'verified')
    except Exception as exc:
        report['error'] = type(exc).__name__
    return report
