# copy files in /setup

import os
import shutil
import sys

from directories import root_dir, src_dir

setup_dir = os.path.join(root_dir, "setup")
release_dir = os.path.join(root_dir, "releases")

# source of index.html
html = """<!doctype html>
<html>

<head>
<meta charset="utf-8">
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
</head>

<body onload="brython(1)">
<script type="text/python">
from browser import document

document <= "Hello"
</script>
</body>

</html>"""

print("copying files...")
if not os.path.exists(os.path.join(src_dir, "brython_no_static.js")):
    # reported in issue #1452
    print("File brython_no_static.js doesn't exist. Please run "
          "scripts/make_dist.py to generate it.")
    sys.exit()
brython_dir = os.path.join(setup_dir, "brython")

# copy python_minifier from /scripts into current directory
fname = "python_minifier.py"
shutil.copyfile(os.path.join(root_dir, "scripts", fname),
    os.path.join(brython_dir, fname))

# create an empty subdirectory for data files
data_dir = os.path.join(setup_dir, "brython", "data")
if os.path.exists(data_dir):
    shutil.rmtree(data_dir)
os.mkdir(data_dir)

# copy files from /www/src into data_dir
for fname in ["brython_stdlib.js", "unicode.txt"]:
    shutil.copyfile(os.path.join(src_dir, fname),
        os.path.join(data_dir, fname))
shutil.copyfile(os.path.join(src_dir, "brython_no_static.js"),
    os.path.join(data_dir, "brython.js"))

# copy files from release_dir to data_dir
for fname in ["index.html", "README.txt"]:
    shutil.copyfile(os.path.join(release_dir, fname),
        os.path.join(data_dir, fname))

# copy demo.html in data_dir
with open(os.path.join(root_dir, 'www', 'demo.html'), encoding="utf-8") as f:
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

with open(os.path.join(data_dir, "demo.html"), "w", encoding="utf-8") as out:
    out.write(demo)