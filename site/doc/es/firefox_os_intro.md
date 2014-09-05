Escribiendo una Webapp para Firefox OS en Python con Brython
============================================================

Las aplicaciones para Firefox OS se escriben usando tecnologías web estándar: HTML5, CSS y un lenguaje de programación para los clientes web. Con [Brython](http://brython.info) los desarrolladores no están limitados a usar Javascript: pueden escribir aplicaciones móviles en Python.

El paso inicial sería configurar un entorno para poder ejecutar aplicaciones en Firefox OS. Lo más sencillo seria installar el [simulador de Firefox OS](https://developer.mozilla.org/en-US/docs/Tools/Firefox_OS_Simulator), un plugin para el navegador Firefox. Selecciona la última versión del sistema operativo.

Cuando hayas terminado con la instalaciónpodrás manejar el simulador en el navegador Firefox mediante Tools > Web Developer > App Manager (ver [usando el App Manager](https://developer.mozilla.org/en-US/Firefox_OS/Using_the_App_Manager#Using_a_Firefox_OS_Simulator_Add-on))

La aplicación Memos
-------------------

Para poder tener una primera aproximación de una webapp desarrollada con Brython, puedes descargar y desenpaquetar la aplicación [brython-firefoxOS-memo](https://bitbucket.org/brython/brython-firefoxos-memos) y seguir las instrucciones de instalación en el simulador de Firefox OS.

Los componentes de la aplicación incluyen:

- *server.py*: el servidor web integrado que se usa para instalar y correr la aplicación.

- *manifest.webapp* : este fichero será leído por el 'application manager' cuando la app alojada se añade al simulador. Es un fichero de texto con un objeto JSON que proporciona información importante sobre la aplicación a Firefox OS: su nombre y descripción, el launch_path (i.e. la url de la pantalla inicial de la aplicación), la ruta de los iconos instalados en la pantalla de inicio del simulador para la aplicación.

- *index.html* : la página inicial de la aplicación. Cargará una serie de hojas de estilo localizadas en el directorio raíz y en los subdirectorios *icons* y *style*. Todos estos ficheros CSS los proporciona el equipo de desarrollo de Firefox OS; las puedes obtener del sitio de desarrollo [Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks).

>*index.html* también carga el programa javascript *brython/brython_dist.js*. Este script permite desarrollar scripts en Python en lugar de en Javascript. Expone una función llamada `brython`  que se ejecuta cuando la página se ejecuta.

>    <body role="application" onload="brython(1)">

>Gracias a Brython, la lógica de la aplicación está escrita en Python en el script *memos.py*, el cual se cargará con *index.html* mediante

>    <script type="text/python" src="memos.py"></script>

- *memos.py* Python script normal, que se parsea, se traduce a Javascript y se ejecuta gracias a Brython. La mayor parte de la sintaxis Python 3 y muchos de los módulos de la librería estándar están soportados por Brython. Para la interfaz con el DOM, Brython proporciona módulos específicos agrupados en el paquete **browser**.

>Para obtener información de como usar Brython para desarrollo web puedes ver la [documentación oficial](http://brython.info)
