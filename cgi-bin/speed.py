#!c:/python33/python.exe
# -*- coding: utf-8 -*-

import os
import cgi
import time

print('Content-type: text/html\n')

if os.environ['REMOTE_ADDR']!='127.0.0.1':
    print('forbidden access')
else:
    fs = cgi.FieldStorage()
    src = fs['src'].value
    t0 = time.perf_counter()
    exec(src)
    print('%6.2f' % ((time.perf_counter() - t0) * 1000.0))