"""
    Various tasks dealing with distributing Brython
"""
import datetime
import json
import os
import pathlib
import re
import shutil
import sys
import tarfile
import time
import zipfile

from ..javascript_minifier import minify as js_minify
from .lib.cli import M, Option
from .lib.git import GIT, in_git, get_releases, is_clean, version, version_string
from .lib.info import MANIFEST, BRYTHON_DIR, SRC_DIR, VERSION_NAME
from .lib.term import status


def brython_js(status_line=status):
    """
        Returns concatenated & minified javascript of the core Brython implementation
        (brython.js)
    """
    src_size = 0
    sources = MANIFEST['sources']['core']
    ret = """// brython.js brython.info
// version {}
// implementation {}
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
""".format(MANIFEST['meta']['version'], MANIFEST['meta']['implementation'])

    for fname in sources:
        status.update("adding", fname)
        src = (SRC_DIR / (fname+'.js')).read_text() + '\n'
        src_size += len(src)
        status.update("minifying", fname)
        ret += js_minify(src)

    return ret.replace('context', 'C'), src_size


def stdlib_vfs(status_line=status):
    """
        Returns a VFS containing the standard library.
    """
    sys.path.append(str(BRYTHON_DIR / "scripts"))
    try:
        from make_VFS import create_vfs
    except ImportError:
        return ''

    vfs, num = create_vfs(SRC_DIR, progress_func=status.update)

    VFS_FILE_CONTENT = '\n'.join([
        '__BRYTHON__.use_VFS = true;',
        '__BRYTHON__.VFS = {}'.format(json.dumps(vfs)),
        '',
    ])
    return VFS_FILE_CONTENT, num


def demo_html():
    """
        Returns a demo html file  constructed from www/demo.html and setup/data/demo.tmpl
    """
    demo = (BRYTHON_DIR / 'www' / 'demo.html').read_text(encoding="utf-8")
    start_tag = "<!-- start copy -->"
    end_tag = "<!-- end copy -->"
    start = demo.find(start_tag)
    if start == -1:
        raise Exception("No tag <!-- start copy --> in demo.html")
    end = demo.find(end_tag)
    if end == -1:
        raise Exception("No tag <!-- end copy --> in demo.html")
    body = demo[start + len(start_tag): end].strip()

    template = (BRYTHON_DIR / 'setup' / 'data' / "demo.tmpl").read_text(encoding="utf-8")

    return template.replace("{{body}}", body)


def pack_setup_data(status_line=status):
    """
        Creates archives of setup/data for distribution using pip
    """
    DATA_DIR = BRYTHON_DIR / 'setup' / 'data'
    name = 'Brython-{}'.format(VERSION_NAME)
    dest_path = str(DATA_DIR / name)
    dist1 = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
    dist2 = tarfile.open(dest_path + '.tar.bz2', mode='w:bz2')
    dist3 = zipfile.ZipFile(dest_path + '.zip', mode='w', compression=zipfile.ZIP_DEFLATED)

    for arc, wfunc in (
            (dist1, dist1.add),
            (dist2, dist2.add),
            (dist3, dist3.write)):
        for path in MANIFEST['setup_data']:
            status_line.update("Adding", path)
            wfunc(str(DATA_DIR / path), arcname=str(name+'/'+path))
        arc.close()


def get_changelog():
    """
        Returns the changelog.
    """
    try:
        title = 'Changes in Brython version {}'.format(VERSION_NAME)
        ret = title + '\n' + ('=' * len(title)) + '\n\n'
        ret += (BRYTHON_DIR / 'setup' / 'changelog.txt').read_text()
        return ret
    except Exception as error:
        return None


