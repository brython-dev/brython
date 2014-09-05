Problema
--------

Leer el contenido de un fichero


Solución
--------

Usaremos la función integrada `open()` para leer el contenido de un fichero

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    import time
    from browser import document as doc
    
    fake_qs = '?foo=%s' %time.time()
    doc['zone'].value = open('cookbook/file.txt'+fake_qs).read()

<button id="get_file">Pruébalo</button>

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Contenido inicial</textarea>
</td>
</tr>
</table>

<script type="text/python3">
def get_file(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

doc['get_file'].bind('click', get_file)
</script>


Fíjate en el valor aleatorio de la cadena de consulta (query) al final del nombre del fichero : Será necesario refrescar el resultado si el fichero fuente ha sido modificado entre dos llamdas diferentes

El siguiente ejemplo añade un timeout para mostrar un mensaje en caso de que el fichero no haya sido encontrado después de 4 segundos :

    import time
    from browser import document as doc

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["zone"].value = req.text
        else:
            doc["zone"].value = "error "+req.text
    
    def err_msg():
        doc["zone"].text = "El servidor no ha contestado después de %s segundos" %timeout
    
    timeout = 4
    
    def go(url):
        req = ajax()
        req.on_complete = on_complete
        req.set_timeout(timeout,err_msg)
        req.open('GET',url,True)
        req.send()

    go('cookbook/file.txt?foo=%s' %time.time())
