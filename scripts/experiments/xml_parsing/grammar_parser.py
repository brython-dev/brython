import re

def tmp_counter():
    i = 1
    while True:
        yield f'tmp_{i}'
        i += 1

temp_count = tmp_counter()

class GE:

    def __init__(self, value):
        self.value = value
        #self.expect_name = f"{self.__class__.__name__}_{next(temp_count)}"

    def __repr__(self):
        return self.value

class Alt(GE):
    """Singleton for token | """
    pass

class Minus(GE):
    """Singleton for token - """
    pass

class Literal(GE):

    def __repr__(self):
        if not "'" in self.value:
            return f"'{self.value}'"
        elif not '"' in self.value:
            return f'"{self.value}"'
        else:
            repl = self.value.replace("'", "\\'")
            return f"'{repl}'"

class Rule(GE):

    def __repr__(self):
        return self.value + getattr(self, 'quantifier', '')

class Quantifier(GE):
    pass

class OpenParenth(GE):
    pass

class CloseParenth(GE):
    pass

class End(GE):
    pass

class Charset(GE):

    def __repr__(self):
        return f"[{self.value}]"


rule_def_re = re.compile(r'^(.*?)\s*::=(.*)$')

def handle_alts(rules):
    add_rules = {}
    for rule_name, rule in rules.items():
        print(rule_name, rule)
        options = []
        start_alt = 0
        i = 0
        while i < len(rule):
            token = rule[i]
            print(token)
            if token is Alt:
                if i == start_alt + 1:
                    options.append(rule[start_alt])
                else:
                    subrule_name = next(temp_count)
                    add_rules[subrule_name] = rule[start_alt:i]
                    options.append(Rule(subrule_name))
                start_alt = i + 1
            i += 1
        if not options:
            continue
        if start_alt == len(rule) - 1:
            options.append(rule[start_alt])
        else:
            subrule_name = next(temp_count)
            add_rules[subrule_name] = rule[start_alt:]
            options.append(Rule(subrule_name))
        for i, option in enumerate(options[:-1]):
            options[i].alt = options[i + 1]
            options[i].rule_name = rule_name
        rules[rule_name] = options
    rules.update(add_rules)

def handle_minus(rules):
    add_rules = {}
    for rule_name, rule in rules.items():
        print(rule_name, rule)
        options = []
        start_minus = 0
        i = 0
        while i < len(rule):
            token = rule[i]
            print(token)
            if token is Minus:
                if i == start_minus + 1:
                    options.append(rule[start_minus])
                else:
                    subrule_name = next(temp_count)
                    add_rules[subrule_name] = rule[start_minus:i]
                    options.append(Rule(subrule_name))
                start_minus = i + 1
            i += 1
        if not options:
            continue
        if start_minus == len(rule) - 1:
            options.append(rule[start_minus])
        else:
            subrule_name = next(temp_count)
            add_rules[subrule_name] = rule[start_alt:]
            options.append(Rule(subrule_name))
        for i, option in enumerate(options[:-1]):
            options[i].minus = options[i + 1]
            options[i].rule_name = rule_name
        rules[rule_name] = options
    rules.update(add_rules)


def handle_quantifiers(rules):
    for rule_name, rule in rules.items():
        options = []
        i = len(rule) - 1
        while i > 0:
            token = rule[i]
            if isinstance(token, Quantifier):
                rule[i - 1].quantifier = token.value
                del rule[i]
            i -= 1

def handle_single_sequences(rules):
    for rule_name, rule in rules.items():
        for i, option in enumerate(rule):
            if isinstance(option, SEQUENCE) and len(option) == 1:
                rule[i] = option[0]

