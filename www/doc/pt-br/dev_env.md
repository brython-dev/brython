Ambiente de Desenvolvimento
---------------------------

Os desenvolvedores devem usar o ambiente disponivel em [download](https://github.com/brython-dev/brython/releases): escolha o arquivo zip começando com "BrythonX.Y.Z\_site\_mirror" onde X.Y.Z é o número da versão e descompacte em um diretório (Nós nos referimos a este diretório como brython_directory nos próximos paragrafos). 

Um servidor web é necessário para testar os scripts localmente durante o desenvolvimento. Qualquer servidor web que pode usar arquivos como brython_directory/www como documento raiz servirá para o devido funcionamento; você pode usar o servidor web integrado fornecido pela distribuição: abra uma aba do console, vá para o diretório e execute `python server.py`. Isso iniciará o servidor na porta 8000 e criará a pasta *static_doc*. Opções para o script *server.py*:   

* `--port <int>`: se você quiser usar um número de porta diferente, você pode usar `python server.py --port 8001` para usar a porta 8001.

* `--no-docs`: Quando você está testando algumas coisas, às vezes não é necessário criar a pasta *static_doc*. Se você quiser evitar este passo, você pode fazer `python server.py --no-docs`. AVISO: Se você usar essa opção, os documentos não estarão disponíveis em seu host local. 

Depois que o servidor for iniciado, aponte seu navegador para _http://localhost:8000/_ (ou http://localhost:<port> se você usou a opção `python server.py --port <port>`): a mesma página que o  [Brython site homepage](http://www.brython.info) deve aparecer.

Crie um novo diretório (exemplo "whatever") em _brython\_directory/www_ . Com um editor de texto, crie um arquivo chamado _index.html_ com o conteúdo abaixo e salve-o no diretório _brython\_directory/www/whatever/index.html_:


    <html>
    <head>
    <meta charset="iso-8859-1">
    <script src="../src/brython.js"></script>
    </head>
    <body onLoad="brython()">
    <script type="text/python">
    from browser import document as doc
    from browser import alert
    
    def echo(ev):
        alert("Hello %s !" %doc["zone"].value)
    
    doc["echo"].bind('click', echo)
    </script>
    <p>Your name is : <input id="zone"><button id="echo">click !</button>
    </body>
    </html>

Aponte o navegador para _http://localhost:8000/whatever/index.html_ : parabéns, você escreveu seu primeiro script Brython !!

Use este ambiente para teste e desenvolvimento. Apenas lembre-se de apontar o script _brython.js_ para o local certo relacionado ao diretório em que se encontra a página HTML.
