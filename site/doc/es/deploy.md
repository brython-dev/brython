Desplegando una aplicación Brython en un servidor
--------------------------------------------------------

Para hacer un despliegue en un servidor web accesible a los usuarios de tu aplicación no es necesario instalar todo el entorno de desarrollo

En la [página de descargas](https://github.com/brython-dev/brython/releases), elige uno de los archivos (zip, gz or bz2) llamado _Brython-YYYYMMDD-HHMMSS_ ; desempaquétalo y sube el contenido a la carpeta donde quieres instalar tu aplicación Brython. 

Este paquete solo contiene la distribución Brython : __brython.js__ y las librerías 'built-in' integradas que se encuentran en las carpetas __libs__ y __Lib__

Deploying without installing
----------------------------

Una solución más directa sería no instalar nada en el servidor y llamar a todo el entorno Python disponible en la página brython.info :

    <script src="http://brython.info/src/brython_dist.js"></script>

El inconveniente de esta método es el tamaño de la distribución a descargar, que incluye la librería estándar.

