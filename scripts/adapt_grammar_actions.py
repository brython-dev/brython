"""Adapt CPython's python.gram "grammar actions" to Javascript
"""
import re

def transform_action(action):
    action0 = re.sub(r'\(\s*[a-z][a-z_]*\*?\s*\)\s*([a-z_]+)', r'\1', action)
    action1 = re.sub(r'\s*->\s*v\s*\..*?\*?\.', '.', action0)
    action2 = re.sub(r'\(\(.*_ty\) (.*?)\)', r'\1', action1)
    action3 = re.sub(r'\([^(]+ \*\)', '', action2)
    action4 = re.sub(r'\([a-z_]*\*?\)_Py', '_Py', action3)
    # the negative lookahead below is for case 'except*' in invalid_try_stmt
    action5 = re.sub(r"([a-z_]+)\*(?!')", r'\1', action4)
    action6 = re.sub(r'\s*->\s*', '.', action5)
    action7 = re.sub('_PyPegen_', '$B._PyPegen.', action6)
    action7 = re.sub('PyPegen_', '$B.PyPegen.', action7)
    action8 = re.sub('_PyAST_', 'new $B._PyAST.', action7)
    action9 = re.sub(r'([a-z]+)_ty\b', r'$B.ast.\1', action8)

    for name in operators + ['Module']:
        action9 = re.sub(rf'\b{name}\b', 'new $B.ast.' + name + '()', action9)

    for name in helper_functions:
        action9 = re.sub(rf'\b{name}\b', '$B.helper_functions.' + name, action9)

    for name in parser_constants:
        action9 = re.sub(rf'\b{name}\b', '$B.parser_constants.' + name, action9)

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

    action9 = action9.replace('void', 'NULL')

    action9 = re.sub(r'RAISE_(.*?)\s*\(([^p])', r'RAISE_\1(p, \2', action9)
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

parser_constants = [
    'Store', 'Load', 'Del', 'NULL', 'alias_ty', 'keyword_ty', 'arguments_ty',
    'expr_ty', 'asdl_stmt_seq', 'asdl_int_seq', 'asdl_expr_seq',
    'asdl_keyword_seq', 'asdl_identifier_seq', 'asdl_pattern_seq',
    'asdl_type_param_seq',
    'AugOperator', 'Py_Ellipsis', 'Py_False', 'Py_True', 'Py_None',
    'PyExc_SyntaxError',
    'STAR_TARGETS', 'DEL_TARGETS', 'FOR_TARGETS',
    'PyBytes_AS_STRING'
    ]

helper_functions = [
    "CHECK",
    "CHECK_VERSION",
    "CHECK_NULL_ALLOWED",
    "INVALID_VERSION_CHECK",
    "NEW_TYPE_COMMENT",
    "RAISE_ERROR_KNOWN_LOCATION",
    "RAISE_SYNTAX_ERROR",
    "RAISE_INDENTATION_ERROR",
    "RAISE_SYNTAX_ERROR_KNOWN_LOCATION",
    "RAISE_SYNTAX_ERROR_KNOWN_RANGE",
    "RAISE_SYNTAX_ERROR_INVALID_TARGET",
    "_RAISE_SYNTAX_ERROR_INVALID_TARGET",
    "RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN",
    "RAISE_SYNTAX_ERROR_STARTING_FROM",
    "asdl_seq_LEN",
    "asdl_seq_GET"]

if __name__ == '__main__':
    src = """_PyAST_alias(a->v.Name.id,
                                               (b) ? ((expr_ty) b)->v.Name.id : NULL,
                                               EXTRA)"""
    print(transform_action(src))
