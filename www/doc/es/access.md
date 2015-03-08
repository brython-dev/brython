Accediendo a los elementos
--------------------------

Acceder a un elemento se puede realizar de varias formas. La más habitual sería usar su identificador, ie su atributo _id_ : con un campo de entrada definido por

>    <input id="data">

podemos acceder a este elemento mediante

>    from browser import document
>    data = document["data"]

`document` se encuentra definido en el módulo **browser** y hace referencia al documento HTML. Se comporta como un diccionario cuyas claves son los identificadores de los elementos que se encuentran en la página. Si no hay ningún elemento que contenga el id especificado, el programa lanzará una excepción `KeyError`.

También podríamos obtener todos los elementos de un tipo determinado, por ejemplo todos los enlaces de hipertexto (HTML tag `A`), usando la siguiente sintaxis

    from browser import document as doc
    from browser import html

    links = doc[html.A]

Por último, todos los elementos de la página tienen un método `get()` que puede usarse para buscar elementos :

- `elt.get(name=N)` devuelve una lista de todos los elementos que descienden de `elt` cuyo atributo `name` es igual a `N`
- `elt.get(selector=S)` devuelve una lista con todos los elementos que descienden de `elt` cuyo selector CSS coincide con `S`

Unos pocos ejemplos:

    document.get(selector='.foo')       # elementos con la clase "foo"
    document.get(selector='form')       # lista de etiquetas "<form>"
    document.get(selector='H1.bar')     # Etiquetas H1 con la clase "bar"
    document.get(selector='#container') # El elemento con id "container", igual que usar [document["container"]]
    document.get(selector='a[title]')   # Etiquetas A con el atributo "title"
