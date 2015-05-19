# Generate list of modules in the standard distribution

import sys
import os

if(sys.version_info[0]!=3):
    raise ValueError("This script must be run with Python 3")
    
brython_stdlib_folder = os.path.join(os.path.dirname(os.getcwd()),
    'www', 'src')
python_stdlib_folder = os.path.dirname(sys.executable)
print(python_stdlib_folder)
doc_folder = os.path.join(os.path.dirname(os.getcwd()),
    'www', 'doc')

with open(os.path.join(doc_folder,'stdlib_list.html'), 'w') as out:
    out.write('<html><head><style>li {padding-left:20px;list-style-type:none;}</style>')
    out.write('</head><body>')
    out.write('<h1>Brython distribution</h1>\n<div style="padding-left:30px;">')
    out.write('<table border=1>\n')
    for dirpath, dirnames, filenames in os.walk(brython_stdlib_folder):
        path = dirpath[len(brython_stdlib_folder)+1:]
        python_path = os.path.join(python_stdlib_folder, path)
        
        if path.startswith('Lib\\test'):
            print(path, dirnames)
            continue
        
        if path:
            valid = [f for f in filenames 
                if os.path.splitext(f)[1] not in ['.pyc']]
            valid = [v for v in valid if v.startswith('_')] + \
                [v for v in valid if not v.startswith('_')]

            if valid:
                common = [v for v in valid 
                    if os.path.exists(os.path.join(python_path,v))]
                brython_specific = [v for v in valid if not v in common]
                if os.path.exists(python_path):
                    missing = [f for f in os.listdir(python_path)
                        if f!='__pycache__' and 
                            os.path.isfile(os.path.join(python_path,f))
                            and not f in valid]
                else:
                    missing = []
                out.write('<tr><td valign="top">%s</td>\n' %path)
                for files in common, brython_specific, missing:
                    out.write('<td style="vertical-align:top;">'+'\n<br>'.join(files)+'</td>\n')
                out.write('</tr>\n')
    out.write('</table>\n</div>\n</body>\n</html>')