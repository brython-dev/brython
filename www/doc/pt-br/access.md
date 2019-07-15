Acessando elementos
------------------

Um elemento pode ser acessado de diferentes maneiras. A mais comum é utilizar
seu identificador, isto é, seu atributo _id_: tendo sua entrada definida por

```xml
<input id="data">
```
nós podemos obter a referência deste campo através de

```python
from browser import document
data = document["data"]
```

`document` é definido no módulo **browser** e se refere ao documento HTML.
Ele se comporta como um dicionário cujas chaves são os identificadores dos
elementos na página. Se nenhum elemento tem seu id especificado, o programa
lança uma exceção do tipo `KeyError` exception.

Todos os elementos na página possuem o método `get()` o qual pode ser utilizado
para pesquisar elementos:

- `elt.get(name=N)` returns a list of all the elements descending from `elt`
  whose attribute `name` is equal to `N`
- `elt.get(selector=S)` returns a list with all the elements descending from
  `elt` whose CSS selector matches `S`

- `elt.get(name=N)` retorna uma lista de todos os elementos de `elt`
  nos quais o atributo `name` seja igual a `N`
- `elt.get(selector=S)` retorna uma lista de todos os elementos de
  `elt` nos quais o seletor CSS seja igual a `S`

`elt.select(S)` é um pseudônimo para `elt.get(selector=S)`. Exemplos:

```python
document.select('.foo')       # elementos com a classe "foo"
document.select('form')       # lista das tags "<form>"
document.select('H1.bar')     # elementos do tipo H1 com a classe "bar"
document.select('#container') # elemento que possua o id "container", sendo o equivalente a
                              # [document["container"]]
document.select('a[title]')   # elementos do tipo A que possuam o attributo "title"
```