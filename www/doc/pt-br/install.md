Primeira instalação
------------------

Para instalar o Brython :

- se o seu computador possui o CPython e o pip, instale o pacote `brython` via

```
    pip install brython
```

> então, em um diretório vazio, execute

```
    python -m brython --install
```

- se você não consegue executar através deste método, acesse a página com as [últimas versões](https://github.com/brython-dev/brython/releases)
no Github, selecione a mais recente, realize download e descompacte o arquivo __Brython-x.y.z.zip__.

Em ambos os casos, o diretório obtido terá os seguintes arquivos :

- __brython.js__ : o script do Brython para inserir em páginas HTML
- __brython_stdlib.js__ : grupo com todos os módulos e pacotes da biblioteca
padrão do Python suportados pelo Brython
- __demo.html__ : uma página com alguns exemplos de como usar o Brython para o desenvolvimento voltado para o lado do cliente 

__brython.js__ inclui os módulos mais usados : `browser, browser.html, javascript`.

Se a sua aplicação utiliza módulos da distribuição padrão, você precisa
incluir __brython_stdlib.js__ junto do __brython.js__:

```
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```

Atualizações
-------
Quando uma nova versão do Brython é publicada, a atualização pode ser executada
de forma usual através do comando:

```
pip install brython --upgrade
```

No diretório da aplicação, você pode atualizar os arquivos Brython
(__brython.js__ e __brython_stdlib.js__) por:

```
python -m brython --update
```

Instalando o pacote CPython
----------------------------
O pacote CPython instalado via `pip` pode ser instalado na aplicação Brython
pelo comando `--add package <package name>`.

Por exemplo:
```
pip install attrs
python -m brython --add_package attrs
```

Todos os arquivos do pacote devem ser usados pelo Brython; isto
exclui arquivos escritos em C, por exemplo.

Outros comandos
--------------

`-- modules`

> cria uma distribuição específica da aplicação, para substituir
> __`brython_stdlib.js`__ por um arquivo menor. Veja a seção
> [import](import.html).

`-- make_dist`

> gera um pacote CPython adequado para distribuição através do PyPI, para instalar uma
> aplicação Brython. Veja a seção [Deploying a Brython application](deploy.html)

Servidor web
----------
Os arquivos HTML podem ser abertos no navegador, mas é recomendável
iniciar um servidor web no diretório da aplicação.

É mais simples usar o módulo **http.server** na distribuição
padrão CPython :

```bash
python -m http.server
```

A porta padrão é 8000. Para escolher outra porta:

```bash
python -m http.server 8001
```

Você pode acessar suas páginas digitando o endereço _http://localhost:8001/demo.html_
na barra de endereços dos seu navegador.