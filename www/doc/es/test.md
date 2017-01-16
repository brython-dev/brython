Pruebas y depuración y profiling
--------------------------------

### Pruebas interactivas

El sitio oficial de Brython o su copia disponible para descarga, incluye una consola donde se 
pueden hacer pruebas de c&oacute;digo Python

Ten en cuenta que el espacio de nombres no se 'refresca' cuando haces click en "run", 
debes recargar la p&aacute;gina para ello

Para las pruebas y la depuraci&oacute;n de Brython, se pueden encontrar una serie de scripts de prueba 
en la carpeta __tests__ ; puedes acceder a ellos pulsando el enlace "Test pages" en la consola y 
despu&eacute;s elegir los diferentes tests y ejecutarlos

### Depurando scripts

Cualquiera que sea el nivel de depuraci&oacute;n (debug mode), se informa en la consola del navegador 
de los errores sint&aacute;cticos (o en los lugares definidos mediante `sys.stderr`)

Por ejemplo, el c&oacute;digo

>    x = $a

genera el mensaje

>    SyntaxError: unknown token [$]
>    module '__main__' line 1
>    x = $a
        ^

Si seleccionamos el nivel de depuraci&oacute;n 1 en la llamada a la funci&oacute;n 
<code>brython(_debug\_mode_)</code>, las excepciones lanzadas durante el tiempo de ejecuci&oacute;n y no 
definidas por un `except` tambi&eacute;n producen un mensaje de error, tan similar como sea posible a 
aquel creado por Python3

Este código:

>    x = [1,2]
>    x[3]

genera:

>    IndexError: list index out of range
>    module '__main__' line 2
>    x[3]

### Depurando el código Javascript generado a partir de código Python

> TL;DR si deseas usar el depurador integrado en el navegador para ir paso a paso a través de tu 
> código javascript generado debes escribir `__debugger__` en tu código y abrir las herramientas para 
> desarrolladores.

Esta declaración es similar a la declaración javascript `debugger`.

Los navegadores modernos como FireFox y Google Chrome poseen depuradores integrados, estos 
depuradores permiten a los desarrolladores analizar el código paso a paso en las llamadas a funciones 
(como hace los depuradores en los IDEs)

Es posible depurar código javascript ccolocando breakpoints en los números de línea dentro de la pestaña 
"script" en las herramientas para desarrolladores.

El código javascript generado por Brython se crea al vuelo y no aparece en un fichero, afortunadamente, 
los navegadores han añadido una palabra clave especial al lenguaje javascript llamada `debugger`. Esta 
declaración añade un breakpoint en el script por lo que durante el tiempo de ejecución, si las 
herramientas para desarrolladores están abiertas detendrá la ejecución y comenzará una sesión
de depuración en ese punto.

Hemos añadido al intérprete Brython la keyword `__debugger__` que será traducida por el tokenizer 
a `debugger` lanzando el mismo proceso.

Para probarlo puedes ir al editor, teclear `__debugger__` en tu código, abrir las herramientas para 
desarrolladores (en chrome click-derecho + 'inspect element'), y, después click en 'run'.

Para aprender más sobre las herramientas para desarrolladores en chrome puedes visitar su documentación 
o este pequeño curso realizado por code school.


### Depurando código Python

Un simple viaje en el tiempo hacia adelante y hacia atrás ha sido implementado [aquí](../../tests/debugger.html)

En este momento solo soporta pasos de una línea.
Encontrarás documentación sobre como funciona cada función en el depurador (en caso de que quieras 
construirt sobre él)

De momento, solo programas específicos del lenguaje Python están soportados.

El depurador no soporta de forma completa las declaraciones de entrada; 
soportando únicamente entradas con un string literal para argumentos (más sobre esto más abajo).


#### Depurador Brython para desarrolladores

El depurador ofrece 4 hooks (on_debugging_started, on_step_update, on_debugging_end, y 
on_debugging_error) que toman una llamada de respuesta (callback) que tú decides qué es lo que debe hacer.