def version_info():
    """
        Constructs the contents of version_info.js and returns it.

        The file initializes the following attributes of __BRYTHON__:

          - implementation, __MAGIC__, version_info   ... version info
          - compiled_date, timestamp                  ... the date & timestamp when the file was created
          - builtin_module_names                      ... list of private modules in src/Lib and not contained
                                                          in the CPython distribution together with all files
                                                          in src/libs
    """
    implementation = MANIFEST['meta']['implementation']
    version = MANIFEST['meta']['version']
    ret =  '__BRYTHON__.implementation = %s\n' % implementation
    ret += '__BRYTHON__.__MAGIC__ = "%s"\n' % '.'.join(['%s' % _i for _i in implementation[:3]])
    ret += '__BRYTHON__.version_info = %s\n' % str(version)
    ret += '__BRYTHON__.compiled_date = "%s"\n' % str(datetime.datetime.now())
    ret += '__BRYTHON__.timestamp = {}\n'.format(int(1000*time.time()))

    # builtin module names = list of scripts in src/libs
    ret += '__BRYTHON__.builtin_module_names = ["posix","sys", "errno", "time",'
    modules = [
        '"'+m.stem+'"' for m in (SRC_DIR / 'libs').iterdir()
        if m.is_file() and m.suffix == '.js'
    ]
    modules.sort()
    ret += ',\n    '.join(modules)
    ret += ',\n    '

    cpython_stdlib_private_mods = [
        m.name for m in pathlib.Path(os.__file__).parent.iterdir()
        if m.is_file() and m.stem.startswith('_')
    ]
    brython_private_mods = [
        '"'+m.stem+'"' for m in (SRC_DIR / 'Lib').iterdir()
        if m.is_file() and m.stem.startswith('_') and m.name not in cpython_stdlib_private_mods
    ]
    ret += ',\n    '.join(brython_private_mods)
    ret += ']\n'
    return ret


@M.command()
def list_releases():
    """
        Returns a list of releases (runs git tag -l)
    """
    for rel in get_releases():
        print(rel)


@M.command()
def changes(since: Option('list only changes since the given release', ['-s', '--since']) = None):
    """
        Lists changes between releases (using git shortlog)
    """
    releases = get_releases()
    if since is None:
        start = len(releases)-1
    else:
        try:
            start = releases.index(since)
        except:
            print("Unknown release:", since)
            exit(1)

    for rel in range(start, len(releases)):
        f = releases[rel]
        if rel + 1 < len(releases):
            t = releases[rel+1]
        else:
            t = 'master'
        changes = str(GIT("shortlog", '-r', f+'..'+t)).strip()
        if changes:
            print()
            print("Changes in ", f)
            print("------------" + '-'*len(f))
            print()
            print(changes)


@M.command()
def list_core_files():
    """
        Prints out a list of source files comprising the core implementation of Brython
    """
    print('.js\n'.join(MANIFEST['sources']['core'])+'.js')


