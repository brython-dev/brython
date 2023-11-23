import os
import re
import json

#import transform_grammar_actions

import make_dist
import javascript_minifier

import version
vnum = '.'.join(str(num) for num in version.version[:2])

# grammar file is downloaded by script downloads.py
grammar_file = f'python{vnum}.gram'

grammar = {}

keywords = set()

with open(grammar_file, encoding="utf-8", newline=None) as f:
    src = f.read()

sep = re.search("^'''", src, flags=re.M).end()
head = src[:sep]
src = src[sep:]

for line in src.split('\n'):

    if line.startswith('#') or not line.strip():
        continue

    comment_pos = line.find('#')
    if comment_pos > -1:
        line = line[:comment_pos].rstrip()
    line = line.rstrip()

    if mo := re.match(r'^(\w+)(\[[a-zA-Z_*]+\])?\s*(\(\w+\))?:(.*)$', line):
        decl = mo.group(1)
        grammar[decl] = mo.group(4).strip()
    else:
        grammar[decl] += ' ' + line.strip()

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
    "_RAISE_SYNTAX_ERROR_INVALID_TARGET"]

def find_end_of_string(src, quote, start):
    escaped = False
    pos = start
    while pos < len(src):
        if src[pos] == quote and not escaped:
            return pos
        if src[pos] == '\\':
            escaped = not escaped
        else:
            escaped = False
        pos += 1
    return -1

def parse_action(action):
    pos = 0
    alias = None
    while pos < len(action):
        if action[pos] == "'" or action[pos] == '"':
            end = find_end_of_string(action, action[pos], pos + 1)
            if end == -1:
                print('no end ?', action, pos + 1, action[pos], action[pos + 1:])
                input()
            s = action[pos + 1:end]
            if re.match(r'^[a-z]+$', s):
                keywords.add(s)
            yield ['string', s]
            pos = end + 1
        elif action[pos] in '()[]?:!*+|~.=':
            yield ['op', action[pos]]
            pos += 1
        elif action[pos] == '&':
            if pos + 1 < len(action) and action[pos + 1] == '&':
                # sequence &&
                pos += 2
            else:
                yield ['op', action[pos]]
                pos += 1
        elif mo := re.match(r'\w+', action[pos:]):
            s = action[pos:pos + mo.end()]
            end_pos = pos + mo.end()
            annotation = None
            if end_pos < len(action):
                if action[end_pos] == '[':
                    pos = end_pos + 1
                    while action[pos] != ']':
                        pos += 1
                    annotation = action[end_pos + 1:pos]
                    end_pos = pos + 1
            if end_pos < len(action) and action[end_pos] == '=':
                yield ['alias', s, annotation]
                pos = end_pos + 1
                continue
            name = (s, annotation)
            if s == s.upper(): # NAME, NUMBER, STRING
                yield ['builtin', *name]
            else:
                yield ['id', *name]
            pos = end_pos
            alias = None
        elif action[pos] == ' ':
            pos += 1
        elif action[pos] == '{':
            start = pos + 1
            pos += 1
            quote = False
            while True:
                if action[pos] == '"' or action[pos] == "'":
                    quote = action[pos]
                    pos += 1
                    while action[pos] != quote:
                        pos += 1
                if action[pos] == '}':
                    break
                pos += 1
            yield ['action', action[start:pos]]
            pos += 1
        elif action[pos] == ',':
            yield ['op', ',']
            pos += 1
        elif action[pos] == '-':
            if pos < len(action) and action[pos + 1] == '>':
                yield ['op', '->']
                pos += 2
            else:
                yield ['op', '-']
                pos += 1
        else:
            yield ['unknown', action[pos]]
            print('action', action, 'unknown at pos', pos, action[pos])
            print(action[pos - 40:pos + 40])
            input()
            pos += 1

    yield ['eol', '']

def make_id():
    i = 1
    while True:
        yield i
        i += 1

id_maker = make_id()

