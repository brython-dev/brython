$vfs = {'hello_pyc' : ['.py', '__all__ = ["get_hello", "world"]\ndef get_hello():\n    return "Hello from pyc"', 1],
 'hello_pyc.world' : ['.py', 'def get_world():\n    return "pyc world"'],
 'foo_pyc' : ['.py', 'def get_foo():\n    return "foo from pyc"\n\ndef get_bar():\n    return "bar from pyc"'],
 'test_issue7_pyc' : ['.py', 'def yyy():\n    return xxx * 3']}
