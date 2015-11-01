#!c:/python33/python.exe
# -*- coding: utf-8 -*-

import os
import cgi
import time
import locale

locale.setlocale(locale.LC_ALL, '')

print('Content-type: text/html\n\n')

if os.environ['REMOTE_ADDR']!='127.0.0.1':
    print('forbidden access')
else:
    fs = cgi.FieldStorage()
    result = eval(fs['result'].value)
    print('result %s' %str(result))
    out = open(os.path.join(os.getcwd(), 'speed', 
        'bench_result_%s.txt' %result['version']), 'w')
    del result['version']
    keys = list(result.keys())
    keys.sort()
    for key in keys:
        out.write('%s:%s\n' %(key, result[key]))
    out.close()
    