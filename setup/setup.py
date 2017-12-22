# Always prefer setuptools over distutils
from setuptools import setup, find_packages

import os
import shutil

with open('README.rst', encoding='utf-8') as fobj:
    LONG_DESCRIPTION = fobj.read()

setup(
    name='brython',

    version='3.4.0',

    description='Brython is an implementation of Python 3 running in the browser',

    long_description = LONG_DESCRIPTION,

    # The project's main homepage.
    url='http://brython.info',

    # Author details
    author='Pierre Quentel',
    author_email='quentel.pierre@orange.fr',

    packages = ['data', 'data.tools'],

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

    py_modules=["brython", "list_modules", "server"],

    package_data={
        'data': [
            'README.txt',
            'demo.html',
            'brython.js',
            'brython_stdlib.js',
            'unicode.txt'
            ]
    }

)