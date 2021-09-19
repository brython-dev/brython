Ar gentel-mañ a ziskouez penaos skrivañ ur programm hag a ya en-dro e-barzh ar merdeer gant ar yezh-programmiñ Python. Evit-se emaomp o vont da skrivañ kod ur jedonerezh.

Ezhomm ho peus eus ur skridtreterezh, hag eveljust ur merdeer kevreet gant ar genrouedad.

Evit heuliañ ar gentel-mañ ez eo ret gouzout un nebeut traoù diwar-benn HTML (penaos e vez stummet ur bajenn, ar balizennoù a implijer ar muiañ), folennoù-stil (CSS) hag ar yezh Python.

E-barzh ar skridtreterezh, krouit ur bajenn HTML, enni ar c'hod a-dreñv:

```xml
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython.min.js">
    </script>
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython_stdlib.js">
    </script>
</head>

<body onload="brython()">

<script type="text/python">
from browser import document

document <= "Hopala !"
</script>


</body>

</html>
```

E-barzh ur kavlec'h goullo, enrollit ar bajenn dindan an anv __`index.html`__. Evit he lenn e-barzh ar merdeer ez eus daou doare:

- implij ar Fichennaoueg/Digeriñ lañser: an doare aesañ an hini eo. [Traoù zo](/static_doc/fr/file_or_http.html) ne c'heller ket ober gant an doare-se, met evit ar gentel ez ayo mat pep tra
- loc'han ur servijer Web: ma 'z eo staliet Python (an hini a gaver war python.org) war ho urzhiater e c'hellit seveniñ `python -m http.server` e kavlec'h ar bajenn, ha skrivañ _localhost:8000/index.html_ e-barzh takad chomlec'h ar merdeer

Pa vo digoret ar bajenn, emichañs e vo gwelet "Hopala !" moullet war prenestr ar merdeer.

Framm ur bajenn
===============
Taolomp ur sell ouzh ar pezh a zo er bajenn. E-barzh al lodenn `<head>` e kargomp ar skript __`brython.js`__ : ar c'heflusker Brython eo, ar programm a ra war-dro an holl skriptoù Python er bajenn. Karget eo amañ diwar ur CDN, kuit da staliañ tra ebet war ar PC. Taolit evezh ouzh an niverenn doare (`brython@{implementation}`) : gallout a raer he hizivaat pep gwech ez a un doare Brython nevez er-maez.

Ar valizenn `<body>` he deus un doareenn `onload="brython()"`. Gourc'hemenn a ra ar merdeer kas an arc'hwel `brython()` en-dro pa vo echuet kargañ an holl bajenn. An arc'hwel a zo termenet e-barzh ar c'heflusker Brython. Klask a ra an holl balizennoù `<script>` gant an doareenn `type="text/python"` ha seveniñ a ra anezho.

E-barzh hor pajenn __`index.html`__ e kaver ar skript-mañ:

```python
from browser import document

document <= "Hopala !"
```

Ur programm Python ordinal eo. Da gentañ ez eo enporzhiet ur vodulenn, __`browser`__ (amañ, ur vodulenn enframmet e-barzh __`brython.js`__). Ar vodulenn he deus un doareenn `document`, gantañ e c'heller gouzout pe chañch ar pezh a zo diskouezet war prenestr ar merdeer.

Evit ouzhpennañ un destenn ouzh an teul - da lavaret eo, evit diskouez an destenn war ar merdeer - e skriver kement-mañ:

```python
document <= "Hopala !"
```

Gallout a rit soñjal ez eo arouezenn `<=` ur saezh war an tu kleiz : an teul a "zegemer" un elemant nevez, amañ ar chadenn "Hopala !". Gwelout a reot diwezatoc'h e c'heller implijout ereadurezh skoueriek an DOM evit traoù seurt-se, met kinnig a ra Brython doareoù eeunoc'h evit berraat hag eeunaat ar kod.

Furmad an destenn gant balizennoù HTML
======================================
Gant balizennoù HTML e c'heller resizat furmad un destenn, da skouer he skrivañ e lizerennoù tev (balizenn `<B>`), italek (`<I>`), h.a.

Gant Brython e kaver ar balizennoù dindan stumm arc'hweloù termenet e-barzh ar vodulenn __`html`__, ezel eus pakad __`browser`__. Setu penaos o implijout:

```python
from browser import document, html

document <= html.B("Hopala !")
```

Balizennoù a c'hell bezañ lakaet an eil e-barzh eben:

```python
document <= html.B(html.I("Hopala !"))
```

Ouzhpennañ balizennoù ha chadennoù an eil ouzh eben a c'heller ober ivez:

```python
document <= html.B("Hopala, ") + "Chapalain !"
```

