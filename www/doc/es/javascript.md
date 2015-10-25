módulo **javascript**
---------------------

El módulo **javascript** permite la interacción con objetos definidos en otros programas o librerías 
escritos en javascript presentes en la misma página donde se encuentra el script Brython

Define dos clases y una función:

**javascript**.`JSConstructor`
> es una clase cuyas instancias representan constructores Javascript, (ie funciones usadas con la 
 palabra clave en Javascript `new`)

> <code>JSConstructor(_jsconstr_)</code> devuelve un objeto Brython. Este objeto permite llamadas; 
> devuelve el objeto construido por el constructor *jsconstr*, transformado en un objeto Python 
> de acuerdo a la tabla de conversión en <a href="jsojects.html">objetos y librerías Javascript</a>.


**javascript**.`JSObject`
> Clase para objetos Javascript que pueden convertirse "de forma natural" "naturally" a objetos Python
> cuando se referencian como atributos de `browser.window`. Esta clase
> se usa internamente por Brython y no debería ser usada en scripts.

> Ver <a href="jsojects.html">objetos y librerías Javascript</a>.

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

Ejemplo
-------

Usando `JSConstructor` con la librería javascript three.js:

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )

> Ver [three](../../gallery/three.html) para ver el ejemplo en acción
