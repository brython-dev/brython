import os
import builtins

script_dir = os.path.dirname(os.getcwd())
path = os.path.join(script_dir, 'www', 'src', 'builtins_docstrings.js')

tail = """
for(var key in docs){
    if(__BRYTHON__.builtins[key]){
        __BRYTHON__.builtins[key].__doc__ = docs[key]
    }
}"""

with open(path, 'w', encoding='utf-8') as out:

    out.write('var docs = {\n')
    for b in dir(builtins):
        doc = getattr(builtins, b).__doc__
        if b.startswith('__') and b !='__debug__':
            continue
        if doc is not None:
            doc = doc.replace('\\',r'\\')
            doc = doc.replace('\n',r'\n')
            out.write('%s:"%s",\n' %(b,doc.replace('"',r'\"')))
        else:
            out.write('%s:"",\n' %b)

    out.write('}')
    out.write(tail)

