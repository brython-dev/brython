"""Brython templating engine.

Templates in HTML pages can include:

- Python code blocks:

    <py code="for item in items:">
        ...
    </py>

    <py code="if some_value:">
        ...
    </py><py code="else:">
        ...
    </py>

- Python expressions:

    <py expr="message"/>

- tag attributes:

    <option attrs="value=name, selected=name===expected">

Usage in Brython scripts:

    from browser.template import Template

    def show(element):
        element.data += 1

    Template(element, callbacks=[show]).render(message=1)

replaces an element with template code by its rendering using the
key/values in kw.

Elements rendered by the template engine have an attribute "data" set to a
dictionary with the key-values in the keyword arguments of render().

Callback functions
------------------

    <button b-click="show">Show item</button>

The tag attribute "b-click" is converted so that a click on the button is
handled by the function "show". The function takes a single argument, the
element object.

After a handler function is run, the element is rendered again, with the
current value of element.data.

"""
import traceback
import random
from browser import document, html

class Template:

    def __init__(self, element, callbacks=[]):
        self.element = element
        self.line_mapping = {}
        self.line_num = 1
        self.indent = 0
        self.python = ""
        self.bindings = {}
        self.source = element.html
        self.parse(element)
        self.callbacks = callbacks

    def add(self, content, elt):
        self.python += content
        self.line_mapping[self.line_num] = elt
        if content.endswith('\n'):
            self.line_num += 1

    def add_indent(self, content, elt):
        self.add("    " * self.indent + content, elt)

    def write(self, content):
        self.html += str(content)+"\n"

    def parse(self, elt):
        is_block = False
        if elt.nodeType == 3:
            if elt.text.strip():
                lines = [line for line in elt.text.split('\n')
                    if line.split()]
                text = ' '.join(lines).replace('"', '&quot;')
                self.add_indent ('__write__("' + text + '")\n', elt)

        elif hasattr(elt, 'tagName'):
            if elt.tagName == "PY":
                for item in elt.attributes:
                    if item.name == "code":
                        self.add(item.value + "\n", elt)
                        if item.value.rstrip().endswith(':'):
                            self.indent += 1
                            is_block = True
                    elif item.name == "expr":
                        self.add_indent("__write__(" + item.value + ")\n",
                            elt)
            else:
                self.add_indent("__write__('<" + elt.tagName, elt)
                attrs = None
                elt_id = None
                bindings = {}
                for item in elt.attributes:
                    if item.name == "attrs":
                        attrs = item.value
                    elif item.name.startswith("b-"):
                        elts = item.name.split('-')
                        if elts[1]:
                            bindings[elts[1]] = item.value
                    else:
                        if item.name.lower() == "id":
                            elt_id = item.value
                        self.add(' ' + item.name + '="' + item.value
                            + '"', elt)
                if elt_id is None:
                    elt_id = 'id_' + ''.join(random.choice('0123456789')
                        for _ in range(8))
                    self.add(' id = "' + elt_id +'"', elt)

                if bindings:
                    self.bindings[elt_id] = bindings

                if attrs:
                    # special attribute "attrs" replaced by the key-values
                    # specified in the value
                    self.add("')\n", elt)
                    self.add_indent("for k, v in dict(" + item.value +
                        ").items():\n", elt)
                    self.add_indent(
                        """ __write__(' ' + k + '="' + v + '"')\n""",
                            elt)
                    self.add_indent("__write__('>')\n", elt)
                else:
                    self.add_indent(">')\n", elt)

        for child in elt.childNodes:
            self.parse(child)

        if is_block:
            self.indent -= 1

        if hasattr(elt, 'tagName') and elt.tagName not in ['PY', 'BR']:
            self.add_indent("__write__('</" + elt.tagName + ">')\n", elt)

    def on(self, element, event, callback):
        def func(evt):
            callback(self)
            self.render(**self.data)
        element.bind(event, func)

    def render(self, **ns):
        """Returns the HTML code for the template, with key / values in ns.
        """
        # Add name "__write__" to namespace, alias for self.write, used in the
        # generated Python code
        self.data = ns
        ns.update({'__write__': self.write})

        self.html = ""

        # Executing the Python code will store HTML code in self.html
        try:
            exec(self.python, ns)
        except Exception as exc:
            if isinstance(exc, SyntaxError):
                line_no = exc.args[2]
            else:
                line_no = exc.traceback.tb_lineno
            elt = self.line_mapping[line_no]
            for item in elt.attributes:
                if item.name in ["code", "expr"]:
                    print(self.source)
                    print('{}:'.format(exc.__class__.__name__), exc)

        # replace element content by generated html
        self.element.html = self.html

        # bindings
        self.element.unbind()
        callbacks = {}
        for callback in self.callbacks:
            callbacks[callback.__name__] = callback
        for elt_id, bindings in self.bindings.items():
            element = document[elt_id]
            for event, func_name in bindings.items():
                self.on(element, event, callbacks[func_name])


def render(element, **kw):
    Template(element).render(**kw)