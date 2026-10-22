import json
from unittest.mock import patch
import httpx
import pytest
from app.ai import JsonGateway,GatewaySolver,ProviderFailure
from app.validation import BlindInput,pipeline
from app.seed import fixture_questions
from app.taxonomy import validate_edges


def test_mock_reviewer_rejects_corrupt_solution():
    q=next(fixture_questions());q['solution']='Add the numbers but make up an answer of 999.'
    assert not pipeline(q)['approved']


def test_prerequisite_cycle_and_self_link():
    assert validate_edges({'a','b'},[{'source':'a','target':'b','kind':'prerequisite'}])
    for edges in ([{'source':'a','target':'a','kind':'prerequisite'}],[{'source':'a','target':'b','kind':'prerequisite'},{'source':'b','target':'a','kind':'prerequisite'}],[{'source':'a','target':'missing','kind':'related_concept'}]):
        with pytest.raises(ValueError):validate_edges({'a','b'},edges)


def test_gateway_retries_budget_and_redacted_telemetry():
    calls=[]
    def transport(request):
        calls.append(request)
        return httpx.Response(503)
    provider=JsonGateway('https://provider.invalid','test-only-not-a-real-key','model','solver',max_calls=2,transport=httpx.MockTransport(transport))
    with pytest.raises(ProviderFailure):provider.complete({}, {})
    assert len(calls)==2
    assert 'test-only-not-a-real-key' not in repr(provider)
    assert 'test-only-not-a-real-key' not in json.dumps(provider.telemetry)


def test_gateway_solver_isolated_and_structured():
    sent=[]
    def transport(request):
        sent.append(json.loads(request.content))
        return httpx.Response(200,json={'choices':[{'message':{'content':json.dumps({'status':'solved','answer':'B'})}}],'usage':{'total_tokens':20}})
    solver=GatewaySolver('https://provider.invalid','test-only','different-model','blind',transport=httpx.MockTransport(transport))
    solver.solve(BlindInput(stem='Calculate 2 + 4.',options={'A':'7','B':'6','C':'8','D':'9'},subject='math'))
    payload=json.loads(sent[0]['messages'][1]['content'])
    assert set(payload)=={'stem','options','subject'}
    assert solver.telemetry[0]['usage']['total_tokens']==20


@pytest.mark.parametrize('body',[{}, {'choices':[]},{'choices':[{'message':{'content':'not json'}}]}])
def test_malformed_provider_result_does_not_pass(body):
    solver=GatewaySolver('https://provider.invalid','test-only','model','blind',max_calls=1,transport=httpx.MockTransport(lambda r:httpx.Response(200,json=body)))
    assert not pipeline(next(fixture_questions()),solver=solver)['approved']
