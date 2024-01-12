import tokenize
import token as _token
import io
import re
import shlex
import pprint

primitives = {}

class Name:

    def __init__(self, value, repeat=None, alias=None):
        self.value = value
        self.repeat = repeat
        self.alias = alias

class Rule:

    def __init__(self, name):
        self.name = name
        self.alias = ''

    def __reXpr__(self):
        s = self.alias + '=' if self.alias else ''
        return s + self.name

class Literal:

    def __init__(self, value):
        self.value = value

class Operator:

    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"'{self.value}'"

class Primitive:

    def __init__(self, name, repeat = ''):
        self.name = name
        self.repeat = repeat

    def __repr__(self):
        return self.name + self.repeat

class ENDMARKER:
    pass

class NUMBER:
    pass

class NAME:
    pass

class NEWLINE:
    pass

primitives = {
    'ENDMARKER': ENDMARKER,
    'NUMBER': NUMBER,
    'NAME': NAME,
    'NEWLINE': NEWLINE
    }

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
                option[-1].repeat = '?'
            else:
                if tok.startswith("'"):
                    if tok[1].isalpha():
                        option.append(Literal(tok[1:-1]))
                    else:
                        option.append(Operator(tok[1:-1]))
                elif tok == tok.upper():
                    option.append(primitives[tok]())
                else:
                    option.append(Rule(tok))
        elif state == 'cont':
            alias = option[-1].name
            if tok == tok.upper():
                option[-1] = Primitive(tok)
            else:
                option[-1] = Rule(tok)
            option[-1].alias = alias
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

operators = ['(', ')', '+', '-', '*', '/']

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


src = "x + (1 + (y * (7 - 6))) * 7"

def match(token, ge):
    tok_type = _token.tok_name[token.type]
    if ge in operators:
        if tok_type == 'OP' and token.string == ge:
            return ge
    elif ge == ge.upper():
        if tok_type == ge or (ge.endswith('?') and tok_type == ge[:-1]):
            return ge
    elif tok_type in is_a: # NUMBER, NAME
        for equiv in is_a[tok_type]:
            if equiv == ge:
                return ge
    elif ge in grammar:
        for option in grammar[ge]:
            if option[0] != ge and match(token, option[0]):
                return option[0]
    else:
        print('match', tok_type, token.string, 'with ge', ge)
        print('is_a', is_a)
        input()

candidates = can_follow(None)

for token in tokenize.tokenize(io.BytesIO(src.encode('utf-8')).readline):
    print()
    tok_type = _token.tok_name[token.type]
    if tok_type == 'ENCODING':
        continue
    print('new token', tok_type, token.string)
    print('candidates', candidates)
    matches = []
    new_candidates = []
    for rule, onum, inum in candidates:
        ge = grammar[rule][onum][inum]
        if new_ge := match(token, ge):
            print('token matches with grammar expression', ge, 'new', new_ge)
            matches.append(new_ge)
            add_to_list(new_candidates, can_follow(new_ge))

    print('new candidates', new_candidates)
    if new_candidates:
        candidates = new_candidates
        continue

    if new_ge == 'ENDMARKER':
        print('success')
    else:
        print('syntax error')

