Desplegando una aplicación Brython en un servidor
--------------------------------------------------------

La aplicación se puede desplegar subiendo todo el contenido del directorio
al servidor.

También puedes generar un fichero __brython_modules.js__ siguiendo las
indicaciones en la página [import](import.html), y desplegando solo :

- la página HTML con la aplicación
- los ficheros __brython.js__ y __brython_modules.js__
- Si hubiera, los scripts Python incluidos en la página mediante

    <script type="text/python" src="..."></script>

- el resto de ficheros usados por la aplicación (imágenes, sonidos, ficheros de texto, 
  hojas de estilo...) si los hubiera
