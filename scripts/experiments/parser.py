import tokenize
import token as _token
import io
import re
import shlex
import string

primitives = {}

operators = set()
keywords = set()
punctuations = set()

class Operator(str):
    pass

class Keyword(str):

    def __str__(self):
        return f"'{str.__str__(self)}'"


class Punctuation(str):
    pass

class Separated(str):

    def __str__(self):
        return f"'{self.separator}'.{str.__str__(self)}"

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
            elif tok == '.':
                if isinstance(option[-1], Punctuation):
                    state = 'separated'
                    separator = option.pop()
                else:
                    raise Exception('. after non separator ' + option.pop())
            else:
                if tok.startswith("'"):
                    if tok[1].isalpha():
                        option.append(Keyword(tok[1:-1]))
                        keywords.add(tok[1:-1])
                    elif tok[1] in string.punctuation:
                        option.append(Punctuation(tok[1:-1]))
                        punctuations.add(tok[1:-1])
                    elif not tok[1].isalpha():
                        option.append(Operator(tok[1:-1]))
                        operators.add(tok[1:-1])
                else:
                    option.append(tok)
        elif state == 'separated':
            sep = Separated(tok)
            sep.separator = separator
            option.append(sep)
            state = 'expect+'
        elif state == 'expect+':
            if tok != '+':
                raise Exception('expected +, got ' + tok)
            state = 'new'
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
with open('python.mini.gram2', encoding='utf-8') as f:
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

for rule, options in grammar.items():
    print(rule)
    for option in options:
        print(option)
        print('  |', ' '.join(str(x) for x in option))

print('operators', operators)
print('keywords', keywords)
print('punctuations', punctuations)

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
    test = False # isinstance(e, Separated)
    if test:
        print('can follow', e)
    for rule, options in grammar.items():
        for onum, option in enumerate(options):
            if e is None:
                if option[0] == option[0].upper() or \
                        isinstance(option[0], (Operator, Keyword)):
                    result.append([rule, onum, 0])
            else:
                for inum, ge in enumerate(option[:-1]):
                    if ge == e:
                        if isinstance(e, Separated):
                            result.append([rule, onum, inum])
                        if len(option) == 2:
                            add_to_list(result, can_follow(rule))
                        elif inum < len(option) - 2:
                            if isinstance(ge, Separated):
                                result.append([rule, onum, inum])
                                if getattr(ge, 'expect', None) == 'separator':
                                    result.append([rule, onum, inum + 1])
                            else:
                                next_ge = option[inum + 1]
                                if next_ge == '[':
                                    # next can be first ge inside []
                                    result.append([rule, onum, inum + 2])
                                    # or the ge after matching ']'
                                    next_inum = inum + 1
                                    nb_inum = len(option)
                                    while next_inum < nb_inum - 1:
                                        if option[next_inum] == ']':
                                            break
                                        next_inum += 1
                                    print('[ ends at', option[next_inum])
                                    if next_inum == nb_inum - 2:
                                        add_to_list(result, can_follow(rule))
                                    else:
                                        result.append([rule, onum, next_inum + 1])
                                elif next_ge == '(':
                                    # next can be the ge after "("
                                    result.append([rule, onum, inum + 2])
                                    # check if there is a repeater ("*" or "+")
                                    # after matching ")"
                                    next_inum = inum + 1
                                    nb_inum = len(option)
                                    while next_inum < nb_inum - 1:
                                        if option[next_inum] == ')':
                                            break
                                        next_inum += 1
                                    print('( ends at', option[next_inum])
                                else:
                                    result.append([rule, onum, inum + 1])
                        else:
                            add_to_list(result, can_follow(rule))

    return result

print('can follow None', can_follow(None))


candidates = []


src = "x + (1 + (y * (7 - 6)))"
src = "global x"


last_item = None

def starters(r):
    # list of options whose first option is compatible with rule "r"
    result = []
    for rule, options in grammar.items():
        for onum, option in enumerate(options):
            if option[0] == r:
                result.append([rule, onum, 0])
    if r in is_a:
        for equiv in is_a[r]:
            add_to_list(result, starters(equiv))
    return result



def match(token, ge):
    # check if token matches the grammar expression referenced by candidate
    # returns a list of candidates for the next token
    tok_type = _token.tok_name[token.type]
    test = tok_type == 'OP' and token.string == '='
    if test:
        print('test match', tok_type, token.string, 'with ge', ge)
        input()
    if ge in operators or ge in punctuations:
        if tok_type == 'OP' and token.string == ge:
            return ge
    elif ge in keywords:
        if tok_type == 'NAME' and token.string == ge:
            return ge

    elif isinstance(ge, Separated):
        if not hasattr(ge, 'expect'):
            ge.expect = 'repeated'
        if ge.expect == 'repeated' and tok_type == ge:
            ge.expect = 'separator'
            return ge
        elif ge.expect == 'separator' and tok_type == 'OP' and \
                token.string == ge.separator:
            ge.expect = 'repeated'
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

