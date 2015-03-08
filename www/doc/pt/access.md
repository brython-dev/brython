Acessando Elementos
-------------------

A obtenção de acesso a um elemento pode ser feita de diferentes
maneiras. A mais usual é usar seu identificador, isto é, seu atributo
_id_ : com um campo de entrada definido por:

>    <input id="data">

Nós podemos obter uma referência a este campo com:

>    from browser import doc
>    data = doc["data"]

`doc` é definido no módulo **browser** que se refere ao documento
HTML. Ele se comporta como um dicionário cujas chaves são os
identificadores dos elementos na página. Se nenhum elemento tiver a id
especificada, o programa levanta uma exceção `KeyError`.

Nós também podemos obter todos os elementos de um determinado tipo,
por exemplo todos os links de hypertexto (etiqueta HTML `A`) usando a
sintaxe:

>    from browser import html
>    links = doc[html.A]

Finalmente, todos os elementos na página têm um método `get()` que
pode ser usado para buscar elementos:

- `elt.get(name=N)` retorna uma lista de todos os elementos
  descendentes de `elt` cujo atributo `name` é igual a `N`
- `elt.get(selector=S)` retorna uma lista com todos os elementos
  descendentes de `elt` cujo seletor CSS corresponde a `S`

Alguns exemplos:

    doc.get(selector='.foo')       # elementos com a classe "foo"
    doc.get(selector='form')       # lista de etiquetas "<form>"
    doc.get(selector='H1.bar')     # etiquetas H1 com a classe "bar"
    doc.get(selector='#container') # o elemento com id "container", o mesmo que `doc["container"]`
    doc.get(selector='a[title]')   # Uma etiqueta com um atributo "title"
