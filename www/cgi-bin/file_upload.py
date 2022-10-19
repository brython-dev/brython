#!c:/python34/python.exe
# -*- coding: utf-8 -*-


import cgi


print('Content-type: text/html\n\n')
print()
print('file upload<p>')
fs = cgi.FieldStorage()
for key in tuple(fs.keys()):
    if fs[key].file:
        length = 0
        while True:
            nb = len(fs[key].file.read(2048))
            if nb == 0:
                break
            length += nb
            if length > 10_000:
                # ignore big files
                continue
    print(('%s:%s' % (key, length) + '<br>'))
print('ok')
