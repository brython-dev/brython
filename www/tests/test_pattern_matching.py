import test_patma

class TestSyntaxErrors(test_patma.TestSyntaxErrors):

    def assert_syntax_error(self, code):
        try:
            exec(test_patma.inspect.cleandoc(code))
            print('--- syntax error not raised')
        except SyntaxError as exc:
            print('syntax error raised', exc)
            pass


test = test_patma.TestPatma()
for method in dir(test):
    if method.startswith('test_'):
        print(method)
        m = getattr(test, method)

        try:
          m()
        except Exception as exc:
          print(exc)

test = TestSyntaxErrors()
for method in dir(test):
    if method.startswith('test_'):
      print(method)
      m = getattr(test, method)
      m()


test = test_patma.TestTypeErrors()
for method in dir(test):
    if method.startswith('test_'):
        print(method)
        m = getattr(test, method)

        try:
          m()
        except Exception as exc:
          print(exc)


test = test_patma.TestInheritance()
for method in dir(test):
    if method.startswith('test_'):
        print(method)
        m = getattr(test, method)

        try:
          m()
        except Exception as exc:
          print(exc)
