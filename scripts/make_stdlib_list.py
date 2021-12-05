# -*- coding: utf-8 -*-
# Generate list of modules in the standard distribution

import sys
import os
import git

dico = {
    'title': {
            'en':'Brython distribution vs CPython',
            'fr':'Comparaison des distributions Brython et CPython',
            'es':'Distribución Brython vs CPython'
    },
    'dir': {
        'en':'Directory',
        'fr':'Répertoire',
        'es':'Directorio'
    },
    'both': {
        'en':'Files in both distributions<br><i>' + \
            '* indicates that Brython version is different from CPython</i>',
        'fr':'Fichiers communs aux deux distributions <br><i>' + \
            '* indique que la version Brython est différente de CPython</i>',
        'es':'Archivos comunes en ambas distribuciones <br><i>' + \
            '* indica que la versión de Brython es diferente de CPython'
    },
    'replacements': {
        'en': 'Replacement for CPython module',
        'fr': 'Remplacement de modules CPython',
        'es': 'Reemplazando módulos de CPython'
    },
    'specific': {
        'en':'Brython-specific',
        'fr':'Spécifiques à Brython',
        'es':'Especificos de Brython'
    },
    'not_yet': {
        'en':'In CPython but not (yet) in Brython<br><i>' + \
            '*: replaced by a Javascript module in /libs</i>',
        'fr':'Dans CPython mais pas (encore) dans Brython<br><i>' + \
            '*: remplacé par un module Javascript dans /libs</i>',
        'es':'En CPython pero no (todavía) en Brython<br><i>' + \
            '*: reemplazado por un módulo javascript en /libs</i>'
    },
    'missing': {
        'en':'Directories in CPython distribution missing in Brython',
        'fr':'Répertoires de la distribution CPython absents de Brython',
        'es':'Directorios en CPython ausentes en la distribución en Brython'
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

for lang in 'en','es','fr':
    index = open(os.path.join(doc_folder,lang,'index_static.html'), 'r', encoding="utf-8").read()

    with open(os.path.join(static_doc_folder,lang,'stdlib.html'), 'w', encoding="utf-8") as out:

        html = '<h1>%s %s'\
            '</h1>\n<div style="padding-left:30px;">' %(dico['title'][lang], version)
        html += '<table border=1>\n'
        html += '<tr>\n<th>%s</th>\n'\
            '<th>%s</th>\n'\
            '<th>%s</th>\n'\
            '<th>%s</th>\n'\
            '<th>%s</th></tr>\n'\
            %(dico['dir'][lang],
                dico['both'][lang],
                dico['replacements'][lang],
                dico['specific'][lang],
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
                    brython_specific = [v for v in valid if not v in common]
                    replacements = []
                    r1 = []
                    for v in brython_specific:
                        try:
                            mod_name = os.path.splitext(v)[0]
                            if path.startswith("Lib") and path != "Lib":
                                mod_name = '.'.join(path[4:].split(os.sep) + \
                                    [mod_name])
                            print(v, mod_name)
                            try:
                                m = __import__(mod_name)
                            except ImportError:
                                # cf issue 1829
                                continue
                            r1.append(v)
                            if hasattr(m, "__file__"):
                                replacements.append(
                                    f'{v} <i>({m.__file__[len(python_stdlib_folder):]})</i>')
                            else:
                                replacements.append(f'{v} <i>(built-in)</i>')
                        except ModuleNotFoundError:
                            pass
                    brython_specific = [v for v in brython_specific
                        if v not in r1]
                    for i, f in enumerate(common):
                        if os.stat(os.path.join(dirpath, f)).st_size != \
                                os.stat(os.path.join(python_path, f)).st_size:
                            common[i] = "*" + common[i]
                    if os.path.exists(python_path):
                        missing = [f for f in os.listdir(python_path)
                            if f!='__pycache__' and
                                os.path.isfile(os.path.join(python_path,f))
                                and not f in valid]
                    else:
                        missing = []
                    if path == "Lib":
                        brython_libs_folder = os.path.join(brython_stdlib_folder, 'libs')
                        brython_libs = [os.path.splitext(v)[0]
                            for v in os.listdir(brython_libs_folder)]
                        for i, m in enumerate(missing):
                            if os.path.splitext(m)[0] in brython_libs:
                                missing[i] = '*' + m
                    html += '<tr><td valign="top">%s</td>\n' %path
                    for files in common, replacements, brython_specific, missing:
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

