This tutorial explains how to develop an application that runs in the browser using the Python programming language. We will take the example of writing a calculator.

You will need a text editor, and of course a browser with Internet access.

The contents of this tutorial assume that you have at least a basic knowledge of HTML (general page structure, most usual tags), of stylesheets (CSS) and of the Python language.

In the text editor, create an HTML page with the following content:

```xml
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython.min.js">
    </script>
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython_stdlib.js">
    </script>
</head>

<body onload="brython()">

<script type="text/python">
from browser import document

document <= "Hello !"
</script>


</body>

</html>
```

In an empty directory, save this page as __`index.html`__. To read it in the browser, you have two options:

- use the File/Open menu: it is the most simple solution. It brings [some limitations](/static_doc/en/file_or_http.html) for an advanced use, but it works perfectly for this tutorial
- launch a web server : for instance, if the Python interpreter available from python.org is available on your machine, run `python -m http.server` in the file directory, then enter _localhost:8000/index.html_ in the browser address bar

When you open the page, you should see the message "Hello !" printed on the browser window.

Page structure
==============
Let's take a look at the page contents. In the `<head>` zone we load the script __`brython.js`__ : it is the Brython engine, the program that will find and execute the Python scripts included in the page. In this example we get it from a CDN, so that there is nothing to install on the PC. Note the version number (`brython@{implementation}`) : it can be updated for each new Brython version.

The `<body>` tag has an attribute `onload="brython()"`. It means that when the page has finished loading, the browser has to call the function `brython()`, which is defined in the Brython engine loaded in the page. The function searches all the `<script>` tags that have the attribute `type="text/python"` and executes them.

Our __`index.html`__ page embeds this script:

```python
from browser import document

document <= "Hello !"
```

This is a standard Python program, starting by the import of a module, __`browser`__ (in this case, a module shipped with the Brython engine __`brython.js`__). The module has an attribute `document` which references the content displayed in the browser window.

To add a text to the document - concretely, to display a text in the browser - the syntax used by Brython is

```python
document <= "Hello !"
```

You can think of the `<=` sign as a left arrow : the document "receives" a new element, here the string "Hello !". You will see later that it is always possible to use the standardized DOM syntax to interact with the page, but Brython provides a few shortcuts to make the code less verbose.

For this specific case, those who are not at ease with the use of the operator `<=` can use the method `attach()` of DOM elements instead:

```python
document.attach("Hello !")
```

Text formatting with HTML tags
==============================
HTML tags allow text formatting, for instance to write it in bold letters (`<B>` tag), in italic (`<I>`), etc.

With Brython, these tags are available as functions defined in module __`html`__ of the __`browser`__ package. Here is how to use it:

```python
from browser import document, html

document <= html.B("Hello !")
```

Tags can be nested:

```python
document <= html.B(html.I("Hello !"))
```

Tags can also be added to each other, as well as strings:

```python
document <= html.B("Hello, ") + "world !"
```

The first argument of a tag function can be a string, a number, another tag. It can also be a Python "iterable" (list, comprehension, generator): in this case, all the elements produced in the iteration are added to the tag:

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Tag attributes are passed as keyword arguments to the function:

```python
html.A("Brython", href="http://brython.info")
```

Drawing the calculator
======================
We can draw our calculator as an HTML table.

The first line is made of the result zone, followed by a reset button. The next 3 lines are the calculator touches, digits and operations.

```python
from browser import document, html

calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C", id="clear"))
lines = ["789/",
         "456*",
         "123-",
         "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc
```

Note the use of Python generators to reduce the program size, while keeping it readable.

Let's add style to the `<TD>` tags in a stylesheet so that the calculator looks better:

```xml
<style>
*{
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.1em;
}
td{
    background-color: #ccc;
    padding: 10px 30px 10px 30px;
    border-radius: 0.2em;
    text-align: center;
    cursor: default;
}
#result{
    border-color: #000;
    border-width: 1px;
    border-style: solid;
    padding: 10px 30px 10px 30px;
    text-align: right;
}
</style>
```

Event handling
==============
The next step is to trigger an action when the user presses the calculator touches:

- for digits and operations : print the digit or operation in the result zone
- for the = sign : execute the operation and print the result, or an error message if the input is invalid
- for the C letter : reset the result zone

To handle the elements printed in the page, the program need first to get a reference to them. The buttons have been created as `<TD>` tags; to get a reference to all these tags, the syntax is

```python
document.select("td")
```

The argument passed to the `select()` method is a _CSS selector_. The most usual ones are: a tag name ("td"), the element's `id` attribute ("#result") or its attribute "class" (".classname"). The result of `select()` is always a list of elements.

The events that can occur on the elements of a page have a normalized name: when the user clicks on a button, the event called "click" is triggered. In the program, this event will provoque the execution of a function. The association betweeen element, event and function is defined by the syntax

```python
element.bind("click", action)
```

For the calculator, we can associate the same function to the "click" event on all buttons by:

```python
for button in document.select("td"):
    button.bind("click", action)
```

To be compliant to Python syntax, the function `action()` must have been defined somewhere before in the program. Such "callback" functions take a single parameter, an object that represents the event.

Complete program
================
Here is the code that manages a minimal version of the calculator. The most important part is in the function `action(event)`.

```python
from browser import document, html

# Construction de la calculatrice
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

result = document["result"] # direct acces to an element by its id

def action(event):
    """Handles the "click" event on a button of the calculator."""
    # The element the user clicked on is the attribute "target" of the
    # event object
    element = event.target
    # The text printed on the button is the element's "text" attribute
    value = element.text
    if value not in "=C":
        # update the result zone
        if result.text in ["0", "error"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # reset
        result.text = "0"
    elif value == "=":
        # execute the formula in result zone
        try:
            result.text = eval(result.text)
        except:
            result.text = "error"

# Associate function action() to the event "click" on all buttons
for button in document.select("td"):
    button.bind("click", action)
```

Result
======
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>
