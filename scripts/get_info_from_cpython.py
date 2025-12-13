"""Scan CPython files in /Objects to get the information on type
getset, methods and members"""

import os
import re
import shlex
import pprint

from directories import src_dir
from get_cpython_objects_defines import defines
import get_type_slots

props = {
    'tp_getset': 'PyGetSetDef',
    'tp_methods': 'PyMethodDef',
    'tp_members': 'PyMemberDef'
}

#format1 = r'(?P<name>.*),\s*/\*\s*tp_getset\s*\*/'
#format2 = r'\.tp_getset\s*=\s*(?P<name>.*),\s*'

defline_re = r'^(.*)\s*=\s*{'

def scan(lines, prop):
    format1 = rf'(?P<name>.*),\s*/\*\s*{prop}\s*\*/'
    format2 = rf'\.{prop}\s*=\s*(?P<name>.*),\s*'
    infos = {}
    for i, line in enumerate(lines):
        if mo := re.search(format1, line) or re.search(format2, line):
            name = mo.group('name').strip()
            if name == '0':
                continue
            type_name = get_pytype_name(lines, i)
            defs, functions = get_list(prop, lines, name)
            defs = ',\n'.join(defs)
            funcs = ''
            for gs, name in functions:
                if gs == 'get':
                    funcs += 'function ' + name + '(klass){\n\n}\n'
                else:
                    funcs += 'function ' + name + '(klass, value){\n\n}\n'
            funclist = f'{types.get(type_name, type_name)}.{prop} = [\n'
            funclist += defs + '\n]\n'
            infos[type_name] = funcs + funclist
    return infos

def get_pytype_name(lines, i):
    j = i - 1
    while j > 0:
        defline = lines[j]
        if mo1 := re.match(defline_re, defline):
            info = mo1.groups()[0]
            type_name = info.split()[-1]
            return type_name
        j -= 1

def get_list(prop, lines, name):
    getset_re = rf'{name}\[\] = \{{'
    found = False
    k = 0
    while k < len(lines):
        line = lines[k]
        if not found:
            if re.search(getset_re, line):
                start = k
                found = True
        elif line.startswith('}'):
            deflines = lines[start + 1:k - 1]
            return scan_deflines(prop, deflines)
        k += 1
    print('prop', getset_re, 'not found')

definitions = []
prefix = '    '

def transform_data(data):
    i = 0
    data = data.strip()
    seps = '{,}()'
    delims = []
    parts = []
    item = ''
    s = None
    while i < len(data):
        if data[i] == '"':
            if s == '"__func__"':
                print('bizarre')
            if item:
                parts.append(item)
                item = ''
            j = i + 1
            esc = False
            s = None
            while j < len(data):
                if data[j] == '\\':
                    esc = True
                elif data[j] == '"' and not esc:
                    s = data[i:j+1]
                    delims.append([i, j + 1])
                    parts.append(s)
                    i = j + 1
                    break
                elif esc:
                    esc = False
                j += 1
            if s is None:
                raise SyntaxError(f'unterminated string in {data}')
        else:
            if data[i] in seps:
                if item:
                    parts.append(item.strip())
                delims.append(i)
                parts.append(data[i])
                item = ''
            else:
                item += data[i]
            i += 1
    if item:
        parts.append(item)
    parts0 = parts[:]

    if parts.pop(0) != '{':
        raise SyntaxError('first item is not }')
    while parts:
        if parts.pop() == '}':
            break
    if not parts:
        print(data)
        print(parts0)
        raise SyntaxError('terminal } not found')
    elts = []
    elt = parts.pop(0)
    while parts:
        if (x := parts.pop(0)) != ',':
            elt += x
        else:
            if elt.startswith('('):
                elt = elt[elt.find(')') + 1:]
            elif elt.startswith('_PyCFunction_CAST('):
                elt = elt[len('_PyCFunction_CAST('):-1]
            elif elt.startswith('METH_'):
                elt = '$B.' + elt
            elts.append(elt)
            elt = ''
    if elt:
        elts.append(elt)
    return elts

