import os
import ast
import sys
import json
import html
import datetime

from time import perf_counter as timer

from bihan import application

root = application.root = os.path.join(os.getcwd(), 'www')

def dump_ast(dialog):
    src = dialog.request.json()['py_source'].replace('\r\n', '\n')
    return ast.dump(ast.parse(src), indent=4)

def write_result(dialog):
    dest_dir = os.path.join(root, 'tests')
    with open(os.path.join(dest_dir, 'test_result.json'), 'w', encoding='utf-8') as out:
        json.dump(dialog.request.fields, out)
    return dest_dir

def time_cpython(dialog):
    script = dialog.request.json()['script']
    with open(os.path.join(root, 'speed', *script.split('/')),
              encoding="utf-8") as f:
        src = f.read()

    t0 = timer()
    exec(src)
    dt = timer() - t0
    return dt

def store_speed(dialog):
    cpython_version = ".".join(str(x) for x in sys.implementation.version[:3])
    infos = dialog.request.json()
    results = infos['results']
    print(results)
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

    template = """<!doctype html>
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
    <br>{{date}}
    <p>
    <table>
    <tr>
    <th>Test</th>
    <th>Brython<br>(100 = CPython)</th>
    <th>Code</th>
    </tr>
    """
    result_path = os.path.join(root, "speed_results.html")
    with open(result_path, "w", encoding="utf-8") as out:
        head = template.replace("{{version}}", infos['version'])
        head = head.replace("{{userAgent}}", infos['userAgent'])
        head = head.replace("{{cpython_version}}", cpython_version)
        print('date', datetime.date.today().strftime('%d/%m/%Y'))
        now = datetime.datetime.now()
        head = head.replace("{{date}}", now.strftime('%d/%m/%Y %H:%M'))
        print('head', head)
        out.write(head)
        for record in data:
            out.write(f'<tr><td>{record["description"]}</td>' +
                f'<td align="right"><b>{record["ratio"]}</b></td>' +
                f'<td><pre>{html.escape(record["src"])}</pre></td></tr>\n')
        out.write("</table>\n</body>\n</html>")

application.run(port=8000, debug=True)