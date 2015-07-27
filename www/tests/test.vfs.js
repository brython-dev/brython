$vfs = {'hello' : ['.py', '__all__ = ["get_hello", "world"]\ndef get_hello():\n    return "Hello"', 1],
 'hello.world' : ['.py', 'def get_world():\n    return "world"'],
 'foo' : ['.py', 'def get_foo():\n    return "foo"\n\ndef get_bar():\n    return "bar"'],
 'test_issue7' : ['.py', 'def yyy():\n    return xxx * 2']}
