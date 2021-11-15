#!c:/python34/python.exe
# -*- coding: utf-8 -*-

import sys
import cgi
import json

import ast

print('Content-type: text/plain')
print()
data = json.loads(sys.stdin.read())
print(ast.dump(ast.parse(data["py_source"]), indent = 4))
