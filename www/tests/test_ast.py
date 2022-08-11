import ast

# issue 1990
module = ast.parse("def f(): pass")
assert module._attributes == ()
assert module.body[0]._attributes == ('lineno', 'col_offset', 'end_lineno', 'end_col_offset')
module.body[0].body = ast.parse("print(1+2j)").body
assert ast.unparse(module) == """def f():
    print(1 + 2j)"""
