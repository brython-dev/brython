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

operators = set()

class Str(str):
    pass

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

def match(token, grammar_element):
    if token_type == expect:
        return True
    elif token_type in primitives and isinstance(expect, primitives[token_type]):
        return True
    elif token_type in is_a:
        for rule in is_a[token_type]:
            if match(rule, expect):
                return True
    return False

def search(tok):
    # search the places where token is present in grammar
    result = []
    tok_name = _token.tok_name[tok.type]
    if tok_name == 'OP':
        for rule, options in grammar.items():
            for onum, option in enumerate(options):
                for inum, item in enumerate(option[:-1]):
                    if item == tok.string:
                        result.append([rule, onum, inum])

    elif tok_name == tok_name.upper():
        for rule, options in grammar.items():
            for onum, option in enumerate(options):
                for inum, item in enumerate(option[:-1]):
                    if item == tok_name or \
                            item.endswith('?') and item[:-1] == tok_name:
                        result.append([rule, onum, inum])

    for rule, onum, inum in result:
        if len(grammar[rule][onum]) == 2:
            # token exactly matches rule, add equivalents
            add_to_list(result, search_rule(rule))

    return result

def search_rule(rule):
    result = []

    for r, options in grammar.items():
        for onum, option in enumerate(options):
            for inum, item in enumerate(option[:-1]):
                if item == rule:
                    result.append([r, onum, inum])
                    if len(option) == 2:
                        result += search_rule(r)
    return result


def transitions(ge1, ge2):
    # search the places where grammar element ge1 can be followed by ge2
    # if ge1 matches a rule, recursively add transitions(rule, ge2)
    result = []
    for rule, options in grammar.items():
        for onum, option in enumerate(options):
            for inum, item in enumerate(option[:-1]):
                if ge1 == item:
                    if inum < len(option) - 1 \
                            and option[inum + 1] == ge2:
                        result.append([rule, onum, inum])
                    elif len(option) == 2:
                        result += transitions(option[0], ge2)
    return result

def what_can_follow(x):
    candidates = []
    for rule, options in grammar.items():
        for option in options:
            start = option[0]
            if x in primitives and isinstance(start, primitives[x]):
                if len(option) == 2:
                    candidates += what_can_follow(rule)
                else:
                    candidates.append([rule, option, 0])
            elif isinstance(start, Rule) and start.name == x:
                if len(option) == 2:
                    candidates += what_can_follow(rule)
                else:
                    candidates.append([rule, option, 0])

    return candidates

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

done = False

def show_possible_token_positions(item, item_positions):
    print('token', _token.tok_name[item.type], item.string)
    print('possible positions for token')
    for r, onum, inum in item_positions:
        print('  ', grammar[r][onum][:-1], '#', inum)

def show_candidate(candidate):
    r, onum, inum = candidate
    print('  ', grammar[r][onum][:-1], '#', inum, f'expect {grammar[r][onum][inum + 1]}')

def show_candidates(candidates):
    print('candidates')
    for candidate in candidates:
        show_candidate(candidate)

src = "x + (1 + (y * (7 - 6)))"
last_item = None

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
starters = candidates

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

    """
    input()

    if state is None:
        candidates = search(item)
        show_candidates(candidates)
        state = 1
        continue

    # if there is a new token, remove all candidates that don't expect a
    # new one
    filtered = []
    for c in candidates:
        rule, onum, inum = c
        if inum < len(grammar[rule][onum]) - 2:
            filtered.append(c)
    candidates = filtered


    item_positions = search(item)
    #show_possible_token_positions(item, item_positions)
    show_candidates(candidates)

    new_candidates = []
    for item_pos in item_positions:
        previous = item_pos[:2] + [item_pos[2] - 1]
        if previous in candidates:
            print('possible candidate')
            show_candidate(previous)
            new_candidates.append(item_pos)
            r, onum, inum = item_pos
            if inum == len(grammar[r][onum]) - 2:
                print('  >> terminates', r)
                if r == 'start':
                    print('success !!!')
                    break
                new_candidates.pop()
                add_to_list(new_candidates, search_rule(r))

    if not new_candidates:
        raise SyntaxError('error for token ' + str(item))
    candidates = new_candidates
    """