class Node:

    def __init__(self, aliases, parent=None):
        self.id = next(id_maker)
        self.parent = parent
        if parent is not None:
            parent.content.append(self)
        self.children = []
        self.content = []
        self.aliases = aliases
        self.aliases.add('p')

    def add(self, item):
        self.content.append(item)

    def group_arguments(self):
        args = [[]]
        for item in self.content:
            if item == ['op', ',']:
                args.append([])
            else:
                args[-1].append(item)
                if isinstance(item, Node):
                    item.group_arguments()
        self.arguments = args

    def __Srepr__(self):
        return self.show()

    def show(self):
        t = []
        for arg in self.arguments:
            t_arg = []
            for item in arg:
                if isinstance(item, Node):
                    call = ''
                    if t_arg and not isinstance(t_arg[-1], Node) and \
                            t_arg[-1][0] in ('id', 'builtin'):
                        call = t_arg.pop()[1]
                    t_arg.append(call + '(' + item.show() + ')')
                else:
                    if t_arg and isinstance(t_arg[-1], str) and call == '' \
                            and item[0] in ('id', 'builtin'):
                        # remove parenth expressions followed by an id
                        # eg "((expr_ty) b)" becomes "(b)"
                        t_arg.pop()
                    if item == ['op', '*']:
                        continue
                    t_arg.append(item)
            s_arg = ''
            pos = 0
            while pos < len(t_arg):
                if isinstance(t_arg[pos], str):
                    s_arg += t_arg[pos]
                    pos += 1
                elif t_arg[pos] == ['op', '->']:
                    s_arg += '.'
                    if pos + 1 < len(t_arg) and t_arg[pos + 1][:2] == ['id', 'v']:
                        # sequence x->v.Name.id transformed to x.id
                        pos += 5
                    else:
                        pos += 1
                elif t_arg[pos][0] == 'string':
                    s_arg += f'"{t_arg[pos][1]}"'
                    pos += 1
                else:
                    if t_arg[pos][0] == 'id' and t_arg[pos][1] in self.aliases:
                        s_arg += 'L.'
                    if t_arg[pos][:2] == ['id', 'void']:
                        s_arg += '"void"'
                    else:
                        s_arg += t_arg[pos][1]
                    pos += 1
            t.append(s_arg)
        return ', '.join(t)

