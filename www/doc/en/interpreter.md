interpreter
-----------

This module provides classes to open a Python interactive interpreter in a
page. It is used by the [console](https://www.brython.info/tests/console.html)
and the [editor](https://www.brython.info/tests/editor.html) of the site
[brython.info](https://brython.info).

### Classes

`Interpreter(element=None, title="Interactive Interpreter", globals=None, locals=None, rows=30, cols=84, default_css=True)`

- if _element_ is `None`, the interpreter is opened in a new dialog box (cf.
  module [browser.widgets.dialog](widgets-dialog.html)).

  Otherwise, _element_ can be an existing TEXTAREA in the page page, or the
  attribute `id` of an existing TEXTAREA.
- if _element_ is `None`, _title_ is the title of the dialog box
- dictionaries _globals_ and _locals_ are the environment where the interpreter
  commands are executed (by default, empty dictionaries)
- _rows_ and _cols_ are the TEXTAREA dimensions
- _default_css_ specifies if the CSS stylesheet provided by the module should
  be used. If the value is `False`, the styles defined in the HTML page are
  used (cf. "CSS style" below)

<blockquote>
```exec
from interpreter import Interpreter

Interpreter()
```
</blockquote>


`Inspector(title="Frames inspector", rows=30, cols=84, default_css=True)`
> Opens a dialog box with an interactive interpreter running in the
> program execution frames. This can be used for debugging purposes.
>
> Note that opening an inspector does not block program execution, but the
> namespaces used in the inspector represent the state of the frames when
> it was opened.

> For instance, in this example, the value of `y` in frame `f` is 8, not 9:
<blockquote>
```exec
from interpreter import Inspector

def f(x):
  y = 8
  Inspector()
  y = 9

f(5)
```
</blockquote>


### CSS style

If an interpreter is opened in an existing TEXTAREA, the HTML stylesheet is
used.

Otherwise, if argument _default_css_ is `True` (default), the following
stylesheet in inserted in the page:

<blockquote>
```css
.brython-interpreter {
    background-color: #000;
    color: #fff;
    font-family: consolas, courier;
}
```
</blockquote>

Pour personnaliser l'apparence des boites, il faut passer comme argument

To customize the interpreter look, pass `default_css=False` and redefine the
CSS class `brython-interpreter`. The most straightforward is to copy-paste
the stylesheet above and edit it.
