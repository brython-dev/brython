El módulo **browser.webcomponent** se usa para crear etiquetas HTML personalizadas, usando
el tecnología estándar DOM 
[WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Un elemento personalizado se puede usar en una página HTML de la siguiente forma

```xml
<popup-window>¡Hola!</popup-window>
```

El módulo expone una única función

`define(`_tag_name, component_class_`)`

> _tag_name_ es el nombre de la etiqueta personalizada. La especificación para
> Web Component obliga a que el nombre de la etiqueta incluya un guión (el
> caracter "`-`").
>
> _component_class_ es la clase que define el comportamiento del componente. Su
> método `__init__` es el usado para crear el componente; el parámetro `self`
> referencía al elemento DOM para el componente personalizado.


### Ejemplo

Supón que queremos definir una etiqueta personalizada `<bold-italic>` con un atributo
"`data-val`":

```
<bold-italic data-val="hello"></bold_italic>
```

Lo que sucede pasa cuando se encuentra una etiqueta en el documento HTML será definido
mediante el método `__init__` de la clase Web Component `BoldItalic`.

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

Nota para usar otra tecnología del DOM, [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot),
para definir un subárbol DOM, diferente al árbol principal del DOM.

### Gestión del ciclo de vida

El Web Component define un conjunto de [callback functions](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)
que gestionan el ciclo de vida de un componente personalizado.

Para implementarlo en Brython añade las funciones en la definición de la clase:

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
