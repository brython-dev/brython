# Create file stdlib_paths.js : static mapping between module names and paths
# in the standard library

import os

import git

libfolder = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')
simple_javascript_template_string = """;(function($B){\n
$B.stdlib = {}
"""
with open(os.path.join(libfolder, 'stdlib_paths.js'), 'w') as out:
    out.write(simple_javascript_template_string)

    pylist = []
    pkglist = []
    pypath = os.path.join(libfolder, 'Lib')
    for dirpath, dirnames, filenames in os.walk(pypath):
        if os.path.exists(os.path.join(dirpath,'__init__.py')):
            # package
            filenames = []
            path = dirpath[len(pypath)+len(os.sep):].split(os.sep)
            pkglist.append('.'.join(path))
        elif not dirnames:
            filenames = []
        for filename in filenames:
            mod_name, ext = os.path.splitext(filename)
            if ext != '.py':
                continue
            path = dirpath[len(pypath)+len(os.sep):].split(os.sep)+[mod_name]
            if not path[0]:
                path = path[1:]
            mod_name = '.'.join(path).lstrip('.')
            if filename == '__init__.py':
                mod_name = '.'.join(path[:-1]).lstrip('.')
            mod_path = 'Lib/'+'/'.join(path)
            if not git.in_index(mod_path):
                print(mod_path, 'not in index')
                continue
            if filename == '__init__.py':
                pkglist.append(mod_name)
            else:
                pylist.append(mod_name)
    pylist.sort()
    out.write("var pylist = ['%s']\n" % "','".join(pylist))
    pkglist.sort()
    out.write(
        "for(var i = 0; i < pylist.length; i++)" +
            "{$B.stdlib[pylist[i]] = ['py']}\n\n")

    jspath = os.path.join(libfolder, 'libs')
    jslist = []
    for dirpath, dirnames, filenames in os.walk(jspath):
        for filename in filenames:
            if not filename.endswith('.js'):
                continue
            mod_name = os.path.splitext(filename)[0]
            jslist.append(mod_name)

    jslist.sort()
    out.write("var js = ['%s']\n" % "','".join(jslist))

    out.write("for(var i = 0; i < js.length; i++)" +
        "{$B.stdlib[js[i]] = ['js']}\n\n""")

    out.write("var pkglist = ['%s']\n" % "','".join(pkglist))
    out.write("for(var i  =0; i < pkglist.length; i++)" +
        "{$B.stdlib[pkglist[i]] = ['py', true]}\n")
    out.write('})(__BRYTHON__)')


print('static stdlib mapping ok')

