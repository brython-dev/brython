import os
import re
import tarfile
import zipfile
import shutil

# generate html files that compare Brython and CPython distributions
import make_stdlib_list

from make_dist import run, pdir, vname, abs_path

run()

release_dir = os.path.join(pdir, "releases")

# update package.json
print("Update package.json...")
package_file = os.path.join(pdir, 'npm', 'package.json')
with open(package_file, encoding="utf-8") as fobj:
    package_info = fobj.read()
    package_info = re.sub('"version": "(.*)"',
        '"version": "{}"'.format(vname),
        package_info)

with open(package_file, "w", encoding="utf-8") as fobj:
    fobj.write(package_info)

# update implementation in README.md
print("Update readme and install doc pages...", vname)
README_page = os.path.join(pdir, "README.md")
with open(README_page, encoding="utf-8") as f:
    content = f.read()
    content = re.sub("npm/brython@\d\.\d+\.\d+", "npm/brython@" + vname,
        content)
with open(README_page, "w", encoding="utf-8") as out:
    out.write(content)

for lang in ["en", "fr", "es"]:
    install_page = os.path.join(pdir, "www", "doc", lang, "install.md")
    with open(install_page, encoding="utf-8") as f:
        content = f.read()
    content = re.sub("npm/brython@\d\.\d+\.\d+", "npm/brython@" + vname,
        content)
    content = re.sub("/brython/\d\.\d+\.\d+", "/brython/" + vname,
        content)
    with open(install_page, "w", encoding="utf-8") as out:
        out.write(content)

# update implementation in brython/__init__.py
print("Update CPython brython package...")
br_script = os.path.join(pdir, 'setup', 'brython', '__init__.py')
with open(br_script, "w", encoding="utf-8") as out:
    out.write('__version__ = implementation = "{}"'.format(vname))

# copy files in folder /npm
print("Udpate npm folder...")
npmdir = os.path.join(pdir, 'npm')
src_dir = os.path.join(pdir, 'www', 'src')
for f in ['brython.js', 'brython_stdlib.js', 'unicode.txt']:
    shutil.copyfile(os.path.join(src_dir, f), os.path.join(npmdir, f))

# copy demo.html
print("Copy demo.html...")
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


with open(os.path.join(release_dir, "demo.tmpl"), encoding="utf-8") as f:
    template = f.read()

demo = template.replace("{{body}}", body)

with open(os.path.join(release_dir, "demo.html"),
        "w", encoding="utf-8") as out:
    out.write(demo)


# create zip files
print('Create zip files in /releases...')
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
print('Write changelog file...')
try:
    first = 'Changes in Brython version {}'.format(vname)
    with open(os.path.join(pdir, 'setup', 'changelog.txt'), encoding="utf-8") as f:
        input_changelog_data_string = f.read()
    with open(os.path.join(release_dir,
            'changelog_{}.txt'.format(vname)), 'w', encoding="utf-8") as out:
        out.write('%s\n' % first)
        out.write('%s\n\n' % ('=' * len(first)))
        out.write(input_changelog_data_string)
except Exception as error:
    print(error)
    print("Warning - no changelog file")
