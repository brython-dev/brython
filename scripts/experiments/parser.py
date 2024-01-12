import tokenize
import token as _token
import io
import re
import shlex
import pprint

primitives = {}

operators = set()


def parse_grammar_options(line):
    lexer = shlex.shlex(io.StringIO(line))
    option = []
    state = 'new'
    while True:
        tok = lexer.get_token()
        if not tok:
            break
        if state == 'new':
            if tok == '=':
                state = 'cont'
            elif tok == '{':
                action = tok
                state = 'action'
            elif tok == '?':
                option[-1] += '?'
            else:
                if tok.startswith("'"):
                    option.append(tok[1:-1])
                    if not tok[1].isalpha():
                        operators.add(tok[1:-1])
                else:
                    option.append(tok)
        elif state == 'cont':
            alias = option[-1]
            option[-1] = tok
            #option[-1].alias = alias
            state = 'new'
        elif state == 'action':
            action += tok
            if tok == '}':
                option.append(action)
    return option

grammar = {}
with open('d:/cpython/Grammar/python.mini1.gram', encoding='utf-8') as f:
    rule = None
    for line in f:
        if not line.strip():
            continue
        if mo := re.match('^([a-z_]+):(.*)', line):
            if rule is not None:
                grammar[rule] = options
            rule = mo.groups()[0]
            options = []
            if mo.groups()[1].strip():
                options = [parse_grammar_options(mo.groups()[1])]
        elif not line.strip().startswith('|'):
            print('erreur', line)
        else:
            options.append(parse_grammar_options(line.strip()[1:]))

    grammar[rule] = options

"""
for rule in grammar:
    print(rule)
    for option in grammar[rule]:
        print('    ', option)
"""

grammar = {
'start': [
        ['expr', 'NEWLINE?', 'ENDMARKER', '{ ast.Expression(expr) }']
    ],
'expr': [
        [ 'expr', '+',  'term', '{ ast.BinOp(expr, ast.Add(), term) }'],
        [ 'expr', '-', 'term',  '{ ast.BinOp(expr, ast.Sub(), term) }'],
        [ 'term', '{ term }']
    ],
'term': [
        [ 'term', '*', 'factor',  '{ ast.BinOp(l, ast.Mult(), r) }'],
        [ 'term', '/', 'factor', '{ ast.BinOp(term, ast.Div(), factor) }'],
        [ 'factor', '{ factor }']
    ],
'factor': [
        [ '(', 'expr', ')',  '{ expr }'],
        [ 'atom', '{ atom }'],
    ],
'atom': [
        [ 'NAME', '{ ast.Name(id=name.string, ctx=ast.Load()) }'],
        [ 'NUMBER', '{ ast.Constant(value=ast.literal_eval(number.string)) }']
    ]
}


state = None

def add_to_list(t1, t2):
    for item in t2:
        if not item in t1:
            t1.append(item)

# get all names defined in the grammar
names = set()
rules = list(grammar)
is_a = {}

for rule, options in grammar.items():
    for option in options:
        if len(option) == 2:
            key = option[0]
            if key in is_a:
                is_a[key].append(rule)
            else:
                is_a[key] = [rule]

# {'term': ['expr'], 'factor': ['term'], 'atom': ['factor'], 'NAME': ['atom'], 'NUMBER': ['atom']}

def extend(rule):
    result = []
    if rule in is_a:
        for equiv in is_a[rule]:
            if equiv in is_a:
                result += is_a[equiv] + extend(equiv)
    return result

extended = {}

for item in is_a:
    extended[item] = extend(item)

for item in is_a:
    is_a[item] += extended[item]

print('is_a', is_a)

def add_to_list(t1, t2):
    for item in t2:
        if item not in t1:
            t1.append(item)

def can_follow(e):
    # list of elements that can follow grammar element "e"
    result = []
    for rule, options in grammar.items():
        for onum, option in enumerate(options):
            if e is None:
                if option[0] == option[0].upper():
                    result.append([rule, onum, 0])
            else:
                for inum, ge in enumerate(option[:-1]):
                    if ge == e:
                        if len(option) == 2:
                            add_to_list(result, can_follow(rule))
                        elif inum < len(option) - 2:
                            result.append([rule, onum, inum + 1])
                        else:
                            add_to_list(result, can_follow(rule))

    return result

print('can follow None', can_follow(None))


candidates = []


src = "x + (1 + (y * (7 - 6)))"
last_item = None

def match(token, ge):
    tok_type = _token.tok_name[token.type]
    test = False # tok_type == 'OP' and token.string == '('
    if test:
        print('test match', tok_type, token.string, 'with ge', ge)
        input()
    if ge in operators:
        if tok_type == 'OP' and token.string == ge:
            return ge
    elif ge == ge.upper():
        if tok_type == ge or (ge.endswith('?') and tok_type == ge[:-1]):
            return ge
    elif tok_type in is_a: # NUMBER, NAME
        for equiv in is_a[tok_type]:
            if equiv == ge:
                # return minimal equivalent
                return is_a[tok_type][0]
    elif ge in grammar:
        for option in grammar[ge]:
            if test and option[0] != ge:
                print('match first option of rule', ge, option[0])
                input()
            if (option[0] != ge) and (mo := match(token, option[0])):
                if test:
                    print('match result', mo)
                return mo
    else:
        print('match', tok_type, token.string, 'with ge', ge)
        print('is_a', is_a)
        input()

candidates = can_follow(None)


def show_candidates(candidates):
    for rule, onum, inum in candidates:
        option = grammar[rule][onum]
        print('  ', rule, option, 'expect', option[inum])
for token in tokenize.tokenize(io.BytesIO(src.encode('utf-8')).readline):
    print()
    tok_type = _token.tok_name[token.type]
    if tok_type == 'ENCODING':
        continue
    print('new token', tok_type, token.string)
    print('candidates')
    show_candidates(candidates)
    matches = []
    new_candidates = []
    for rule, onum, inum in candidates:
        ge = grammar[rule][onum][inum]
        if new_ge := match(token, ge):
            print('token matches with grammar expression', ge, 'new', new_ge)
            matches.append(new_ge)
            add_to_list(new_candidates, can_follow(new_ge))

    print('new candidates')
    show_candidates(new_candidates)
    if new_candidates:
        candidates = new_candidates
        continue

    if new_ge == 'ENDMARKER':
        print('success')
    else:
        print('syntax error')
        break

