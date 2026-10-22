"""Optional server-only JSON gateway adapters. No network calls in student flows.

Wire explicitly into offline generation tooling. This module is not evidence of
successful real-provider integration. Tests use httpx MockTransport only.
"""
import json
import time
from dataclasses import dataclass,field
from typing import Literal
import httpx
from pydantic import BaseModel,ConfigDict,Field
from .validation import BlindInput,QuestionSpec


class GenerationRequest(BaseModel):
    model_config=ConfigDict(extra='forbid')
    subject:Literal['math','physics']
    node_id:str
    prerequisites:list[str]
    tier:int=Field(ge=1,le=5)
    objective:str
    curriculum:str='introductory'
    assumptions:list[str]
    verification_methods:list[str]
    question_type:Literal['single_choice']='single_choice'


class ProviderFailure(RuntimeError):pass


@dataclass
class JsonGateway:
    base_url:str
    key:str=field(repr=False)
    model:str=''
    role:str=''
    timeout:float=20
    retries:int=2
    max_calls:int=20
    max_tokens:int=2000
    calls:int=0
    telemetry:list=field(default_factory=list)
    transport:object=None

    @property
    def name(self):return f'gateway:{self.role}:{self.model}'

    def complete(self,payload:dict,schema:dict):
        if not self.base_url.startswith('https://') or not self.key or not self.model:
            raise ProviderFailure('HTTPS gateway credentials/model not configured')
        for retry in range(self.retries+1):
            if self.calls>=self.max_calls:raise ProviderFailure('Call budget exhausted')
            self.calls+=1
            started=time.monotonic()
            try:
                with httpx.Client(timeout=self.timeout,transport=self.transport,follow_redirects=False) as client:
                    response=client.post(self.base_url.rstrip('/')+'/chat/completions',headers={'Authorization':'Bearer '+self.key},json={'model':self.model,'messages':[{'role':'system','content':'Return only JSON matching the supplied schema. Do not assume unstated conditions. '+json.dumps(schema)},{'role':'user','content':json.dumps(payload)}],'max_tokens':self.max_tokens,'response_format':{'type':'json_object'}})
                response.raise_for_status()
                result=response.json()
                content=json.loads(result['choices'][0]['message']['content'])
                if not isinstance(content,dict):raise ValueError('Object required')
                self.telemetry.append({'role':self.role,'model':self.model,'retry':retry,'latency_ms':round((time.monotonic()-started)*1000),'usage':result.get('usage',{}),'status':'ok','cost':None})
                return content
            except Exception as exc:
                self.telemetry.append({'role':self.role,'model':self.model,'retry':retry,'latency_ms':round((time.monotonic()-started)*1000),'status':'error','type':type(exc).__name__})
        raise ProviderFailure('Provider failed; mandatory review is unavailable')


class GatewayGenerator(JsonGateway):
    def generate(self,spec:GenerationRequest):
        return QuestionSpec.model_validate(self.complete(spec.model_dump(),QuestionSpec.model_json_schema()))


class GatewaySolver(JsonGateway):
    def solve(self,question:BlindInput):
        return self.complete(question.model_dump(),{'status':'solved or inconclusive','answer':'A/B/C/D or null','reasoning':'string','assumptions':['string']})


class GatewayReviewer(JsonGateway):
    def review(self,question:QuestionSpec):
        return self.complete(question.model_dump(),{'status':'accepted or rejected or inconclusive','findings':['string'],'severity':'string'})
