Ambiente de desenvolvimento
---------------------------

Desenvolvedores deveriam usar o ambeinte disponível para
[download](https://github.com/brython-dev/brython/releases): escolha o
arquivo zip que começa com "Brython\_site\_mirror" e descompacte-o em
uma pasta (chamaremos esta pasta de diretório Brython nos próximos
parágrafos).

Um servidor web é necessário para testar os scripts localmente durante
o desenvolvimento. Qualquer servidor que possa servir arquivos com o
diretório Brython como raiz do documento é válido; você pode usar o
servidor web fornecido na distribuição: abra uma janela de console, vá
até o diretório onde está o arquivo server.py, e execute o comando
`python server.py`. Este comando iniciará o servidor na porta 8000
(edite _server.py_ para alterar o número da porta).

Uma vez que o servidor seja iniciado, aponte seu navegador web para
_http://localhost:8000/site/_ : você deve ver uma página igual à
[página inicial do site Brython](http://www.brython.info).

Crie uma nova pasta (p.ex. "teste") no diretório Brython. Com um
editor de texto, crie um arquivo chamado _index.html_ com o conteúdo
abaixo e salve-o no diretório _teste_.

    <html>
    <head>
    <meta charset="iso-8859-1">
    <script src="../src/brython.js"></script>
    </head>
    <body onLoad="brython()">
    <script type="text/python">
    from browser import doc, win, alert
    
    def echo(ev):
        alert("Olá %s !" %doc["zone"].value)

    doc["echo"].bind('click', echo)
    </script>
    <p>Seu nome é: <input id="zone"><button id="echo">clique !</button>
    </body>
    </html>


Navegue para _http://localhost:8000/teste/index.html_: bingo ! você
acaba de escrever seu primeiro script em Brython.

Use este ambiente para teste e desenvolvimento. Só lembre de apontar o
script _brython.js_ para a localização correta em relação ao diretório
de sua página HTML.
