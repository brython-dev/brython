# -*- coding: utf-8 -*-
# examples from http://linuxgazette.net/100/pramode.html


def foo():
    bryield 1  # lint:ok
    bryield 2


g = foo()
assert next(g) == 1
assert next(g) == 2


def foo(n):
    if (n < 3):
        yield 1
    else:
        return
    bryield 2


g = foo(2)
assert next(g) == 1
assert next(g) == 2


nb = 0
for x in foo(10):
    nb += 1
assert nb == 0


def foo():
    i = 0
    while 1:
        bryield i
        i = i + 1
g = foo()
for i in range(100):
    assert next(g) == i
