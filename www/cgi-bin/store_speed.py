#!c:/python37/python.exe
# -*- coding: utf-8 -*-

import os
import cgi
import json
import sys

cpython_version = ".".join(str(x) for x in sys.implementation.version[:3])

print('Content-type: text/html\n\n')
print()
fs = cgi.FieldStorage()
results = json.loads(fs["results"].value)
version = fs["version"].value
userAgent = fs["userAgent"].value

data = [
    {"test": result["test"],
     "description": result["description"],
     "src": result["src"].replace("\r\n", "\n"),
     "ratio": round(100 * (result["Brython"] / result["CPython"]))
     }
    for result in results]

json.dump(data, open("speed_results.json", "w", encoding="utf-8"),
    indent=4)

with open("speed_results.txt", "w", encoding="utf-8") as out:
    for line in data:
        out.write(f'{line["description"]};{line["ratio"]}\n')
        
html = """<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Brython speed compared to CPython</title>
<link rel="stylesheet" href="/brython.css">
<style>
body{
    padding-left: 2em;
}
td{
    vertical-align: top;
    padding: 3px;
}
td, th{
    border-style: solid;
    border-width: 0px 0px 1px 0px;
    border-color: #000;
}
pre{
    margin: 0px 0px 0px 5px;
}
</style>
</head>
<body>
<h2>Brython {{version}} performance compared to CPython {{cpython_version}}</h2>
User agent: {{userAgent}}
<p>
<table>
<tr>
<th>Test</th>
<th>Brython<br>(100 = CPython)</th>
<th>Code</th>
</tr>
"""
with open("speed_results.html", "w", encoding="utf-8") as out:
    head = html.replace("{{version}}", version).replace("{{userAgent}}",
        userAgent).replace("{{cpython_version}}", cpython_version)
    out.write(head)
    for record in data:
        out.write(f'<tr><td>{record["description"]}</td>' +
            f'<td align="right"><b>{record["ratio"]}</b></td>' +
            f'<td><pre>{record["src"]}</pre></td></tr>\n')
    out.write("</table>\n</body>\n</html>")