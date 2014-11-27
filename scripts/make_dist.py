# -*- coding: utf-8 -*-


"""Script to compact all Brython scripts in a single one."""


import datetime
import logging as log
import os
import re
import sys
import tarfile
import zipfile
from ctypes import byref, cdll, create_string_buffer
from getpass import getuser
from multiprocessing import Pool
from tempfile import gettempdir
from webbrowser import open_new_tab
from platform import platform

import make_static_doc  # lint:ok

try:
    import slimit
    minify = slimit.minify
except ImportError:
    minify = slimit = None


# path of parent directory
pdir = os.path.dirname(os.getcwd())
# version info
version = [3, 3, 0, "alpha", 0]
implementation = [3, 0, 1, 'alpha', 0]


# Lets make a Logger logging to StdErr and Temp file,so we can kill those print
LOG_FILE_PATH = os.path.join(gettempdir(), "brython-make_dist.log")
log.basicConfig(filename=LOG_FILE_PATH, level=-1,
                format="%(levelname)s: %(asctime)s:    %(message)s")
log.getLogger().addHandler(log.StreamHandler(sys.stderr))
try:
    os.nice(19)  # smooth cpu priority
    libc = cdll.LoadLibrary("libc.so.6")  # set process name
    buff = create_string_buffer(len("brython-make") + 1)
    buff.value = bytes("brython-make".encode("utf-8"))
    libc.prctl(15, byref(buff), 0, 0, 0)
except Exception as reason:
    log.warning(reason, exc_info=True)


def custom_minify(src):
    """Custom Python 3 Minifier, takes src string argument, returns string."""
    _res, pos = '', 0
    while pos < len(src):
        if src[pos] in ('"', "'"):
            # the end of the string is the next quote if it is not
            # after an odd number of backslashes
            start = pos
            while True:
                end = src.find(src[pos], start + 1)
                if end == -1:
                    error_msg = "String not closed in {} line {}: {}.".format(
                        fname, src[:pos].count('\n'), src[pos:pos + 20])
                    log.critical(error_msg)
                    raise SyntaxError(error_msg)
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


###############################################################################


abs_path = lambda _pth: os.path.join(os.path.dirname(os.getcwd()), 'src', _pth)
now = datetime.datetime.now()
log.info("#" * 80 + "\n\nBrython Developer: {} using {}.".format(
    getuser().capitalize(), platform()))


# update version number
with open(abs_path('version_info.js'), 'w') as vinfo_file_out:
    # implementation[2] = now
    file_content = ""
    file_content += '__BRYTHON__.implementation = %s\n' % implementation
    file_content += ('__BRYTHON__.__MAGIC__ = "%s"\n' %
                     '.'.join(['%s' % _i for _i in implementation[:3]]))
    file_content += '__BRYTHON__.version_info = %s\n' % str(version)
    # builtin module names = list of scripts in src/libs
    file_content += '__BRYTHON__.builtin_module_names = ["posix",'
    file_content += (',\n    '.join(['"%s"' % fname.split('.')[0]
                     for fname in os.listdir(abs_path('libs'))
                     if fname.lower().endswith('.js')]))
    # add Python scripts in Lib that start with _ and arent found in CPython Lib
    # using sys.executable to find stdlib dir doesn't work under Linux.
    stdlib_path = os.path.dirname(os.__file__)
    # stdlib_path = os.path.join(os.path.dirname(sys.executable), 'Lib')
    stdlib_mods = [f for f in os.listdir(stdlib_path) if f.startswith('_')]
    stdlib_mods.sort()
    brython_mods = [f for f in os.listdir(abs_path('Lib'))
                    if f.startswith('_') and f != '__pycache__']
    brython_py_builtins = [os.path.splitext(x)[0]
                           for x in brython_mods if x not in stdlib_mods]
    brython_py_builtins.sort()
    file_content += (',\n    ' + ',\n    '.join(
                     ['"%s"' % f for f in brython_py_builtins]))
    file_content += ']\n'
    vinfo_file_out.write(file_content)
    log.info("Finished Writing file: " + abs_path('version_info.js'))


