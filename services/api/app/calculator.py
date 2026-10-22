import ast
import math


def calculate(expression: str, degrees: bool = False, precision: int = 10):
    if len(expression)>150 or not 1<=precision<=14:
        raise ValueError('Expression or precision exceeds limits')
    tree=ast.parse(expression.replace('^','**'),mode='eval')
    if len(list(ast.walk(tree)))>60: raise ValueError('Expression too complex')
    trig=lambda f: lambda x:f(math.radians(x) if degrees else x)
    inv=lambda f: lambda x:math.degrees(f(x)) if degrees else f(x)
    functions={'sqrt':math.sqrt,'ln':math.log,'log':math.log10,'sin':trig(math.sin),'cos':trig(math.cos),'tan':trig(math.tan),'asin':inv(math.asin),'acos':inv(math.acos),'atan':inv(math.atan),'abs':abs,'percent':lambda x:x/100}
    def visit(n):
        if isinstance(n,ast.Constant) and type(n.value) in (float,int): value=n.value
        elif isinstance(n,ast.Name) and n.id in ('pi','e'): value=getattr(math,n.id)
        elif isinstance(n,ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)): value=(-1 if isinstance(n.op,ast.USub) else 1)*visit(n.operand)
        elif isinstance(n,ast.BinOp):
            a,b=visit(n.left),visit(n.right)
            if isinstance(n.op,ast.Add): value=a+b
            elif isinstance(n.op,ast.Sub): value=a-b
            elif isinstance(n.op,ast.Mult): value=a*b
            elif isinstance(n.op,ast.Div): value=a/b
            elif isinstance(n.op,ast.Pow) and abs(b)<=100: value=a**b
            else: raise ValueError('Unsupported operator or exponent')
        elif isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in functions and len(n.args)==1 and not n.keywords: value=functions[n.func.id](visit(n.args[0]))
        else: raise ValueError('Unsupported expression')
        if not isinstance(value,(float,int)) or not math.isfinite(value) or abs(value)>1e100: raise ValueError('Non-finite or oversized result')
        return value
    return float(f'{visit(tree.body):.{precision}g}')
