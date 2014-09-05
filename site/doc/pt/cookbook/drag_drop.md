Problema
--------

Arrastar e soltar um elemento na página web


Solução
-------

Brython implementa uma API baseada na especificação de arrastar e
soltar de HTML5. Na forma básica apresentada neste exemplo, ela
consiste em definir funções de resposta para 3 eventos:

- _dragstart_ no elemento arrastável (quando o usuário começa a
  arrastá-lo)

- _dragover_ na zona de destino (quando o elemento arrastável é movido
  sobre ele)

- _drop_ na zona de destino (quando o usuário libera o botão do mouse)

Para vincular a função de resposta _callback_ a um evento _event_ em
um elemento _element_, usamos o método
_element_<code>.bind(_event,callback_)</code>

As funções de resposta recebem um único argumento, uma instância de
`DOMEvent`. Para comunicar informação durante a operação de arrastar e
soltar, o evento tem um atributo _data_ que recebe um valor na função
de resposta associada a _dragstart_; este valor é usado na função de
resposta associada com _drop_ para identificar o elemento que esta
sendo solto.

No exemplo, quando o objeto arrastável tiver sido solto, ele não pode
mais ser arrastado; para isso, removemos os vínculos a um evento
_event_ neste objeto usando o método
_element_<code>.unbind(_event_)</code>

<div style="width:400px;height:150px;background-color:yellow" id="panel">
<div id="dest" style="position:absolute;width:180px;height:80px;background-color:green;color:white;">destination zone</div>
<div id="source" style="position:absolute;width:80px;height:40px;background-color:red;">draggable object</div>
</div>

<div id="py_source">
    from browser import doc

    panel = doc["panel"] # zona amarela
    
    source = doc["source"] # zona vermelha
    # posicionar em (10,10) a partir do canto superior esquerdo de panel
    source.style.top = "%spx" %(10+panel.top)
    source.style.left = "%spx" %(10+panel.left)
    # tornar a zona vermelha arrastável
    source.draggable = True
    
    dest = doc["dest"] # zona verde
    # posicionar em (10,150) a partir do canto superior esquerdo de panel
    dest.style.top = "%spx" %(10+panel.top)
    dest.style.left = "%spx" %(150+panel.left)
    
    # quando o mouse estiver sobre o elemento arrastável, mudar o cursor
    def mouse_over(ev):
        print('mouse over ! ')
        ev.target.style.cursor = "pointer"
    
    # deslocamento do mouse relativamente ao objeto arrastado quando o arrastamento começa
    m0 = [None,None]
    
    # função chamada quando o usuário começa a arrastar o objeto
    def drag_start(ev):
        global m0
        # calcular o deslocamento do mouse
        # ev.x e ev.y são as coordenadas do mouse quando o evnto é ativado
        # ev.target é o elemento arrastado. Seus atributos "left" e "top" são
        # inteiros, a distância das bordas esquerda e superior do documento
        m0 = [ev.x-ev.target.left,ev.y-ev.target.top]
        # associar dados ao processo de arrasto
        ev.data['text']=ev.target.id
        # permitir que o objeto arrastado seja movido
        ev.data.effectAllowed = 'move'
    
    # função chamada quando o objeto arrastável está sobre a zona de destino
    def drag_over(ev):
        ev.data.dropEffect = 'move'
        # aqui devemos prevenir o comportamento padrão para este tipo de evento
        ev.preventDefault()
    
    # função vinculada à zona de destino
    # descreve o que acontece quando o objeto é solto, p.ex. quando o mouse é
    # liberado enquanto o objeto está sobre a zona
    def drop(ev):
        # retomar dados armazenados em drag_start (o id do elemento arrastável)
        src_id = ev.data['text']
        elt = doc[src_id]
        # ajustar as novas coordenadas do objeto arrastado
        elt.style.left = "%spx" %(ev.x-m0[0])
        elt.style.top = "%spx" %(ev.y-m0[1])
        # não arrastar mais o objeto
        elt.draggable = False
        # remover a função de resposta
        elt.unbind('mouseover')
        elt.style.cursor = "auto"
        ev.preventDefault()

    # vincular eventos aos objetos arrastáveis
    source.bind('mouseover',mouse_over)
    source.bind('dragstart',drag_start)

    # vincular eventos à zona de destino
    dest.bind('dragover',drag_over)
    dest.bind('drop',drop)
    
</div>


<script type="text/python3" id="py_source">
exec(doc['py_source'].text)
</script>    
