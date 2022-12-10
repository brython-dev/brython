import os
import urllib.request

import version
vnum = '.'.join(str(num) for num in version.version[:2])

print('Python.asdl and python.gram from CPython Github repository')

ast_url = f"https://raw.githubusercontent.com/python/cpython/{vnum}/Parser/Python.asdl"
f = urllib.request.urlopen(ast_url)

with open('Python.asdl', 'wb') as out:
    out.write(f.read())

# read python.gram from CPython Github site
grammar_file = f'python{vnum}.gram'

ast_url = f"https://raw.githubusercontent.com/python/cpython/{vnum}/Grammar/python.gram"
print('request', ast_url)
print('might take a few seconds, please wait...')

with urllib.request.urlopen(ast_url, timeout=4) as f:
    print('connection open, reading...')
    src = f.read().decode('utf-8')
    print('read', len(src))

    with open(grammar_file, 'w', encoding='utf-8') as out:
        out.write(src)

print('Unicode database from unicode.org')
unicode_url = "https://www.unicode.org/Public/UCD/latest/ucd/"

# Load required files from unicode.org
if not os.path.exists("ucd"):
    os.mkdir("ucd")

for path in ["UnicodeData.txt",
             "CaseFolding.txt",
             "DerivedCoreProperties.txt",
             "NameAliases.txt"]:
    abs_path = os.path.join("ucd", path)
    f = urllib.request.urlopen(unicode_url + path)
    print(f'downloading {path}')
    with open(abs_path, "wb") as out:
        buf = f.read()
        if not buf:
            break
        out.write(buf)
