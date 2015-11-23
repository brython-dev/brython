# -*- coding: utf-8 -*-


"""Script to compact all Brython scripts in a single one."""


import datetime
import os
import re
import sys
import tarfile
import zipfile

import javascript_minifier

from make_dist import *

# Generate page comparing Brython dist and CPython stdlib
import make_stdlib_list

# Generate static documentation pages
import make_doc  # lint:ok

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
            if 'test' in dirnames:
                dirnames.remove('test')
            for path in filenames:
                if os.path.splitext(path)[1] not in ('.js', '.py', '.css'):
                    continue
                print(('add', path, dirpath[len(base):]))
                # leave folder site-packages empty
                if 'site-packages' in dirpath:
                    path = ''
                wfunc(os.path.join(dirpath, path),
                      arcname=os.path.join(name, dirpath[len(base) + 1:], path))

    arc.close()

# changelog file
try:
    first = 'Changes in Brython version %s.%s.%s' % (
        implementation[0], implementation[1], implementation[2])
    with open(os.path.join(pdir, 'dist', 'changelog.txt')) as file_to_read:
        input_changelog_data_string = file_to_read.read()
    with open(os.path.join(pdir, 'dist', 'changelog_%s.txt' % now), 'w') as ou:
        ou.write('%s\n' % first)
        ou.write('%s\n\n' % ('=' * len(first)))
        ou.write(input_changelog_data_string)
except Exception as error:
    print(error)
    print("Warning - no changelog file")
