# -*- coding: utf-8 -*-
# Generate list of modules in the standard distribution

import sys
import os
import git

dico = {
    'title': {
            'en':'Brython distribution vs CPython',
            'fr':'Comparaison des distributions Brython et CPython',
            'es':'Distribución Brython vs CPython',
            'zh-hant': 'Brython 分發 vs CPython'
    },
    'dir': {
        'en':'Directory',
        'fr':'Répertoire',
        'es':'Directorio',
        'zh-hant': '目錄'
    },
    'both': {
        'en':'Files in both distributions',
        'fr':'Fichiers communs aux deux distributions',
        'es':'Archivos comunes en ambas distribuciones',
        'zh-hant': '兩個分發中的檔案'
    },
    'specific': {
        'en':'Brython-specific',
        'fr':'Spécifiques à Brython',
        'es':'Especificos de Brython',
        'zh-hant': 'Brython特定'
    },
    'not_yet': {
        'en':'In CPython but not (yet) in Brython',
        'fr':'Dans CPython mais pas (encore) dans Brython',
        'es':'En CPython pero no (todavía) en Brython',
        'zh-hant': '在CPython中，但尚未在Brython中'
    },
    'missing': {
        'en':'Directories in CPython distribution missing in Brython',
        'fr':'Répertoires de la distribution CPython absents de Brython',
        'es':'Directorios en CPython ausentes en la distribución en Brython',
        'zh-hant': '在CPython分發中而在Brython缺少的目錄'
    },
    'diff': {
        'en': '* indicates that Brython version is different from CPython',
        'fr': '* indique que la version Brython est différente de CPython',
        'es': '* indica que la versión de Brython es diferente de CPython',
        'zh-hant': '表明Brython版本與CPython的不同'
    }
}

if(sys.version_info[0]!=3):
    raise ValueError("This script must be run with Python 3")

version = '%s.%s' %sys.version_info[:2]

brython_stdlib_folder = os.path.join(os.path.dirname(os.getcwd()),
    'www', 'src')
python_stdlib_folder = os.path.dirname(sys.executable)
print(python_stdlib_folder)
doc_folder = os.path.join(os.path.dirname(os.getcwd()),
    'www', 'doc')
static_doc_folder = os.path.join(os.path.dirname(os.getcwd()),
    'www', 'static_doc')

if not os.path.exists(static_doc_folder):
    import make_doc

for lang in 'en','es','fr', 'zh-hant':
    index = open(os.path.join(doc_folder,lang,'index_static.html'), 'r', encoding="utf-8").read()

    with open(os.path.join(static_doc_folder,lang,'stdlib.html'), 'w', encoding="utf-8") as out:

        html = '<h1>%s %s'\
            '</h1>\n<div style="padding-left:30px;">' %(dico['title'][lang], version)
        html += '\n<div>%s</div>' %dico["diff"][lang]
        html += '<table border=1>\n'
        html += '<tr>\n<th>%s</th>\n'\
            '<th>%s</th>\n'\
            '<th>%s</th>\n'\
            '<th>%s</th></tr>\n'\
            %(dico['dir'][lang],dico['both'][lang],dico['specific'][lang],
                dico['not_yet'][lang])
        for dirpath, dirnames, filenames in os.walk(brython_stdlib_folder):

            if 'dist' in dirnames:
                dirnames.remove('dist')
            if '.hg' in dirnames:
                dirnames.remove('.hg')
            if '.git' in dirnames:
                dirnames.remove('.git')
            for dirname in dirnames:
                if dirname == 'dist':
                    continue
                if dirname == "__pycache__":
                    continue

            if "site-packages" in dirpath:
                continue

            path = dirpath[len(brython_stdlib_folder)+1:]
            python_path = os.path.join(python_stdlib_folder, path)

            if path.startswith('Lib\\test'):
                continue

            if not git.in_index(path.replace("\\", "/")):
                continue

            if path:
                valid = [f for f in filenames
                    if os.path.splitext(f)[1] not in ['.pyc']]
                valid = [v for v in valid
                    if git.in_index(os.path.join(path, v).replace("\\", "/"))]
                valid = [v for v in valid if v.startswith('_')] + \
                    [v for v in valid if not v.startswith('_')]

                if valid:
                    common = [v for v in valid
                        if os.path.exists(os.path.join(python_path, v))]
                    for i, f in enumerate(common):
                        if os.stat(os.path.join(dirpath, f)).st_size != \
                                os.stat(os.path.join(python_path, f)).st_size:
                            common[i] = "*" + common[i]
                    brython_specific = [v for v in valid if not v in common]
                    if os.path.exists(python_path):
                        missing = [f for f in os.listdir(python_path)
                            if f!='__pycache__' and
                                os.path.isfile(os.path.join(python_path,f))
                                and not f in valid]
                    else:
                        missing = []
                    html += '<tr><td valign="top">%s</td>\n' %path
                    for files in common, brython_specific, missing:
                        html += '<td style="vertical-align:top;">'+\
                            '\n<br>'.join(files)+'</td>\n'
                    html += '</tr>\n'

        html += '</table>\n'

        # Directories in CPython dist missing from Brython dist
        html += '<h2>%s</h2>' %dico['missing'][lang]
        for dirpath, dirnames, filenames in os.walk(python_stdlib_folder):
            path = dirpath[len(python_stdlib_folder)+1:]
            if path.startswith(r'Lib\site-packages'):
                continue
            if path.endswith(r'\__pycache__'):
                continue
            brython_path = os.path.join(brython_stdlib_folder, path)
            if not os.path.exists(brython_path):
                html += '<li>%s\n' %path
                dirnames.clear() # no recursion

        html += '</div>\n</body>\n</html>'

        html = index.replace('<content>', html)
        html = html.replace('<prefix>','..')

        out.write(html)

