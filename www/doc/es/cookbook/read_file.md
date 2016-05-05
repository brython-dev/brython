Problema
--------

Leer el contenido de un fichero


Solución
--------

Usaremos la función integrada `open()` para leer el contenido de un fichero

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

```exec
import time
from browser import document

fake_qs = '?foo=%s' %time.time()
document['zone'].value = open('file.txt'+fake_qs).read()
```

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Contenido inicial</textarea>
</td>
</tr>
</table>


Fíjate en el valor aleatorio de la cadena de consulta (query) al final del 
nombre del fichero : Será necesario refrescar el resultado si el fichero 
fuente ha sido modificado entre dos llamadas diferentes

El siguiente ejemplo añade un *timeout* para mostrar un mensaje en caso de 
que el fichero no haya sido encontrado después de 4 segundos :

```exec
import time
from browser import document

def on_complete(req):
    if req.status==200 or req.status==0:
        document["zone"].value = req.text
    else:
        document["zone"].value = "error "+req.text

def err_msg():
    document["zone"].text = "El servidor no ha contestado \
        después de %s segundos" %timeout

timeout = 4

def go(url):
    req = ajax()
    req.bind("complete", on_complete)
    req.set_timeout(timeout,err_msg)
    req.open('GET',url,True)
    req.send()

go('file.txt?foo=%s' %time.time())
```