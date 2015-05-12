# -*- coding: utf-8 -*-


"""Script to compact all Brython scripts in a single one."""


import datetime
import os
import re
import sys
import tarfile
import zipfile

if(sys.version_info[0]!=2):
    raise ValueError("This script uses pyminifier, which only works with Python 2")

import make_doc  # lint:ok

try:
    import slimit
    minify = slimit.minify
except ImportError:
    minify = slimit = None


# path of parent directory
pdir = os.path.dirname(os.getcwd())
# version info
version = [3, 3, 0, "alpha", 0]
implementation = [3, 1, 3, 'alpha', 0]

def custom_minify(src):
    _res, pos = '', 0
    while pos < len(src):
        if src[pos] in ('"', "'"):
            # the end of the string is the next quote if it is not
            # after an odd number of backslashes
            start = pos
            while True:
                end = src.find(src[pos], start + 1)
                if end == -1:
                    line = src[:pos].count('\n')
                    raise SyntaxError('string not closed in %s line %s : %s' %
                                      (fname, line, src[pos:pos + 20]))
                else:
                    # count number of backslashes before the quote
                    nb = 0
                    while src[end-nb-1] == '\\':
                        nb += 1
                    if not nb % 2:
                        break
                    else:
                        start = end+1
            _res += src[pos:end+1]
            pos = end+1
        elif src[pos] == '\r':
            pos += 1
        elif src[pos] == ' ':
            if _res and _res[-1] in '({=[)}];|\n':
                pos += 1
                continue
            _res += ' '
            while pos < len(src) and src[pos] == ' ':
                pos += 1
        elif src[pos:pos + 2] == '//':
            end = src.find('\n', pos)
            if end == -1:
                break
            pos = end
        elif src[pos:pos + 2] == '/*':
            end = src.find('*/', pos)
            if end == -1:
                break
            pos = end+2
        elif src[pos] in '={[(' and _res and _res[-1] == ' ':
            _res = _res[:-1]+src[pos]
            pos += 1
        elif src[pos] == ';' and pos < len(src) - 1 and src[pos + 1] in '\r\n':
            pos += 1
        elif src[pos] in '{[,':
            _res += src[pos]
            while pos < len(src) - 1 and src[pos + 1] in ' \r\n':
                pos += 1
            pos += 1
        elif src[pos] == '}':
            _res += src[pos]
            nxt = pos + 1
            while nxt < len(src) and src[nxt] in ' \r\n':
                nxt += 1
            if nxt < len(src) and src[nxt] == '}':
                pos = nxt - 1
            pos += 1
        else:
            _res += src[pos]
            pos += 1
    while '\n\n' in _res:
        _res = _res.replace('\n\n', '\n')
    return _res


abs_path = lambda _pth: os.path.join(os.path.dirname(os.getcwd()), 'www', 'src', _pth)
now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

# update version number
with open(abs_path('version_info.js'), 'wb') as vinfo_file_out:
    # implementation[2] = now
    vinfo_file_out.write('__BRYTHON__.implementation = %s\n' % implementation)
    vinfo_file_out.write('__BRYTHON__.__MAGIC__ = "%s"\n' %
                         '.'.join(['%s' % _i for _i in implementation[:3]]))
    vinfo_file_out.write('__BRYTHON__.version_info = %s\n' % str(version))
    vinfo_file_out.write('__BRYTHON__.compiled_date = "%s"\n' % str(datetime.datetime.now()))
    # builtin module names = list of scripts in src/libs
    vinfo_file_out.write('__BRYTHON__.builtin_module_names = ["posix","sys","errno", "time",')
    _modules=['"%s"' % fname.split('.')[0] 
               for fname in os.listdir(abs_path('libs')) if fname.endswith('.js')]
    _modules.sort()    #sort modules so that git diff's don't change between runs
    vinfo_file_out.write(',\n    '.join(_modules))
    # add Python scripts in Lib that start with _ and arent found in CPython Lib
    # using sys.executable to find stdlib dir doesn't work under linux.
    stdlib_path = os.path.dirname(os.__file__)
    # stdlib_path = os.path.join(os.path.dirname(sys.executable),'Lib')
    stdlib_mods = [f for f in os.listdir(stdlib_path) if f.startswith('_')]
    stdlib_mods.sort()
    brython_mods = [f for f in os.listdir(abs_path('Lib'))
                    if f.startswith('_') and f != '__pycache__']
    brython_py_builtins = [os.path.splitext(x)[0]
                           for x in brython_mods if x not in stdlib_mods]
    brython_py_builtins.sort()
    vinfo_file_out.write(',\n    ' + ',\n    '.join(
                     ['"%s"' % f for f in brython_py_builtins]))
    vinfo_file_out.write(']\n')

    #log.info("Finished Writing file: " + abs_path('version_info.js'))

