#!c:/python33/python.exe
# -*- coding: utf-8 -*-

import os
import cgi
import sys

print('Content-type: text/html\n\n')
print()
fs = cgi.FieldStorage()
name = fs['name'].value
js = fs['js'].value
out = open(os.path.join(os.path.dirname(__file__),'saved.js'),'w')
while len(js):
    out.write(js[:4096])
    js = js[4096:]
out.close()

sys.stdout.write('closed %s' %len(js))