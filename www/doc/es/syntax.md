Brython implementa Python version 3, basado en la 
[referencia del lenguaje Python](https://docs.python.org/3/reference/index.html)


La implementación tiene en cuenta las limitaciones de los navegadores, en particular
aquellas relacionadas con el sistema de ficheros. La escritura es imposible y la lectura está
limitada a aquellas carpetas accesibles mediante una petición Ajax.

 Keywords y funciones integradas (built-in functions)
----------------------------------------------------

Brython soporta la mayor parte de keywords y funciones de Python 3 :

- keywords : `and, as, assert, async, await, break, class, continue, def, del, `
  `elif, else, except, False, finally, for, from, global, if, import, in, is, `
  `lambda, None, nonlocal, not, or, pass, raise, return, True, try, while, with, yield`
- funciones y clases integradas : `abs, all, any, ascii, bin, bool, bytes,`
  `callable, chr, classmethod, delattr, dict, dir, divmod, `
  `enumerate, eval, exec, filter, float, frozenset, getattr, `
  `globals, hasattr, hash, hex, id, input, int, isinstance, `
  `iter, len, list, locals, map, max, memoryview, min, `
  `next, object, open, ord, pow, print, property, range, `
  repr, reversed, round, set, setattr, slice, sorted, str, `
  `sum, super, tuple, type, vars, zip, __import__`

Algunas de las características y limitaciones impuestas por el navegador y Javascript :

- Las funciones Javascript no pueden bloquear la ejecución durante un tiempo dado o
  esperar a que suceda un evento antes de ir a la siguiente instrucción. Por esta razón:

 - `time.sleep()` no se puede usar: las funciones como `set_timeout()` or `set_interval()`
   en el módulo **browser.timer** son las que deberían usarse.

 - La función *built-in* `input()` se simula mediante la función Javascript
 `prompt()`

- Por la misma razón y también porque el navegador posee su propio event loop
  implícito el módulo `asyncio` de CPython no se puede usar. El módulo 
  [**`browser.aio`**](aio.html) de Brython es lo que se proporciona para el asincronismo.
  programming.

- la función built-in `open()` toma como argumento la url del fichero a
  abrir. Debido a que se abre mediante una llamada Ajax, el fichero debe estar en el mismo dominio que
  el script que lo llama. El objeto devuelto por `open()` dispone de los métodos de lectura y acceso
  habituales : `read, readlines, seek, tell, close`. Solo es posible usar el modo texto:
  la llamada Ajax es bloqueante y de esto modo el atributo `responseType` no se puede definir.

- por defecto, `print()` mostrará la salida en la consola del navegador de la misma forma que sucede
  con los errores. `sys.stderr` y `sys.stdout` se pueden asignar a un objeto usando
  el método `write()` permitiendo la redirección del 'output' a una ventana o área texto.

- para abrir un diálogo de impresión (a una impresora), llama a `window.print`
  (`window` se encuentra definido en el módulo **browser**)

- la función *built-in* `input()` está implementada con la función bloqueante del navegador
  _prompt()_. Debido a que no se pueden definir funciones bloqueantes en Javascript,
  `sys.stdin` es de solo lectura. Un ejemplo de la galería muestra como simular
  una función de entrada en una caja de diálogo a medida.

- el ciclo de vida de los objetos se gestiona mediante el recolector de basura (garbage collector)
  de Javascript, Brython no gestiona el conteo de referencias (reference counting) como sí hace CPython.
  Por tanto,  no se llama al método `__del__()` cuando una instancia de una clase no se vuelve a referenciar.

- El parser JSON usado es el de Javascript ; debido a esto, los números reales
  que son iguales a enteros (e.g. 1.0) serán convertidos a enteros cuando se usa
  `json.dumps()`.

Valor Built-in `__name__`
-------------------------

La variable built-in `__name__` se fija al valor del atributo `id`
del script. Por ejemplo:

```xml
<script type="text/python" id="myscript">
assert __name__ == 'myscript'
</script>
```

Si 2 scripts poseen la misma `id`, se lanzará una excepción.

Para los scripts que no disponen de una `id` de forma explícita :

- Si ningún script tiene su `id` fijada a `__main__`, el primer script 'sin nombre' tendrá su `__name__` asociado a
 `__main__`. De esta forma, si solo hay un script en la página,
  será capaz de ejecutar los tests :

<blockquote>
```xml
<script type="text/python">
if __name__=='__main__':
    print('hello !')
</script>
```
</blockquote>

- Para el resto de scripts 'sin nombre', `__name__` se ajustará a un string aleatorio que comenzará
 por `__main__`
