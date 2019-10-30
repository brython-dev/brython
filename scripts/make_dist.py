# -*- coding: utf-8 -*-


"""Script to compact all Brython scripts in a single one."""

import time
import datetime
import os
import re
import sys
import tarfile
import zipfile
import shutil

import javascript_minifier

if sys.version_info[0] != 3:
    raise ValueError("This script only works with Python 3")

# path of parent directory
pdir = os.path.dirname(os.getcwd())
# version info
version = [3, 8, 0, "final", 0]
implementation = [3, 8, 0, "dev", 0]

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]

def run():
    # update package.json
    package_file = os.path.join(pdir, 'npm', 'package.json')
    with open(package_file, encoding="utf-8") as fobj:
        package_info = fobj.read()
        package_info = re.sub('"version": "(.*)"',
            '"version": "{}"'.format(vname),
            package_info)

    with open(package_file, "w", encoding="utf-8") as fobj:
        fobj.write(package_info)

    abs_path = lambda _pth: os.path.join(os.path.dirname(os.getcwd()), 'www',
        'src', _pth)
    now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

    timestamp = int(1000 * time.time())

    # update version number
    with open(abs_path('version_info.js'), 'w') as vinfo_file_out:
        # implementation[2] = now
        vinfo_file_out.write('__BRYTHON__.implementation = %s\n'
            %implementation)
        vinfo_file_out.write('__BRYTHON__.__MAGIC__ = "%s"\n' %
            '.'.join(['%s' % _i for _i in implementation[:3]]))
        vinfo_file_out.write('__BRYTHON__.version_info = %s\n' % str(version))
        vinfo_file_out.write('__BRYTHON__.compiled_date = "%s"\n'
            %str(datetime.datetime.now()))
        vinfo_file_out.write('__BRYTHON__.timestamp = {}\n'.format(timestamp))
        # builtin module names = list of scripts in src/libs
        vinfo_file_out.write('__BRYTHON__.builtin_module_names = [')
        _modules = ['"%s"' % fname.split('.')[0]
                   for fname in os.listdir(abs_path('libs'))
                   if fname.endswith('.js')]

        # Sort modules so that git diff's don't change between runs
        _modules.sort()
        vinfo_file_out.write(',\n    '.join(_modules))
        vinfo_file_out.write(']\n')

    # generate html files that compare Brython and CPython distributions
    import make_stdlib_list

    import make_stdlib_static
    # build brython.js from base Javascript files
    sources = [
        'brython_builtins', 'version_info', 'py2js', 'loaders',
        'py_object', 'py_type', 'py_utils', 'py_builtin_functions',
        'py_exceptions', 'py_range_slice', 'py_bytes', 'py_set', 'js_objects',
        'stdlib_paths', 'py_import', 'py_float', 'py_int', 'py_long_int',
        'py_complex', 'py_sort', 'py_list', 'unicode_data', 'py_string',
        'py_dict', 'py_dom', 'py_generator', 'builtin_modules',
        'py_import_hooks', 'async'
    ]

    res = """// brython.js brython.info
// version {}
// implementation {}
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
""".format(version, implementation)

    res_no_static = res # same but without static stdlib files
    src_size = 0

    for fname in sources:
        src = open(abs_path(fname)+'.js').read() + '\n'
        src_size += len(src)
        mini = javascript_minifier.minify(src) + ";\n"
        res += mini
        if fname == 'stdlib_paths':
            res_no_static += "__BRYTHON__.stdlib = {}\n"
        else:
            res_no_static += mini

    res = re.sub(r'\bcontext\b', 'C', res)

    with open(abs_path('brython.js'), 'w', newline="\n") as out:
        out.write(res)

    with open(abs_path('brython_no_static.js'), 'w', newline="\n") as out:
        out.write(res_no_static)

    print(('size : originals %s compact %s gain %.2f' %
          (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

    sys.path.append("scripts")

    try:
        import make_VFS
    except ImportError:
        print("Cannot find make_VFS, so we won't make brython_stdlib.js.js")
        make_VFS = None
        sys.exit()

    make_VFS.process(os.path.join(pdir, 'www', 'src', 'brython_stdlib.js'))

    # Create brython_dist.js : core + libraries
    src_dir = os.path.join(pdir, 'www', 'src')
    with open(os.path.join(src_dir, 'brython_dist.js'), 'w') as distrib:
        distrib.write(open(os.path.join(src_dir, 'brython.js')).read())
        distrib.write(open(os.path.join(src_dir, 'brython_stdlib.js')).read())

    # update implementation in brython/__init__.py
    br_script = os.path.join(pdir, 'setup', 'brython', '__init__.py')
    with open(br_script, "w", encoding="utf-8") as out:
        out.write('implementation = "{}"'.format(vname))

    # copy demo.html
    with open(os.path.join(pdir, 'www', 'demo.html'), encoding="utf-8") as f:
        demo = f.read()
    start_tag = "<!-- start copy -->"
    end_tag = "<!-- end copy -->"
    start = demo.find(start_tag)
    if start == -1:
        raise Exception("No tag <!-- start copy --> in demo.html")
    end = demo.find(end_tag)
    if end == -1:
        raise Exception("No tag <!-- end copy --> in demo.html")
    body = demo[start + len(start_tag) : end].strip()

    release_dir = os.path.join(pdir, "releases")
    with open(os.path.join(release_dir, "demo.tmpl"), encoding="utf-8") as f:
        template = f.read()

    demo = template.replace("{{body}}", body)

    with open(os.path.join(release_dir, "demo.html"),
            "w", encoding="utf-8") as out:
        out.write(demo)

    # copy files in folder /npm
    npmdir = os.path.join(pdir, 'npm')
    for f in ['brython.js', 'brython_stdlib.js', 'unicode.txt']:
        shutil.copyfile(os.path.join(src_dir, f), os.path.join(npmdir, f))

    # create zip files
    print('create zip files in /releases')
    name = 'Brython-{}'.format(vname)
    dest_path = os.path.join(release_dir, name)
    dist1 = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
    dist2 = tarfile.open(dest_path+'.tar.bz2', mode='w:bz2')
    dist3 = zipfile.ZipFile(dest_path + '.zip', mode='w',
                            compression=zipfile.ZIP_DEFLATED)

    paths1 = ['README.txt', 'demo.html', 'index.html']
    paths2 = ['brython.js', 'brython_stdlib.js', 'unicode.txt']

    for arc, wfunc in ((dist1, dist1.add), (dist2, dist2.add),
            (dist3, dist3.write)):
        for path in paths1:
            wfunc(os.path.join(release_dir, path),
                arcname=os.path.join(name, path))
        for path in paths2:
            wfunc(abs_path(path),
                arcname=os.path.join(name, path))

        arc.close()

    # changelog file
    print('write changelog file')
    try:
        first = 'Changes in Brython version {}'.format(vname)
        with open(os.path.join(pdir, 'setup', 'changelog.txt')) as f:
            input_changelog_data_string = f.read()
        with open(os.path.join(pdir, 'setup', 'data',
                'changelog_{}.txt'.format(vname)), 'w') as out:
            out.write('%s\n' % first)
            out.write('%s\n\n' % ('=' * len(first)))
            out.write(input_changelog_data_string)
    except Exception as error:
        print(error)
        print("Warning - no changelog file")

if __name__ == "__main__":
    run()