La forma en la que trabaja el depurador en modo registro cuando se ejecuta `start_debugger` se realiza 
mediante el parseado de código Python y la generación de código javascript al cual se le inyecta una
función traza antes de la ocurrencia de cada $line_info (lo que requiere que Brython esté corriendo
en modo debug superior a 0).

Llamadas adicionales a la traza se inyectan al inicio del código antes de cada línea, 
apuntando a la primera línea; después de bucles while y al final del programa, para que apunte 
a las líneas correctas cuando se depura en el editor.

Debido a que el depurador no se ejecuta en vivo, pero se registra, desde el parseador se reemplazan las 
funciones de entrada a Brython con una traza de tipo entrada con los argumentos que se espera se pasen
a la función de entrada (actualmente solo soporta strings literales).

Después de la inyección de la traza el depurador ejecuta el código que posteriormente lanza 
 las llamadas a la traza mientras se ejecuta.

Cada línea de la llamada a la traza posee un estado como parámetro con el frame inicial y el número de línea y
lo registra. Antes de hacer lo anterior el estado previo del próximo número de línea se actualiza con el estado 
del número de línea actual; mientras se realiza cada paso en el editor, la siguiente línea, y no la línea actual,
es la que se muestra destaca.

Si la línea de traza es del tipo siguiente o eof su estado no se registrará.

Si una traza de entrada es invocada una traza de línea de estado del tipo entrada será añadida y el
depurador parará la ejecución del código, empezando la sesión de depuración.

Cuando la traza de la línea de tipo entrada se alcanza se pide al usuario que introduzca su input basado
en la función de entrada de Brython, el resultado se registra y el programa se reejecuta.

Si no existe una entrada de la traza la sesión de depuración empezará después de que el código parseado se ejecute de forma normal.

El depurador se encuentra en desarollo activo y pueden producirse cambios en la API.

El depurador está disponible en el scope global y se encuentra accesible en el objeto `window` con el nombre `Brython_Debugger`.

Para ver un ejemplo del depurador en funcionamiento se puede visitar [aquí](../../tests/debugger.html)

Si quieres añadir puntos de llamada a la traza adicionales puedes usar la función `setTrace` 
accesible desde la API dentro de tu función (actualmente, debe accederse de forma global).

En las siguientes líneas se detalla la API pública del depurador. Puedes encontrar más detalles en el código www/tests/debugger/main.js

**Brython_Debugger**.`start_debugger()`
> Comienza la sesión de depurado, toma código para depurar además de 
> un flag booleano opcional para depurar en vivo o mediante registro. Actualmente, el depurado en vivo no se encuentra disponible
> y la depuración por defecto commienzo en modo registro. La función de llamada `on_debugging_started` será llamada
> al final de este paso.

**Brython_Debugger**.`stop_debugger()`
> una función que se puede llamar cuando se quiere finalizar la sesión de depuración, en este paso es cuando se llama a `on_debugging_end`

**Brython_Debugger**.`step_debugger()`
> Cuando se llama a esta función el depurador camina un paso hacia adelante en la sesión registrada

**Brython_Debugger**.`step_back_debugger()`
> Cuando se llama a esta función el depurador camina un paso hacia atrás en la sesión registrada

**Brython_Debugger**.`can_step(n)`
> Chequea si se puede dar un paso al punto indicado

**Brython_Debugger**.`set_step(n)`
> Busca un paso específico en la sesión de depuración registrada, toma un número como parámetro que va desde 0 hasta el último paso. 
> Si se introduce un número superior al del último paso no sucederá nada.

**Brython_Debugger**.`is_debugging()`
> devuelve si una sesión de depurado está activa.

**Brython_Debugger**.`is_recorded()`
> devuelve si una sesión de depurado está en modo registro.

**Brython_Debugger**.`is_last_step()`
> devuelve si el paso actual es el último.

**Brython_Debugger**.`is_first_step()`
> devuelve si el paso actual es el primero.

**Brython_Debugger**.`get_current_step()`
> devuelve un número indicando el paso actual.

**Brython_Debugger**.`get_current_frame()`
> devuelve el fram/estado actual (debería ser estado)