@M.command()
def make_dist():
    """
        Prepares a release doing:

            1. creates the 'version_info.js' with basic version information
            2. creates brython.js with the core Brython javascript implementation (basic types, compiler, ...)
            3. creates brython_dist.js (the core + stdlib)
            4. updates package.json & copies necessary files into npm subdir
            5. copies files and creates archives in setup/data
            6. creates the changelog.txt file

        (make_dist)

    """

    status.start_action("Creating version_info.js")
    # create version_info.js
    vinfo = version_info()
    (SRC_DIR / 'version_info.js').write_text(vinfo)
    status.end_action()

    # create brython.js (core implementation)
    status.start_action('Catenating & minifying brython.js')
    brjs, src_size = brython_js(status_line=status)
    status.update("Saving to file")
    (SRC_DIR / 'brython.js').write_text(brjs)
    status.end_action(message="original size: %s; minified size: %s; ratio: %.2f%%" %
                        (src_size, len(brjs), 100 * (src_size - len(brjs)) / src_size))

    # create brython_dist.js (core + stdlib VFS)
    status.start_action('Creating brython_dist.js')
    vfs, num = stdlib_vfs(status_line=status)
    (SRC_DIR / 'brython_dist.js').write_text(brjs+vfs)
    status.end_action(message='processed '+str(num)+' files')

    # Update package.json
    status.start_action("Updating version in npm/package.json")
    package_file = BRYTHON_DIR / 'npm' / 'package.json'
    package_info = re.sub('"version": "(.*)"',
                          '"version": "{}"'.format(VERSION_NAME),
                          package_file.read_text(encoding="utf-8"))
    package_file.write_text(package_info, encoding='utf-8')
    status.end_action()


    # copy files into setup/data & npm
    status.start_action("Copying data files into setup/data & npm")
    DATA_DIR = BRYTHON_DIR / 'setup' / 'data'
    for f in ['brython.js', 'brython_stdlib.js', 'unicode.txt']:
        status.update(f)
        shutil.copyfile(str(SRC_DIR / f), str(DATA_DIR / f))
        shutil.copyfile(str(SRC_DIR / f), str(BRYTHON_DIR / 'npm' / f))
    status.end_action()

    # create setup/data/demo.html
    status.start_action("Creating setup/data/demo.html")
    (DATA_DIR / "demo.html").write_text(demo_html(), encoding="utf-8")
    status.end_action()

    # create zip files in setup/data
    status.start_action("Creating archives")
    pack_setup_data(status_line=status)
    status.end_action()

    # create the changelog file
    status.start_action("Creating the changelog file")
    chglog = get_changelog()
    if chglog:
        (DATA_DIR / 'changelog_{}.txt'.format(VERSION_NAME)).write_text(chglog)
        status.end_action()
    else:
        status.end_action(ok=False, message="No changelog found.")


@M.command()
def make_stdlibpath():
    """
        Create the file www/src/stdlib_paths.js containing a static mapping between module names and paths
        in the standard library (make_stdlib_static)
    """
    # Copied from scripts/make_st
    status.start_action("Generating stdlib_paths.js")
    with open(str(SRC_DIR/'stdlib_paths.js'), 'w') as out:
        out.write(""";(function($B){\n\n$B.stdlib = {}\n""")

        pylist = []
        pkglist = []
        pypath = SRC_DIR/'Lib'
        for dirpath, dirnames, filenames in os.walk(str(pypath)):
            dirpath = pathlib.Path(dirpath)
            status.update(dirpath.relative_to(pypath))
            if (dirpath/'__init__.py').exists():
                # package
                filenames = []
                pkglist.append('.'.join(dirpath.relative_to(pypath).parts))
            elif not dirnames:
                filenames = []
            for filename in filenames:
                rel_dir = dirpath.relative_to(pypath)
                mod_name, ext = os.path.splitext(filename)
                if not in_git('Lib'/rel_dir) or ext != '.py':
                    continue
                mod_name = '.'.join(rel_dir.parts+(mod_name,)).strip('.')
                if filename == '__init__.py':
                    mod_name = mod_name[:-9].lstrip('.')
                    pkglist.append(mod_name)
                else:
                    pylist.append(mod_name)
        jslist = [p.stem for p in (SRC_DIR/'libs').rglob('*.js')]

        status.update("sorting")
        pylist.sort()
        pkglist.sort()
        jslist.sort()

        status.update("writing")
        out.write("var pylist = ['%s']\n" % "','".join(pylist))
        out.write(
            "for(var i = 0; i < pylist.length; i++)" +
                "{$B.stdlib[pylist[i]] = ['py']}\n\n")

        out.write("var js = ['%s']\n" % "','".join(jslist))
        out.write("for(var i = 0; i < js.length; i++)" +
            "{$B.stdlib[js[i]] = ['js']}\n\n""")

        out.write("var pkglist = ['%s']\n" % "','".join(pkglist))
        out.write("for(var i  =0; i < pkglist.length; i++)" +
            "{$B.stdlib[pkglist[i]] = ['py', true]}\n")

        out.write('})(__BRYTHON__)')
    status.end_action()


@M.command(name='version')
def current_version():
    cv = version()
    print(version_string(cv))
