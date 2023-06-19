# Always prefer setuptools over distutils
from setuptools import setup, find_packages

import os
import shutil
import sys

this_dir = os.getcwd()
root_dir = os.path.dirname(this_dir)
release_dir = os.path.join(root_dir, "releases")


LONG_DESCRIPTION = \
"""With Brython you can write browser programs in Python instead of Javascript,
by inserting Python code in an HTML page by::

    <script type="text/python">
    ...
    </script>

Usage::

    pip install brython

Then in an empty folder::

    brython-cli --install

or in a folder with older versions already present::

    brython-cli --update

The package includes a page **demo.html** with examples of use. For more
information see the `Brython site <http://brython.info>`_.
"""

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


command = sys.argv[1]

if command == "sdist":
    # before creating the distribution, copy files from other locations in
    # the repository
    print("copying files...")
    src_dir = os.path.join(root_dir, "www", "src")
    if not os.path.exists(os.path.join(src_dir, "brython_no_static.js")):
        # reported in issue #1452
        print("File brython_no_static.js doesn't exist. Please run "
              "scripts/make_dist.py to generate it.")
        sys.exit()
    brython_dir = os.path.join(this_dir, "brython")

    # copy python_minifier from /scripts into current directory
    fname = "python_minifier.py"
    shutil.copyfile(os.path.join(root_dir, "scripts", fname),
        os.path.join(brython_dir, fname))

    # create an empty subdirectory for data files
    data_dir = os.path.join(this_dir, "brython", "data")
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

setup(
    name='brython',

    version='3.11.3',
    description='Brython is an implementation of Python 3 running in the browser',

    long_description=LONG_DESCRIPTION,

    # The project's main homepage.
    url='http://brython.info',

    # Author details
    author='Pierre Quentel',
    author_email='quentel.pierre@orange.fr',

    packages=find_packages(),

    # Choose your license
    license='BSD',

    # See https://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[

        # Indicate who your project is intended for
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Interpreters',

        'Operating System :: OS Independent',

        # Pick your license as you wish (should match "license" above)
        'License :: OSI Approved :: BSD License',

        # Specify the Python versions you support here. In particular, ensure
        # that you indicate whether you support Python 2, Python 3 or both.
        'Programming Language :: Python :: 3',
    ],

    # What does your project relate to?
    keywords='Python browser',

    package_data={
        'brython': ['data/*.*']
    },
    entry_points={
        'console_scripts': [
            'brython-cli = brython.__main__:main'
            ]
    }


)
