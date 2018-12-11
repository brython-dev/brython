"""Brython templating engine.

Templates in HTML pages can include:

- Python code blocks:

    <tr b-code="for item in items">
        ...
    </tr>

- Python expressions:

    {message}

- tag attributes:

    <option value="{name}", selected="{name===expected}">

- inclusion of subtemplates:

    <div b-include="menu.html"></div>

Usage in Brython scripts:

    from browser.template import Template

    Template(element).render(message="ok")

replaces an element with template code by its rendering using the
key/values in kw.

Elements rendered by the template engine have an attribute "data" set to a
object with attributes set to the keyword arguments of render().

Callback functions
------------------

    <button b-on="click:increment">Increment</button>

The tag attribute "b-on" is converted so that a click on the button is
handled by the function "increment". This function takes two arguments:

    def increment(event, element):
       element.data.counter += 1

where "event" is the event object.

To make the function available in the element, pass the list of callback
functions as the second argument of Template():

    Template(element, [increment]).render(counter=0)

After a handler function is run, if element.data has changed, the element is
rendered again, with the new value of element.data.
"""
from browser import document, html

# HTML elements that don't need a closing tag
# Cf. http://w3c.github.io/html/syntax.html#void-elements
void_elements = ["AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT",
    "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"]

def copy(obj):
    if isinstance(obj, dict):
        res = {}
        for key, value in obj.items():
            res[key] = copy(value)
        return res
    elif isinstance(obj, (list, tuple)):
        return obj[:]
    elif isinstance(obj, set):
        return {x for x in obj}
    else:
        return obj


class ElementData:
    """Class used to manipulate template element data as an object with
    attributes, rather than as a dictionary."""

    def __init__(self, **kw):
        """Initialise the instance with the keyword arguments passed to
        Template.render().
        Attribute self.__keys__ is the set of keys of the keyword arguments.
        """
        self.__keys__ = set()
        for key, value in kw.items():
            object.__setattr__(self, key, value)
            self.__keys__.add(key)

    def __setattr__(self, attr, value):
        """The attribute "data" of the Template element is set to the
        instance. If a callback function sets an attribute, this method
        updates the set self.__keys__.
        """
        object.__setattr__(self, attr, value)
        if attr != "__keys__":
            self.__keys__.add(attr)

    def to_dict(self):
        """Make a dictionary with the keys in self.__keys__."""
        return {k:getattr(self, k) for k in self.__keys__}

    def clone(self):
        """Used to store the current key / values before running a callback
        function ; the element is rendered again only if the element data
        has changed.
        """
        return copy(self.to_dict())


class TemplateError(Exception):
    pass


