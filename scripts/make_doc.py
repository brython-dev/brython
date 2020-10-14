import os
import shutil
import sys

from version import implementation

impl_name = '.'.join(str(x) for x in implementation[:3])

# hack sys.path to be able to import markdown
sys.path.insert(0, os.path.join(os.path.dirname(os.getcwd()),
    'www','src','Lib','browser'))
import markdown
# restore original sys.path
del sys.path[0]

# path of markdown files
md_doc_path = os.path.join(os.path.dirname(os.getcwd()), 'www', 'doc')

static_doc_path = os.path.join(os.path.dirname(os.getcwd()), 'www',
    'static_doc')

md_tutorial_path = os.path.join(os.path.dirname(os.getcwd()), 'www',
    'tutorial')

static_tutorial_path = os.path.join(os.path.dirname(os.getcwd()), 'www',
    'static_tutorial')

src_paths = [static_doc_path,
    os.path.join(static_doc_path,'cookbook'),
    static_tutorial_path]

for path in src_paths:
    if not os.path.exists(path):
        os.mkdir(path)

# copy css
shutil.copy(os.path.join(md_doc_path,'doc_brython.css'),
    os.path.join(static_doc_path,'doc_brython.css'))

# copy images
images_dir_src = os.path.join(md_doc_path,'images')
images_dir_dest = os.path.join(static_doc_path,'images')
if not os.path.exists(images_dir_dest):
    os.mkdir(images_dir_dest)

for img in os.listdir(images_dir_src):
    shutil.copy(os.path.join(images_dir_src, img), images_dir_dest)

with open(os.path.join(md_tutorial_path, "index.html"),
        encoding="utf-8") as f:
    index_tutorial = f.read()

# documentation
for lang in ['fr', 'en', 'es']:
    dest_path = os.path.join(static_doc_path, lang)
    dest_paths = [dest_path, os.path.join(dest_path,'cookbook')]

    index = open(os.path.join(md_doc_path, lang,
        'index_static.html'), 'rb').read()
    index = index.decode('utf-8')

    for path in dest_paths:
        if not os.path.exists(path):
            os.mkdir(path)

    print('static doc %s' %lang)
    for i, (src_path, dest_path) in enumerate(zip([os.path.join(md_doc_path, lang),
        os.path.join(md_doc_path,lang,'cookbook')], dest_paths)):
        for filename in os.listdir(src_path):
            ext = os.path.splitext(filename)[1]
            if ext == '.md':
                src = open(os.path.join(src_path, filename), 'rb').read()
                src = src.decode('utf-8')
                html, scripts = markdown.mark(src)
                out = open(os.path.join(dest_path, filename[:-3]+'.html'), 'wb')
                html = index.replace('<content>',html)
                html = html.replace('<prefix>','/'.join(['..'] * (i + 1)))
                if i == 1:
                    html = html.replace('class="navig" href="',
                        'class="navig" href="../')
                if scripts:
                    script_content = "\n".join(scripts)
                    html = html.replace('<scripts>', script_content)
                out.write(html.encode('utf-8'))
                out.close()
            elif ext=='.txt':
                shutil.copy(os.path.join(src_path, filename),
                    os.path.join(dest_path, filename))
            elif os.path.isdir(os.path.join(src_path, filename)) \
                and filename != 'cookbook':
                dest_dir = os.path.join(dest_path, filename)
                if os.path.exists(dest_dir):
                    shutil.rmtree(dest_dir)
                shutil.copytree(os.path.join(src_path, filename), dest_dir)

# tutorial
for lang in ['br', 'fr', 'en', 'es', 'it', 'pt-br']:
    print(f"tutorial {lang}")
    md_path = os.path.join(md_tutorial_path, lang)
    static_path = os.path.join(static_tutorial_path, lang)
    if os.path.exists(md_path):
        if not os.path.exists(static_path):
            os.mkdir(static_path)
        for filename in os.listdir(md_path):
            print(md_path, filename)
            basename, ext = os.path.splitext(filename)
            if ext == '.md':
                src_path = os.path.join(md_path, filename)
                with open(src_path, encoding="utf-8") as f:
                    src = f.read()
                    src = src.replace('{implementation}', impl_name)
                    html, scripts = markdown.mark(src)
                    dest_path = os.path.join(static_path, basename + '.html')
                    print("save in", dest_path)
                    content = index_tutorial.replace("{{content}}", html)
                    with open(dest_path, 'w', encoding="utf-8") as out:
                        out.write(content)