# Create file stdlib_paths.js : static mapping between module names and paths
# in the standard library
libfolder = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')
simple_javascript_template_string = """;(function($B){\n
$B.stdlib = {}
"""
with open(os.path.join(libfolder, 'stdlib_paths.js'), 'wb') as out:
    out.write(simple_javascript_template_string)

    jspath = os.path.join(libfolder, 'libs')
    jslist = []
    for dirpath, dirnames, filenames in os.walk(jspath):
        for filename in filenames:
            if not filename.endswith('.js'):
                continue
            mod_name = os.path.splitext(filename)[0]
            jslist.append(mod_name)

    jslist.sort()
    out.write("var js=['%s']\n" % "','".join(jslist))
    out.write("""for(var i=0;i<js.length;i++) $B.stdlib[js[i]]=['js']\n\n""")

    pylist = []
    pkglist = []
    pypath = os.path.join(libfolder, 'Lib')
    for dirpath, dirnames, filenames in os.walk(pypath):
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
            if filename == '__init__.py':
                pkglist.append(mod_name)
            else:
                pylist.append(mod_name)
    pylist.sort()
    out.write("var pylist=['%s']\n" % "','".join(pylist))
    pkglist.sort()
    out.write(
        "for(var i=0;i<pylist.length;i++) $B.stdlib[pylist[i]]=['py']\n\n")
    out.write("var pkglist=['%s']\n" % "','".join(pkglist))
    out.write(
        "for(var i=0;i<pkglist.length;i++) $B.stdlib[pkglist[i]]=['py',true]\n")
    out.write('})(__BRYTHON__)')


print('static stdlib mapping ok')

# build brython.js from base Javascript files
sources = [
    'brython_builtins', 'version_info', 'identifiers_re', 'py2js', 'py_object',
    'py_type', 'py_utils', 'py_builtin_functions', 'py_bytes',
    'js_objects', 'stdlib_paths', 'py_import', 'py_float', 'py_int',
    'py_complex', 'py_list', 'py_string', 'py_dict', 'py_set', 'py_dom',
    'py_generator', 'py_import_hooks', 'builtin_modules', 'async'
]

res = '// brython.js brython.info\n'
res += '// version %s\n' % version
res += '// implementation %s\n' % implementation
res += '// version compiled from commented, indented source files '
res += 'at github.com/brython-dev/brython\n'
src_size = 0

for fname in sources:
    src = open(abs_path(fname)+'.js').read() + '\n'
    src_size += len(src)
    if minify is not None:
        try:
            res += minify(src)
        except Exception as error:
            print(error)
    else:
        res += custom_minify(src)

res = res.replace('context', 'C')

with open(abs_path('brython.js'), 'wb') as the_brythonjs_file_output:
    the_brythonjs_file_output.write(res)


