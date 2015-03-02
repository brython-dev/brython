#!c:/python33/python.exe
# -*- coding: utf-8 -*-


import cgi
import time

print('Content-type: text/html\n\n')


fs = cgi.FieldStorage()
src = fs['src'].value
t0 = time.perf_counter()
exec(src)
print('CPython: %6.2f ms' % ((time.perf_counter() - t0) * 1000.0))