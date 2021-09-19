Questo tutorial spiega come sviluppare un'applicazione eseguibile in un browser scritta con il linguaggio di programmazione Python. Faremo un esempio sviluppando una calcolatrice.

Ti servirà un editor di testo e, ovviamente, un browser con accesso ad internet.

Gli aspetti coperti in questo tutorial prevedono che tu abbia almeno conoscenze di base di HTML (composizione di una pagina HTML, tags più comuni), dei fogli di stile (CSS) and the linguaggio Python.

Nell'editor di testo, crea una pagina HTML con il seguente contenuto:

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

document <= "Hello !"
</script>


</body>

</html>
```
In una cartella vuota, salva la pagina come __`index.html`__. Ci sono due possibilità per visualizzarlo ne browser:

- usa il comando File/Open del tuo browser: è la soluzione più semplice. Comporta [alcune limitazioni](/static_doc/en/file_or_http.html) nel caso di un utilizzo avanzato, ma funziona alla perfezione per questo tutorial.
- avvia un server web: per esempio, se il interprete Python che puoi scaricare dal sito python.org è installato, esegui il comando `python -m http.server` nella cartella in cui è presente il file index.html. Poi inserisci _localhost:8000/index.html_ nella barra degli indirizzi del browser.

Quando la pagina si aprirà, dovresti vedere il messaggio "Hello !" all'interno del browser.

Composizione della pagina
=========================

Ora diamo un'occhiata al contenuto della pagina. Nella sezione `<head>` viene caricato lo script __`brython.js`__: è questo l'engine di Brython, il programma che trova ed esegue gli script Python inclusi nella pagina. In questo esempio Brython viene scaricato online da un CDN, quindi non si deve installare nulla sul PC. Nota il numero di versione (`brython@{implementation}`): lo puoi aggiornare ad ogni nuova versione di Brython.

Il tag `<body>` contiene l'attributo `onload="brython()"`. Significa che quando la pagina ha finito di caricarsi, il browser deve chiamare la funzione `brython()`, che è definita nell'engine Brython descritto poco sopra. Questa funzione cerca tutti i tag `<script>` che hanno l'attributo `type="text/python"` e li esegue.

La nostra pagina __`index.html`__ contiene proprio uno di questi script:

```python
from browser import document

document <= "Hello !"
```

Questo è un programma standard scritto in Python, comincia importando un modulo: __`browser`__ (in questo caso un modulo incluso nell'engine Brython __`brython.js`__). Questo modulo ha un attributo `document` che si riferisce al contenuto mostrato nella finestra del browser.

Per aggiungere del testo al documento, o in pratica per mostrare testo nel browser, la sintassi usata da Brython è

```python
document <= "Hello !"
```

Puoi pensare al segno `<=` come a una freccia rivolta a sinistra: il documento "riceve" un nuovo elemento, la stringa "Hello !". Vedrai nella pagina di esempio, che è sempre possibile usare la sintassi standard DOM per interagire con la pagina, ma Brython fornisce alcune scorciatoie per rendere il codice più compatto.

Formattare del testo usando tags HTML
=====================================
I tag HTML permettono, ad esempio, di formattare il testo per scrivere in grassetto (tag `<B>`), in corsivo (tag `<I>`), ecc.

Con Brython questi tag sono disponibili come funzioni definite nel modulo __`html`__ del pacchetto __`browser`__. Ecco come usarli:

```python
from browser import document, html

document <= html.B("Hello !")
```

I tag si possono annidare:

```python
document <= html.B(html.I("Hello !"))
```

I tag si possono anche sommare tra di loro, come anche con le stringe:

```python
document <= html.B("Hello, ") + "world !"
```

Il primo parametro di una funzione-tag può essere una stringa, un numero, oppure un altro tag. Può anche essere un qualsiasi elemento Python purchè sia 'iterabile' (list comprehension, generator): in questo caso tutti gli elementi generati dell'elemento iterabile verranno aggiunti al tag:

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Gli attributi dei tag vengono passati come "keyword argument" alla funzione:

```python
html.A("Brython", href="http://brython.info")
```

Disegnamo la calcolatrice
=========================
Ora possiamo disegnare la calcolatrice come una tabella HTML.

La prima riga contiere il campo del risultato, seguito da un pulsante di reset. Le tre righe seguenti contengono i pulsanti dei numeri, degli operatori, virgola e uguale.

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

Nota l'uso dei generatori per ridurre la dimensione del programma, mantenendolo nel contempo leggibile.

Aggiungiamo un po' di stile al tag `<TD>` in un foglio di stile, così la nostra calcolatrice si presenta meglio:

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

Gestione degli eventi
=====================
Il prossimo passo è collegare un'azione alla pressione dei pulsanti della calcolatrice:

- per numeri e operatori: stampa la cifra o operatore nel campo del risultato
- per =: esegui l'operazione e stampa il risultato, o un messaggio di errore se l'input non è valido
- per la lettera C: resetta il campo del risultato

Per gestire gli elementi visibili nella pagina, il programma deve prima ottenerne un riferimento. I bottoni sono stati creati usando il tag `<TD>`; si può ottenere i riferimenti a questo tag con questa sintassi:

```python
document.select("td")
```

L'argomento passato al metodo `select()` è un _selettore CSS_. I più comuni sono: il nome di un tag ("td"), l'attributo `id` dell'elemento ("#result") o i suoi attributi di tipo "class" (".classname"). Il risultato di `select()` è sempre una lista di elementi.

Gli eventi che possono verificarsi su un elemento di una pagina hanno nomi normalizzati: quando l'utente clicca su un pulsante, l'evento "click" viene lanciato. Nel programma, questo evento causa l'esecuzione di una funzione. L'associazione tra elemento, evento e funzione si definisce con la seguente sintassi:

```python
elemento.bind("click", funzione)
```

Per la calcolatrice, possiamo associare la stessa funzione all'evento "click" su tutti i pulsanti:

```python
for button in document.select("td"):
    button.bind("click", action)
```

Per essere conformi con la sintassi Python la funzione `action()` deve essere definita nel programma prima dell'uso. Queste funzioni, denominate "callback", accettano un singolo parametro, un oggetto che rappresenta l'evento.

Il programma completo
=====================
Ecco il codice per gestire una calcolatrice minimale. La parte più importante è contenuta nella funzione `action(event)`.

```python
from browser import document, html

# Costruzione degli elementi della calcolatrice
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

# accesso diretto al campo dei risultati usandone l'id
result = document["result"]

def action(event):
    """Handles the "click" event on a button of the calculator."""
    # L'elemento cliccato dall'utente è l'attributo "target"
    # dell'oggetto "event" che la funzione riceve
    element = event.target
    # L'attributo "text" dell'elemento contiene
    # il testo visibile sul pulsante
    value = element.text
    if value not in "=C":
        # Aggiorna il campo dei risultati
        if result.text in ["0", "error"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # Fa un reset
        result.text = "0"
    elif value == "=":
        # Esegue la formula scritta nel campo dei risultati
        try:
            result.text = eval(result.text)
        except:
            result.text = "error"

# Associa la funzione action() all'evento "click" per tutti i pulsanti
for button in document.select("td"):
    button.bind("click", action)
```

Risultato
=========
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>
