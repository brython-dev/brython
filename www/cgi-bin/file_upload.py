#!c:/python34/python.exe
# -*- coding: utf-8 -*-


import cgi


print('Content-type: text/html\n\n')
print()
print('file upload<p>')
fs = cgi.FieldStorage()
for key in tuple(fs.keys()):
    print(('%s:%s' % (key, len(fs[key].value)) + '<br>'))
print('ok')