# Create file stdlib_paths.js : static mapping between module names and paths
# in the standard library
libfolder = os.path.join(os.path.dirname(os.getcwd()), 'src')
simple_javascript_template_string = """;(function($B){\n
$B.stdlib = {}
"""
with open(os.path.join(libfolder, 'stdlib_paths.js'), 'w') as out:
    file_content = ""
    file_content += simple_javascript_template_string

    jspath = os.path.join(libfolder, 'libs')
    jslist = []
    for dirpath, dirnames, filenames in os.walk(jspath):
        for filename in filenames:
            if not filename.endswith('.js'):
                continue
            mod_name = os.path.splitext(filename)[0]
            jslist.append(mod_name)

    file_content += "var js=['%s']\n" % "','".join(jslist)
    file_content += "for(var i=0;i<js.length;i++) $B.stdlib[js[i]]=['js']\n"

    pylist, pkglist = [], []
    pypath = os.path.join(libfolder, 'Lib')
    for dirpath, dirnames, filenames in os.walk(pypath):
        for filename in filenames:
            mod_name, ext = os.path.splitext(filename)
            if ext.lower() != '.py':
                continue
            path = dirpath[len(pypath) + len(os.sep):].split(os.sep)+[mod_name]
            if not path[0]:
                path = path[1:]
            mod_name = '.'.join(path).lstrip('.')
            if filename.lower() == '__init__.py':
                mod_name = '.'.join(path[:-1]).lstrip('.')
            mod_path = 'Lib/'+'/'.join(path)
            if filename.lower() == '__init__.py':
                pkglist.append(mod_name)
            else:
                pylist.append(mod_name)
    file_content += "var pylist=['%s']\n" % "','".join(pylist)
    file_content += (
        "for(var i=0;i<pylist.length;i++) $B.stdlib[pylist[i]]=['py']\n")
    file_content += "var pkglist=['%s']\n" % "','".join(pkglist)
    file_content += (
        "for(var i=0;i<pkglist.length;i++) $B.stdlib[pkglist[i]]=['py',true]\n")
    file_content += '})(__BRYTHON__)'
    out.write(file_content)
    log.info("Finished Writing file: " +
             os.path.join(libfolder, 'stdlib_paths.js'))


log.info('Static StdLib mapping OK.')
###############################################################################


# build brython.js from base Javascript files
sources = [abs_path(source_file) + ".js" for source_file in (
    'brython_builtins', 'version_info', 'identifiers_re', 'py2js', 'py_object',
    'py_type', 'py_utils', 'py_generator', 'py_builtin_functions', 'py_bytes',
    'js_objects', 'stdlib_paths', 'py_import', 'py_float', 'py_int',
    'py_complex', 'py_dict', 'py_list', 'py_string', 'py_set', 'py_dom',
    'py_import_hooks'
)]

with open(abs_path('py_loader.js')) as the_old_py_loader_file:
    loader_source_code = the_old_py_loader_file.read()
loader_source_code = re.sub('version_info = \[1,2,".*?"\,"alpha",0]',
                            'version_info = %s' % version, loader_source_code)
with open(abs_path('py_loader.js'), 'w') as the_new_py_loader_file:
    the_new_py_loader_file.write(loader_source_code)
    log.info("Finished Writing file: " + abs_path('py_loader.js'))


res = """// brython.js brython.info
// version {}
// implementation {}
// compiled from commented indented source at github.com/brython-dev/brython
""".format(version, implementation)


def minify_my_source(filename_path_string):
    """Take filename path string, read and minify, then return it minified."""
    minify_function = minify or custom_minify  # whatever exists of both
    with open(filename_path_string) as file_with_normal_source_code:
        normal_source_code = file_with_normal_source_code.read().strip() + "\n"
        try:  # try to minify source code if fails log error return empty str
            minified_source_code = minify_function(normal_source_code)
        except Exception as reason:
            minified_source_code = ""
            log.critical(reason, exc_info=True)
        finally:
            log.info("Process {} finished compressing: {}.".format(
                os.getpid(), filename_path_string))
            return minified_source_code


number_of_processes, src_size = len(sources), 0  # processes equal files
# for minified_source in map(minify_my_source, sources):  # no process option
for minified_source in Pool(number_of_processes).map(minify_my_source, sources):
    res += minified_source
    src_size += len(minified_source)


res = res.replace('context', 'C')
log.info('Size: {} originals, {} compact, {}% gain, {} processes.'.format(
         src_size, len(res), round(100 * (src_size - len(res)) / src_size),
         number_of_processes))
with open(abs_path('brython.js'), 'w') as the_brythonjs_file_output:
    the_brythonjs_file_output.write(res)
    log.info("Finished Writing file: " + abs_path('brython.js'))


# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3].lower() == 'rc':
    vname += 'rc%s' % implementation[4]

sys.path.append("scripts")

try:
    import make_VFS  # isort:skip
except ImportError:
    log.critical("Cant find make_VFS, so we wont make py_VFS.js", exc_info=True)
    make_VFS = None
    sys.exit()

make_VFS.process(os.path.join(pdir, 'src', 'py_VFS.js'))
make_VFS.process_unittest(os.path.join(pdir, 'src', 'py_unittest.js'))

