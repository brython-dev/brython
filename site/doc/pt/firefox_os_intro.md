Escrevendo uma Webapp para Firefox OS em Python com Brython
===========================================================

Aplicações para Firefox OS são escritas com tecnologias padrão da web:
HTML5, CSS, e uma linguagem de programação para clientes web. Com
[Brython](http://brython.info) desenvolvedores não são mais limitados
a Javascript: eles podem escrever aplicações para dispositivos móveis
em Python.

O passo inicial é configurar um ambiente para executar aplocações
Firefox OS. O mais simples é instalar o
[Simulador Firefox OS](https://developer.mozilla.org/en-US/docs/Tools/Firefox_OS_Simulator),
um plugin para o navegador Firefox. Escolha a versão mais recente do
OS (no momento da elaboração deste texto é a versão 1.3).

Quando a instalação estiver completa, você poderá gerenciar o
simulador no navegador Firefox em Tools > Web Developer > App Manager
(veja
[Usando o App Manager](https://developer.mozilla.org/en-US/Firefox_OS/Using_the_App_Manager#Using_a_Firefox_OS_Simulator_Add-on))

A aplicação Memos
-----------------

Para ter um primeiro contato com webapps desenvolvidas com Brython,
baixe e descompacte a aplicação
[brython-firefoxOS-memo](https://bitbucket.org/brython/brython-firefoxos-memos)
e siga as instruções de como instalar no simulador Firefox OS.

Os componentes da aplicação inclúem:

- *server.py*: O servidor web integrado usado para instalar e executar
   a aplicação.

- *manifest.webapp*: Este arquivo é lido pelo gerenciador de
   aplicações quando a aplicação hospedada (hosted) é adicionada ao
   siulador. Ele é um arquivo de texto com um objeto JSON fornecendo
   ao Firefox OS informações importantes sobre a aplicação: seu nome e
   descrição, o caminho de lançamento (launch_path, a url da primeira
   tela da aplicação), o caminho dos icones instalados na tela inicial
   do simulador para a aplicação.

- *index.html*: a página inicial da aplicação. Ela carrega um conjunto
   de estilos (stylesheets) localizados no diretório raiz e nos
   subdiretórios *icons* e *style*. Todos estes arquivos CSS são
   fornecidos pelo time de desenvolvimento do Firefox OS; eles foram
   obtidos no site de desenvolvimento
   [Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks).

> *index.html* também carrega o programa Javascript
> brython/brython_dist.js*. Este script permite o desenvolvimento de
> scripts em Python em vez de Javascript. Ele expõe a função chamada
> `brython` que é executada ao carregar a página.

>    <body role="application" onload="brython(1)">

> Graças a Brython, a logica da aplicação é escrita em Python no
> script *memos.py*, que é carregado em *index.html* por:

>    <script type="text/python" src="memos.py"></script>

- *memos.py* é um script Python comum, analisado, traduzido para
   Javascript e executado por Brython. A maior parte da sintaxe de
   Python 3 e muitos dos módulos da distribuição padrão são suportados
   por Brython. Para interface com o DOM, ele fornece módulos
   específicos agrupados no pacite **browser**.

> Para informação sobre como usar Brython para desenvolvimento web,
> veja a [Documentação](http://brython.info).
