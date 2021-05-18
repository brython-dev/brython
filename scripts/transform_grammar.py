import os
import re
import pprint

grammar = {}
keywords = set()

with open("grammar.txt", encoding="utf-8") as f:
    for line in f:
        if line.startswith('#') or not line.strip():
            continue
        comment_pos = line.find('#')
        if comment_pos > -1:
            line = line[:comment_pos].rstrip()
        line = line.rstrip()

        if mo := re.match('^(\w+):(.*)$', line):
            decl = mo.group(1)
            grammar[decl] = mo.group(2).strip()
        else:
            grammar[decl] += ' ' + line.strip()

def parse(line):
    pos = 0
    while pos < len(line):
        if line[pos] == "'" or line[pos] == '"':
            end = line[pos + 1:].find(line[pos])
            s = line[pos + 1:pos + end + 1]
            if re.match(r'^[a-z]+$', s):
                keywords.add(s)
            yield ['string', s]
            pos += end + 2
        elif line[pos] in '()[]?!*+|~.&':
            yield ['op', line[pos]]
            pos += 1
        elif mo := re.match('\w+', line[pos:]):
            s = line[pos:pos + mo.end()]
            if s == s.upper(): # NAME, NUMBER, STRING
                yield ['builtin', s]
            else:
                yield ['id', s]
            pos += mo.end()
        elif line[pos] == ' ':
            pos += 1
        else:
            yield ['unknown', line[pos]]
            pos += 1

    yield ['eol', '']

types = set()

class CommitChoice:

    @classmethod
    def show(cls, level=1, indent=4):
        return level * indent * ' ' + "{type: 'COMMIT_CHOICE'}"

class Element:

    def __init__(self, type, value):
        self.type = type
        self.value = value
        self.repeat = [1, 1]
        self.join = None
        self.lookahead = None

    def show(self, level=1, indent = 4):
        prefix = level * indent * ' '
        if self.type == 'rule':
            res = f"{{type: 'rule', name:'{self.value}'"
        elif self.type == 'builtin':
            res = f"{{type: '{self.value}'"
        elif self.type == 'string':
            res = f"{{type: 'string', value: '{self.value}'"
        elif self.type == 'op':
            print('op', self.value)
            res = f"{{type: 'op', value: '{self.value}'"
        else:
            res = '/' + self.type + self.value + '\\'
        if self.join:
            res += f", join: '{self.join.value}'"
        if self.repeat != [1, 1]:
            res += f', repeat: {self.repeat}'
        if self.lookahead:
            res += f", lookahead: '{self.lookahead}'"
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

    def __str__(self):
        return self.show()

    def add(self, item):
        if self.joining():
            item.join = self.sequence.pop()
        if (self.sequence and
                isinstance(self.sequence[-1], Element) and
                self.sequence[-1].type == 'lookahead'):
            item.lookahead = self.sequence.pop().value
        if isinstance(item, Element):
            types.add(item.type)
        self.sequence.append(item)

    def feed(self, token):
        if token == ['op', '|']:
            if self.sequence:
                ge = GrammarExpression(parent=self)
                ge.sequence = self.sequence
                self.options.append(ge)
            self.sequence = []
        elif token == ['op', '*']: # repeat 0 or more
            self.sequence[-1].repeat = [0, float('inf')]
        elif token == ['op', '+']: # repeat 1 or more
            self.sequence[-1].repeat = [1, float('inf')]
        elif token == ['op', '.']:
            assert self.sequence[-1].type == 'string'
            self.sequence[-1].type = 'join'
        elif token == ['op', '[']: # open optional expr
            sub_ge = GrammarExpression()
            sub_ge.parent = self
            return sub_ge
        elif token == ['op', '(']: # open group
            sub_ge = GrammarExpression()
            sub_ge.parent = self
            return sub_ge
        elif token == ['op', ']']: # can only happen in a sub expression
            self.repeat = [0, 1]
            self.parent.add(self)
            return self.parent
        elif token == ['op', '?']: # previous is optional
            self.sequence[-1].repeat = [0, 1]
        elif token == ['op', '~']: # commit to current choice
            print('commit choice', self)
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
            if self.sequence and self.options:
                ge = GrammarExpression()
                ge.sequence = self.sequence
                self.options.append(ge)
                self.sequence = []
        elif token[0] == 'id' and token[1].startswith('invalid'):
            pass
        else:
            if token[0] == 'id':
                self.add(Rule(token[1]))
            else:
                self.add(Literal(*token))
        return self

    def joining(self):
        return self.sequence and hasattr(self.sequence[-1], 'type') \
                    and self.sequence[-1].type == 'join'

    def show(self, level=1, indent=4):
        prefix = level * indent * ' '
        res = prefix
        if self.options:
            res += '{choices: [\n'
            t = []
            for option in self.options:
                t.append(option.show(level + 1))
            res += ',\n'.join(t) + ']'
        else:
            res = ''
            t = []
            res += prefix + '{items: [\n'
            for item in self.sequence:
                t.append(item.show(level + 1))
            res += ',\n'.join(t)
            res += '\n' + prefix + ']'
        if self.join:
            res += f", join: '{self.join.value}'"
        if self.repeat != [1, 1]:
            res += f', repeat: [{self.repeat[0]}, {self.repeat[1]}]'
        if self.lookahead:
            res += f", lookahead: '{self.lookahead}'"
        return res + '}'

def generate_javascript():
    dest = os.path.join(os.path.dirname(os.getcwd()),
        'www', 'src', 'grammar.js')
    with open(dest, 'w', encoding='utf-8') as out:
        out.write('var grammar = {\n')
        for token, descr in grammar.items():
            ge = GrammarExpression(token)
            for x in parse(descr):
                ge = ge.feed(x)
            out.write(token + ':\n')
            out.write(ge.show() + ',\n')
        out.write('}')

if __name__ == '__main__':
    generate_javascript()
    print('possible types', types)
    print("keywords", keywords)