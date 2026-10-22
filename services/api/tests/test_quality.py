from copy import deepcopy
from unittest.mock import Mock
import pytest
from pydantic import ValidationError
from app.seed import fixture_questions
from app.validation import QuestionSpec, BlindInput, pipeline, deterministic, arithmetic, fingerprint
from app.calculator import calculate


@pytest.mark.parametrize('raw',list(fixture_questions()))
def test_all_seed_questions(raw):
    report=pipeline(raw)
    assert report['approved']
    assert report['mock'] is True
    assert report['deterministic']['status']=='verified'


@pytest.mark.parametrize('defect',['key','missing','duplicate','no_correct','extra','malformed','unknown_template','bad_expression','bad_unit'])
def test_defects_fail_closed(defect):
    raw=deepcopy(list(fixture_questions())[36] if defect=='bad_unit' else next(fixture_questions()))
    if defect=='key': raw['answer']='A' if raw['answer']!='A' else 'B'
    if defect=='missing': del raw['solution']
    if defect=='duplicate': raw['options']['A']=raw['options']['B']
    if defect=='no_correct': raw['options']={k:str(100+i) for i,k in enumerate('ABCD')}
    if defect=='extra': raw['hidden_answer']='B'
    if defect=='malformed': raw['options']='not a dict'
    if defect=='unknown_template': raw['stem']='An ambiguous question with no conditions.'
    if defect=='bad_expression': raw['expression']='__import__("os").system("bad")'
    if defect=='bad_unit': raw['expected_unit']='kg'
    assert pipeline(raw)['approved'] is False


def test_blind_solver_cannot_receive_key():
    solver=Mock(name='solver'); solver.name='test-blind'
    solver.solve.return_value={'status':'solved','answer':'B'}
    pipeline(next(fixture_questions()),solver=solver)
    sent=solver.solve.call_args.args[0].model_dump()
    assert set(sent)=={'stem','options','subject'}
    assert 'expression' not in sent and 'solution' not in sent and 'answer' not in sent


@pytest.mark.parametrize('outcome',[{'status':'solved','answer':'D'},{'status':'inconclusive'},{'status':'timeout'},{}])
def test_solver_disagreement_and_uncertainty(outcome):
    solver=Mock();solver.name='mock:failure';solver.solve.return_value=outcome
    assert pipeline(next(fixture_questions()),solver=solver)['approved'] is False


def test_timeout_fails_closed():
    solver=Mock();solver.name='timeout';solver.solve.side_effect=TimeoutError()
    assert not pipeline(next(fixture_questions()),solver=solver)['approved']


def test_reviewer_rejection():
    reviewer=Mock();reviewer.name='reject';reviewer.review.return_value={'status':'rejected'}
    assert not pipeline(next(fixture_questions()),reviewer=reviewer)['approved']


def test_fingerprints_and_variants():
    all_raw=list(fixture_questions())
    hashes=[fingerprint(QuestionSpec.model_validate(q)) for q in all_raw]
    assert len(set(hashes))==72
    raw=deepcopy(all_raw[0]);raw['stem']='  '+raw['stem'].upper()+'  '
    assert fingerprint(QuestionSpec.model_validate(raw))==hashes[0]
    assert len({q['variant_family'] for q in all_raw})==6


@pytest.mark.parametrize('expression,result',[('1+2*3',7),('sqrt(16)',4),('sin(pi/2)',1),('ln(e)',1),('log(100)',2),('2^3',8),('percent(25)',.25),('1e-3',.001),('abs(-4)',4),('asin(1)',1.570796327)])
def test_calculator(expression,result):
    assert calculate(expression)==pytest.approx(result)


def test_degree_inverse():
    assert calculate('sin(30)',True)==.5
    assert calculate('asin(1)',True)==90


@pytest.mark.parametrize('expression',['1/0','sqrt(-1)','log(-2)','2**1000','__import__("os")','(1).__class__','[1,2]','9'*200,'1e1000','pow(2,3)','True'])
def test_calculator_rejects_unsafe_or_invalid(expression):
    with pytest.raises((ValueError,ZeroDivisionError,OverflowError,SyntaxError)): calculate(expression)


@pytest.mark.parametrize('expression',['x+2','sin(1)','2**99','[1]','1/0','__import__("os")'])
def test_symbolic_parser_is_bounded(expression):
    with pytest.raises(Exception): arithmetic(expression)
