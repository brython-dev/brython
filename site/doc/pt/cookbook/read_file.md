Problema
--------

Ler o conteúdo de um arquivo

Solução
-------

Usamos a função integrada `open()` para carregar o conteúdo do
arquivo.

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    import time
    from browser import doc
    
    fake_qs = '?foo=%s' %time.time()
    doc['zone'].value = open('cookbook/file.txt'+fake_qs).read()

<button id="get_file">Teste</button>

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Conteúdo inicial</textarea>
</td>
</tr>
</table>

<script type="text/python3">
def get_file(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

doc['get_file'].bind('click', get_file)
</script>


Note que a cadeia de consulta tem um valor aleatório no final do nome
do arquivo: ele é necessário para atualizar o resultado caso o arquivo
fonte seja alterado entre duas chamadas.

O próximo exemplo adiciona uma função de tempo limite para imprimir
uma mensagem caso o arquivo não tenha sido encontrado após 4 segundos:

    import time
    from browser import doc

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["zone"].value = req.text
        else:
            doc["zone"].value = "error "+req.text
    
    def err_msg():
        doc["zone"].text = "servidor não respondeu após %s segundos" %timeout
    
    timeout = 4
    
    def go(url):
        req = ajax()
        req.on_complete = on_complete
        req.set_timeout(timeout,err_msg)
        req.open('GET',url,True)
        req.send()

    go('cookbook/file.txt?foo=%s' %time.time())



