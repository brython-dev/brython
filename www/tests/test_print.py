funcs = [
    "abs", "all", "any", "ascii", "bin", "callable", "chr", "compile",
    "delattr", "dir", "divmod", "eval", "exec", "exit", "format", "getattr",
    "globals", "hasattr", "hash", "help", "hex", "id", "input", "isinstance",
    "issubclass", "iter", "len", "locals", "max", "min", "next", "oct",
    "open", "ord", "pow", "print", "quit", "repr", "round", "setattr",
    "sorted", "sum", "vars"
]

classes = [
    "bool", "bytearray", "bytes", "classmethod", "complex", "dict", "enumerate",
    "filter", "float", "frozenset", "int", "list", "map", "memoryview",
    "object", "property", "range", "reversed", "set", "slice", "staticmethod",
    "str", "super", "tuple", "type", "zip"
]

special_cases = "exit", "quit", "help"

for func in funcs:
    if func in special_cases:
        continue
    assert str(getattr(__builtins__, func)) == f"<built-in function {func}>"

for kl in classes:
    obj = getattr(__builtins__, kl)
    assert str(obj) == f"<class '{kl}'>", f"erreur pour {kl} : {obj}"