Compilando e executando
-----------------------

### Visão geral

<table border=1 cellpadding =5>
<tr><td>Etapa</td><td>desempenhada por</td></tr>
<tr>
 <td>Leitura de código Python</td>
 <td>função <code>brython(_debug\_mode)</code> em __py2js.js__
  <p>Se o código estiver em um arquivo externo, ele é obtido por uma chamada Ajax
  <p>Esta função cria as seguintes variáveis de ambiente:
  
- `document.$py_src`: objeto indexado pelos nomes dos módulos, o valor é o código fonte do módulo
- `document.$debug`: nível de depuração
- `document.$exc_stack`: uma lista de erros gerados durante a análise ou em tempo de execução
</td>
</tr>

<tr>
 <td>criação da árvore representando o código Python</td>
 <td>função <code>\_\_BRYTHON\_\_.py2js(_source,module_)</code> em __py2js.js__ <br>
  
  Esta função chama :
  
- `$tokenize(<i>source</i>)`: análise de sintaxe das marcas (tokens) no código fonte Python e construção da árvore ; retorna a raiz da árvore
- `transform(<i>root</i>)`: transforma a árvore para preparar a conversão para Javascript (ver abaixo)
- `$add_line_num()` para adicionar números de linhas se o modo de depuração for maior que 0
  
  A função `py2js` retorna a raiz da árvore
</td>
</tr>

<tr>
 <td>geração de código Javascript</td>
 <td>método `to_js()` da árvore retornada por `py2js`

 Esta função chama recursivamente o método de mesmo nome em todos os
 elementos de sintaxe encontrados na árvore. Ela retorna a cadeia
 contendo o código Javascript resultante. Se o modo de depuração for
 2, esta sequência é impressa no console do navegador </td> </tr>

<tr>
 <td>execução do código Javascript</td>
 <td>avaliação pela função `eval()`</td>
</tr>

</table>

### Arquivos utilizados

O script __brython.js__ é gerado pela compilação de vários scripts :

- **brython\_builtins.js**: define o objeto `__BRYTHON__` que atua como intermediador entre objetos Javascript nativos (`Date, RegExp, Storage...`) e Brython
- **py2js.js**: faz a conversão de código Python para código Javascript
- **py\_utils.js**: funções de utilidades (p.ex. conversões de tipos entre Javascript e Python)
- **py\_object.js**: implementa a classe `object` de Python
- **py\_builtin\_functions.js** : funções embutidas de Python
- **js\_objects.js**: interface para objetos e construtores Javascript
- **py\_import.js**: implementação de <tt>import</tt>
- **py\_dict.js**: implementação da classe `dict` de Python
- **py\_list.js**: implementação da classe `list` de Python, baseada no tipo `Array` de Javascript
- **py\_string.js**: implementação da classe `str` de Python, baseada no tipo `String` de Javascript
- **py\_set.js**: implementação da classe `set` de Python
- **py\_dom.js**: interação com o documento HTML (DOM)

### Mais sobre tradução e execução

A tradução e execução de um script Brython por **py2js.js** passa
pelas seguintes etapas:
<ol>
<li>análise de sintaxe e construção de árvore

  Esta etapa conta com um autômato cujo estado evolui com as marcas
  (tokens) encontrados no código fonte.
  
  O código Python é dividido em marcas que podem ter os seguintes
  tipos:

- palavra-chave
- identificador
- literal (sequência, inteiro, ponto flutuante)
- operador
- ponto (.)
- dois pontos (:)
- ponto e vírgula (;)
- parêntese / colchete / chave
- designação (sinal de igual =)
- decorador (@)
- fim de linha

Para cada marca, é feita uma chamada da função _$transition()_. Ela
retorna um novo estado dependendo do estado atual e da marca.

Cada instrução no código fonte corresponde a um nodo na árvore (uma
instância da classe _$Node_). Se uma linha contém mais de uma
instrução separada por ":" (`def foo(x):return x`) ou por ";"
(`x=1;print(x)`), serão criados tantos nodos quanto for neccessário
para esta linha.

Cada elemento de sintaxe (identificador, chamada de função, expressão,
operador...) é gerido por uma classe: veja no código fonte de
**py2js.js** entre `function $AbstractExprCtx` e `function $UnaryCtx`.

Nesta etapa, erros podem ser reportados:

- erros de sintaxe
- erros de indentação
- sequências literais não finalizadas
- parênteses / colchetes / chaves faltando ou sobrando
- caractére ilegal
- palavra-chave de Python não gerida por Brython

<li>Tranformando a árvore

Para alguns elementos da sintaxe Python, a árvore representando o
código fonte tem que ser modificada (adicionar ramos) antes de se
começar a tradução para Javascript. Isto é feito por chamadas
recursivas do método `transform()` do topo da árvore.

Por exemplo, na primeira etapa o código Python `assert _condition_`
implica em um único ramo da árvore. A segunda etapa o transforma em um
ramo `if not _condition_` e adiciona um ramo filho com `raise
AssertionError`.

Os elementos que precisam ser transformados deste modo são : `assert`,
designações encadeadas (`x=y=0`) e múltiplas (`x,y=1,2`), `class, def,
except, for, try`.

Esta etapa também é usada para armazenar variáveis declaradas por
`global`.

<li>Executando o código Javascript

No tempo de execução, o script gerado pode usar:

- as classes integradas definidas em _py\_object.js, py\_dict.js,
  py\_string.js, py\_list.js, py\_set.js, py\_dom.js_
- funções internas, não acessíveis por Python (seus nomes sempre
  começam com $); a maioria delas é definida em _$py\_utils.js_. As
  mais importantes são:
 - _$JS2Py_: recebe um único argumento e retorna:
  - o argumento não modificado se este for um tipo gerido por Brython, (p.ex. se tem um atributo _\_\_class\_\__)
  - uma instância de DOMObject (respectivamente, DOMEvent) se o argumento é um objeto DOM (respectivamente, evento DOM)
  - uma instância de JSObject "encapsulando" o argumento em outros casos
 - _$MakeArgs_ é chamada no início de cada função se sua assinatura
   tem pelo menos um argumento. Ela constrói um espaço de nomes
   baseado nos argumentos da função, chamando a função _$JS2Py_ em
   todos os argumentos
 - _$class\_constructor_ é chamada para definições de classe
 - _$list\_comp_ é chamada para copreensões de listas
 - _$lambda_ é chamada para funções anônimas definidas por `lambda`
 - _$test\_expr_ e _$test\_item_ são usadas na avaliação de condições
   combinadas por `and` ou `or`
- as funções definidas no script _py\_import.js_ para gestão de
  _imports_

</ol>
</body>
</html>
