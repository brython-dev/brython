Creando tu propia webapp : la lógica de la aplicación
=====================================================

Crea un script Python llamado *calculator.py*; en *index.html*, justo después de la etiqueta `body`, añade la siguiente línea:

    <script src="calculator.py" type="text/python3"></script>

Esto hará que Brython cargue y ejecute el script.

Las primeras líneas de *calculator.py* importarán los nombres que se usarán para interactuar con la aplicación:

    from browser import document

Todas las teclas del teclado se encuentran dentro de etiquetas `<a href="#">...</a>`. El objeto `document` puede encontrar todas esas etiquetas de la siguiente forma:

    anchors = document.get(selector='a')

Mientras depuras la aplicación, será útil controlar que realmente obtienes las etiquetas, puedes añadir la línea:

    print(anchors)

que mostrará la lista de elementos en la consola del navegador.

Perfecto, de esta forma *calculator.py* es:

    from browser import document
    
    anchors = document.get(selector="a")
    print(anchors)

Recarga la página en el navegador y abre la consola (Tools > Web developer > Web console). en la consola, deberías ver la lista de elementos:

    <DOMNode object type 'ELEMENT' name 'A'>

Cada uno de los objetos dispone de un atributo _text_ ; puedes ver lo que contiene este atributo cambiando la última línea por:

    print(list(anchor.text for anchor in anchors))

Esto mostrará `['7', '8', '9', '÷', '4', '5', '6', '*', '1', '2', '3', '-', '.', '0', '=', '+']` en la consola.

Para definir qué sucede cuando un usuario pulsa sobre una de las teclas  Brython usa la syntaxis:

    anchor.bind('click', callback)

donde _callback_ es una función que toma la instancia `DOMEvent` como argumento. En esta aplicación, usaremos la misma función para todas las teclas:

    from browser import document
    
    anchors = document.get(selector="a")
    
    def callback(ev):
        print(ev.target.text)
    
    for anchor in anchors:
        anchor.bind('click', callback)

Con estas vinculaciones ('bindings'), cuando el usuario pulsa una tecla, el texto de la tecla se mostrará en la consola (el atributo _target_ del objeto `DOMEvent` es el elemento 'Anchor' mismo).

Esto no es exactamente lo que queremos: el texto debería verse en el campo de entrada. Este campo de entrada tiene el id "entry" y Brython obtiene una referencia a este elemento mediante `document["entry"]`. La función de respuesta puede ser cambiada a lo siguiente:

    def callback(ev):
        document["entry"].value += ev.target.text

Esto está bien para la mayoría de las teclas pero debemos gestionar aquellas que se supone que calculan un resultado. El código completo de *calculator.py* mostrado más abajo debería ser autoexplicativo:

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
