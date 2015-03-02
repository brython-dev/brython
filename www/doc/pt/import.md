Implementação de `import`
-------------------------

Para importar módulos ou pacotes, Brython usa o mesmo mecanismo que
CPython: para resolver "import X", o programa procura um arquivo em
vários lugares, primeiro na biblioteca padrão (urls relativas às do
script __brython.js__):

- __libs/X.js__ (módulos Javascript, para os módulos da biblioteca
  padrão que não podem ser escritos em Python)
- __Lib/X.py__
- __Lib/X/\_\_init\_\_.py__
- __Lib/site-packages/X.py__
- __Lib/site-packages/X/\_\_init\_\_.py__

depois, se nenhum destes arquivos existe, as urls __X.py__ e
__X/\_\_init\_\_.py__ no diretório do script fazem o import.

Como o navegador não tem acesso direto ao sistema de arquivos, buscar
um arquivo deve ser feito por uma chamada Ajax, que retorna uma
mensagem de erro se não existir o arquivo com a url especificada.

Este método consome tempo para scripts que devem importar muitos
módulos (por exemplo, para "import random", nada menos que 44 módulos devem ser importados!). Para melhorar a performance, Brython propõe diversas opções:

1. a biblioteca padrão pode ser carregada na página HTML com o arquivo
   __py\_VFS.js__:

   `<script src="/src/py_VFS.js"></script>`

   Neste caso, buscas na biblioteca padrão consistem em checar se o
   nome do módulo é referenciado neste script; se sim, o código fonte
   é recuperado e executado, sem fazer uma chamada Ajax.

   Este método acelera imports da biblioteca padrão; as desvantagens
   são que o arquivo __py\_VFS.js__ é grande (em torno de 2MB), e que
   se o usuário modificar o conteúdo da biblioteca padrão (o que não é
   boa prática, mas pode ser feito para depuração), ele deve gerar uma
   nova versão de __py\_VFS.js__ usando o script Python __scripts/make\_VFS.py__.

2. se __py\_VFS.js__ não estiver incluído, buscas na biblioteca padrão
   usam uma tabela que mapeia nomes de módulos a uma url relativa à de
   __brython.js__: se o nome existir nesta tabela, uma única chamada
   Ajax é feita ára o local especificado.

   A única desvantagem deste método é que se o usuário modificar a
   localização dos scripts da biblioteca padrão, ele deve gerar a
   tabela, usando o script __scripts/make\_dist.py__.

   Para desabilitar esta opção e forçar a busca por chamadas Ajax em
   todas as localizações possíveis, a função __brython()__ deve ser
   chamada com a opção `static_stdlib_import` ajustada para `false`.

Note que os módulos devem estar codificados em utf-8; a declaração de
codificação no topo do script é ignorada.