def transform_action(action, aliases):
    state = None
    depth = 0
    bufs = []
    last = None
    node = Node(aliases)
    s = ''
    for item in parse_action(action):
        if item == ['op', '(']:
            node = Node(aliases, node)
        elif item == ['op', ')']:
            node = node.parent
        else:
            node.add(item)

    node.group_arguments()

    print('action', action)
    return '(L) => ' + node.show()

    action1 = re.sub(r'->v\..*?\.', '.', action)
    action2 = re.sub(r'\(\(.*_ty\) (.*?)\)', r'\1', action1)
    action3 = re.sub(r'\([^(]+ \*\)', '', action2)
    action4 = re.sub(r'\([a-z_]*\*?\)_Py', '_Py', action3)
    action5 = re.sub(r'([a-z_]+)\*', r'\1', action4)
    action6 = re.sub('->', '.', action5)
    action7 = re.sub('_PyPegen_', '$B._PyPegen.', action6)
    action8 = re.sub('_PyAST_', '$B._PyAST.', action7)
    #action9 = re.sub(operators_re, r'$B.ast.\1', action8)
    action9 = re.sub(r'([a-z]+)_ty\b', r'$B.ast.\1', action8)

    func_re = r'(\w+?)\('
    for mo in re.finditer(func_re, action9):
        call = action9[mo.start():mo.end()-1]
        if call in helper_functions:
            action9 = action9.replace(call, '$B.helper_functions.' + call)
    # remove parameter types, eg
    # "$B._PyPegen.joined_str(p, a, (asdl_expr_seq)b, c)"
    # replaced by
    # "$B._PyPegen.joined_str(p, a, b, c)"
    args_mo = re.search(r'\(.*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        s1 = re.sub(r'\((.*?)\)(\w+)', r'\2', s)
        if s1 != s:
            action10 = action9.replace(s, s1)
            action9 = action10

    args_mo = re.search(r'\(.*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        params = [x.strip() for x in s.split(',')]
        params1 = []
        for param in params:
            if 'void' in s:
                print(s, param)
            if len(param) == 1 and param.isalpha() and param == param.lower():
                params1.append('L.' + param)
            elif param.startswith('"') or param.startswith("'"):
                params1.append(param)
            elif '*' in param:
                params1.append(f'"{param}"')
            elif param == 'void':
                params1.append('"void"')
            elif param == 'Store' or param == 'Load':
                params1.append('$B.ast.' + param)
            else:
                params1.append(param)

        if 'void' in s:
            print('params1', params1)
        s1 = ', '.join(params1)
        action10 = action9.replace(s, s1)
        action9 = action10

    type_decl = re.match(r'\s*(\(.*?\))(.*)', action9)
    if type_decl:
        action9 = action9[:type_decl.start(1)] + action9[type_decl.end(1):]
        print('new', action9)

    if '(' not in action9:
        print('no (, action', action9)
        for alias in aliases:
            action9 = action9.replace(alias, 'L.' + alias)

    action10 = '(L) => ' + action9.strip('{}')


    return action10

action = """PyErr_Occurred() ? NULL : RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting '}'")"""
print(action)
transform_action(action, {'a', 'b', 'c'})
input()

def parse(line):
    pos = 0
    alias = None
    while pos < len(line):
        if line[pos] == "'" or line[pos] == '"':
            end = line.find(line[pos], pos + 1)
            s = line[pos + 1:end]
            if re.match(r'^[a-z]+$', s):
                keywords.add(s)
            yield ['string', s]
            pos = end + 1
        elif line[pos] in '()[]?!*+|~.=':
            yield ['op', line[pos]]
            pos += 1
        elif line[pos] == '&':
            if pos + 1 < len(line) and line[pos + 1] == '&':
                # sequence &&
                pos += 2
            else:
                yield ['op', line[pos]]
                pos += 1
        elif mo := re.match(r'\w+', line[pos:]):
            s = line[pos:pos + mo.end()]
            end_pos = pos + mo.end()
            annotation = None
            if end_pos < len(line):
                if line[end_pos] == '[':
                    pos = end_pos + 1
                    while line[pos] != ']':
                        pos += 1
                    annotation = line[end_pos + 1:pos]
                    end_pos = pos + 1
            if end_pos < len(line) and line[end_pos] == '=':
                yield ['alias', s, annotation]
                pos = end_pos + 1
                continue
            name = Name(s, annotation)
            if s == s.upper(): # NAME, NUMBER, STRING
                yield ['builtin', name]
            else:
                yield ['id', name]
            pos = end_pos
            alias = None
        elif line[pos] == ' ':
            pos += 1
        elif line[pos] == '{':
            start = pos + 1
            pos += 1
            quote = False
            while True:
                if line[pos] == '"' or line[pos] == "'":
                    quote = line[pos]
                    pos += 1
                    while line[pos] != quote:
                        pos += 1
                if line[pos] == '}':
                    break
                pos += 1
            yield ['action', line[start:pos]]
            pos += 1
        else:
            yield ['unknown', line[pos]]
            print('line', line, 'unknown at pos', pos, line[pos])
            print(line[pos - 40:pos + 40])
            input()
            pos += 1

    yield ['eol', '']

types = set()

class Name:

    def __init__(self, value, annotation):
        self.value = value
        self.annotation = annotation

    def to_dict(self):
        res = '{name: ' + f"'{self.value}'"
        if self.annotation:
            res += f", annotation: '{self.annotation}'"
        return res + '}'

    def __repr__(self):
        return f"{self.value}"

class Alias(Name):
    pass

class CommitChoice:

    @classmethod
    def show(cls, level=1, indent=4):
        return level * indent * ' ' + "{type: 'COMMIT_CHOICE'}"

class Element:

    def __init__(self, type, value, annotation=None):
        self.type = type
        self.value = value
        self.annotation = annotation
        self.repeat = [1, 1]
        self.join = None
        self.lookahead = None
        self.alias = None
        self.action = None

    def show(self, level=1, indent = 4):
        prefix = level * indent * ' '
        if self.type == 'rule':
            res = f"{{type: 'rule', name: '{self.value}'"
        elif self.type == 'builtin':
            res = f"{{type: '{self.value}'"
        elif self.type == 'string':
            res = f"{{type: 'string', value: '{self.value}'"
        elif self.type == 'op':
            print('op', self.value)
            res = f"{{type: 'op', value: '{self.value}'"
        elif self.type == 'action':
            res = f"{{type: 'action', value: '{self.value}'"
        else:
            print('unknown type', self, self.type)
            input()
            res = '/' + self.type + self.value + '\\'
        if self.join:
            res += f", join: '{self.join.value}'"
            if hasattr(self.join, 'alias') and self.join.alias is not None:
                res += f", alias: '{self.join.alias}'"
        if self.repeat != [1, 1]:
            res += f", repeat: '{self.repeat}'"
        if self.lookahead:
            res += f", lookahead: '{self.lookahead}'"
        if self.alias:
            res += f", alias: '{self.alias}'"
        if self.action:
            code = self.action.value.replace("'", "\\'")
            res += f", action: '{code}'"
        return prefix + res + '}'

class Rule(Element):

    def __init__(self, value):
        Element.__init__(self, 'rule', value)

    def __eq__(self, other):
        return self.value == other.value

    def __str__(self):
        return f'Rule("{self.value}")'

    __repr__ = __str__

class Literal(Element):

    def __eq__(self, other):
        return self.type == other.type and self.value == other.value

    def __str__(self):
        return f'Literal({self.type}, "{self.value}")'

    __repr__ = __str__

class GrammarExpression:

    def __init__(self, name=None, parent=None):
        if name is None and parent is not None:
            name = parent.name
        self.name = name
        self.parent = parent
        self.options = []
        self.sequence = []
        self.repeat = [1, 1]
        self.join = None
        self.lookahead = None
        self.action = None
        self.alias = None
        self.aliases = set()

    def add(self, item):
        if self.joining():
            item.join = self.sequence.pop()
        if (self.sequence and
                isinstance(self.sequence[-1], Element) and
                self.sequence[-1].type == 'lookahead'):
            item.lookahead = self.sequence.pop().value
        if (self.sequence and
                isinstance(self.sequence[-1], Alias)):
            item.alias = self.sequence.pop().value
        if isinstance(item, Element):
            types.add(item.type)
        self.sequence.append(item)

    def feed(self, token):
        test = False #self.name == 'simple_stmts'
        if test:
            print(self.name, 'feed', token)
        if token == ['op', '|']:
            if self.sequence:
                ge = GrammarExpression(parent=self)
                ge.sequence = self.sequence
                ge.action = self.action
                self.action = None
                self.options.append(ge)
                if test:
                    print('add option', ge.show())
            self.sequence = []
        elif token == ['op', '*']: # repeat 0 or more
            self.sequence[-1].repeat = '*' #[0, float('inf')]
        elif token == ['op', '+']: # repeat 1 or more
            self.sequence[-1].repeat = '+' #[1, float('inf')]
        elif token == ['op', '?']: # previous is optional
            self.sequence[-1].repeat = '?' #[0, 1]
        elif token == ['op', '.']:
            assert self.sequence[-1].type == 'string'
            self.sequence[-1].type = 'join'
        elif token == ['op', '[']: # open optional expr
            sub_ge = GrammarExpression()
            sub_ge.parent = self
            return sub_ge
        elif token == ['op', '(']: # open group
            sub_ge = GrammarExpression()
            if self.alias:
                sub_ge.alias = self.alias
                self.alias = None
            sub_ge.parent = self
            return sub_ge
        elif token == ['op', ']']: # can only happen in a sub expression
            self.repeat = '?' #[0, 1]
            self.parent.add(self)
            return self.parent
        elif token == ['op', '~']: # commit to current choice
            self.add(CommitChoice)
        elif token == ['op', '&']: # positive lookahead
            self.add(Element('lookahead', 'positive'))
        elif token == ['op', '!']: # negative lookahead
            self.add(Element('lookahead', 'negative'))
        elif token == ['op', ')']: # close group
            self.feed(['eol', ''])
            self.parent.add(self)
            return self.parent
        elif token[0] == 'eol':
            self.got_eol = True
            if test:
                print(self.name, 'eol, sequence', self.sequence,
                    'options', self.options)
            if self.sequence and self.options:
                ge = GrammarExpression()
                ge.sequence = self.sequence
                if self.action:
                    ge.action = self.action
                    self.action = None
                self.options.append(ge)
                self.sequence = []
        elif token[0] == 'action':
            self.action = transform_action(token[1], self.aliases) #Literal(*token)
        else:
            if token[0] == 'id':
                self.add(Rule(token[1]))
            elif token[0] == 'alias':
                # store alias for next expression
                self.add(Alias(*token[1:]))
                self.aliases.add(token[1])
            else:
                self.add(Literal(*token))
        if test:
            print(self.name, self.sequence, self.options)
        return self

    def joining(self):
        return self.sequence and hasattr(self.sequence[-1], 'type') \
                    and self.sequence[-1].type == 'join'

    def show(self, level=1, indent=4):
        prefix = level * indent * ' '
        prefix1 = prefix + indent * ' '
        res = prefix
        if self.options:
            res += '{\n' + prefix + ' ' + 'choices: [\n'
            t = []
            for option in self.options:
                t.append(option.show(level + 2, indent))
            res += ',\n'.join(t) + ']'
        else:
            res = ''
            t = []
            res += prefix + '{\n' + prefix1 + 'items: [\n'
            for item in self.sequence:
                t.append(item.show(level + 2, indent))
            res += ',\n'.join(t)
            res += '\n' + prefix1 + ']'
        if self.join:
            res += f", join: '{self.join.value}'"
            if hasattr(self.join, 'alias') and self.join.alias is not None:
                res += f", alias: '{self.join.alias}'"
        if self.repeat != [1, 1]:
            res += ',\n' + prefix1 + f"repeat: '{self.repeat}'"
        if self.lookahead:
            res += f", lookahead: '{self.lookahead}'"
        if self.alias:
            res += f", alias: '{self.alias}'"
        if self.action:
            code = self.action.replace("'", "\\'")
            res += f", action: {code}"
        return res + '\n' + prefix + '}'

end = """for(var rule_name in grammar){
    grammar[rule_name].name = rule_name
    if(grammar[rule_name].choices){
        grammar[rule_name].choices.forEach(function(item, rank){
            item.parent_rule = rule_name
            item.rank = rank
        })
    }
}
"""

def generate_javascript():
    dest = os.path.join(os.path.dirname(os.getcwd()),
        'www', 'src', 'full_grammar.js')
    with open(dest, 'w', encoding='utf-8') as out:
        out.write('(function($B){\n')
        out.write('var grammar = $B.grammar = {\n')
        for token, descr in grammar.items():
            ge = GrammarExpression(token)
            for x in parse(descr):
                ge = ge.feed(x)
            out.write(token + ':\n')
            out.write(ge.show(indent=2) + ',\n')
        out.write('}\n')
        out.write(end)
        out.write('})(__BRYTHON__)')

    # Generate brython_standard_parser.js
    # When included in a page instead of brython.js, uses Python grammar
    # to parse Python code and generate the AST
    with open(make_dist.abs_path('brython.js'), encoding='utf-8') as f:
        res = f.read()
    src = ''
    for fname in ['string_parser', 'number_parser', 'action_helpers',
            'python_parser', 'full_grammar']:
        src = open(make_dist.abs_path(fname) + '.js').read() + '\n'
        try:
            mini = javascript_minifier.minify(src) + ";\n"
        except:
            print('error in', fname)
            raise
        res += mini

    with open(make_dist.abs_path('brython_standard_parser.js'), 'w', newline="\n") as out:
        out.write(res)
        out.write('\n__BRYTHON__.parser_to_ast = true\n')

if __name__ == '__main__':
    generate_javascript()
    print('possible types', types)
    print("keywords", keywords)