El paquete **browser** agrupa los nombres y módulos que son específicos de Brython

**browser**.`alert(`_mensaje_`)`
> una función que muestra el _mensaje_ en una ventana emergente (pop-up window). Devuelve `None`

**browser**.`confirm(`_mensaje_`)`
> una función que muestra el _message_ en una ventana mostrando, además, dos botones (ok/cancel). Devuelve `True` si se pulsa 'ok', `False` si se pulsa 'cancel'

**browser**.`console`
> un objeto con métodos para interactuar con la consola del navegador. Su interfaz es específica de cada tipo de navegador. Permite acceder, al menos, al método `log(msg)`, el cual muestra el _msg_ en la consola. Otros métodos dependerán del navegador que se esté usando.

**browser**.`document`
> un objeto que representa el documento HTML  que se muestra en la ventana del navegador. La interfaz de este objeto se encuentra descrita en la sección "Browser interface"

**browser**.`DOMEvent`
> la clase de los eventos del DOM

**browser**.`DOMNode`
> la clase de los nodos del DOM

**browser**.`load(`_script\_url_`)`
> Carga el script Javascript en la dirección _script\_url_ .

> Esta función usa una llamada Ajax bloqueante. Se debe usar cuando uno no puede cargar
> la librería Javascript en la página html mediante
> `<script src="prog.js"></script>`.

> Los nombres insertados por la librería en el espacio global de nombres Javascript
> están disponibles en el script Brython como atributos del objeto `window`.

> Por ejemplo, el módulo **jqueryui** en la librería estándar de Brython
> provee de una interfaz a la librería Javascript jQueryUI. Para usarlo en un
> script Brython simplemente escribe `import jqueryui` sin insertar las
> librerías Javascript en la página. Es el módulo **jqueryui** el encargado
> de cargarlas, usando la función `load()`.

**browser**.`prompt(`_mensaje[,default]_`)`
> una función que muestra el _mensaje_ en una ventana y un campo de entrada.
> Devuelve el valor que se ha introducido en el campo de entrada ; si no se ha
> introducido ningún valor devuelve el valor _default_ en caso de que haya sido
> definida y devuelve una cadena vacia en caso de que no haya sido definida.

**browser**.`window`
> un objeto que representa la ventana del navegador
