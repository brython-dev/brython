#!c:/python34/python.exe
# -*- coding: utf-8 -*-

import sys
import cgi
import json

import ast

print('Content-type: text/plain')
print()

source = sys.stdin.read()

data = json.loads(source)
source = data["py_source"]
b = source.encode('utf-8')

result = ast.dump(ast.parse(source), indent = 4)
result = result.encode('utf-8').decode(sys.stdout.encoding)
print(result)