módulo **javascript**
---------------------

El módulo **javascript** permite la interacción con objetos definidos en otros programas o librerías 
escritos en javascript presentes en la misma página donde se encuentra el script Brython

**javascript**.`JSConstructor(`_constructor_`)`

> Clase cuyas instancias representan constructores Javascript, ie funciones usadas con la 
> palabra clave en Javascript `new`.

> <code>JSConstructor(_constructor_)</code> devuelve un objeto Brython. Este objeto permite llamadas; 
> devuelve el objeto construido por el constructor *constructor*, transformado en un objeto Python 
> de acuerdo a la tabla de conversión en <a href="jsojects.html">objetos y librerías Javascript</a>.

> _ALERTA : esta función dejará de estar mantenida desde la versión 3.1.1. En lugar de `py_class = JSConstructor(js_class)` usa `py_class = js_class.new`_

**javascript**.`JSObject(`_js\_object_`)`

> Clase para objetos Javascript que pueden convertirse "de forma natural" a objetos Python
> cuando se referencian como atributos de `browser.window`. Esta clase
> se usa internamente por Brython y no debería ser usada en scripts.

> Ver <a href="jsojects.html">objetos y librerías Javascript</a>.

> _ALERTA : esta función dejará de estar ,mantenida desde la versión 3.1.1. Los atributos del objeto `window` ya son instancias de la clase `JSObject`_

**javascript**.`load(`_script\_url[,names]_`)`

> Llama al script Javascript que se encuentra en la dirección _script\_url_ y carga el listado de
> _names_ en el espacio de nombres del programa.

> Esta función usa una llamada Ajax bloqueante. Debe ser usada cuando alguien no puede llamar 
> a la librería Javascript en la página html mediante 
> `<script src="prog.js"></script>`. 

> Por ejemplo, el módulo **jqueryui** en la librería estándar de Brython
> proporciona una interfaz con la librería Javascript jQueryUI. Para usarla en un script
> Brython, simplemente deberás escribir `import jqueryui` sin insertar las librerías
> Javascript en la página. Será el módulo **jqueryui** el que
> las cargará, usando esta función `load()`

> _ALERTA : esta función dejará de estar ,mantenida desde la versión 3.1.1. Usa la función `load` en el módulo **browser**_

**javascript**.`py2js(`_src_`)`

> Devuelve el código Javascript generado por Brython a partir del código fuente Python _src_.

**javascript**.`this()`

> Devuelve el objeto Brython equivalente al objeto Javascript `this`. Puede ser útil cuando se usan frameworks 
> Javascript, eg cuando una función _callback_ usa el valor de `this`.
