"""Brython templating engine.
Usage :

from browser.template import render
render(element, **kw)

replaces an element with template code by its rendering using the
key/values in kw.
"""
import traceback
import random
from browser import document, html

class Template:

    def __init__(self, element):
        self.element = element
        self.line_mapping = {}
        self.line_num = 1
        self.bindings = {}

    def add(self, content, elt):
        self.python += content
        self.line_mapping[self.line_num] = elt
        if content.endswith('\n'):
            self.line_num += 1

    def write(self, content):
        self.html += str(content)+"\n"

    def parse(self, elt):
        is_block = False
        if elt.nodeType == 3:
            if elt.text.strip():
                lines = [line for line in elt.text.split('\n')
                    if line.split()]
                text = ' '.join(lines).replace('"', '&quot;')
                self.add("    " * self.indent + '__write__("'
                    + text + '")\n', elt)

        elif hasattr(elt, 'tagName'):
            if elt.tagName == "PY":
                for item in elt.attributes:
                    if item.name == "code":
                        self.add(item.value + "\n", elt)
                        if item.value.rstrip().endswith(':'):
                            self.indent += 1
                            is_block = True
                    elif item.name == "expr":
                        self.add("    " * self.indent +
                            "__write__(" + item.value + ")\n", elt)
            elif elt != self.zone:
                self.add("    " * self.indent + "__write__('<"
                    + elt.tagName, elt)
                bindings = {}
                elt_id = None
                for item in elt.attributes:
                    if item.name == "attrs":
                        # special attribute "attrs" replaced by the key-values
                        # specified in the value
                        kw = eval("dict("+item.value+")", self.ns)
                        for k, v in kw.items():
                            self.add(' ' + k + '="' + v+ '"', elt)
                    elif item.name == "events":
                        bindings = eval("dict(" + item.value + ")", self.ns)
                    else:
                        if item.name == "id":
                            elt_id = item.value
                        self.add(' ' + item.name + '="' + item.value
                            + '"', elt)
                if bindings:
                    if elt_id is None:
                        # add a random id
                        elt_id = "id_" + "".join(random.choice("0123456789")
                            for _ in range(10))
                        self.add(' id="' + elt_id +'"', elt)

                    self.bindings[elt_id] = bindings

                self.add(">')\n", elt)

        for child in elt.childNodes:
            self.parse(child)

        if is_block:
            self.indent -= 1

        if hasattr(elt, 'tagName') and elt.tagName not in ['PY', 'BR'] \
                and elt != self.zone:
            self.add("    " * self.indent + "__write__('</"
                + elt.tagName + ">')\n", elt)

    def render(self, **ns):
        """Returns the HTML code for the template, with key / values in ns.
        """
        self.python = ''
        self.indent = 0
        self.html = ''

        # create empty DIV to store the content of template file
        self.zone = html.DIV(style=dict(display="none"))
        self.zone.html = self.element.html
        document <= self.zone

        # Generate the Python code to execute
        self.ns = ns
        self.parse(self.zone)

        # Add name "__write__" to namespace, alias for self.write, used in the
        # generated Python code
        self.ns.update({'__write__': self.write})

        # Executing the Python code will store HTML code in self.html
        try:
            exec(self.python, self.ns)
        except Exception as exc:
            print(self.python)
            if isinstance(exc, SyntaxError):
                line_no = exc.args[2]
            else:
                line_no = exc.traceback.tb_lineno
            elt = self.line_mapping[line_no]
            for item in elt.attributes:
                if item.name in ["code", "expr"]:
                    print(item.value)
                    print('{}:'.format(exc.__class__.__name__), exc)

        # Remove temporary DIV
        self.zone.remove()

        # replace element content by generated html
        self.element.html = self.html

        print('bindings', self.bindings)
        for key, bindings in self.bindings.items():
            print(document[key])
            for event, callback in bindings.items():
                document[key].bind(event, callback)


def render(element, **kw):
    Template(element).render(**kw)