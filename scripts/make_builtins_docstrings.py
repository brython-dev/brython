import builtins

out = open('../src/builtins_docstrings.js','w')

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
out.close()