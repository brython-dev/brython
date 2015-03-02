Problema
--------

Criar uma tabela HTML.


Solução
-------

Neste exemplo e no seguinte, mostraremos somente o script Python; o
código HTML que o cerca permanecerá o mesmo dos exemplos anteriores.

Para criar uma tabela, usamos as etiquetas HTML: `TABLE` (a
tabela),`TR` (uma linha da tabela),`TH` (uma célula de cabeçalho) e
`TD` (uma célula).

A tabela é composta de linhas, cada linha é feita de células; a
primeira célula é geralmente feita de "células de cabeçalho"
descrevendo o valor da coluna correspondente.

Abaixo um exemplo simples:

<table width="100%">
<tr>
<td style="width:50%;">

    from browser import doc
    from browser.html import TABLE,TR,TH,TD
    table = TABLE()
    row = TR() # create a row
    # add header cells
    row <= TH("País")
    row <= TH("Capital")
    table <= row # adiciona a linha à tabela
    
    # adicionar uma linha
    row = TR()
    row <= TD("Estados Unidos")+TD("Washington")
    table <= row
    
    # apagar o conteúdo inicial
    doc['zone'].text = ''
    
    # inserir a tabela no elemento
    doc['zone'] <= table

<button id="fill_zone">Teste</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Conteúdo inicial<p>
</td>
</tr>
</table>

<script type="text/python3">
def fill_zone(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

doc['fill_zone'].bind('click', fill_zone)
</script>

Note como o conteúdo inicial da célula foi apagado: simplesmente
ajustando seu atributo `text` para a cadeia vazia.

Podemos construir uma tabela a partir de uma lista de listas:

<table width="100%">
<tr>
<td style="width:50%;">

    lines = [ ['Morrissey','vocals'],
        ['Johnny Marr','guitar'],
        ['Mike Joyce','the drums'],
        ['Andy Rourke','the bass guitar']
        ]
    t = TABLE()
    for line in lines:
        t <= TR(TD(line[0])+TD(line[1]))
    doc['zone1'].text = ''
    doc['zone1']<= t

<button id="build_table">Teste</button>
</td>
<td id="zone1" style="background-color:#FF7400;text-align:center;">Conteúdo inicial<p>
</td>
</tr>
</table>

<script type="text/python3">
def build_table(ev):
    src = doc.get(selector="pre.marked")[1].text
    exec(src)

doc['build_table'].bind('click', build_table)
</script>

