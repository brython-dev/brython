import sys
import time
import random
import dis
import traceback

_rand=random.random()

from browser import html, markdown
from browser import document as doc

editor = html.TEXTAREA(rows=20,cols=70)
doc <= editor

if sys.has_local_storage:
    from local_storage import storage
else:
    storage = False

def reset_src():
    if storage and "markdown_src" in storage:
       editor.value = storage["markdown_src"]
    else:
       editor.value = ""

def to_str(xx):
    return str(xx)

def run():
    src = editor.value
    if storage:
       storage["markdown_src"]=src

    mk,scripts = markdown.mark(src)
    doc['console'].html = mk

reset_src()