print(('size : originals %s compact %s gain %.2f' %
      (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]

sys.path.append("scripts")

try:
    import make_VFS  # isort:skip
except ImportError:
    print("Cannot find make_VFS, so we won't make py_VFS.js")
    make_VFS = None
    sys.exit()

make_VFS.process(os.path.join(pdir, 'www', 'src', 'py_VFS.js'))
make_VFS.process_unittest(os.path.join(pdir, 'www', 'src', 'py_unittest.js'))

# make distribution with core + libraries
with open(os.path.join(pdir, 'www', 'src', 'brython_dist.js'), 'wb') as distrib_file:
    distrib_file.write(open(os.path.join(pdir, 'www', 'src', 'brython.js')).read())
    distrib_file.write(open(os.path.join(pdir, 'www', 'src', 'py_VFS.js')).read())

# zip files
dest_dir = os.path.join(pdir, 'dist')
if not os.path.exists(dest_dir):
    os.mkdir(dest_dir)
name = 'Brython%s_site_mirror-%s' % (vname, now)
dest_path = os.path.join(dest_dir, name)


def is_valid(filename_path):
    if filename_path.startswith('.'):
        return False
    for extension in ('bat', 'log', 'gz', 'pyc'):
        if filename_path.lower().endswith('.%s' % extension):
            return False
    return True

dist_gz = tarfile.open(dest_path + '.tar.gz', mode='w:gz')

for path in os.listdir(pdir):
    if not is_valid(path):
        continue
    abs_path = os.path.join(pdir, path)
    if os.path.isdir(abs_path) and path == "dist":
        continue
    print(('add', path))
    dist_gz.add(os.path.join(pdir, path), arcname=os.path.join(name, path))

dist_gz.close()

dist_zip = zipfile.ZipFile(dest_path + '.zip', mode='w',
                           compression=zipfile.ZIP_DEFLATED)

for dirpath, dirnames, filenames in os.walk(pdir):
    print(dirpath)
    for path in filenames:
        if not is_valid(path):
            continue
        abs_path = os.path.join(pdir, dirpath, path)
        dist_zip.write(
            os.path.join(dirpath, path),
            arcname=os.path.join(name, dirpath[len(pdir) + 1:], path))
    if 'dist' in dirnames:
        dirnames.remove('dist')
    if '.hg' in dirnames:
        dirnames.remove('.hg')
    if '.git' in dirnames:
        dirnames.remove('.git')
    for dirname in dirnames:
        if dirname == 'dist':
            continue

dist_zip.close()

print('end of mirror')

# minimum package
name = 'Brython%s-%s' % (vname, now)
dest_path = os.path.join(dest_dir, name)
dist1 = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
dist2 = tarfile.open(dest_path+'.tar.bz2', mode='w:bz2')
dist3 = zipfile.ZipFile(dest_path + '.zip', mode='w',
                        compression=zipfile.ZIP_DEFLATED)


def is_valid(filename_path):
    if filename_path.startswith('.'):
        return False
    if not filename_path.lower().endswith('.js'):
        return False
    return True


for arc, wfunc in (dist1, dist1.add), (dist2, dist2.add), (dist3, dist3.write):
    for path in 'README.md', 'LICENCE.txt':
        wfunc(os.path.join(pdir, path), arcname=os.path.join(name, path))

    wfunc(os.path.join(pdir, 'www', 'src', 'brython.js'),
          arcname=os.path.join(name, 'brython.js'))

    base = os.path.join(pdir, 'www', 'src')
    folders = ('libs', 'Lib')
    for folder in folders:
        for dirpath, dirnames, filenames in os.walk(os.path.join(base, folder)):
            for path in filenames:
                if os.path.splitext(path)[1] not in ('.js', '.py'):
                    continue
                print(('add', path, dirpath[len(base):]))
                wfunc(os.path.join(dirpath, path),
                      arcname=os.path.join(name, dirpath[len(base) + 1:], path))

    arc.close()


# changelog file
try:
    first = 'Changes in Brython version %s.%s.%s' % (
        implementation[0], implementation[1], implementation[2])
    with open(os.path.join(pdir, 'dist', 'changelog.txt')) as file_to_read:
        input_changelog_data_string = file_to_read.read()
    with open(os.path.join(pdir, 'dist', 'changelog_%s.txt' % now), 'wb') as ou:
        ou.write('%s\n' % first)
        ou.write('%s\n\n' % ('=' * len(first)))
        ou.write(input_changelog_data_string)
except Exception as error:
    print(error)
    print("Warning - no changelog file")
