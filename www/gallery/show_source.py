from browser import ajax, document, html, bind, window, highlight

btn = html.BUTTON("Show source code", Class="nice")

height = window.innerHeight
width = window.innerWidth

css = """
/* colors for highlighted Python code */

span.python-string{
    color: #27d;
}
span.python-comment{
    color: #019;
}
span.python-keyword{
    color: #950;
}
span.python-builtin{
    color: #183;
}

em {
  color:#339;
  font-family:courier
}

strong {
  color:#339;
  font-family:courier;
}

button.nice{
    margin-right: 15%;
    color: #fff;
    background: #7ae;
    border-width: 2px;
    border-style: solid;
    border-radius: 5px;
    border-color: #45b;
    text-align: center;
    font-size: 15px;
    padding: 6px;
}

"""

document.body <= html.STYLE(css)

state = "off"

div_style = {"position": "absolute",
             "left": int(width * 0.5),
             "paddingLeft": "1em",
             "padding-right": "1em",
             "backgroundColor": "#ccc",
             "borderStyle": "solid",
             "borderColor" : "#888",
             "borderWidth": "0px 0px 0px 3px",
             "color": "#113",
             "font-size": "12px"
            }

def show_source(text):
    shown = document.select(".show_source")
    if not shown:
        top = btn.offsetTop + btn.offsetHeight
    else:
        top = max(elt.offsetTop + elt.offsetHeight for elt in shown)

    top += int(0.5 * btn.offsetHeight)

    div = html.DIV(style=div_style, Class="show_source")
    indent = None
    lines = text.split("\n")
    for line in lines:
        if line.strip():
            _indent = len(line) - len(line.lstrip())
            if indent is None:
                indent = _indent
                break
    if indent:
        text = "\n".join(line[indent:] for line in lines)

    div <= highlight.highlight(text)
    document <= div
    div.top = top
    div.left = max(int(width / 2),
        width - div.offsetWidth - int(0.02 * width))

@bind(btn, "click")
def show(ev):
    global state
    if state == "on":
        for div in document.select(".show_source"):
            div.remove()
        state = "off"
        btn.text = "Show source code"
    else:
        scripts = document.select("script")
        for script in scripts:
            if not script.src:
                show_source(script.text)
            else:
                if script.src.endswith(".py") and \
                        not script.src.endswith("show_source.py"):
                    req = ajax.get(script.src, oncomplete=show_external)
        state = "on"
        btn.text = "Hide source code"

def show_external(req):
    """Used after an Ajax request for external script."""
    show_source(req.text)

href = window.location.href
href = href[href.rfind("/") + 1:]

document.body.insertBefore(html.DIV(btn, style={"text-align": "right"}),
    document.body.children[0])
