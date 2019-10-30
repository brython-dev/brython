módulo **browser.template**
---------------------------

El módulo **template** permite generar de forma dinámica algunos elementos en una
página incluyendo bloques de código Python o expresiones dentro del codigo HTML.

## Variables

En su forma más simple una plantilla incluye una variable rodeada de claves, "{}":

```xml
<span id="team">{name}</span>
```

Para reemplazar el contenido de esa etiqueta `span` añadimos el siguiente script
en la página

```python
from browser import document
from browser.template import Template

Template(document["team"]).render(name="Liverpool FC")
```

El argumento de `Template` puede ser tanto un elemento o un *string*; en el
segundo caso, es el atributo `id` del elemento. El código anterior se puede 
escribir de una forma más concisa:

```python
Template("team").render(name="Liverpool FC")
```

El motor de renderizado usa f-strings de Python; si el texto incluye claves, "{}",
se debe incluir dos veces:

```xml
<span id="team">{name} - {{these are literal braces}}</span>
```

Los atributos de una etiqueta HTML también pueden ser variables:

```xml
<a id="link" href="{url}">{name}</a>
```
```python
from browser import document
from browser.template import Template

Template(document["link"]).render(url="brython.info", name="Brython site")
```

En lugar de una variable se puede usar cualquier expresión de Python válida:

```xml
<span id="tag-uppercase">{tag.upper()}</span>
```

Para los atributos que se deben renderizar sin un vlor asociado (por ejemplo,
el atributo `selected` de una etiqueta `OPTION`), la variable o el resultado
 de la expresión debe ser un booleano:
```xml
<option selected="{name==expected}">
```

## Incluyendo otras plantillas

Si el sitio web tiene varias páginas y queremos compartir algunos elementos
como un menú, una parte de la página se puede poner en una segunda plantilla; se incluye
en la página principal mediante el atributo especial `b-include`.

Por ejemplo, podemos definir la plantilla __menu.html__:

```xml
<img src="logo.png"><h2>{title}</h2>
```

e incluir esa plantilla en la página principal:

```xml
<div id="menu" b-include="menu.html"></div>
```

La plantilla incluida se renderizará con los argumentos que pasemos en la página
principal:

```python
Template("menu").render(title="Home page")
```

## Bloques de código

El atributo especial `b-code` define un bloque de código: un bucle `for` o un
condicional (`if`, `elif`, `else`).

```xml
<ul id="team-list">
    <li b-code="for team in teams:">{team}
</ul>
```
```python
teams = ["FC Barcelona", "Real Madrid CF", "Liverpool FC"]
Template("team-list").render(teams=teams)
```

Los bloques de código se pueden anidar. Por ejemplo, el siguiente código genera
una línea en una tabla en la cual solo las celdas pares tendrán contenido:

```xml
<tr>
  <td b-code="for i in range(16):">
    <span b-code="if i % 2 == 0:">
      {1 + (i / 2)}
    </span>
  </td>
</tr>
```

## Gestores de eventos

Se pueden definir funciones que reaccionen a eventos que ocurren en un elemento 
de una plantilla. Para conseguir lo anterior:

- la lista de funciones se debe pasar como segundo argumento cuando se crea
la instancia `Template`
- el atributo especial `b-on` describe los eventos manejados en el elemento HTML

Por ejemplo, para gestionar el evento "click" de un botón:

```xml
<button id="hello" b-on="click:say_hello">Hello !</button>
```

Código Python:

```python
def say_hello(event, element):
    alert("Hello world")

Template("hello", [say_hello]).render()
```

Para especificar varias funciones las debemos separar usando punto y coma `;`:

```xml
<button id="hello" b-on="click:say_hello;mouseover:show">Hello !</button>
```

La función puede recibir dos argumentos, `event` (el objeto event, instancia
de [DOMEvent](events.html)) y `element`, la instancia `Template`.

La referencia a `element` hace posible el acceso a datos asociados con el elemento 
(aquellos que reciba el método `render()`) dentro de la función. Estos datos se
representan mediante el atributo `element.data` ; los atributos de este objeto son
las claves de los argumentos de palabra clave pasados a `render()`.

Por tanto, el ejemplo anterior se puede modificar pasando el texto como argumento de
`render()`:

```python
def say_hello(event, element):
    alert(element.data.text)

Template("hello", [say_hello]).render(text="Hello, world !")
```

Cuando se ejecuta una función, si los datos asociados con un elemento han sido
modificados por esta función, _el elemento se renderizará de nuevo_ con los nuevos 
datos.

Por ejemplo, para incrementar un contador cuando se pulsa un botón:

```xml
<div id="incrementer">
  <button b-on="click:incr">+1</button>{counter}
</div>
```

Código Python:

```python
def incr(event, element):
    element.data.counter += 1

Template("incrementer", [incr]).render(counter=0)
```