Usando objetos Javascript
-------------------------

Tenemos que manejar el periodo de transición en el que Brython va a coexistir con Javascript ;-)

### Accessing Brython objects from Javascript

Por defecto, Brython solo expone dos nombres en el espacio de nombres global de Javascript :

> `brython()` : la función que se ejecuta al cargarse la página

> `__BRYTHON__` : un objeto usado internamente por Brython para almacenar los objetos necesarios para ejecutar los scripts

Por tanto, por defecto, un programa Javascript no podría acceder a los objetos Brython.
Por ejemplo, para que la función `echo()` definida en un script Brython
reaccione a un evento en un elemento de la página, en lugar de usar la sintaxis javascript:

    <button onclick="echo()">

(debido a que la función _echo_ no es accesible directamente desde Javascript), la solución sería definir un atributo id al elemento:

    <button id="mybutton">

y definir un enlace entre este elemento y el evento _click_ mediante :

    from browser import document
    document['mybutton'].bind('click',echo)

Otra opción sería forzar la instroducción de la función _echo_ en el espacio de nombres de Javascript, definiéndola como un atributo del objeto `window` presente en el módulo **browser** :

    from browser import window
    window.echo = echo

<strong>NOTA: No se recomienda usar este segundo método ya que introduce un riesgo de conflicto con nombres ya definidos por otros programas o librerías Javascript usadas en la página.
</strong>

### Objetos en programas Javascript

Un documento HTML puede usar librerías o scripts Javascript, además de librerías y scripts Python. Brython no puede hacer uso de forma directa de los objetos Javascript : por ejemplo, la búsqueda de atributos usa el atributo  _\_\_class\_\__, que no existe para objetos Javascript

Para poder ser usados en un script Python, deben ser transformados explícitamente por la función _JSObject()_ definida en el módulo **javascript**

Por ejemplo :

    <script type="text/javascript">
    circle = {surface:function(r){return 3.14*r*r}}
    </script>
    
    <script type="text/python">
    from browser import document as doc
    from javascript import JSObject
    doc['result'].value = JSObject(circle).surface(10)
    </script>

### Usando constructores Javascript

Si una función Javascript es un objecto constructor, puede ser llamado en código Javascript mediante la palabra clave `new`, se podría usar en Brython transformando esa palabra clave en la función integrada `JSConstructor()` definida en el módulo **javascript**

<code>JSConstructor(_constr_)</code> 

>devuelve una función que cuando se la invoca con argumentos devuelve un objeto Python que corresponde al objeto Javascript creado mediante el constructor _constr_

Por ejemplo :

    <script type="text/javascript">
    function Rectangle(x0,y0,x1,y1){
        this.x0 = x0
        this.y0 = y0
        this.x1 = x1
        this.y1 = y1
        this.surface = function(){return (x1-x0)*(y1-y0)}
    }
    </script>
    
    <script type="text/python">
    from browser import alert
    from javascript import JSConstructor
    rectangle = JSConstructor(Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### jQuery example
    
En la siguiente porción de código tenemos un ejemplo más completo de cómo podrías usar la popular librería jQuery :

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
        from browser import document as doc
        from javascript import JSObject
        
        def change_color(ev):
          _divs=doc.get(selector='div')
          for _div in _divs:
              if _div.style.color != "blue":
                 _div.style.color = "blue"
              else:
                 _div.style.color = "red"
        
        # creating an alias for "$" in jQuery would cause a SyntaxError in Python
        # so we assign jQuery to a variable named jq

        jq = jQuery.noConflict(true)
        _jQuery=JSObject(jq("body"))
        _jQuery.click(change_color)    
    </script>
    
    <body onload="brython()">

      <div>Click here</div>
      <div>to iterate through</div>
      <div>these divs.</div>
     
    </body>
    </html>
