Implementação do _import_
--------------------------

Como na biblioteca padrão do Python, você pode instalar os módulos ou pacotes Python em sua
aplicação colocando-os no diretório raiz ou em diretórios com um arquivo __\_\_init\_\_.py__.

Observe que o módulo precisa esta codificado em utf-8; a codificação declarada no topo do
script é ignorada.

Por exemplo, a aplicação pode ser feita com os seguintes arquivos e
diretórios:

    .bundle-include
    app.html
    brython.js
    brython_modules.js
    brython_stdlib.js
    index.html
    users.py
    utils.py
    + app
        __init__.py
        records.py
        tables.py

O script Python em __app.html__ pode executar as seguintes importações:

```python
import users
import app.records
```

Se a distribuição padrão tiver sido incluída na página por

```xml
<script type="text/javascript" src="brython_stdlib.js"></script>
```

o script também pode ser executado por

```python
import datetime
import re
```

Para importar módulos ou pacotes, o Brython usa o mesmo mecanismo que o CPython: para
Para determinar o "import X", o programa procura um arquivo em vários locais:

- um módulo __X__ na distribuição padrão
- um arquivo __X.py__ no diretório raíz
- um arquivo __\_\_init\_\_.py__ no diretório __X__

Uma vez que o navegador não possui acesso direto ao sistema de arquivos, a procura
por um arquivo deve ser feita por uma chamada Ajax, a qual retorna uma mensagem de
erro se o arquivo não existir no url especificado.

Otimização
============
O processo descrito acima possui duas principais desvantagens:

- to tamanho relativamente grande de __brython_stdlib.js__ (mais de 3 Mb)
- o tempo requerido por chamadas Ajax

Para otimizar importações, caso a instalação do Brython tenha sido via `pip`, é possível
gerar um arquivo __brython_modules.js__ o qual retém apenas os módulos usados pela
aplicação.

Para isso, abra uma janela no console, navegue para o diretório da aplicação e execute:

```console
python -m brython --modules
```

Observe que este programa analisa o código Brython em todos os scripts, módulos
e páginas HTML do diretório e seus subdiretórios. A versão do CPython
usado deve ser compatível com este código Brython: por exemplo, se houver
f-strings no código Brython, o CPython 3.6+ é necessário; caso isto não acontece,
você obterá erros de sintaxe.

Você pode substituir todas as ocorrências de

```xml
<script type="text/javascript" src="brython_stdlib.js"></script>
```
por
```xml
<script type="text/javascript" src="brython_modules.js"></script>
```
