#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import cgi
import time
import json
import sys


print('Content-type: text/html\n\n')

scripts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
    'www','speed','benchmarks')

fs = cgi.FieldStorage()
filename = fs['filename'].value
out = open(r'c:\temp\script_timer.txt', 'w')
out.write(filename)
out.close()

t0 = time.perf_counter()
src = open(os.path.join(scripts_path,filename)).read()
exec(src)
t1 = time.perf_counter()
print(json.dumps({'filename': filename, 'timing': int((t1-t0) * 1000.0),
    'version': sys.version}))
