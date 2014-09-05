Problema
--------

Almacenar objetos localmente usando 'local storage' disponible en HTML5


Solución
--------

Brython proporciona un módulo llamado `browser.local_storage` que permite almacenar cadenas de valores a sociados a cadenas de claves


    from browser.local_storage import storage
    storage['brython_test'] = doc['zone'].value
    
<input id="zone" value="Local Storage">
<button id="show_0">Almacenar valor</button>

    from browser import alert
    alert(storage['brython_test'])

<button id="show_1">Mostrar valor almacenado</button>


<script type="text/python3">
def show_locstor(num):
    src = doc.get(selector="pre.marked")[num].text
    exec(src)

doc['show_0'].bind('click', lambda ev:show_locstor(0))
doc['show_1'].bind('click', lambda ev:show_locstor(1))
doc['show_2'].bind('click', lambda ev:show_locstor(2))
</script>

Si un objeto Python puede ser serializado mediante el módulo `json`, podríamos almacenar la versión serializada para, más tarde, volver a obtener el objeto original :

    from browser import alert
    from browser.local_storage import storage
    import json
    
    a = {'foo':1,1515:'Marignan'}
    
    storage["brython_test"] = json.dumps(a)
    
    b = json.loads(storage['brython_test'])
    alert(b['foo'])
    alert(b['1515'])

<button id="show_2">Pruébalo</button>

Ten cuidado ya que `json` convierte las claves del diccionario a una cadena. Debido a ello es por lo que hemos usado `b['1515']` en lugar de `b[1515]` en el ejemplo anterior
