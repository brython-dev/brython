The module **browser.webcomponent** is used to create custom HTML tags, using
the standard DOM [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
technology.

A custom element can be used in the HTML page as

```xml
<popup-window>Hello !</popup-window>
```

The module exposes the following functions

`define(`_tag_name, component_class_`)`

> _tag_name_ is the name of the custom tag name. The Web Component
> specification mandates that the tag name includes a dash (the "`-`"
> character).
>
> _component_class_ is the class that defines the component behaviour. Its
> `__init__` method is called to create the component; the parameter `self`
> references the DOM element for the custom component.

`get(`_tag_name_`)`

> returns the class associated to _tag_name_, or `None`.

### Example

Suppose we want to define a custom tag `<bold-italic>` with an attribute
"`data-val`":

```
<bold-italic data-val="hello"></bold_italic>
```

What happens when the tag is found in the HTML document is defined by the method
`__init__` of the Web Component class `BoldItalic`.

```python
from browser import webcomponent

class BoldItalic:

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Insert the value of attribute "data-val" in bold italic
        # in the shadow root
        shadow <= html.B(html.I(self.attrs['data-val']))

# Tell the browser to manage <bold-italic> tags with the class BoldItalic
webcomponent.define("bold-italic", BoldItalic)
```

Note the use of another DOM technology, [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot),
to define a DOM subtree, different from the main DOM tree.

### Life cycle management

The Web Component defines a set of [callback functions](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)
that manage the life cycle of a custom component.

To implement them in Brython, just add the functions in the class definition:

```python

import browser.webcomponent

class BoldItalic:

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Insert the value of attribute "data-val" in bold italic
        # in the shadow root
        shadow <= html.B(html.I(self.attrs['data-val']))

    def connectedCallback(self):
        print("connected callback", self)

webcomponent.define("bold-italic", BoldItalic)
```
