Problem
-------

Store objects locally, using HTML5 Local Storage


Solution
--------

Brython provides a built-in module `browser.local_storage` that stores string values associated to string keys


    from browser import document as doc
    from browser.local_storage import storage
    storage['brython_test'] = doc['zone'].value
    
<input id="zone" value="Local Storage">
<button id="show_0">Store value</button>

    from browser import alert
    alert(storage['brython_test'])

<button id="show_1">Show stored value</button>

<script type="text/python3">
def show_locstor(num):
    src = doc.get(selector="pre.marked")[num].text
    exec(src)

doc['show_0'].bind('click', lambda ev:show_locstor(0))
doc['show_1'].bind('click', lambda ev:show_locstor(1))
doc['show_2'].bind('click', lambda ev:show_locstor(2))
</script>

If a Python object can be serialized by the `json` module, you can store the serialized version, then retrieve the original object :

    from browser import alert
    from browser.local_storage import storage
    import json
    
    a = {'foo':1,1515:'Marignan'}
    
    storage["brython_test"] = json.dumps(a)
    
    b = json.loads(storage['brython_test'])
    alert(b['foo'])
    alert(b['1515'])

<button id="show_2">Test it</button>

Beware that `json` converts dictionary keys to their string value, this is why we use `b['1515']` instead of `b[1515]`
