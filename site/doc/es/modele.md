Compilando y ejecutando
-----------------------

### Visión general

<table border=1 cellpadding =5>
<tr><td>Paso </td><td>llevado a cabo por</td></tr>
<tr>
<td>Leyendo código Python</td>
<td>función <code>brython(_debug\_mode_)</code> en __py2js.js__

Si el código es un fichero externo, se obtendrá mediante una llamada Ajax

Esta función crea las siguientes variables de entorno :

- `__BRYTHON__.$py_src` : objeto indexado mediante los nombres de los módulos, el valor es el código fuente del módulo
- `__BRYTHON__.$debug` : nivel de depuración
- `__BRYTHON__.exception_stack` : una lista de errores generados durante el 'parseo' o durante el tiempo de ejecución
- `__BRYTHON__.imported` : Objeto Javascript, mapeado de los módulos importados al objeto módulo 
- `__BRYTHON__.modules` : Objeto Javascript, mapeado de los nombres de los módulos a los objetos módulo
- `__BRYTHON__.vars` : Objeto Javascript, mapeado de los nombres de los módulos al diccionario de las variables definidas en el módulo

    
</td>

</tr>

<tr>
    
<td>Creación del árbol representando al código Python</td>
<td>función <code>\_\_BRYTHON\_\_.py2js(_source,module_)</code> in __py2js.js__

Esta función llama a :

- <code>$tokenize(_source_)</code> : análisis sintáctico de los tokens en el código fuente Python y en la construcción del árbol. ;

   Devuelve la raíz del árbol

- <code>transform(_root_)</code> : transforma el árbol para prepararlo para la conversión a Javascript (ver debajo)
- `$add_line_num()` para añadir números de línea en el caso de que el 'debug mode' sea superior a 0

La función `py2js` devuelve la raíz del árbol.
</td>
</tr>

<tr>
    
<td>generando código Javascript</td>
<td>método `to_js()` del árbol devuelto por `py2js`

Esta función llama de forma recursiva al método del mismo nombre y a todos los elementos sintácticos encontrados en el árbol. Devuelve la cadena que contiene el código Javascript resultante. Si el 'debug mode' es 2, esta cadena se mostrará en la consola del navegador.
</td>
</tr>

<tr>
    
<td>ejecutando código Javascript</td>
<td>evaluación mediante la función `eval()`
    
</td>
</tr>

</table>

### Fiicheros usados

El script __brython.js__ se genera mediante la compilación de varios scripts :

- __brython\_builtins.js__ : define el objeto `__BRYTHON__` que actúa como pasarela entre objetos Javascript nativos (`Date, RegExp, Storage...`) y Brython
- **version\_info.js** : creado por el script make_dist.py, añade información sobre la versión de Brython
- __py2js.js__ : realiza la conversión de código Python a código Javascript
- __py\_utils.js__ : funciones útiles (eg conversiones de tipos entre Javascript y Python)
- __py\_object.js__ : implementa la clase `object` de Python
- __py\_type.js__ : implementa la clase `type` de Python
- __py\_builtin\_functions.js__ : Python built-in functions
- __js\_objects.js__ : interfaz a los objetos y constructores Javascript
- __py\_import.js__ : implementación de _import_
- **py\_float.js**, **py\_int.js**, **py\_complex.js**, **py\_dict.js**, **py\_list.js**, **py\_string.js**, **py\_set.js** : implementación de las respectivas clases Python
- __py\_dom.js__ : interacción con el documento HTML (DOM)

### Más sobre traducción y ejecución

Traducción y ejecución de un script Brython mediante __py2js.js__ sigue los siguientes pasos :
<ol>
<li>Análisis sintáctico y creación del árbol

Este paso se basa en un autómata cuyo estado evoluciona con los tokens encontrados en el código fuente

El código Python se separa en tokens que pueden poseer los siguientes tipos : 

- keyword
- identificador
- literal (string, integer, float)
- operador
- period (.)
- colon (:)
- semi colon (;)
- par&eacute;ntesis / corchete ('bracket') / llave ('curly brace')
- asignación (signo igual =)
- decorador (@)
- fin de línea

Para cada token, Se produce una llamada a la función _$transition()_, devolverá un nuevo estado dependiendo del estado actual y del token

Cada instrucción en el código fuente encuentra un nodo en el árbol (una instancia de la clase _$Node_). Si una línea contiene más de una instrucción separadas por ":" (`def foo(x):return x`) o por ";" (`x=1;print(x)`), se crearán tantos nodos para esa línea

Cada elemento sintáctico (identificador, llamada a función, expresión, operador,...) es manejado mediante una clase : ver en el código fuente de __py2js.js__ entre `function $AbstractExprCtx` y `function $UnaryCtx`

En este paso, se puede informar de los errores : 

- errores sintácticos
- errores de indentación
- cadenas literales inacabadas
- falta de paréntesis / corchetes ('brackets') / llaves ('curly braces')
- caracteres ilegales
- Palabras clave Python no gestionadas por Brython

<li>Transformando el árbol

Para algunos elementos de la sintaxis Python, el árbol que representa el código fuente debe ser modificado (añadiendo ramas) antes de comenzar la traducción a Javascript. Esto se realiza mediante llamadas recursivas al método `transform()` desde el principio del árbol 

Por ejemplo, en el primer paso, el código Python <code>assert _condition_</code> produce una única rama del árbol. El segundo paso lo transforma a una rama <code>if not _condition_</code> y añade una rama hija con `raise AssertionError`

Los elementos que deben ser transformados de esta forma son : `assert`, cadenas (`x=y=0`) y asignaciones múltiples (`x,y=1,2`), `class, def, except, for, try`

Este paso se usa, además, para almacenar las variables declaradas mediante `global`

<li>Ejecutando código Javascript

En el momento de ejecución, el script generado puede hacer uso de :

- las clases definidas en _py\_objects.js, py\_dict.js, py\_string.js, py\_list.js, py\_set.js, py\_dom.js_
- funciones internas no accesibles desde Python (sus nombres siempre comienzan con $) ; la mayoría de ellas se definen en _$py\_utils.js_. Las más importantes son :

 - _$JS2Py_ : toma un solo argumento y devuelve :
  - el argumento sin cambiar si es un tipo soportado por Brython (i.e. si tiene un atributo clase ___class___)
  - una instancia de DOMObject (respectivamente DOMEvent) si el argumento es un objeto DOM (resp. evento)
  - una instancia de JSObject "envolviendo" al argumento en el resto de casos

 - _$MakeArgs_ llamado al inicio de cada función si su firma posee al menos un argumento. Crea un espacio de nombres basado en los argumentos de la función, llamando a la función `$JS2Py` en todos los argumentos
 - _$class\_constructor_ Se le llama para la definición de la clase
 - _$list\_comp_ se le llama para las comprensiones de listas
 - _$lambda_ se le llama para funciones anónimas definidas por `lambda`
 - _$test\_expr_ y _$test\_item_ se usan en la evaluación de condiciones combinadas mediante `and` o `or`

- las funciones definidas en el script __py\_import.js__ se usan para la gestión de los imports