def replace_groups(tokens, rules):
    closing = {} # maps position of ( to position of matching )
    stack = []
    for i, token in enumerate(tokens):
        if token is OpenParenth:
            stack.append(i)
        elif token is CloseParenth:
            level = len(stack)
            if level not in closing:
                closing[level] = {}
            closing[level][stack.pop()] = i
    if not closing:
        return
    # replace groups
    levels = list(closing)
    levels.sort()
    max_level = levels[-1]
    starts = list(closing[max_level])
    starts.sort(reverse=True)
    for start in starts:
        rule_name = next(temp_count)
        end = closing[max_level][start]
        rules[rule_name] = tokens[start + 1:end]
        tokens[start:end + 1] = [Rule(rule_name)]
    replace_groups(tokens, rules)


def add_rule_def(rule_name, rule_def):
    print(rule_name, '::=', rule_def)
    rules = {}
    tokens = list(rule_def_tokenizer(rule_def))
    rules[rule_name] = tokens
    replace_groups(tokens, rules)
    handle_alts(rules)
    handle_minus(rules)
    handle_quantifiers(rules)
    return rules

def rule_def_tokenizer(rule_def):
    pos = 0
    charset = False
    while pos < len(rule_def):
        char = rule_def[pos]
        if charset:
            if char == ']' and not chars.endswith('\\'):
                charset = False
                yield Charset(chars)
                pos += 1
                continue
            else:
                chars += char
                pos += 1
                continue
        if char == "'" or char == '"':
            quote = char
            literal = ''
            pos += 1
            while rule_def[pos] != quote:
                literal += rule_def[pos]
                pos += 1
            yield Literal(literal)
            pos += 1
        elif char.isalpha():
            rule = char
            pos += 1
            while pos < len(rule_def) and (rule_def[pos].isalpha()
                    or rule_def[pos] in '-_'):
                rule += rule_def[pos]
                pos += 1
            yield Rule(rule)
        elif char in '?*+':
            yield Quantifier(char)
            pos += 1
        elif char == '|':
            yield Alt
            pos += 1
        elif char == '-':
            yield Minus
            pos += 1
        elif char == '(':
            yield OpenParenth
            pos += 1
        elif char == ')':
            yield CloseParenth
            pos += 1
        elif char == '[':
            charset = True
            chars = ''
            pos += 1
        else:
            pos += 1

def make_rules(grammar):
    rules = {}
    top = None
    lines = grammar.strip().split('\n')
    for line in lines:
        if mo := rule_def_re.match(line.strip()):
            rule_name, rule_def = mo.groups()
            if top is None:
                top = rule_name
            if rule_def:
                rules.update(add_rule_def(rule_name, rule_def))
    rules[top].append(End)
    return rules

if __name__ == "__main__":
    grammar = """
    tag::= '<' NAME S* attr? '>'
    attr::= NAME S* '=' S* attr_value
    attr_value::= '"' [^&"]* '"'
    """

    grammar = """
    tag ::= ("'" CHAR* "'" | '"' CHAR* '"')
    """

    grammar = """
    document  ::=  prolog element Misc*
    prolog       ::=  XMLDecl? Misc* (doctypedecl Misc*)?
    XMLDecl      ::=  '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
    VersionInfo  ::=  S 'version' Eq ("'" VersionNum "'" | '"' VersionNum '"')
    Eq           ::=  S? '=' S?
    VersionNum   ::=  '1.0'
    EncodingDecl  ::=  S 'encoding' Eq ('"' EncName '"' | "'" EncName "'" )
    EncName       ::=  [A-Za-z] ([A-Za-z0-9._] | '-')*
    SDDecl  ::=  S 'standalone' Eq (("'" ('yes' | 'no') "'") | ('"' ('yes' | 'no') '"'))
    """

    _grammar = """
    SDDecl  ::=  ( ('yes' | 'no') NAME | ('oui' | 'non') NAME )
    """

    _grammar = """
    tag ::= '<' (NAME | (NUMBER | CHAR ) ) '>'
    """

    grammar = """
    tag  ::=   ('ab' | 'ac') 'x'
    """
    rules = make_rules(grammar)

    import pprint
    pprint.pprint(rules)