**Brython_Debugger**.`get_recorded_frames()`
> devuelve todos los estados registrados

**Brython_Debugger**.`set_trace_limit(Number)`
> El número máximo de pasos ejecutados antes de que el depurador salte, el valor por defecto es 10000.

**Brython_Debugger**.`set_trace(obj)`
> El objeto debería contener los datos que quieres para más tarde para que la función `set_trace`,
> no use nombres ya usados por el depurador, añade una llamada a la traza
> (a la que se llamará cuando se actualice el paso)

**Brython_Debugger**.`set_trace_call(string)`
> Cambia el nombre a la función `traceCall` que se inyecta al código javascript generado, 
> usado para registra el estado, el valor por defecto es `Brython_Debugger.set_trace`. 
> Para cambiarlo necesitarás llamar a la función, por lo que deberás ser cuidadoso y generalmente no será necesario.

**Brython_Debugger**.`on_debugging_started(cb)`
> cb será llamado después de que comience la sesión de depurado.

**Brython_Debugger**.`on_debugging_end(cb)`
> cb será llamado después de que finalice la sesión de depurado.

**Brython_Debugger**.`on_debugging_error(cb)`
> cb será llamado después de que ocurra un error de sintáxis o de ejecución.

**Brython_Debugger**.`on_step_update(cb)`
> cb será llamado cuando se cambie un estado usando `setState`.

### Profiling scripts

Para permitir el profiling debemos pasar la opción "profile" a la función `brython`:

> brython({'profile':1})

Cuando la opción `profile` es > 0 el compilador añade código opcional al código
Javascript generado que recolecta información del profiling. El módulo `profile` 
provee de acceso a esta finformación. Intenta proveer una interfaz similar al módulo
`profile` de la distribución estándar de CPython.

La diferencia más notable es que no permite temporizadores definidos por 
el usuario y no hace calibración. Métodos que en el módulo estándar guardan la información 
a un fichero en Brython se guardan en el *local storage* del navegador usando
una versión JSON.

#### Uso básico:

>       from profile import Profile
>
>       p = Profile()
>       p.enable()
>       do_something()
>       do_something_else()
>       p.create_stats()

Que mostrará en pantalla algo como:

>           1 run in 0.249 seconds
>
>       Ordered by: standard name (averaged over 1 run)
>
>       ncalls  tottime  percall  cumtime  var percall  module.function:lineno
>        101/1    0.023    0.000    1.012        0.010               .fact:180

donde cada línea corresponde a una función y las diferentes columnas corresponden a

    ncalls      es el número total de veces que la función ha sido llamada
                (si la función fue llamada de forma no recursiva, el segundo número
                después del *backslash* indica cuantas llamadas fueron de primer nivel
                en la recursión)

    tottime     es el tiempo total (en segundos) usado en la función sin incluir sub-llamadas

    percall     es el tiempo promedio usado en la función por llamada, sin incluir sub-llamadas

    cumtime     es el tiempo total usado en la función incluyendo subllamadas

    var percall es el tiempo promedio usado en la función por una llamada no recursiva

    standard name es el nombre de la función en la forma module.function_name:line_number

Opcionalmente se puede usar la siguiente forma, obteniendo ventaja de correr el código
varias veces y promediándolo:

>       from profile import Profile
>
>       p = Profile()
>       p.call(function_to_profile,200,arg1,arg2,kwarg1=v1)

que mostrará en pantalla algo como:

>           200 runs in 0.249 seconds
>
>       Ordered by: standard name (averaged over 1 run)
>
>       ncalls  tottime  percall  cumtime  var percall  module.function:lineno
>        101/1    0.023    0.000    1.012        0.010  function_to_profile:16

Los datos recolectados en el *profiling* se pueden guardar en el *local storage* para poder ser usados posteriormente:

>        p.dump_stats('run1')

Los datos de un *profiling* se pueden leer de vuelta también:

>        data = Stats('run1')

Y se pueden agregar conjuntamente

>        data.add(p.dump_stats())
>        print(data)
