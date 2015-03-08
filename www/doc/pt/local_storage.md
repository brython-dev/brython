módulo **browser.local_storage** (armazenamento local)
------------------------------------------------------

Este módulo usa o armazenamento local definido em HTML5. A
especificação pode ser encontrada
[neste link](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute).

O que é **`HTML5 localStorage`**?:

- localStorage (armazenamento local) é um banco de dados de
  chave-valor no lado do cliente, ou seja, os dados são guardados no
  navegador do usuário. Isso significa que os dados do usuário são
  salvos em suas máquinas dentro do navegador. Isso também significa
  que os dados guardados só estão disponíveis naquela máquina e
  naquele navegador. Lembre-se que `local_storage` é um para cada
  navegador, e não por computador.
- Chaves e valores são cadeias de caractéres, então se você fornecer,
  por exemplo, uma lista, quando você tentar obter os valores de volta
  você vai obter uma cadeia e não a lista original. Lembre-se disso!!
- Chaves e valores são armazenados persistentemente com um protocolo,
  domínio e porta específicos. Bancos de dados `local_storage` têm
  escopo de uma origem HTML5, basicamente a tupla (scheme, host, port,
  ex. `scheme://host:port`). Isso significa que o banco de dados é
  compartilhado por todas as páginas do mesmo domínio, mesmo
  concorrentemente por múltiplas abas do navegador. No entanto, uma
  página conectando sobre `http://` não pode ver um banco de dados que
  foi criado durante uma sessão `https://`.

O armazenamento local HTML5 **localStorage** é implementado em Brython
no módulo **`browser.local_storage`**. O módulo define um objeto,
`storage`, que é usado como um dicionário típico de Python.

Temos um exemplo simples do uso abaixo:

>    from browser.local_storage import storage
>    storage['foo']='bar'
>    print(storage['foo'])

Agora, se você fechar sua aba, seu navegador, ou mesmo desligar seu
computador, quando você abrir novamente o mesmo navegador você terá
acesso ao valor armazenado pela chave `'foo'` na mesma combinação
`scheme://host:port` em que o par chave-valor foi armazenado.

Se quiser remover permanentemente um par chave-valor você pode usar o
seguinte:

>    del storage['foo']
>    print(storage['foo']) # raises KeyError

Um exemplo mais completo usando `local_storage`, um aplicativo de
lista TO-DO (a fazer), pode ser encontrado no iframe abaixo.

<iframe src="../en/examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