def funcrefs(prop, data):
    # return the list of functions to define
    res = [('get', data[1])]
    if prop == 'tp_getset' and len(data) > 2 and data[2] != 'NULL':
        res.append(('set', data[2]))
    return res

def scan_deflines(prop, lines):
    # deflines are either an idenfier on a single line,
    # or start with '{' and end with '},'
    defs = []
    functions = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith('{'):
            j = i
            while j < len(lines) and '}' not in lines[j]:
                j += 1
            data = ''.join(x.strip() for x in lines[i:j+1])
            data = transform_data(data)
            functions += funcrefs(prop, data)
            defs.append(prefix + '[' + ', '.join(data) + ']')
            i = j + 1
        elif line.strip().startswith('/*'):
            j = i
            while j < len(lines) and '*/' not in lines[j]:
                j += 1
            i = j + 1
        else:
            definition = line.strip()
            if definition in defines:
                data = defines[definition]
                data = transform_data(data)
                functions += funcrefs(prop, data)
                defs.append(prefix + '[' + ', '.join(data) + ']')
            else:
                defs.append(prefix + definition.strip() + ',')
            definitions.append(definition)
            i += 1
    return defs, functions

obj_dir = os.path.join('/cpython', 'Objects')

types_re = r'^PyTypeObject\s+(?P<type_name>[a-zA-z_]+)' #\s*=\s*{{'
include_re = r'#include "(?P<include_name>.*)"'
str_re = re.compile('"(?P<value>.*?)"')

types = {}

with open(os.path.join(src_dir, 'type_info.js'), 'w', encoding='utf-8') as out:
    for filename in os.listdir(obj_dir):
        if filename.endswith('.c'):
            out.write(f'// {filename}\n')
            definitions = []
            found = []
            types = {}
            with open(os.path.join(obj_dir, filename), encoding='utf-8') as f:
                lines = f.readlines()
                content = ''.join(lines)
                types_iter = re.finditer(types_re, content, flags=re.M)
                for mo in types_iter:
                    _type = mo.group('type_name')
                    linenum = content[:mo.end()].count('\n')
                    i = 1
                    tp_name = None
                    while i < len(lines) - linenum:
                        line = lines[linenum + i]
                        if 'tp_name' in line:
                            mo = str_re.search(line)
                            tp_name = mo.group('value')
                            break
                        elif i == 2 and (mo := str_re.search(line)):
                            tp_name = mo.group('value')
                            break
                        elif line.strip().startswith('}'):
                            print('tp name not found', filename, _type)
                            break
                        i += 1
                    types[_type] = tp_name
                    print(tp_name)
                infos = {}
                for prop in props:
                    info = scan(lines, prop)
                    for _type in info:
                        if _type not in types:
                            continue
                        tp_name = types[_type]
                        if tp_name not in infos:
                            infos[tp_name] = {}
                        infos[tp_name][prop] = info[_type]
                for tp_name in infos:
                    out.write(f'// {tp_name}\n')
                    out.write(get_type_slots.get_slots(tp_name))
                    for prop in infos[tp_name]:
                        out.write(infos[tp_name][prop])
                    out.write('\n')
                for definition in definitions:
                    if not definition in defines:
                        print('def not found', definition)


    for filename in os.listdir(obj_dir):
        if filename.endswith('.c.h'):
            out.write(f'// {filename}\n')
            with open(os.path.join(obj_dir, filename), encoding='utf-8') as f:
                lines = f.readlines()
                content = ''.join(lines)
                types = re.findall(types_re, content, flags=re.M)
                if types:
                    out.write(f'//  types = {types}\n')
                for prop in props:
                    info = scan(lines, prop)
                    if info is not None:
                        out.write(info)
                        out.write('\n')

