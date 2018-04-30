#!/usr/bin/env python3

import json
import pathlib


from plumbum import local

BRYTHON_DIR = pathlib.Path(__file__).parent.parent.parent.parent
SRC_DIR = BRYTHON_DIR / 'www' / 'src'
MANIFEST = json.loads((BRYTHON_DIR / 'manifest.json').read_text())
VERSION_NAME = '.'.join(str(x) for x in MANIFEST['meta']['implementation'][:3])
if MANIFEST['meta']['implementation'][3] == 'rc':
    VERSION_NAME += 'rc%s' % MANIFEST['meta']['implementation'][4]
DOC_DIR = BRYTHON_DIR / 'www' / 'doc'
STATIC_DOC_DIR = BRYTHON_DIR / 'www' / 'static_doc'
DOC_LANGS = ['fr', 'en', 'es']