Kentañ arguzenn an arc'hwel a c'hell bezañ ur chadenn, un niverenn, ur valizenn all. Un "iterable" Python (listenn, "comprehension", "generator") a c'hell bezañ ivez: neuze, an holl elemantou e-barzh an iterable a vez ouzhpennet ouzh ar valizenn:

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Doareennoù ar valizenn a vez kaset d'an arc'hwel e stumm gerioù-alc'hwez:

```python
html.A("Brython", href="http://brython.info")
```

Tresañ ar jedonerezh
====================
Gallout a reomp tresañ hon jedonerezh e stumm un daolenn HTML.

Al linenn gentañ a vez graet eus an dachenn evit an disorc'h, war e lerc'h un nozelenn nullañ. An teir linenn war-lerc'h a zo stokelloù ar jedonerezh, sifroù hag oberiadurioù.

```python
from browser import document, html

calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C", id="clear"))
lines = ["789/",
         "456*",
         "123-",
         "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc
```

Lakait evezh ouzh implij "jeneratorioù" Python evit berraat ment ar programm, ha penaos e chom aes da lenn koulskoude.

Lakaomp ouzhpenn un nebeut stil war ar balizennoù `<TD>` e-barzh ur folenn-stil, ma vo bravoc'h ar jedonerezh:

```xml
<style>
*{
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.1em;
}
td{
    background-color: #ccc;
    padding: 10px 30px 10px 30px;
    border-radius: 0.2em;
    text-align: center;
    cursor: default;
}
#result{
    border-color: #000;
    border-width: 1px;
    border-style: solid;
    padding: 10px 30px 10px 30px;
    text-align: right;
}
</style>
```

Ober gant degouezhadennoù
=========================
Ret eo lavaret bremañ petra a c'hoarvez pa vount an implijer war stokelloù ar jedonerezh:

- evit sifroù hag oberiadurioù : moullañ anezho e-barzh an dachenn-disorc'h
- evit ar stokell = : seveniñ ar jedad ha moullañ an disorc'h, peotramant ur gemennad fazi ma'z eo direizh ar jedad
- evit ar stokell C : mannañ an dachenn-disorc'h

Evit ober gant degouezhadennoù war elemantoù ar bajenn ez eo ret d'ar programm kavout un dave anezho. Stokelloù a zo bet krouet e stumm balizennoù `<TD>`; evit kavout an holl balizennoù seurt-se e skriver

```python
document.select("td")
```

Ar arguzenn kaset d'ar metod `select()` a zo un _diuzer CSS_. A re a gaver ar muiañ a zo: anv ur valizenn ("td"), doareenn `id` un elemant ("#result") pe e doareenn `class` (".classname"). Disorc'h `select()` a vez dalc'hmat ul listenn elemantoù.

An degouezhadennoù a c'hell c'hoarvez war elemantoù ur bajenn o deus un anv reolataet: pa glik an implijer war un nozelenn, an degouezhadenn a zo "click" hec'h anv. E-barzh ar programm, an degouezhadenn a dle kas un arc'hwel en-dro. Al liamm etre elemant, degouezhadenn hag arc'hwel a vez graet e mod-se:

```python
element.bind("click", action)
```

Evit ar jedonerezh e c'hellomp liammañ an hevelep arc'hwel gant an degouezhadenn "click" war an holl nozelennoù:

```python
for button in document.select("td"):
    button.bind("click", action)
```

Ret eo termeniñ an arch'wel `action()` en un lec'h bennak a-raok er programm. Seurt "callback" arc'hwelioù o deus unan arguzenn hepken, un draezenn hag a zo skeudenn an degouezhadenn.

Ar programm a-bezh
==================
Setu amañ ar c'hod a c'hell kas en-dro un doare eeun eus ur jedonerezh. Al lodenn bouezusañ a zo e-barzh an alc'hwez `action(event)`.

```python
from browser import document, html

# Tresañ ar jedonerezh
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

result = document["result"] # adkavout un elemant dre e doareenn "id"

def action(event):
    """Ra war-dro an degouezhadenn "click" war nozelenn ar jedonerezh."""
    # An elemant an implijer a vountas warnañ a zo doareenn "target" an
    # draezenn "event".
    element = event.target
    # An destenn moullet war an nozelenn a zo doareenn "text" an elemant.
    value = element.text
    if value not in "=C":
        # hizivaat tachenn disorc'hoù
        if result.text in ["0", "error"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # nullañ
        result.text = "0"
    elif value == "=":
        # klask jediñ
        try:
            result.text = eval(result.text)
        except:
            result.text = "error"

# Liamm etre an arc'hwel action() hag an degouezhadenn "click" evit an holl
# nozelennoù.
for button in document.select("td"):
    button.bind("click", action)
```

Disorc'h
========
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>
