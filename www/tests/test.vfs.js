$vfs = {'hello' : ['.py', '__all__ = ["get_hello", "world"]\ndef get_hello():\n    return "Hello from py"', 1],
 'hello.world' : ['.py', 'def get_world():\n    return "py world"'],
 'foo' : ['.py', 'def get_foo():\n    return "foo from py"\n\ndef get_bar():\n    return "bar from py"'],
 'test_issue7' : ['.py', 'def yyy():\n    return xxx * 2']}
