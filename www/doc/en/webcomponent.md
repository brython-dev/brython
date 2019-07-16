The module **browser.webcomponent** is used to create custom HTML tags, using
the standard DOM [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
technology.

It exposes the class `WebComponent`, designed to be used as a metaclass to
define a class that will handle the definition and the behaviour of the
Web Component.

```python
from browser.webcomponent import WebComponent

class CustomElement(metaclass=WebComponent):

    tag_name = "popup-window"
```

A Web Component class must define an attribute `tag_name`, so that it can be
used in the HTML page as

```xml
<popup-window>Hello !</popup-window>
```

Note that the Web Component specification mandates that the tag name includes
a dash (the "`-`" character).

### Instanciation of a web component

What happens when a tag is found in the HTML document is defined by the method
`__init__` of the Web Component class.

For instance, to insert the text supplied as the attribute "`data-text`" of
the custom tag `<bold-italic>` in bold and italic:

```python
class BoldItalic(metaclass=WebComponent):

    tag_name = "bold-italic"

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Get the value of the "data-text" attribute and create a
        # bold-italic tag
        italic = html.I()
        italic.textContent = self.getAttribute('data-text')
        bold_italic = html.B(italic)

        # Insert the element in the shadow root
        shadow <= bold_italic
```

Note the use of another DOM technology, [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot),
to define a DOM subtree, different from the main DOM tree.

### Life cycle management

The Web Component defines a set of [callback functions](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)
that manage the life cycle of a custom component.

To implement them in Brython, just add the functions in the class definition:

```python

from browser.webcomponent import WebComponent

class BoldItalic(metaclass=WebComponent):

    tag_name = "bold-italic"

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Get the value of the "data-text" attribute and create a
        # bold-italic tag
        italic = html.I()
        italic.textContent = self.getAttribute('data-text')
        bold_italic = html.B(italic)

        # Insert the element in the shadow root
        shadow <= bold_italic

    def connectedCallback(self):
        print("connected callback", self)
```
