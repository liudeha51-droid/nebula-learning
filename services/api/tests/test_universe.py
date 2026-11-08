def test_universe_progress_requires_login(client):
    assert client.get('/api/v1/universe/progress').status_code==401
    assert client.put('/api/v1/universe/progress/g1-make-ten',json={'level':1}).status_code==401


def test_universe_progress_accumulates_levels(client,student):
    assert client.get('/api/v1/universe/progress').json()=={'items':[]}
    r=client.put('/api/v1/universe/progress/g1-make-ten',json={'level':1}); assert r.status_code==200 and r.json()['levels']==1
    r=client.put('/api/v1/universe/progress/g1-make-ten',json={'level':3}); assert r.json()['levels']==0b101
    r=client.put('/api/v1/universe/progress/g1-make-ten',json={'level':3}); assert r.json()['levels']==0b101  # idempotent
    client.put('/api/v1/universe/progress/g6-cake',json={'level':6})
    items=client.get('/api/v1/universe/progress').json()['items']
    assert [(i['kp_id'],i['levels']) for i in items]==[('g1-make-ten',5),('g6-cake',32)]


def test_universe_progress_validates_input(client,student):
    assert client.put('/api/v1/universe/progress/g1-make-ten',json={'level':7}).status_code==422
    assert client.put('/api/v1/universe/progress/g1-make-ten',json={'level':0}).status_code==422
    assert client.put('/api/v1/universe/progress/g1-make-ten',json={'level':2,'extra':1}).status_code==422
    assert client.put('/api/v1/universe/progress/g7-unknown',json={'level':1}).status_code==422
    assert client.put('/api/v1/universe/progress/DROP TABLE',json={'level':1}).status_code in (404,422)
    assert client.put('/api/v1/universe/progress/g1-make-ten',json={'level':1},headers={'X-Nebula-Client':'other'}).status_code==403


def test_universe_progress_is_private_per_learner(client,student):
    client.put('/api/v1/universe/progress/g2-share',json={'level':2})
    client.post('/api/v1/auth/logout')
    assert client.post('/api/v1/auth/demo').status_code==200
    assert client.get('/api/v1/universe/progress').json()=={'items':[]}
