[![Stories in Ready](https://badge.waffle.io/brython-dev/brython.svg?label=ready&title=Ready)](http://waffle.io/brython-dev/brython)
[![Travis](https://api.travis-ci.org/brython-dev/brython.svg)](https://travis-ci.org/brython-dev/brython)
[![CDNJS version](https://img.shields.io/cdnjs/v/brython.svg)](https://cdnjs.com/libraries/brython)

brython
=======

Brython (Browser Python) é uma implementação em Python 3 executada no navegador com interface para os elementos e eventos do DOM.

A seguir, um exemplo simples de uma página HTML utilizando Python:

```html
<html>

    <head>
        <script type="text/javascript" src="/path/to/brython.js"></script>
    </head>

    <body onload="brython()">

        <script type="text/python">
        from browser import document, alert

        def echo(event):
            alert(document["zone"].value)

        document["mybutton"].bind("click", echo)
        </script>

        <input id="zone"><button id="mybutton">click !</button>

    </body>

</html>
```

Para usar o Brython, tudo o que você precisará fazer é:

1. Carregar o script [brython.js](http://brython.info/src/brython.js "Brython from the site brython.info").
2. Executar a função `brython()` no carregamento da página, com `<body onload=brython()>`.
3. Escrever os códigos em Python entre as tags `<script type="text/python">`.


Principais características
=============
Brython suporta grande parte da sintaxe de [Python 3](https://www.python.org "Python Homepage"),
incluso compreensões, geradores, metaclasses, importações, dentre outros muitos módulos da distribuição CPython.

Inclui bibliotecas para interagir com elementos e eventos DOM além de algumas das bibliotecas existentes do Javascript tais como, jQuery, D3, Highcharts, Raphael etc.

Suporta as mais recentes especificações de HTML5/CSS3 podendo ser utilizado com frameworks de CSS como Bootstrap3, LESS, SASS etc.


Começando
===============
Zero install !
--------------
A maneira mais simles para começar sem instalação é utilizar a distribuição disponível em [cdnjs](https://cdnjs.com). Você pode escolher a versão estável mais recente em:

```html
<script type="text/javascript"
    src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.7.1/brython.min.js">
</script>
```

O código acima irá lhe permitir utilizar códigos python diretamente, mas, para importar módulos da biblioteca padrão é necessário carregar um único arquivo javascript com o [stdlib disponível](https://github.com/brython-dev/brython/tree/master/www/src/Lib):

```html
<script type="text/javascript"
    src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.7.1/brython_stdlib.js">
</script>
```

Instalação local
-------------
Para instalar Brython localmente, caso você tenha uma distribuição CPython, é possível através do `pip` :

```bash
pip install brython
```
em seguida, crie um novo diretório e execute:

```bash
python -m brython --install
```

Você pode ainda obter a versão mais recente do Brython em formato zip através da nossa [página de lançamentos](https://github.com/brython-dev/brython/releases).

Em ambos os casos, a distribuição obtida inclui __brython.js__ (o arquivo central do Brython)
e o __brython_stdlib.js__ (um pacote com todos os arquivos na distribuição padrão).

Também inclui a página __demo.html__, a qual possui alguns exemplos de como interagir com uma página web utilizando Python como linguagem de script: como criar novos elementos, acessar e modificar elementos existentes, criar gráficos, animações, enviar requisições Ajax, etc.

Teste Brython online
===================
Se você deseja testar o Brython online, você pode visitar algum dos sites a seguir:

- [Editor](http://brython.info/tests/editor.html "Online Brython Editor")
- [Console](http://brython.info/tests/console.html "Online Brython Console")


Galeria de Exemplos
===================
Em [galeria de exemplos](http://brython.info/gallery/gallery_en.html "gallery of examples")
você encontra exemplos desde simples até a avançados usando Brython além de interações com outras bibliotecas javascript. 


Documentação
=============
Documentação disponível no [site oficial](http://www.brython.info "Brython Homepage").
Disponível em [Inglês](http://brython.info/static_doc/en/intro.html),
[Francês](http://brython.info/static_doc/fr/intro.html) e
[Espanhol](http://brython.info/static_doc/es/intro.html).

As documentações mais atualizadas geralmente são as versões em inglês e francês, então caso você
precise da versão mais recente, por favor, utilize uma dessas versões.

Curioso sobre [como Brython funciona](https://github.com/brython-dev/brython/wiki/How%20Brython%20works) ?

Veja neste [tutorial](https://github.com/brython-dev/brython/wiki/Writing-an-Android-application)
como contruir uma aplicação Android com Brython.

Comunidade (perguntas, feedback, issues, novas funcionalidades, ...)
==========================================================
Você pode se inscrever e postar em nossa
[lista de e-mails](https://groups.google.com/forum/?fromgroups=#!forum/brython "Brython Main Mailing List").

Se você encontrar um bug, possuir dúvidas ou queira conhecer mais sobre uma nova funcionalidade do Brython, por favor [abra uma issue](https://github.com/brython-dev/brython/issues "Brython GitHub Issues").

Se você deseja contribuir para o Brython, por favor, leia o [guia de contribuição](https://github.com/brython-dev/brython/blob/master/CONTRIBUTING.md).

Obrigado
=========

- Utilize o [BrowserStack](http://www.browserstack.com) para obter acesso ao ambiente de testes online.
