Construindo sua própria webapp: lógica da aplicação
===================================================

Crie um programa Python chamado *calculator.py*. Em *index.html*, logo
após a etiqueta `body`, adicione esta linha:

    <script src="calculator.py" type="text/python3"></script>

Isso fará o motor de Brython carregar e executar o script.

As primeiras linhas de *calculator.py* importarão os nomes usados em
Brython para interagir com a aplicação:

    from browser import document

Todas as teclas no teclado estão dentro de âncoras html (etiquetas `<a
href="#">...</a>`). O objeto `document` pode encontrar todas as
âncoras com:

    anchors = document.get(selector='a')

Como você está depurando a aplicação, é útil garantir que você
realmente pegou as âncoras, então você pode adicionar a linha:

    print(anchors)

que vai imprimir a lista de âncoras no console do navegador.

Ok, então *calculator.py* é

    from browser import document
    
    anchors = document.get(selector="a")
    print(anchors)

Atualize a página no navegador e abra o console (Tools > Web developer
\> Web console). No console, você deve ver uma lista de elementos:

    <DOMNode object type 'ELEMENT' name 'A'>

Cada um dos objetos âncora tem um atributo _text_. Você pode ver o que
este atributo é mudando a última linha para:

    print(list(anchor.text for anchor in anchors))

Isso imprime
`['7', '8', '9', '÷', '4', '5', '6', '*', '1', '2', '3', '-', '.', '0', '=', '+']`
no console.

Para definir o que acontece quando o usuário clica em uma âncora,
Brython usa a sintaxe:

    anchor.bind('click', callback)

onde _callback_ é a função que recebe uma instância de `DOMEvent` como
argumento. Nesta aplicação, vamos usar a mesma função para todas as
teclas:

    from browser import document
    
    anchors = document.get(selector="a")
    
    def callback(ev):
        print(ev.target.text)
    
    for anchor in anchors:
        anchor.bind('click', callback)

Com estes vínculos, quando o usuário apertar uma tecla, o texto nesta
tecla é impresso no console (o atributo _target_ do objeto `DOMEvent`
é a própria âncora).

Isso não é exatamente o que queremos: o texto devia aparecer no campo
de entrada. Este campo de entrada tem id "entry", e Brython obtem uma
referência para o campo com `document["entry"]`. A função de resposta
deveria ser mudada para:

    def callback(ev):
        document["entry"].value += ev.target.text

Isso está bom para a maioria das teclas, mas precisamos resolver
aquelas que deveriam computar um resultado. O código completo de
*calculator.py* abaixo deve ser auto-explicativo:

    from browser import document
    import math
    
    anchors = document.get(selector="a")
    entry = document["entry"]
    
    def callback(ev):
        txt = ev.target.text
        if txt=='C':
            entry.value = ''
        elif txt=='<' and entry.value:
            entry.value = entry.value[:-1]
        elif txt=='=':
            try:
                entry.value = eval(entry.value)
            except:
                entry.value = 'error'
        elif txt=='√¯':
            try:
                entry.value = math.sqrt(float(entry.value))
            except:
                entry.value = 'error'
        elif txt=="1/x":
            try:
                entry.value = 1/float(entry.value)
            except:
                entry.value = 'error'    
        else:
            entry.value += ev.target.text
    
    for anchor in anchors:
        anchor.bind('click', callback)
    
