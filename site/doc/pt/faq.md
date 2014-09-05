Perguntas Frequentes
--------------------

__P__: _qual é a performance de Brython comparado com Javascript, e
com outras soluções que permitem usar Python no navegador?_

__R__: comparado ao Javascript, a proporção é naturalmente diferente
de um programa para outro, mas fica entre 3 e 5 vezes mais lento. Um
console Javascript é fornecido junto com a distribuição ou no
[site de Brython](http://brython.info/tests/js_console.html), e pode
ser usado para medir o tempo de execução de um programa Javascript
comparado com seu equivalente em Python no editor (desmarcando a caixa
"debug")

A diferença é devida a dois fatores:

- o tempo para traduzir Python em Javascript, imediatamente no
  navegador. Para dar uma idéia, o módulo datetime (2130 linhas de
  código Python) é analisado e convertido para Javascript em 0,5
  segundos em um PC comum.
- o código Javascript gerado por Brython deve atender à especificação
  de Python, incluíndo a natureza dinâmica da busca de atributos, que
  leva a um código Javascript não otimizado.

Comparado com outras soluções que traduzem Python para Javascript,
algumas
[comparações extravagantes](http://pyppet.blogspot.fr/2013/11/brython-vs-pythonjs.html)
mencionam uma razão de 1 para 7500 contra Brython: nenhuma informação
é dada, mas é óbvio que eles não comparam situações similares; nas
mesmas condições (executando um script em um navegador) é difícil
imaginar com ser mais rápido do que Javascript nativo...

Ademais, o exemplo apresentado nesta página é:

    N = 100000
    a = 0
    for i in range(N):
        a += 1

que PythonJS traduz nativamente para:

    var N=100000;
    var a=0;
    for(var i=0;i<N;i++){
        a += 1
    }

Se o código for modificado desta maneira:

    def range(N):
        return ['spam', 'eggs']
    
    for i in range(100000):
        print(i)

Brython dá o resultado correto, enquanto PythonJS ainda traduz o laço
como se `range()` fosse a função interna de mesmo nome.

Desnecessário dizer que, no caso em que `a` é uma lista em vez de um
inteiro, os resultados produzidos por PythonJS não são exatamente o
que um desenvolvedor Python esperaria...

Brython tenta ser tão rápido quanto possível e, como os exemplos na
galeria mostram, é _rápido o suficiente_ para a maioria dos casos de
seus objetivos - desenvolvimento web de frente. Mas também almeja
cobrir 100% da sintaxe de Python, o que inclúi produzir as mesmas
mensagens de erro que CPython, mesmo que isso leve a um Javascript
mais lento.

Não achei comparações sérias entre as soluções que podem ser
encontradas em
[uma lista](http://stromberg.dnsalias.org/~strombrg/pybrowser/python-browser.html)
mantida por Dan Stromberg. Nada prova que o código Javascript gerado
por soluções escritas em Python são mais rápidas do que uma gerada por
Brython. E o ciclo de desenvolvimento de soluções escritas em Python
como Pyjamas / pyjs é obviamente mais longo do que com Brython.

__P__: _Vejo muitos erros 404 no console do navegador quando executo
um script Brython, por quê?_

__R__: isso acontece por que Brython implementa o mecanismo de
"import". Quando um script tem que importar um módulo X, Brython busca
por um arquivo ou um pacote em diferentes diretórios: a biblioteca
padrão (diretório libs para módulos Javascript e Lib para módulos
Python), o diretório Lib/site-paclages e o diretório da página
atual. Para isso, chamadas Ajax são enviadas para as urls
correspondentes; se o arquivo não for encontrado, a mensagem de erro
404 é escrita no console do navegador, mas o erro é pego por Brython,
que continua a busca até encontrar o módulo, ou levanta `ImportError`
se todos os caminhos foram tentados sem êxito.

__P__: _por que usar o operador `<=` para construir a árvore de
elementos DOM? Isso não é pythônico!_

__R__: Python não tem uma estrutura integrada para manipular árvores,
p.ex. para adicionar nodos "filho" ou "irmão" na árvore de nós. Para
estas operações: este operador é mais fácil de digitar (sem
parênteses) e mais legível.

Para adicionar um nodo irmão, o operador `+` é usado.

Para adicionar um filho, o operador `<=` foi escolhido pelas seguintes razões:

- parece uma designação aumentada por causa do sinal de igual.
- anotações de função usam um novo operador `->` que foi escolhido por
  sua forma de seta.
- tem a forma de uma seta para a esquerda.
- não pode ser confundido com "menor ou igual a" pois a linha com "doc
  <= elt" seria um no-op se fosse "menor ou igual a", que é sempre
  usada em uma condição.
- estamos tão acostumados a interpretar os dois sinais `<` e `=` como
  "menor ou igual a" que esquecemos que eles são uma convenção para
  linguagens de programação para substituir o sinal real `≤`.
- em Python, `<=` é usado como um operador para conjuntos (sets) com
  um significado diferente de "menor ou igual a".
- o sinal `<` é comumente usado em ciência da computação para
  significar algo diferente de "menor que": em Python e muitas outras
  linguagens, `<<` significa um deslocamento para a esquerda; em HTML
  as etiguetas são cercadas por `<` e `>`.
- Python usa o mesmo operador `%` para operações muito diferentes:
  módulo e formatação de cadeias de caractéres.
