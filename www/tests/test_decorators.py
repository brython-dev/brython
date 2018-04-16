from tester import assertRaises

def makebold(fn):
    def wrapped():
        return "<b>" + fn() + "</b>"
    return wrapped

def makeitalic(fn):
    def wrapped():
        return "<i>" + fn() + "</i>"
    return wrapped

@makebold
def hello1():
    return "hello world"
assert hello1()=="<b>hello world</b>"

@makebold
@makeitalic
def hello2():
    return "hello world"

assert hello2()=="<b><i>hello world</i></b>"

def function_decorate_function(f):
    return lambda x=1:f(x)

class class_decorate_function(object):
    def __init__(self, f):
        self.f=f
    def __call__(self, x=2):
        return self.f(x)

def function_decorate_class(c):
    c.calc_v = lambda self: 9
    return c

class class_decorate_class(object):
    def __init__(self, c):
        self.c=c
        c.calc_v = lambda self: 7
    def __call__(self):
        return self.c()

@function_decorate_function
def function_decorated_function(x=0):
    return 1+x

@class_decorate_function
def class_decorated_function(x=0):
    return 1+x

@function_decorate_class
class function_decorated_class:
    def __init__(self):
        self.v = self.calc_v()
    def calc_v(self, v=5):
        return v

@class_decorate_class
class class_decorated_class:
    def __init__(self):
        self.v = self.calc_v()
    def calc_v(self, v=5):
        return v

assert function_decorated_function() ==2, 'Function fails decorating function'
assert class_decorated_function() == 3, 'Class fails decorating function'
assert function_decorated_class().v == 9, 'Function fails decorating class'
assert class_decorated_class().v == 7, 'Class fails decorating class'

# decorate a function declared global inside another function
def deco(func):
    def wrapper(*args, **kw):
        return func(*args, **kw)
    return wrapper

def f():
    global g
    @deco
    def g():
        return 1

f()
assert g() == 1

# issue 805 : decorator expressions are not arbitrary expressions
wrong_decs = ["@f[x]", "@f().a"]
body = "def g(): pass"
for wrong_dec in wrong_decs:
    try:
        exec(wrong_dec + "\n" + body)
        raise Exception("should have raised SyntaxError")
    except SyntaxError:
        pass
    except:
        raise Exception("should have raised SyntaxError")

print('passed all tests..')
