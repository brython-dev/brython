from browser import bind, console, html, window, document, alert
import browser.widgets.menu as menu

import sys
version = f'{sys.implementation.version.major}.{sys.implementation.version.minor}'

href = document.location.href
protocol, rest = href.split("://")
host, addr = rest.split("/", 1)

# automatic redirection from http to https for brython.info
if protocol == "http" and host.endswith("brython.info"):
    document.location.href = f"https://{rest}"

Menu = menu.Menu

trans_menu = {
    "menu_console": {"en": "Console", "es": "Consola", "fr": "Console"},
    "menu_editor": {"en": "Editor", "es": "Editor", "fr": "Editeur"},
    "menu_demo": {"en": "Demo", "es": "Demo", "fr": "Démo"},
    "menu_gallery": {"en": "Gallery", "es": "Galería", "fr": "Galerie"},
    "menu_doc": {"en": "Documentation", "es": "Documentación", "fr": "Documentation"},
    "menu_download": {"en": "Download", "es": "Descargas", "fr": "Téléchargement"},
    "menu_dev": {"en": "Development", "es": "Desarrollo", "fr": "Développement"},
    "menu_ex": {"en": "Examples", "es": "Ejemplos", "fr": "Exemples"},
    "menu_groups": {"en": "Community", "es": "Comunidad", "fr": "Communauté"},
    "menu_ref": {"en": "Reference", "es": "Referencia", "fr": "Référence"},
    "menu_resources": {"en": "Resources", "es": "Recursos", "fr": "Ressources"},
    "menu_tutorial": {"en": "Tutorial", "es": "Tutorial", "fr": "Tutoriel"}
}
links = {
    "home": "/index.html",
    "console": "/tests/console.html",
    "demo": "/demo.html",
    "editor": "/tests/editor.html",
    "gallery": "/gallery/gallery_{language}.html",
    "doc": "/static_doc/{version}/{language}/intro.html",
    "download": "https://github.com/brython-dev/brython/releases",
    "dev": "https://github.com/brython-dev/brython",
    "groups": "/groups.html",
    "tutorial": "/static_tutorial/{language}/index.html"
}

languages = [
    ["en", "English"],
    ["fr", "Français"]
]

doc_versions = ["3.13", "3.12", "3.11", "3.10"]

if 'static_doc' in window.location.href:

    current_version = window.location.href.split('/')[4]

    # insert SELECT with available documentation versions
    table = document.select_one(".main-table")
    td = table.select_one('tr').select_one('td')
    sel_version = html.SELECT(id="version")
    for doc_version in doc_versions:
        sel_version <= html.OPTION(doc_version, 
            selected=doc_version==current_version)
    td.insertBefore(html.H5("Version " + sel_version), td.firstChild)

    @bind(sel_version, 'change')
    def change(ev):
        global current_version
        new_version = ev.target.selectedOptions[0].value
        new_href = window.location.href.replace(current_version, new_version)
        current_version = new_version
        window.location.href = new_href


def show(language=None):
    """Detect language, either from the key "lang" in the query string or
    from the browser settings."""
    has_req = False
    qs_lang = None
    tuto_language = None

    prefix = "/"

    if language is None:
        qs_lang = document.query.getfirst("lang") # query string
        if qs_lang and qs_lang in ["en", "fr", "es"]:
            has_req = True
            language = qs_lang
        elif addr.startswith("gallery"):
            elts = addr.split("/")
            if len(elts) > 1:
                elt1 = elts[1].split(".")[0].split("_")
                if len(elt1) == 2:
                    language = elt1[1]
        else:
            lang = __BRYTHON__.language # browser setting
            lang = lang.split('-')[0]
            if lang in ["en", "fr", "es"]:
                language = lang
            if addr.startswith("static_tutorial"):
                elts = addr.split("/")
                if len(elts) > 1:
                    tuto_language = elts[1]
                    if tuto_language in ["en", "fr", "es"]:
                        language = tuto_language

    language = language or "en"

    _banner = document["banner_row"]

    loc = window.location.href
    current = None
    for key in ["home", "console", "demo", "editor", "groups"]:
        if links[key] in loc:
            current = key
            break

    if current is None:
        if "gallery" in loc:
            current = "gallery"
        elif "static_doc" in loc:
            current = "doc"

    def load_page(key):
        def f(e):
            href = links[key].format(language=language)
            window.location.href = href + f"?lang={language}"
        return f

    menu = Menu(_banner, default_css=False)

    menu.add_link(trans_menu["menu_tutorial"][language],
        href=links["tutorial"].format(language=language))

    menu.add_link(trans_menu["menu_demo"][language],
        href=links["demo"] + f"?lang={language}")

    menu.add_link(trans_menu["menu_doc"][language],
        href=links["doc"].format(language=language, version=version))

    menu.add_link(trans_menu["menu_console"][language],
        href=links["console"] + f"?lang={language}")

    menu.add_link(trans_menu["menu_editor"][language],
        href=links["editor"] + f"?lang={language}")

    menu.add_link(trans_menu["menu_gallery"][language],
        href=links["gallery"].format(language=language))

    ex_resources = menu.add_menu(trans_menu["menu_resources"][language])
    ex_resources.add_link(trans_menu["menu_download"][language],
        href=links["download"])
    ex_resources.add_link(trans_menu["menu_dev"][language],
        href=links["dev"])
    ex_resources.add_link(trans_menu["menu_groups"][language],
        href=links["groups"])

    # insert language selection menu
    sel_lang = html.DIV(Class="sel_lang")

    document.body.insertBefore(sel_lang, _banner.nextElementSibling)
    select = html.SELECT(Class="language")
    sel_lang <= select
    selected_lang = tuto_language or language
    for lang1, lang2 in languages:
        select <= html.OPTION(lang2, value=lang1,
            selected=lang1==selected_lang)

    @bind(select, "change")
    # If user changes the language in the select box, reload the page.
    def change_language(ev):
        sel = ev.target
        new_lang = sel.options[sel.selectedIndex].value
        head = f"{protocol}://{host}"
        new_href = href
        if addr.startswith("index.html") or addr == "":
            new_href = f"{head}/index.html?lang={new_lang}"
        elif addr.startswith(("static_tutorial", "static_doc")):
            elts = addr.split("/")
            for i, elt in enumerate(elts):
                if elt == 'en' or elt == 'fr':
                    elts[i] = new_lang
                    break
            new_href = f"{head}/{'/'.join(elts)}"
        elif addr.startswith("gallery"):
            new_href = links["gallery"].format(language=new_lang)
        elif addr.startswith(("demo.html",
                              "tests/console.html",
                              "tests/editor.html")):
            elts = addr.split("?")
            new_href = f"{head}/{elts[0]}?lang={new_lang}"
        document.location.href = new_href

    return qs_lang, language


