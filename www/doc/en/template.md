module **browser.template**
---------------------------

The module **template** allows to dynamically generate some elements in a
page, by including Python code blocks or expressions inside the HTML code.

## Variables

In its most simple form, a template includes a variable name surrounded by
braces:

```xml
<span id="team">{name}</span>
```

To replace the content of this `span` tag, we add the following script in the
page

```python
from browser import document
from browser.template import Template

Template(document["team"]).render(name="Liverpool FC")
```

The argument of `Template` can be either an element or a string; in the
second case, it is the attribute `id` of the element. The above code can
be written in a more concise way:

```python
Template("team").render(name="Liverpool FC")
```

The rendering engine uses Python f-strings ; if the text includes braces, they
have to be written twice:

```xml
<span id="team">{name} - {{these are literal braces}}</span>
```

The attributes of an HTML tag can also be variables:

```xml
<a id="link" href="{url}">{name}</a>
```
```python
from browser import document
from browser.template import Template

Template(document["link"]).render(url="brython.info", name="Brython site")
```

Instead of a variable, any valid Python expression can be used:

```xml
<span id="tag-uppercase">{tag.upper()}</span>
```

For the attributes that must be rendered without an associated value (for
instance the attribute `selected` of an `OPTION` tag), the variable or the
result of the expression must be a boolean:
```xml
<option selected="{name==expected}">
```

## Including other templates

If a site has several pages and we want to share some elements such as a
menu, a part of the page can be put in a secondary template; it is included
in the main page by the special attribute `b-include`.

For instance we can define the template __menu.html__:

```xml
<img src="logo.png"><h2>{title}</h2>
```

and include it in the main page:

```xml
<div id="menu" b-include="menu.html"></div>
```

The included template will be rendered with the arguments passed in the main
page:

```python
Template("menu").render(title="Home page")
```

## Code blocks

The special attribute `b-code` defines a code block : a `for` loop or a
condition (`if`, `elif`, `else`).

```xml
<ul id="team-list">
    <li b-code="for team in teams:">{team}
</ul>
```
```python
teams = ["FC Barcelona", "Real Madrid CF", "Liverpool FC"]
Template("team-list").render(teams=teams)
```

Code blocks can be nested. For instance, the following code generates a line
in a table, in which only the cells of even rank hold a content:

```xml
<tr>
  <td b-code="for i in range(16):">
    <span b-code="if i % 2 == 0:">
      {1 + (i / 2)}
    </span>
  </td>
</tr>
```

## Event handlers

Functions can be defined to react to events happening on an element in a
template. To achieve this:

- the list of handler functions must be passed as the second argument when
creating the `Template` instance
- the special attribute `b-on` describes the events handled on the HTML
element

For instance, to manage the event "click" on a button:

```xml
<button id="hello" b-on="click:say_hello">Hello !</button>
```

Python code:

```python
def say_hello(event, element):
    alert("Hello world")

Template("hello", [say_hello]).render()
```

To specify several handlers, separate them with `;`:

```xml
<button id="hello" b-on="click:say_hello;mouseover:show">Hello !</button>
```

The handler function takes two arguments, `event` (the event object, instance
of [DOMEvent](events.html)) and `element`, the `Template` instance.

The reference to `element` makes it possible to access the data associated
with the element (those passed to the `render()` method) inside the handler
function. These data are represented by the attribute `element.data` ; the
attributes of this object are the keys of the keyword arguments passed to
`render()`.

So, the example above can be modified by passing the text as an argument of
`render()`:

```python
def say_hello(event, element):
    alert(element.data.text)

Template("hello", [say_hello]).render(text="Hello, world !")
```

When a handler function is executed, if the data associated with the element
have been modified by this function, _the element is rendered again_ with the
new data.

For example, to increment a counter by hitting a button:

```xml
<div id="incrementer">
  <button b-on="click:incr">+1</button>{counter}
</div>
```

Python code:

```python
def incr(event, element):
    element.data.counter += 1

Template("incrementer", [incr]).render(counter=0)
```