class Template:

    def __init__(self, element, callbacks=[]):
        if isinstance(element, str):
            element = document[element]
        self.element = element
        self.line_mapping = {}
        self.line_num = 1
        self.indent = 0
        self.python = ""
        self.parse(element)
        self.callbacks = callbacks

    def add(self, content, elt):
        self.python += content
        self.line_mapping[self.line_num] = elt
        if content.endswith("\n"):
            self.line_num += 1

    def add_indent(self, content, elt):
        self.add("    " * self.indent + content, elt)

    def write(self, content):
        self.html += str(content) + "\n"

    def parse(self, elt):
        """Parse the element recursively to generate the Python code that
        will itself generate the HTML code to render the template.
        """
        # Flag to indicate if the element has an attribute b-code that
        # starts a Python block (for loop, if / elif / else...).
        is_block = False

        if elt.nodeType == 3:
            # Text node.
            if elt.text.strip():
                text = elt.text.replace('"', "&quot;")
                text = text.replace("\n", "\\n")
                text = '"' + text + '"'
                # If the text has single braces, render it as an f-string.
                nb_braces = elt.text.count("{")
                if nb_braces:
                    nb_double_braces = elt.text.count("{{")
                    if nb_double_braces != nb_braces:
                        lines = [line for line in elt.text.split("\n")
                            if line.strip()]
                        text = " ".join(lines).replace('"', "&quot;")
                        text = 'f"""' + text + '"""'
                self.add_indent ("__write__(" + text + ")\n", elt)

        elif hasattr(elt, "tagName"):
            start_tag = "__write__('<" + elt.tagName
            block = None
            # If an attribute value has a "{", it is considered dynamic and
            # will be rendered as an f-string. Otherwise is is static.
            static_attrs = []
            dynamic_attrs = []
            for item in elt.attributes:
                if item.name == "b-code":
                    # Code block. The trailing ":" is optional.
                    block = item.value.rstrip(":") + ":"
                elif item.name == "b-include":
                    # Replace by content of the file at address item.value
                    elt.html = open(item.value).read()
                else:
                    value = item.value.replace("\n", "")
                    if "{" in value:
                        dynamic_attrs.append("'" + item.name + "', f'" +
                            value.replace("'", "\\'") + "'")
                    else:
                        static_attrs.append(item.name + '="' + value +'"')

            if block:
                self.add_indent(block + "\n", elt)
                self.indent += 1
                is_block = True

            self.add_indent(start_tag, elt)

            if static_attrs or dynamic_attrs:
                self.add(" ", elt)

            for attr in static_attrs:
                self.add_indent(attr + " ", elt)

            if dynamic_attrs:
                self.add("')\n", elt)
                for attr in dynamic_attrs:
                    self.add_indent("__render_attr__(" + attr + ")\n", elt)
                self.add_indent("__write__('>')\n", elt)
            else:
                self.add_indent(">')\n", elt)

        for child in elt.childNodes:
            self.parse(child)

        if hasattr(elt, "tagName") and elt.tagName not in void_elements:
            self.add_indent("__write__('</" + elt.tagName + ">')\n", elt)

        if is_block:
            self.indent -= 1

    def on(self, element, event, callback):
        def func(evt):
            cache = self.data.clone()
            callback(evt, self)
            new_data = self.data.to_dict()
            if new_data != cache:
                self.render(**new_data)
        element.bind(event, func)

    def render_attr(self, name, value):
        """Function called when executing the Python code to generate the HTML
        code for a dynamic attribute.
        If the value is a boolean (eg for the "selected" attribute of an
        OPTION tag), generate the attribute name if the value is True and
        nothing otherwise.
        If the value is of another type, add its string representation.
        """
        if value == "False":
            return
        elif value == "True":
            self.html += " " + name
        else:
            self.html += " " + name + '="' + str(value) + '"'

    def render(self, **ns):
        """Returns the HTML code for the template, with the key / values in
        the keyword argument ns.
        """
        # Set attribute "data" to an instance of class ElementData.
        self.data = ElementData(**ns)

        # Add names "__write__" and "__render_attr__" to namespace.
        ns.update({"__write__": self.write,
            "__render_attr__": self.render_attr})

        self.html = ""

        # Executing the Python code will store HTML code in self.html.
        try:
            exec(self.python, ns)
        except Exception as exc:
            import traceback
            msg = traceback.format_exc()
            if self.element.nodeType != 9:
                print("Error rendering template:\n" + self.element.outerHTML)
            else:
                print("Error rendering template:\n" + self.element.html)
            print("Namespace passed to render():\n", self.data.to_dict())
            if isinstance(exc, SyntaxError):
                line_no = exc.args[2]
            else:
                line_no = exc.traceback.tb_lineno
            elt = self.line_mapping[line_no]
            print("The error is raised when rendering the element:")
            try:
                print(elt.outerHTML)
            except AttributeError:
                print('no outerHTML for', elt)
                print(elt.html)
            print("Python traceback:")
            print(msg)
            return

        # Replace element content by generated html.
        # Since we reset outerHTML (this is necessary because the element may
        # have dynamic attributes), we must reset the reference to the element
        # because self.element would still point to the previous version (cf.
        # https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML,
        # section Notes).
        if self.element.nodeType != 9:
            rank = self.element.index()
            parent = self.element.parent
            self.element.outerHTML = self.html
            self.element = parent.childNodes[rank]

        else:
            # If the template is the document, only reset (inner)html
            self.element.html = self.html

        # Bindings.
        self.element.unbind()
        callbacks = {}
        for callback in self.callbacks:
            callbacks[callback.__name__] = callback

        # Bindings are specified with the attribute b-on. Its value has the
        # form "event1:callback1;event2:callback2".
        for element in self.element.select("*[b-on]"):
            bindings = element.getAttribute("b-on")
            bindings = bindings.split(";")
            for binding in bindings:
                parts = binding.split(":")
                if not len(parts) == 2:
                    raise TemplateError(f"wrong binding: {binding}")
                event, func_name = [x.strip() for x in parts]
                if not func_name in callbacks:
                    print(element.outerHTML)
                    raise TemplateError(f"unknown callback: {func_name}")
                self.on(element, event, callbacks[func_name])
