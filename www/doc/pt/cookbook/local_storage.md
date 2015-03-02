Problema
--------

Armazenar objetos localmente, usando Armazenamento Local HTML5


Solução
-------

Brython fornece um módulo integrado `browser.local_storage` que
armazena valores associados a chaves, sendo ambos cadeias de
caractéres.


    from browser.local_storage import storage
    storage['brython_test'] = doc['zone'].value
    
<input id="zone" value="Armazenamento Local">
<button id="show_0">Armazenar valor</button>

    from browser import alert
    alert(storage['brython_test'])

<button id="show_1">Mostrar valor armazenado</button>


<script type="text/python3">
def show_locstor(num):
    src = doc.get(selector="pre.marked")[num].text
    exec(src)

doc['show_0'].bind('click', lambda ev:show_locstor(0))
doc['show_1'].bind('click', lambda ev:show_locstor(1))
doc['show_2'].bind('click', lambda ev:show_locstor(2))
</script>

Se um objeto Python pode ser serializado pelo módulo `json`, você pode
armazenar a versão serializadda, e então recuperar o objeto original:

    from browser import alert
    from browser.local_storage import storage
    import json
    
    a = {'foo':1,1515:'Marignan'}
    
    storage["brython_test"] = json.dumps(a)
    
    b = json.loads(storage['brython_test'])
    alert(b['foo'])
    alert(b['1515'])

<button id="show_2">Teste</button>

Atenção, `json` converte chaves de dicionários a seus valores em
cadeias de caracteres, é por isso que usamos `b['1515']` em vez de
`b[1515]`.
