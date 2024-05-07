from xml_grammar_parser import make_rules, Literal, Rule, Charset, End

class ARGS(dict):

    def __repr__(self):
        s = ', '.join(f'{k}: {v}' for k, v in self.items())
        return '{' + s + '}'

def generate_parser(rules, dest=None):
    dest = dest or 'parser.js'
    indent = 0
    with open(dest, 'w', encoding='utf-8') as out:
        write = lambda x: out.write(indent * '  ' + x + '\n')

        write(f"var rules = {{")
        for rule, options in rules.items():
            s = str(options)
            s = s.replace('\\n', '\\\\n')
            s = s.replace('\\r', '\\\\r')
            s = s.replace('\\t', '\\\\t')
            write(f"{rule}: `{s}`,")
        write(f"}}")

        for rule, options in rules.items():
            print('rule', rule)
            print('  options', options, type(options))
            write(f"function {rule}_rule(origin){{")
            indent += 1
            if hasattr(options[0], 'alt'):
                write("this.alt = true")
            write(f"this.origin = origin")
            write(f"this.pos = get_pos(this)")
            write(f"this.result_store = {{}}")
            write(f"this.expect = 0 // {options[0]}")
            write(f"this.items = {[f'{x}' for x in options]}")
            write(f"this.rules = []")
            write(f"this.repeats = []")
            indent -= 1
            write('}')
            write('')
            write(f"{rule}_rule.prototype.feed = function(char){{")
            indent += 1
            #write(f"console.log('{rule}_rule pos', this.pos, 'expects', this.items[this.expect] || 'END', 'char', char)")
            #write(f"show_path(this)")
            #write(f"show_position(this, get_pos(this))")
            #write(f"alert()")
            write(f"var res, rule")
            write(f"switch(this.expect){{")
            for i, option in enumerate(options):
                print('option', option)
                if option is End:
                    indent += 1
                    write(f"case -1:")
                    write(f"case {i}:")
                    indent += 1
                    write(f"if(char == END){{")
                    indent += 1
                    write(f"return DONE")
                    indent -= 1
                    write(f"}}")
                    write(f"return FAIL")
                    indent -=2
                    continue

                indent += 1
                num = 1
                write(f"case {i}: // {option}")
                indent += 1
                alt = getattr(option, 'alt', None)
                minus = getattr(option, 'minus', None)
                quantifier = getattr(option, 'quantifier', None)
                if i == len(options) - 1:
                    next_if_ok = -1
                elif minus:
                    next_if_ok = i + 2
                    if next_if_ok == len(options):
                        next_if_ok = -1
                else:
                    next_if_ok = i + 1
                if alt:
                    alt_index = options.index(alt)
                    next_if_ok = -1
                if minus:
                    print('option has minus', option)
                    print(rule, options)
                    input()
                    minus_index = options.index(minus)

                write(f"if(! this.rules[{i}]){{")
                indent += 1
                lhs = f"this.rules[{i}]"
                if isinstance(option, Literal):
                    if isinstance(option.value, int):
                        literal = f"String.fromCharCode({option.value})"
                    else:
                        literal = option.value.replace("'", "\\'")
                        literal = f"'{literal}'"
                    write(f"{lhs} = new LITERAL(this, {literal})")
                elif isinstance(option, Charset):
                    charset = option.value.replace("'", "\\'")
                    write(f"{lhs} = new CHARSET_rule(this, '{charset}')")
                elif isinstance(option, Rule):
                    write(f"{lhs} = new {option.value}_rule(this)")
                if quantifier:
                    write(f"this.repeats[{i}] = 0")
                indent -= 1
                write(f"}}")
                write(f"rule = this.rules[{i}]")
                write(f"rule.pos = rule.pos ?? get_pos(this)")

                if quantifier == '+':
                    write(f"return handle_plus(this, {i},{next_if_ok}, rule, char)")
                elif quantifier == '*':
                    write(f"return handle_star(this, {i}, {next_if_ok}, rule, char)")
                elif quantifier == '?':
                    write(f"return handle_zero_or_one(this, {i}, {next_if_ok}, rule, char)")
                elif alt:
                    write(f"return handle_alt(this, {alt_index}, rule, char)")
                elif next_if_ok != -1:
                    write(f"return handle_simple(this, {next_if_ok}, rule, char)")
                elif next_if_ok == -1:
                    write(f"return handle_last(this, rule, char)")
                else:
                    write(f"if(char === FAIL){{")
                    indent += 1
                    if alt:
                        write(f"set_expect(this, {alt_index})")
                        write(f"reset_pos(this, this.pos)")
                        write(f"return this.origin.feed(read_char(this))")
                    else:
                        write(f"return this.origin.feed(FAIL)")
                    indent -= 1
                    write(f"}}else if(char === DONE){{")
                    indent += 1
                    write(f"rule.reset()")
                    if alt or next_if_ok == -1:
                        write(f"return this.origin.feed(char)")
                    else:
                        write(f"set_expect(this, {next_if_ok})")
                        write(f"return this.feed(read_char(this))")
                    indent -= 1
                    write(f"}}else if(char === END){{")
                    indent += 1
                    if alt:
                        write(f"set_expect(this, -1)")
                    else:
                        write(f"set_expect(this, {next_if_ok})")
                    write(f"return this")
                    indent -= 1
                    write(f"}}else{{")
                    indent += 1
                    write(f"return rule.feed(char)")
                    indent -= 1
                    write(f"}}")
                indent -= 2
                num += 1

            if options[-1] is not End:
                indent += 1
                write(f"case -1:")
                indent += 1
                write(f"return this.origin.feed(DONE)")
                indent -= 2

            write(f"}}") # close "switch"
            write(f"return this")
            indent -= 1
            write('}')
            write('')

            write(f"{rule}_rule.prototype.reset = function(){{")
            indent += 1
            write(f"this.expect = 0")
            indent -= 1
            write(f"}}")
            write('')

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

    grammar = """
    document  ::=   '<' NAME S+ attributes* '>'
    attributes ::= attribute (S+ attribute)*
    attribute ::= NAME S* '=' S* attr_value
    attr_value ::= ('"' NAME '"' | "'" NAME "'")
    """

    grammar = """
document ::= element
element  ::=  STag content ETag
STag     ::= '<' NAME (S attribute)* '>'
attribute ::= NAME '=' '"' NAME '"'
content  ::= CharData? (element CharData?)*
ETag     ::= '</' NAME '>'
CharData ::= [^<&]*
    """

    rules = make_rules(grammar)

    print(rules)

    generate_parser(rules)