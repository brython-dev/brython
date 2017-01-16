Opciones de la función `brython()`
----------------------------------

Para ejecutar scripts Python en la página, deberás llamar a la función `brython()` cuando se cargue la página.

`<body onload="brython(`*[options]*`)">`

*options* puede ser un número entero, en este caso indicará el nivel de depuración a usar:

- 0 (valor por defecto) : sin depuración. Usa esta opción cuando la aplicación ya ha sido depurada, aumentará ligeramente la ejecución del código
- 1 : los mensajes de error se muestran en la consola del navegador (o a un lugar determinado mediante `sys.stderr`)
- 2 : la traducción de código Python a Javascript se muestra en la consola del navegador
- 10 : la traducción del código Python y de los módulos importados se mostrará en la consola del navegador

*options* puede ser un objeto Javascript, sus palabras clave pueden ser:

- *debug* : nivel de depuración (ver más arriba).
- *static\_stdlib\_import* : booleano, indica si, para importar módulos o paquetes de la librería estándar, la tabla estática de mapeo en el script script **stdlib_paths.js** debería ser usada. El valor por defecto es `true`.
- *pythonpath* : una lista de rutas (*paths*) donde se debería buscar a los módulos importados.
- *ipy_id* : por defecto, la función `brython()` ejecuta todos los scripts de la página. Esta opción permite especificar una lista de elementos con determinada `id` (atributo `id` de una etiqueta HTML) cuyo contenido de texto pueda ser ejecutado como código Python. Ver [brythonmagic](https://github.com/kikocorreoso/brythonmagic) para más información.
- *profile* : Cuando la opción `profile` es > 0 el compilador añade código opcional al código Javascript generado que recolecta información del profiling. El módulo `profile` provee de acceso a esta finformación. Intenta proveer una interfaz similar al módulo `profile` de la distribución estándar de CPython. Ver (Pruebas, depuración y profiling)[http://brython.info/static_doc/es/test.html] para más información


Ejemplo de uso de las opciones de la función `brython`:
-------------------------------------------------------

>    brython({debug:1, ipy_id:['hello']})

ejecutará el contenido del elemento con id "hello" y el nivel de depuración será 1.
