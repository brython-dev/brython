Accediendo a los elementos
--------------------------

Acceder a un elemento se puede realizar de varias formas. La más habitual
sería usar su identificador, ie su atributo _id_ : con un campo de entrada
definido por

```xml
<input id="data">
```

podemos acceder a este elemento mediante

```python
from browser import document
data = document["data"]
```

`document` se encuentra definido en el módulo **browser** y hace referencia al
documento HTML. Se comporta como un diccionario cuyas claves son los
identificadores de los elementos que se encuentran en la página. Si no hay
ningún elemento que contenga el id especificado, el programa lanzará una
excepción `KeyError`.

Todos los elementos de la página tienen un método `get()` que puede usarse
para buscar elementos :

- `elt.get(name=N)` devuelve una lista de todos los elementos que descienden
  de `elt` cuyo atributo `name` es igual a `N`
- `elt.get(selector=S)` devuelve una lista con todos los elementos que
  descienden de `elt` cuyo selector CSS coincide con `S`

`elt.select(S)` es igual a `elt.get(selector=S)`.

Unos pocos ejemplos:

```python
document.select(selector='.foo')  # elementos con la clase "foo"
document.select('form')           # lista de etiquetas "<form>"
document.select('H1.bar')         # Etiquetas H1 con la clase "bar"
document.select('#container')     # El elemento con id "container", igual
                                  # que usar [document["container"]]
document.select('a[title]')       # Etiquetas A con el atributo "title"
```