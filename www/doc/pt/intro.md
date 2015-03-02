Citação da [especificação do Modelo de Objetos de Documentos (DOM) do W3C](http://www.w3.org/DOM/):

> _O que é o Modelo de Objetos de Documentos?_

> _O Modelo de Objetos de Documentos é uma interface, independente de_
> _plataforma ou __linguagem__, que permitirá programas e scripts_
> _acessarem e atualizarem dinamicamente o conteúdo, a estrutura, e o_
> _estilo dos documentos._

O objetivo de Brython é substituir Javascript por Python como a
linguagem de scripting para navegadores web.

Um exemplo simples:

<table>
<tr>
<td>

    <html>
    <head>
    <script src="/brython.js"></script>
    </head>
    <body onload="brython()">
    <script type="text/python">
    from browser import document, alert
    
    def echo(ev):
        alert(document["zone"].value)
    
    document['mybutton'].bind('click',echo)
    </script>
    <input id="zone"><button id="mybutton">click !</button>
    </body>
    </html>

</td>
<td>

Tente! :  

<script type="text/python">
from browser import document, alert

def echo(ev):
    alert(document["zone"].value)

document['mybutton'].bind('click',echo)
</script>

<input id="zone"><button id="mybutton">click!</button>

</td>
</tr>
</table>

Para que o script em Python possa ser processado, é necessário incluir
_brython.js_ e executar a função `brython()` ao carregar a página
(usando o atributo _onload_ da etiqueta `<body>`). Enquanto sua
aplicação estiver em fase de desenvolvimento, é possível passar um
argumento à função `brython()` : 1 para que as mensagens de erro sejam
mostradas no console do navegador, 2 para que seja mostrado também o
código Javascript junto com o erro.

Se o programa em Python for grande, outra opção é escrevê-lo em um
arquivo separado e carregá-lo usando o atributo _src_ da etiqueta
_script_:

    <html>
    <head>
    <script src="/brython.js"></script>
    </head>
    <body onload="brython()">
    <script type="text/python" src="test.py"></script>
    <input id="zone"><button id="mybutton">click!</button>
    </body>
    </html>

Perceba que, neste caso, o script em Python será carregado por uma
chamada Ajax: ele deve estar localizado no mesmo domínio da página
HTML.

Nos dois exemplos acima, quando clicamos no botão, o evento onclick
chama e executa a função `echo()`, definida no script Python. Esta
função obtém o valor do elemento INPUT através de seu id (_zone_). É
utilizada a sintaxe `document["zone"]`. Em Brython, `document` é um objeto
definido no módulo **browser** que representa o documento atualmente
mostrado no navegador. Ele se comporta como um dicionário cujas chaves
são os ids dos elementos do DOM. Portanto, em nosso exemplo,
`document["zone"]` é um objeto que está mapeado ao elemento INPUT, e sua
propriedade _value_, convenientemente, contém o valor do elemento.

Em Brython, a saída pode ser obtida de varias formas, incluindo a
função `alert()` (também definida em **browser**) que mostra uma
janela popup com o texto que for passado como argumento.
