"""Adapt CPython's python.gram "grammar actions" to Javascript
"""
import re

def transform_action(action):
    action0 = re.sub(r'\(\s*[a-z][a-z_]*\*?\s*\)\s*([a-z_]+)', r'\1', action)
    action1 = re.sub(r'\s*->\s*v\s*\..*?\*?\.', '.', action0)
    action2 = re.sub(r'\(\(.*_ty\) (.*?)\)', r'\1', action1)
    action3 = re.sub(r'\([^(]+ \*\)', '', action2)
    action4 = re.sub(r'\([a-z_]*\*?\)_Py', '_Py', action3)
    action5 = re.sub(r'([a-z_]+)\*', r'\1', action4)
    action6 = re.sub(r'\s*->\s*', '.', action5)
    action7 = re.sub('_PyPegen_', '$B._PyPegen.', action6)
    action8 = re.sub('_PyAST_', 'new $B._PyAST.', action7)
    #action9 = re.sub(operators_re, r'$B.ast.\1', action8)
    action9 = re.sub(r'([a-z]+)_ty\b', r'$B.ast.\1', action8)

    for op in ['USub', 'Add', 'Sub', 'Module']:
        action9 = re.sub(rf'\b{op}\b', 'new $B.ast.' + op, action9)

    # remove parameter types, eg
    # "$B._PyPegen.joined_str(p, a, (asdl_expr_seq)b, c)"
    # replaced by
    # "$B._PyPegen.joined_str(p, a, b, c)"
    args_mo = re.search(r'\(.*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        s1 = re.sub(r'\((.*?)\s*\)(\w+)', r'\2', s)
        if s1 != s:
            action10 = action9.replace(s, s1)
            action9 = action10

    args_mo = re.search(r'\(.*\s*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        params = [x.strip() for x in s.split(',')]
        params1 = []
        for param in params:
            if len(param) == 1 and param.isalpha() and param == param.lower():
                params1.append(param)
            elif param.startswith('"') or param.startswith("'"):
                params1.append(param)
            elif ' *' in param:
                print(param, f'"{param}"')
                params1.append(f'"{param}"')
            else:
                params1.append(param)

        s1 = ', '.join(params1)
        action10 = action9.replace(s, s1)
        action9 = action10

    type_decl = re.match(r'\s*\(.*?\)(.*)', action9)
    if type_decl:
        action9 = type_decl.groups()[0]

    action9 = action9.replace('void', '_void')
    action10 = action9.strip('{}')

    return action10

operators = [
    # binary operators
    'Add', 'Sub', 'Mult', 'Div', 'FloorDiv',
    'Mod', 'Pow', 'LShift', 'RShift', 'BitOr',
    'BitXor', 'BitAnd', 'MatMult',
    # boolean operators
    'And', 'Or',
    # comparison operators
    'Eq', 'NotEq', 'Lt', 'LtE', 'Gt', 'GtE',
    'Is', 'IsNot', 'In', 'NotIn',
    # unary operators
    'Invert', 'Not', 'UAdd', 'USub'
    ]

operators_re = r'\b(' + '|'.join(operators) + r')\b'

if __name__ == '__main__':
    src = """_PyAST_alias(a->v.Name.id,
                                               (b) ? ((expr_ty) b)->v.Name.id : NULL,
                                               EXTRA)"""
    print(transform_action(src))
