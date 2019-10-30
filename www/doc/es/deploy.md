Desplegando una aplicación Brython en un servidor
--------------------------------------------------------

La aplicación se puede desplegar subiendo todo el contenido del directorio
al servidor.

Desde la versión 3.4.0 es posible desplegar una aplicación Brython usando
la misma herramienta que se usa para los paquetes de CPython, i.e. `pip`.

Para ello, instala el paquete Brython (`pip install brython`),
abre una consola y en el directorio de la aplicación ejecuta:
```console
python -m brython --make_dist
```
Durante la primera ejecución el usuario deberá proporcionar la información requerida
para un paquete : su nombre, número de versión, etc. Esta información se almacena en un fichero
__brython_setup.json__ que se puede modificar a posteriori.

El comando creará un subdirectorio __\_\_dist\_\___ ; en este subdirectorio se incluye el script
__setup.py__ que se usa para crear el paquete para la aplicación y para desplegar
la misma en PyPI (Python Package Index).

Los usuarios podrían, después, instalar el paquete CPython usando el comando tradicional:
```console
pip install <nombre_aplicacion>
```
e instala la aplicación Brython en un directorio mediante:
```console
python -m <nombre_aplicacion> --install
```