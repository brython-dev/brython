módulo **asyncio.fs**
-----------------------
O módulo fornece acesso assíncrono a arquivos locais / remotos.


A seguir, um exemplo comentando que pode ser executado a partir da repl.

```python
from browser import document as doc, html
import asyncio.fs as afs

# Cria um elemento input e o adiciona na página
i = html.INPUT(type='file')
doc <= i

# Aguarda o usuário selecionar um arquivo...

# Uma vez que o usuário tenha selecionado um arquivo,
# nós podemos abri-lo com o método `open`
ff = afs.open(i.files[0])

# Este método é uma co-rotina, então retorna um `asyncio.Future`
# Uma vez que o arquivo está pronto, podemos obter o resultado com
f = ff.result()

# O resultado é uma instância de `asyncio.fs.BrowserFile`
# o qual herda de `io.StringIO`
# então você pode acessa com o `read`, `readlines`,
# ou todos os outros métodos de `io.StringIO`
print(f.read())

# Também é possível usar o método adicional `save`
# o qual realiza o download do arquivo para o
# diretório Donwloads ou ainda,dependendo das on user settings,
# configurações do usuário, abre uma janela de diálogo permitindo
# a este onde salvar o arquivo
f.save()
```

É preciso observar que o objeto `asyncio.fs.BrowserFile` mantém o conteúdo do arquivo em memória,
logo, é necessário ter cuidado com arquivos muito grandes. Para tanto, o método `open` possui o
argumento opcional `max_size` o qual especifica o tamanho máximo (em bytes) do arquivo que se
deseja carregar. Se o parâmetro é utilizado e o tamanho do arquivo excede o estipulado, este lançará
uma exceção do tipo `IOError`.

O objeto `asyncio.fs.BrowserFile` suporta o método `write`. Se você deseja modificar o arquivo
usando este método, então o método `save` salvará as alterações realizadas.

O método `asyncio.fs.open` aceita tando um objeto [File](https://developer.mozilla.org/cs/docs/Web/API/File)
quanto uma url. Neste último caso, este irá baixar o conteúdo da url e retornar este como um objeto
`asyncio.fs.BrowserFile`. De qualquer forma, o método `save` irá salvar o arquivo localmente e **não**
remotamente.

**Note que a leitura remota ainda não foi testada completamente**


O módulo também contém o conveniente método

```
    asyncio.fs.open_local
```

O qual abre uma caixa de diálogo para que o usuário selecione um arquivo. O
método retorna um `asyncio.Future` que se transforma em um `asyncio.fs.BrowserFile`
com o conteúdo do arquivo de quando este foi lido. O método funciona anexando uma
entrada ao corpo do documento, registrando em um manipulador de alterações para então,
programaticamente clicar e o excluir imediatamente do documento.

O exemplo acima deve ser executado na repl. Devido à natureza assíncrona dos métodos,
quando executado a partir de um script, este deve ser envolvido em uma co-rotina, como
por exemplo:


```python
import asyncio
import asyncio.fs as afs

@asyncio.coroutine
def process_file(file_object = None):

    if file_object is None:
        input = yield afs.open_local()
    else:
        input = yield afs.open(file_object)

    output = yield afs.open('processed.txt','w')

    for ln in input.readlines():
        output.write(ln.replace('\n','\r\n'))

    output.save()

asyncio.ensure_future(process_file())
```
