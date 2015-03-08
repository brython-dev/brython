Problema
--------

Obter o conteúdo de um elemento de uma página web.

Solução
-------

<table width="100%">
<tr>
<td style="width:50%;">

    from browser import alert,doc
    # doc['zone'] é a célula colorida
    alert(doc['zone'].text)

<button id="show_text">Mostrar texto</button>

    alert(doc['zone'].html)

<br><button id="show_html">Mostrar html</button>

    # doc['entry'] é o campo de entrada
    alert(doc['entry'].value)

<br><button id="show_value">Mostrar entrada</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
<B>Conteúdo da célula</B><p>
<INPUT id="entry" value="campo de entrada">
</td>
</tr>
</table>

<script type="text/python3">
from browser import doc
def show_text(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)
def show_html(ev):
    src = doc.get(selector="pre.marked")[1].text
    exec(src)
def show_value(ev):
    src = doc.get(selector="pre.marked")[2].text
    exec(src)

doc['show_text'].bind('click', show_text)
doc['show_html'].bind('click', show_html)
doc['show_value'].bind('click', show_value)
</script>    

Cada elemento na página tem um atributo `text`, uma cadeia de
caracteres com o texto mostrado no elemento.

Têm também um atributo `html`, uma cadeia de caracteres com o código
HTML dentro do elemento.

Campos de entrada (input) têm um atributo `value`, uma cadeia de
caracteres com o valor atual do campo.

`alert()` é uma função definida no módulo **browser** que mostra seu
argumento em uma janela popup.
