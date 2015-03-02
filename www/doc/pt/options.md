Opções da função `brython()`
----------------------------

Para executar script em Python na página, você deve chamar a função
`brython()` ao carregar a página:

`<body onload="brython(`*[options]*`)">`

*options* pode ser um inteiro, neste caso é o nível de depuração:

- 0 (padrão): sem depuração. Use este nível quando a aplicação tiver
  sido depurada, ele acelera um pouco a execução.
- 1: mensagens de erro são impressas no console do navegador (ou na
  saída especificada em `sys.stderr`)
- 2: a tradução de código Python em código Javascript é impressa no console.
- 10: a tradução de código Pythone dos módulos importados é impressa no console.

*options* pode ser um objeto Javascript, suas chaves podem ser:

- *debug*: o nível de depuração (como acima).
- *static\_stdlib\_import*: valor booleano, indica se, para importar
  módulos ou pacotes da biblioteca padrão, a tabela de mapeamento
  estático no script __stdlib\_paths.js__ deveria ser usada. Valor
  padrão: `true`.
- *pythonpath*: uma lista de caminhos onde os módulos importados devem
  ser buscados.
- *ipy_id*: por padrão, a função `brython()` executa todos os scripts
  na página. Esta opção especifica uma lista de identificadores de
  elementos (atributo `id` da etiqueta) cujo conteúdo de texto deve
  ser executado como código Python. Veja
  [brythonmagic](https://github.com/kikocorreoso/brythonmagic) para
  mais informações.

Exemplo
-------

>    brython({debug:1, ipy_id:['hello']})

irá executar o conteúdo do elemento com id "hello" com nível de
depuração 1.
