"""
    Commands used to build the documentation
"""
import os
import re
import shutil
import sys

from .lib.cli import M
from .lib.term import status
from .lib.info import DOC_LANGS, BRYTHON_DIR, SRC_DIR, DOC_DIR, STATIC_DOC_DIR

# hack sys.path to be able to import markdown
sys.path.insert(0, str(SRC_DIR/'Lib'/'browser'))
import markdown

# restore original sys.path
del sys.path[0]


def process_md(index, src, position):
    html, scripts = markdown.mark(src)
    html = index.replace('<content>', html)
    html = html.replace('<prefix>', '/'.join(['..']*(position+1)))
    if position == 1:
        html = html.replace('class="navig" href="', 'class="navig" href="../')
    if scripts:
        html = html.replace('<scripts>', '<script type="text/python">%s\n</script>' %'\n'.join(scripts))
    return html


def copy(src, dst):
    shutil.copy(str(src), str(dst))


@M.command()
def compile():
    """Generate documentation (make_doc)."""
    src_paths = [STATIC_DOC_DIR, STATIC_DOC_DIR/'cookbook']

    for path in src_paths:
        path.mkdir(parents=True, exist_ok=True)

    # copy css & images
    status.start_action('Copying files')

    status.update('doc_brython.css')
    copy(DOC_DIR/'doc_brython.css', STATIC_DOC_DIR/'doc_brython.css')

    images_dir_src = DOC_DIR/'images'
    images_dir_dest = STATIC_DOC_DIR/'images'
    images_dir_dest.mkdir(parents=True, exist_ok=True)
    for img in images_dir_src.iterdir():
        status.update('images/'+img.name)
        copy(img, images_dir_dest)

    status.end_action()

    for lang in DOC_LANGS:
        status.start_action("Generating docs for language "+str(lang))
        dest_path = STATIC_DOC_DIR/lang
        dest_paths = [dest_path, dest_path/'cookbook']
        for path in dest_paths:
            path.mkdir(parents=True, exist_ok=True)

        index = (DOC_DIR/lang/'index_static.html').read_text(encoding='utf-8')

        for i, (src_path, dest_path) in enumerate(zip([DOC_DIR/lang, DOC_DIR/lang/'cookbook'], dest_paths)):
            for filename in src_path.iterdir():
                status.update(filename)
                ext = filename.suffix
                if ext == '.md':
                    src = filename.read_text(encoding='utf-8')
                    html = process_md(index, src, position=i)
                    (dest_path/(filename.stem + '.html')).write_text(html, encoding='utf-8')
                elif ext == '.txt':
                    copy(filename, dest_path/filename.name)
                elif filename.is_dir() and filename.name == 'cookbook':
                    dest_dir = dest_path/'cookbook'
                    if dest_dir.exists():
                        shutil.rmtree(str(dest_dir))
                    shutil.copytree(str(filename), str(dest_dir))
        status.end_action()
