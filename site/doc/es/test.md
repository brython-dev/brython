Pruebas y depuraci&oacute;n
---------------------------

### Pruebas interactivas

El sitio oficial de Brython o su copia disponible para descarga, incluye una consola donde se pueden hacer pruebas de c&oacute;digo Python

Ten en cuenta que el espacio de nombres no se 'refresca' cuando haces click en "run", debes recargar la p&aacute;gina para ello

Para las pruebas y la depuraci&oacute;n de Brython, se pueden encontrar una serie de scripts de prueba en la carpeta __tests__ ; puedes acceder a ellos pulsando el enlace "Test pages" en la consola y despu&eacute;s elegir los diferentes tests y ejecutarlos

### Scripts de depuraci&oacute;n

Cualquiera que sea el nivel de depuraci&oacute;n (debug mode), se informa en la consola del navegador de los errores sint&aacute;cticos (o en los lugares definidos mediante `sys.stderr`)

Por ejemplo, el c&oacute;digo

    x = $a

genera el mensaje

    SyntaxError: unknown token [$]
    module '__main__' line 1
    x = $a
        ^

Si seleccionamos el nivel de depuraci&oacute;n 1 en la llamada a la funci&oacute;n <code>brython(_debug\_mode_)</code>, las excepciones lanzadas durante el tiempo de ejecuci&oacute;n y no definidas por un `except` tambi&eacute;n producen un mensaje de error, tan similar como sea posible a aquel creado por Python3

Este código:

    x = [1,2]
    x[3]

genera:

    IndexError: list index out of range
    module '__main__' line 2
    x[3]