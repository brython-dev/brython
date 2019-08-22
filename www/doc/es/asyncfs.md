módulo **asyncio.fs**
-----------------------
El módulo proporciona acceso asíncrono a ficheros locales / remotos.


Debajo se puede ver un ejemplo comentado el cual se puede ejecutar desde el repl.

```python
from browser import document as doc, html
import asyncio.fs as afs

# Crea un elemento input & añádelo a la página
i = html.INPUT(type='file')
doc <= i

# Espera a que el usuario seleccione un fichero...

# Una vez que el usuario ha seleccionado el fichero
# lo podemos abrir usando el método `open`
ff = afs.open(i.files[0])

# El método es una corutina, por tanto, devolverá un `asyncio.Future`
# Una vez que el fichero se ha leido podemos obtener el resultado usando:
f = ff.result()

# El resultado es una instancia de `asyncio.fs.BrowserFile`
# que hereda de `io.StringIO`
# de tal forma que puedes acceder al mismo con `read`, `readlines`,
# y el resto de métodos de `io.StringIO`
print(f.read())

# También disponemos de un método adicional `save`
# el cual descarga el fichero a la carpeta Downloads
# o, dependiendo de los ajustes del usuario,
# abre un diálogo de fichero permitiendo elegit dónde se salvará el fichero
f.save()
```

Hay que destacar que el objeto `asyncio.fs.BrowserFile`  mantiene el contenido del
fichero en memoria. Por tanto, deberías tener cuidado con ficheros grandes.
El método `open` usa un argumento opcional, `max_size`, el cual especifica 
el tamaño máximo (en bytes) del fichero que deseamos leer.
Si proporcionamos el parámetro y el tamaño es mayor que el valor definido, 
obtendremos una excepción `IOError`.

El objeto `asyncio.fs.BrowserFile` soporta el método `write`. Si modificas
el fichero usando este método, el método `save` guardará los contenidos modificados.

El método `asyncio.fs.open` acepta tanto un objeto [File](https://developer.mozilla.org/cs/docs/Web/API/File)
o una url. En el segundo caso descargará la url y devolverá los contenidos como
un objeto `asyncio.fs.BrowserFile`. Sin embargo, el método `save` guardará el 
fichero localmente, **no** remotamente.

**Destacar que la lectura remota no está totalmente testeada todavía.**


El módulo contiene, además, un método de conveniencia

```
    asyncio.fs.open_local
```

el cual abre un diálogo de fichero que el usuario podrá usar para seleccionar 
un fichero. El método devuelve un `asyncio.Future` el cual deriva en un
`asyncio.fs.BrowserFile` con el contenido del fichero cuando el fichero ha sido 
leído. El método funciona incluyendo un elemento input  al cuerpo del documento,
registrando un gestor de cambios para el elemento, clickándolo de forma
programática y, por último, borrándolo inmediatamente del documento.

El ejemplo de más arriba se puede ejecutar en un repl. Debido a la naturaleza
asíncrona de los métodos, cuando se ejecutan desde un script, se debería de
envolver en una corutina, e.g. como se muestra a continuación:


```python
import asyncio
import asyncio.fs as afs

@asyncio.coroutine
def process_file(file_object = None):

    if file_object is None:
        input = yield afs.open_local()
    else:
        input = yield afs.open(file_object)

    output = yield afs.open('processed.txt','w')

    for ln in input.readlines():
        output.write(ln.replace('\n','\r\n'))

    output.save()

asyncio.ensure_future(process_file())
```
