O pacote **browser** agrupa os nomes e módulos integrados específicos
de Brython.

**browser**.`alert(`_message_`)`

> uma função que imprime a mensgem _message_ em uma janela
> pop-up. Retorna `None`.

**browser**.`confirm(`_message_`)`

> uma função que imprime a mensagem _message_ em uma janela com dois
> botões (ok/cancelar). Retorna `True` se ok, `False` se cancelada.

**browser**.`document`

> um objeto que representa o documento HTML atualmente mostrado na
> janela do navegador. A interface com este objeto é descrita na seção
> "Interface com o navegador".

**browser**.`DOMEvent`

> a classe de eventos DOM

**browser**.`DOMNode`

> a classe de nós DOM

**browser**.`prompt(`_message[,default]_`)`

> uma função que imprime a mensagem _message_ em uma janela e um campo
> de entrada de texto. Retorna o texto fornecido; se nenhum texto foi
> fornecido, retorna _default_ se definido, caso contrário retorna a
> cadeia vazia.

**browser**.`window`

> um objeto que representa a janela do navegador

