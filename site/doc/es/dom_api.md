Introducción
------------

Para interactuar con el navegador, Brython sigue la interfaz del Document Object Model, la cual se encuentra ampliamente documentada en la red :

- [referencia W3C](http://www.w3.org/DOM/)
- [página de la Wikipedia en inglés](http://en.wikipedia.org/wiki/Document_Object_Model) o [en español](http://es.wikipedia.org/wiki/Document_Object_Model)
- [sitio de Mozilla](https://developer.mozilla.org/en-US/docs/DOM)

La interfaz es independiente del lenguaje. Con Brython, todas las operaciones descritas en la API del DOM dependen de dos objetos definidos en el módulo **browser** : _document_ y _window_

_document_ implementa la interfaz `Document` definida en la API del DOM. Por ejemplo, soporta los siguientes métodos :

<code>_document_.getElementById(_elt\_id_)</code>

> devuelve una referencia al elemento DOM cuya id es _elt\_id_

<code>_document_.createElement(_tagName_)</code>

> devuelve un nuevo elemento del tipo _tagName_ ; por ejemplo, para crear un enlace de hipertexto :

>    link = document.createElement('A')

<code>_document_.appendChild(_elt_)</code>

> añade el elemento _elt_ al documento

Conjuntamente a la interfaz estándar, Brython propone una interfaz alternativa, más familiar a los desarrolladores Brython. Se encuentra descrita en las siguientes páginas

