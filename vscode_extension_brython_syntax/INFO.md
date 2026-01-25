#  [![](https://i.postimg.cc/wBPhM5Lv/jackal-11-24-v2-32-inverted.png)]()  CODEBABEL

### *codebabel-brython-syntax : syntax highlight inside html 🐍*
___
## 📃 Description / Descrição
~~~
codebabel-brython-syntax > brython on html syntax highlight
inside html file by codeBabel for vscode. 
~~~
[![](https://i.postimg.cc/m2rsyX8k/shield-vscode-115x20.png)]()

[![](https://i.postimg.cc/Wp99RxZT/banner.png)]()

## 🌐 Content / Conteúdo
* [Installation](#installation)
* [Change log](#changelog)
* [Brython code](#brython)
* [Brython site](#site)
* [Brython syntax vscode](#vscode)
* [Screenshot](#screenshot)

### installation
## 💻 Installation / Instalação

~~~~
{BR}
🐍 Na guia de extenções, procure por "cbbl" ou "codebabel-brython-syntax",
instale, crie um documento *.html usando brython.
🐍 Instalação fácil
🐍 A extensão "codebabel-brython-syntax" desenvolvida para facilitar a
codificação usando brython, ao criar o index.html, na tag script ao
inserir código python a extensão fará o restante.

{FR}
🐍 Dans l'onglet Extensions, recherchez "cbbl" ou "codebabel-brython-syntax",
installez-la, puis créez un document *.html avec Brython.
🐍 Installation facile
🐍 L'extension "codebabel-brython-syntax" est conçue pour simplifier la
programmation avec Brython. Lors de la création du fichier index.html, insérez
le code Python dans la balise script ; l'extension se charge du reste.

{EN}
🐍 In the extensions tab, search for "cbbl" or "codebabel-brython-syntax",
install it, and create an *.html document using Brython.
🐍 Easy installation
🐍 The "codebabel-brython-syntax" extension is designed to make coding
easier using Brython. When creating the index.html file, insert Python
code into the script tag; the extension will handle the rest.
~~~~

### changelog
## 🚨 Change Log
|Version|       Version Name       | Upgrade Latency |
|-------|--------------------------|-----------------|
| 0.0.1 | codebabel-brython-syntax |    ON DEMAND    |

### brython
## 🐍 Brython code
~~~html
<!DOCTYPE html><html lang="en"><!-- brython ajax demo -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="style.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/brython@3.13.2/brython.min.js">
    </script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/brython@3.13.2/brython_stdlib.js">
    </script>
    <title>brython.ajax</title>
</head>
<body>
<script type="text/python">
    from browser import document, ajax

    url = "http://api.open-notify.org/iss-now.json"
    msg = "Position of the International Space Station at {}: {}"

    def complete(request):
        import datetime
        data = request.json
        position = data["iss_position"]
        ts = data["timestamp"]
        now = datetime.datetime.fromtimestamp(ts)
        document["zone10"].text = msg.format(now, position)

    def click(event):
        ajax.get(url, oncomplete=complete, mode="json")
        document["zone10"].text = "waiting..."

    document["button10"].bind("click", click)
</script>
</body></html>
~~~

### screenshot
## 📸 Screenshot
#### Example Code...

[![](https://i.postimg.cc/52vTV1L3/screenshot.png)]()

___
### site
## 🐍 brython site
🔗 [https://brython.info/index.html](https://brython.info/index.html)

### vscode
## 🐍 Brython extension ( on microsoft marketplace )
🔗 [https://marketplace.visualstudio.com/items?itemName=CodeBabel.codebabel-brython-syntax](https://marketplace.visualstudio.com/items?itemName=CodeBabel.codebabel-brython-syntax)

___
## 💜 Thank's 🧡
~~~
{PTBR}
Valeu por usar a extensão codebabel-brython-syntax.
tmj!

{EN}
Thanks for using the codebabel-brython-syntax extension.
see ya!

extension by codesofty@codebabel.
~~~
© Copyright 2026, codebabel from brython users.