# make distribution with core + libraries
with open(os.path.join(pdir, 'src', 'brython_dist.js'), 'w') as distrib_file:
    distrib_file.write(open(os.path.join(pdir, 'src', 'brython.js')).read())
    distrib_file.write(open(os.path.join(pdir, 'src', 'py_VFS.js')).read())
    log.info("Finished Writing file: " +
             os.path.join(pdir, 'src', 'brython_dist.js'))


# zip files
dest_dir = os.path.join(pdir, 'dist')
if not os.path.exists(dest_dir):
    os.mkdir(dest_dir)
name = 'Brython%s_site_mirror-%s' % (vname, now.strftime('%Y%m%d-%H%M%S'))
dest_path = os.path.join(dest_dir, name)


dist_gz = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
blacklist = ('bat', 'log', 'gz', 'pyc', 'pyo', 'pyd', 'pyw', 'xz', '~', 'db')
for path in os.listdir(pdir):
    is_blacklisted = os.path.basename(path).lower().endswith(blacklist)
    is_hidden_file = os.path.basename(path).startswith('.')
    if is_blacklisted or is_hidden_file:
        continue
    abs_path = os.path.join(pdir, path)
    if os.path.isdir(abs_path) and path == "dist":
        continue
    log.info('Adding to .tar.gz file: ' + path)
    dist_gz.add(os.path.join(pdir, path), arcname=os.path.join(name, path))

log.info("Finished Writing file: " + dest_path + '.tar.gz')
dist_gz.close()

dist_zip = zipfile.ZipFile(dest_path + '.zip', mode='w',
                           compression=zipfile.ZIP_DEFLATED)

for dirpath, dirnames, filenames in os.walk(pdir):
    log.info(dirpath)
    for path in filenames:
        is_blacklisted = os.path.basename(path).lower().endswith(blacklist)
        is_hidden_file = os.path.basename(path).startswith('.')
        if is_blacklisted or is_hidden_file:
            continue
        abs_path = os.path.join(pdir, dirpath, path)
        log.info('Adding to .zip file: ' + path)
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

log.info("Finished Writing file: " + dest_path + '.zip')
dist_zip.close()
log.info('End of mirror.')
###############################################################################


# minimum package
name = 'Brython%s-%s' % (vname, now.strftime('%Y%m%d-%H%M%S'))
dest_path = os.path.join(dest_dir, name)
dist1 = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
dist2 = tarfile.open(dest_path+'.tar.bz2', mode='w:bz2')
dist3 = zipfile.ZipFile(dest_path + '.zip', mode='w',
                        compression=zipfile.ZIP_DEFLATED)

for arc, wfunc in (dist1, dist1.add), (dist2, dist2.add), (dist3, dist3.write):
    for path in ('README.md', 'LICENCE.txt'):
        wfunc(os.path.join(pdir, path), arcname=os.path.join(name, path))

    wfunc(os.path.join(pdir, 'src', 'brython.js'),
          arcname=os.path.join(name, 'brython.js'))

    base = os.path.join(pdir, 'src')
    folders = ('libs', 'Lib')
    for folder in folders:
        for dirpath, dirnames, filenames in os.walk(os.path.join(base, folder)):
            for path in filenames:
                if os.path.splitext(path)[1] not in ('.js', '.py'):
                    continue
                # abs_path = os.path.join(os.getcwd(),'src',folder,path)
                log.info('Add ' + os.path.join(dirpath[len(base):], path))
                wfunc(os.path.join(dirpath, path),
                      arcname=os.path.join(name, dirpath[len(base) + 1:], path))
    arc.close()


###############################################################################


# changelog file
try:
    first = 'Changes in Brython version %s.%s.%s' % (
        implementation[0], implementation[1], implementation[2])
    with open(os.path.join(pdir, 'dist', 'changelog.txt')) as file_to_read:
        input_changelog_data_string = file_to_read.read()
    changelog_file = os.path.join(pdir, 'dist', 'changelog_%s.txt' %
                                  now.strftime('%Y%m%d-%H%M%S'))
    with open(changelog_file, 'wb') as ou:
        ou.write("{}\n{}\n\n".format(first, '=' * len(first)))
        ou.write(input_changelog_data_string)
except Exception as reason:
    log.warning(reason, exc_info=True)
    log.warning("No changelog file.")


log.info("Finished !, it takes {} seconds, you can find Log file at {}".format(
    abs(datetime.datetime.now().second - now.second), LOG_FILE_PATH))
# open_new_tab("file://" + LOG_FILE_PATH)  # uncomment to open Log when done
