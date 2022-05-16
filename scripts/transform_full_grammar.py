import os
import re
import json

import transform_grammar_actions

grammar = {}

keywords = set()

with open("python.gram.js_actions", encoding="utf-8", newline=None) as f:
    for line in f:

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

def parse(line):
    pos = 0
    alias = None
    while pos < len(line):
        if line[pos] == "'" or line[pos] == '"':
            end = line[pos + 1:].find(line[pos])
            s = line[pos + 1:pos + end + 1]
            if re.match(r'^[a-z]+$', s):
                keywords.add(s)
            yield ['string', s]
            pos += end + 2
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
        elif mo := re.match('\w+', line[pos:]):
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
            while line[pos] != '}':
                pos += 1
            yield ['action', line[start:pos]]
            pos += 1
        else:
            yield ['unknown', line[pos]]
            print('line', line, 'unknown', line[pos])
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

    def X__str__(self):
        return self.show()

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
        if token == ['op', '|']:
            if self.sequence:
                ge = GrammarExpression(parent=self)
                ge.sequence = self.sequence
                ge.action = self.action
                self.action = None
                self.options.append(ge)
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
            if self.sequence and self.options:
                ge = GrammarExpression()
                ge.sequence = self.sequence
                if self.action:
                    ge.action = self.action
                    self.action = None
                self.options.append(ge)
                self.sequence = []
        elif token[0] == 'action':
            token[1] = re.sub("^\(.*?\)", "", token[1].strip())
            self.action = Literal(*token)
        else:
            if token[0] == 'id':
                self.add(Rule(token[1]))
            elif token[0] == 'alias':
                # store alias for next expression
                self.add(Alias(*token[1:]))
            else:
                self.add(Literal(*token))
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
            code = self.action.value.replace("'", "\\'")
            res += f", action: '{code}'"
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

if __name__ == '__main__':
    generate_javascript()
    print('possible types', types)
    print("keywords", keywords)