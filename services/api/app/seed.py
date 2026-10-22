"""Idempotent development fixture bank. No fabricated independent reviews."""
from sqlalchemy import select
from .models import Node, Edge, Question, Version, Evidence, Release, Member, Active
from .validation import QuestionSpec, fingerprint, pipeline

DOMAINS = {
    'math': [('numbers', 'Numbers & arithmetic'), ('algebra', 'Algebra'), ('equations', 'Equations & inequalities'), ('functions', 'Functions & graphs'), ('geometry', 'Geometry & proofs'), ('trigonometry', 'Trigonometry'), ('vectors', 'Vectors'), ('statistics', 'Probability & statistics'), ('calculus', 'Introductory calculus')],
    'physics': [('motion', 'Kinematics'), ('forces', "Newton’s laws"), ('energy', 'Work & energy'), ('momentum', 'Momentum & collisions'), ('electricity', 'Electricity & circuits'), ('magnetism', 'Magnetism & induction'), ('waves', 'Waves & optics'), ('thermal', 'Thermodynamics'), ('modern', 'Modern physics')]
}
COVERED = ['math.numbers', 'math.equations', 'math.geometry', 'physics.motion', 'physics.forces', 'physics.energy']


def fixture_questions(offset=0):
    for family, node in enumerate(COVERED):
        for tier in range(1, 4):
            for variant in range(4):
                a, b = 2 + variant + offset + 3 * (tier-1), 3 + tier
                if family == 0:
                    stem, expression, unit = f'Calculate {a} + {b}.', f'{a}+{b}', ''
                    solution = f'Add the two integers: {a} + {b} = {a+b}.'
                elif family == 1:
                    stem, expression, unit = f'Solve {a}x + {b} = {a*3+b} for real x.', f'({a*3+b}-{b})/{a}', ''
                    solution = f'Subtract {b} from both sides, then divide by {a}. x = 3.'
                elif family == 2:
                    stem, expression, unit = f'A rectangle has side lengths {a} and {b} units. Find its area in square units.', f'{a}*{b}', ''
                    solution = f'Area is length times width: {a} × {b} = {a*b} square units.'
                elif family == 3:
                    stem, expression, unit = f'A cart moves at a constant {a} m/s for {b} s along a straight line. What distance does it travel?', f'{a}*{b}', 'm'
                    solution = f'For constant speed, distance = speed × time = {a} × {b} = {a*b} m.'
                elif family == 4:
                    stem, expression, unit = f'A constant net force of {a*b} N acts on a {b} kg mass. What is its acceleration in the force direction?', f'{a*b}/{b}', 'm/s^2'
                    solution = f'Newton’s second law gives acceleration = net force / mass = {a*b}/{b} = {a} m/s².'
                else:
                    stem, expression, unit = f'A constant force of {a} N acts parallel to a displacement of {b} m. What work is done by this force?', f'{a}*{b}', 'J'
                    solution = f'Work = force × displacement when parallel: {a} × {b} = {a*b} J.'
                from .validation import arithmetic
                result = arithmetic(expression)
                answer_index = (variant + tier) % 4
                values = [result + i + 1 for i in range(4)]
                values[answer_index] = result
                options = {k: str(v) + (f' {unit}' if unit else '') for k,v in zip('ABCD',values)}
                yield dict(stem=stem, expression=expression, options=options, answer='ABCD'[answer_index], solution=solution, node_id=node, subject=node.split('.')[0], tier=tier, expected_unit=unit, provenance='hand-authored parameterized development fixture; tiers provisional', variant_family=node)


def seed(db):
    for subject, domains in DOMAINS.items():
        for slug, name in domains:
            key = f'{subject}.{slug}'
            if not db.get(Node,key):
                db.add(Node(id=key,subject=subject,name=name,domain=name,description=f'An introductory curriculum node for {name.lower()}. Coverage is deliberately limited in this development bank.',metadata_json={'taxonomy_version':1,'curriculum':'introductory','importance':1,'misconceptions':[], 'formulas':[]}))
    db.flush()
    for source,target,kind in [('math.numbers','math.equations','prerequisite'),('math.equations','math.functions','prerequisite'),('math.geometry','math.trigonometry','prerequisite'),('math.functions','math.calculus','prerequisite'),('physics.motion','physics.forces','prerequisite'),('physics.forces','physics.energy','prerequisite'),('physics.forces','physics.momentum','related_concept'),('math.equations','physics.motion','cross_subject_application'),('math.vectors','physics.forces','cross_subject_application'),('physics.electricity','physics.magnetism','commonly_applied_together')]:
        if not db.scalar(select(Edge).where(Edge.source==source,Edge.target==target,Edge.kind==kind)):
            db.add(Edge(source=source,target=target,kind=kind))
    release_id = 'development-fixtures-v1'
    if db.get(Release,release_id):
        return
    db.add(Release(id=release_id,state='validated',report={'mock': True, 'scope': '6 of 18 nodes, provisional L1-L3 only; not curriculum coverage'}))
    db.flush()
    for index,raw in enumerate(fixture_questions()):
        q = QuestionSpec.model_validate(raw)
        report = pipeline(raw)
        if not report['approved']:
            raise ValueError(f'Invalid seed {index}: {report}')
        qid = f'fixture-{index:03}'
        db.add(Question(id=qid))
        db.flush()
        db.add(Version(id=qid+'-v1',question_id=qid,node_id=q.node_id,tier=q.tier,content=raw,fingerprint=fingerprint(q),state='approved'))
        db.flush()
        db.add(Evidence(version_id=qid+'-v1',report=report))
        db.add(Member(release_id=release_id,version_id=qid+'-v1'))
    db.add(Active(id=1,release_id=release_id))
    db.flush()
