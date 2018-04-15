Quote from the [W3C Document Object Model specification](http://www.w3.org/DOM/) :

> _What is the Document Object Model?_

> _The Document Object Model is a platform- and __language__-neutral interface_
> _that will allow programs and scripts to dynamically access and update the_
> _content, structure and style of documents._

Brython's goal is to replace Javascript with Python, as the scripting language for web browsers.

A simple example :

<table>
<tr>
<td>
```xml
<html>
<head>
<script src="/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python">
from browser import document, alert

# bind event 'click' on button to function echo

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>
<input id="zone">
<button id="mybutton">click !</button>
</body>
</html>
```

</td>
<td style="padding-left:20px">

Try it!

<script type="text/python">
from browser import document, alert

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>

<input id="zone">
<button id="mybutton">click!</button>

</td>
</tr>
</table>

In order for the Python script to be processed, it is necessary to include
__brython.js__ and to run the `brython()` function upon page load (using
the _onload_ attribute of the `<BODY>` tag). While in the development phase,
it is possible to pass an argument to the `brython()` function: 1 to have the
error messages displayed to the web browser console, 2 to also get the
Javascript code displayed along with the error.

If the Python program is large, another option is to write it in a separate
file, and to load it using the _src_ attribute of the _script_ tag :

```xml
<html>

<head>
<script src="/brython.js"></script>
</head>

<body onload="brython()">
<script type="text/python" src="test.py"></script>
<input id="zone" autocomplete="off">
<button id="mybutton">click!</button>
</body>

</html>
```

Please note that in this case the Python script will be loaded through an
Ajax call : it must be in the same domain as the HTML page.

In the above two examples of code, when we click on the button, the onclick
event calls and run the `echo()` function, which was defined in the Python
script. This function gets the value of the INPUT element, through its id
(_zone_). This is accomplished by the syntax `document["zone"]` : `document`,
defined in module **browser**, is an object that represents the document
currently displayed in the browser. It behaves like a dictionary whose keys
are the ids of the elements of the DOM. Hence, in our example,
`document["zone"]` is an object that maps to the INPUT element ; the _value_
property holds, interestingly enough, the value of the object.

In Brython, the output can be accomplished in various ways, including with the
function `alert()` (also defined in **browser**) which shows a popup window
with the text passed as an argument.
