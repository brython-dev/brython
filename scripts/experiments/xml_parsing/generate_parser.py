from grammar_parser import make_rules, Literal, Rule, Charset, End

class ARGS(dict):

    def __repr__(self):
        s = ', '.join(f'{k}: {v}' for k, v in self.items())
        return '{' + s + '}'

def generate_parser(rules):
    indent = 0
    with open('parser.js', 'w', encoding='utf-8') as out:
        write = lambda x: out.write(indent * '  ' + x + '\n')

        for rule, options in rules.items():
            print('rule', rule)
            print('  options', options, type(options))
            write(f"function {rule}_rule(origin, next_if_ok, args){{")
            indent += 1
            write(f"this.origin = origin")
            write(f"this.rank = origin.expect")
            write(f"this.next_if_ok = next_if_ok")
            write(f"this.args = args")
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
            write(f"console.log('{rule}_rule expects', this.items[this.expect] || 'END', 'char', char)")
            write(f"var res, rule, save_pos")
            write(f"switch(this.expect){{")
            for i, option in enumerate(options):
                print('option', option)
                indent += 1
                num = 1
                write(f"case {i}: // {option}")
                indent += 1
                alt = getattr(option, 'alt', None)
                minus = getattr(option, 'minus', None)
                quantifier = getattr(option, 'quantifier', None)
                next_if_ok = -1 if i == len(options) - 1 else i + 1
                if alt:
                    alt_index = options.index(alt)
                    next_if_ok = -1
                if minus:
                    minus_index = options.index(minus)
                if isinstance(option, Literal):
                    literal = option.value.replace("'", "\\'")
                    if alt:
                        write(f"save_pos = get_pos(this)")
                    write(f"rule = new LITERAL(this, '{literal}')")
                    write(f"res = rule.feed(char)")
                    write(f"if(res === FAIL){{")
                    indent += 1
                    if alt:
                        write(f"this.expect = {alt_index}")
                        write(f"reset_pos(this, save_pos)")
                        write(f"return this.feed(read_char(this))")
                    else:
                        write("return res")
                    indent -= 1
                    write(f"}}")
                    write(f"this.expect = {next_if_ok}")
                    write(f"return res")
                elif isinstance(option, (Rule, Charset)):
                    if isinstance(option, Rule):
                        write(f"if(! this.rules[{i}]){{")
                        indent += 1
                        write(f"this.rules[{i}] = new {option.value}_rule(this, {next_if_ok})")
                        if quantifier and quantifier in '+*':
                            write(f"this.repeats[{i}] = 0")
                        indent -= 1
                        write(f"}}")
                        write(f"rule = this.rules[{i}]")
                        write(f"rule.reset()")
                        if quantifier:
                            write(f"save_pos = get_pos(this)")
                            write(f"res = rule.feed(char)")
                            write(f"if(res === FAIL){{")
                            indent += 1
                            if quantifier == '+':
                                write(f"if(this.repeats[{i}] == 0){{")
                                indent += 1
                                write("return FAIL")
                                indent -= 1
                                write(f"}}")
                            if quantifier and quantifier in '+*':
                                write(f"this.result_store[{i}] = this.result_store[{i}] || []")
                                write(f"this.result_store[{i}].push([save_pos, get_pos(this)])")
                                write(f"console.log('result_store {rule}', this.result_store)")
                            write(f"this.expect = {next_if_ok}")
                            write(f"reset_pos(this, save_pos)")
                            write(f"return this.feed(read_char(this))")
                            indent -= 1
                            write(f"}}else{{")
                            indent += 1
                            if quantifier == '?':
                                write(f"this.expect = {next_if_ok}")
                                write(f"return res")
                            else:
                                write(f"this.repeats[{i}] += 1")
                                write(f"console.log('nb repeats', this.repeats[{i}])")
                                write(f"return res")
                            indent -= 1
                            write(f"}}")
                        else:
                            write(f"this.expect = {next_if_ok}")
                            if alt:
                                write(f"save_pos = get_pos(this)")
                                write(f"res = rule.feed(char)")
                                write(f"if(res === FAIL){{")
                                indent += 1
                                write(f"this.expect = {alt_index}")
                                write(f"reset_pos(this, save_pos)")
                                write(f"return this.feed(read_char(this))")
                                indent -= 1
                                write(f"}}")
                                write(f"return res")
                            else:
                                write(f"return rule.feed(char)")
                    else:
                        charset = option.value.replace("'", "\\'")
                        write(f"rule = new CHARSET_rule(this, '{charset}', {next_if_ok})")
                elif option is End:
                    write(f"if(char == END){{")
                    indent += 1
                    write(f"console.log('fin');alert()")
                    indent -= 1
                    write(f"}}")
                    write("break")
                else:
                    print('unhandled type', option, type(option))
                    input()
                indent -= 2
                num += 1
            indent += 1
            write(f"case -1:")
            indent += 1
            write(f"return this.origin.feed(char)")

            indent -= 2
            write(f"}}") # close "switch"
            write(f"return this")
            indent -= 1
            write('}')
            write('')

            """
            write(f"{rule}_rule.prototype.store_result = function(obj){{")
            indent += 1
            write(f"console.log('store result', obj)")
            write(f"var rank = obj.rank")
            write(f"this.result_store[rank] = this.result_store[rank] ?? []")
            write(f"this.result_store[rank].push([obj.pos, get_pos(this)])")
            write(f"console.log('results', this.result_store)")
            write(f"if(obj.next_if_ok == -1){{")
            indent += 1
            write(f"console.log('remonte stockage au niveau', obj.origin)")
            indent -= 1
            write(f"}}")
            indent -= 1
            write(f"}}\n")
            """

            write(f"{rule}_rule.prototype.reset = function(){{")
            indent += 1
            write(f"this.expect = 0")
            indent -= 1
            write(f"}}")
            write('')


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

rules = make_rules(grammar)

print(rules)

generate_parser(rules)