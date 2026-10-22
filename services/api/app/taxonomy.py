from collections import defaultdict


def validate_edges(nodes:set[str],edges:list[dict]):
    graph=defaultdict(list)
    allowed={'prerequisite','related_concept','commonly_applied_together','cross_subject_application'}
    for edge in edges:
        a,b,kind=edge['source'],edge['target'],edge['kind']
        if a not in nodes or b not in nodes or a==b or kind not in allowed:
            raise ValueError('Invalid taxonomy edge')
        if kind=='prerequisite': graph[a].append(b)
    active,visited=set(),set()
    def walk(n):
        if n in active: raise ValueError('Prerequisite cycle')
        if n in visited:return
        active.add(n)
        for child in graph[n]:walk(child)
        active.remove(n);visited.add(n)
    for n in nodes:walk(n)
    return True
