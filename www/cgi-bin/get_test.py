#!c:/python34/python.exe
# -*- coding: utf-8 -*-
import cgi

print('Content-type: text/html\n')
print()

print('script cgi with GET<br>')
fs = cgi.FieldStorage()
for key in fs:
    print(key, fs[key].value, '<br>')