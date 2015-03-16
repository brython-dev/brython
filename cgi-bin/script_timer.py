#!/usr/bin/env python3
#!c:/python33/python.exe
# -*- coding: utf-8 -*-


import cgi
import time
import json

print('Content-type: text/html\n\n')

fs = cgi.FieldStorage()
src = fs['src'].value
filename = fs['filename'].value
t0 = time.perf_counter()
exec(src)
t1 = time.perf_counter()
print(json.dumps({'filename': filename, 'timing': int((t1-t0) * 1000.0)}))
