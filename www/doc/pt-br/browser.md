O pacote **browser** agrupa os nomes e módulos específicos do Brython.

**browser**.`alert(`_message_`)`
> uma função que imprime a mensagem _message_ em um pop-up. Retorna `None`

**browser**.`bind(`_target, event_`)`
> uma função usada como decorador para vinculação de evento. Cf. seção [eventos](events.html).

**browser**.`confirm(`_message_`)`
> uma função que imprime a mensagem _message_ em uma janela, a dois botões (ok/cancel). Retorna `True` se ok, `False` se cancelar

**browser**.`console`
> um objeto com métodos para interagir com o console do navegador. Sua interface é específica do navegador. Ele apresenta ao menos o método `log(msg)`, que printa a mensagem _msg_ no console

**browser**.`document`
> um objeto que representa o documento HTML que está sendo atualmente mostrado na janela do navegador. A interface deste objeto é descrita na seção "Browser interface"

**browser**.`DOMEvent`
> a classe de eventos DOM

**browser**.`DOMNode`
> a classe de nós DOM

**browser**.`load(`_script\_url_`)`
> Carrega a biblioteca Javascript no endereço _script\_url_.

> Essa função usa uma chamada de bloqueio do Ajax (blocking Ajax call). Isso deve ser usado quando não pode
> carregar a biblioteca Javascript na página html usando
> `<script src="prog.js"></script>`.

> Os nomes inseridos pela biblioteca dentro do namespace Javascript global
> estão disponíveis no script Brython como atributos do objeto janela `window`.

> Por instância, o módulo **jqueryui** na bilioteca padrão do Brython
> provê uma interface com a biblioteca Javascript jQueryUI. Para usar no
> script Brython, você simplesmente escrve `import jqueryui` sem inserir as
> bibliotecas Javascript na página. É o módulo **jqueryui** que
> o carrega, usando a função `load()`

**browser**.`prompt(`_message[,default]_`)`
> uma função que printa a mensagem _message_ em uma janela, e um campo de entrada.
> Retorna o valor inserido; se nenhum valor foi inserido, retorna _default_ se
> estiverf definido, senão retorna uma string vazia

**browser**.`run_script(`_src[, nom]_`)`
> essa função executa um código fonte Python em _src_ com um nome
> _name_ opcional. Isso pode ser usado como uma alternativa ao `exec()`, com o benefício
> de que a cache do indexedDB é usada para importar módulos da biblioteca
> padrão.


**browser**.`window`
> um objeto que representa a janela do navegador

