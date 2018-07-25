Brython implementa Python version 3, basado en la [referencia del lenguaje Python](https://docs.python.org/3/reference/index.html)

La implementación tiene en cuenta las limitaciones de los navegadores, en particular
aquellas relacionadas con el sistema de ficheros. La escritura es imposible Writing is impossible y la lectura está
limitada a aquellas carpetas accesibles mediante una petición Ajax.

 Keywords y funciones integradas (built-in functions)
----------------------------------------------------

Brython soporta la mayor parte de keywords y funciones de Python 3 :

- keywords : `and, as, assert, async, await, break, class, continue, def, del, `
  `elif, else, except, False, finally, for, from, global, if, import, in, is, `
  ` lambda, None, nonlocal, not, or, pass, raise, return, True, try, while, with, yield`
- funciones y clases integradas : `abs, all, any, ascii, bin, bool, bytes,`
  `callable, chr, classmethod, delattr, dict, dir, divmod, `
  `enumerate, eval, exec, filter, float, frozenset, getattr, `
  `globals, hasattr, hash, hex, id, input, int, isinstance, `
  `iter, len, list, locals, map, max, memoryview, min, `
  `next, object, open, ord, pow, print, property, range, `
  repr, reversed, round, set, setattr, slice, sorted, str, `
  `sum, super, tuple, type, vars, zip, __import__`

Algunas de las características y limitaciones impuestas por el navegador y Javascript :

- la función built-in `open()` toma como argumento la url del fichero a
  abrir. Debido a que se abre mediante una llamada Ajax, el fichero debe estar en el mismo dominio que
  el script que lo llama. El objeto devuelto por `open()` dispone de los métodos de lectura y acceso
  habituales : `read, readlines, seek, tell, close`

- por defecto, `print()` mostrará la salida en la consola del navegador de la misma forma que sucede
  con los errores. `sys.stderr` y `sys.stdout` se pueden asignar a un objeto usando
  el método `write()` permitiendo la redirección del 'output' a una ventana o área texto.

- para abrir un diálogo de impresión (a una impresora), llama a `window.print`
  (`window` se encuentra definido en el módulo **browser**)

- `sys.stdin`, de momento, no ha sido implementado, sin embargo, existe la
  función integrada (built-in function) `input()` que abre un diálogo bloqueante
  de entrada (un 'prompt').

- el ciclo de vida de los objetos se gestiona mediante el recolector de basura (garbage collector)
  de Javascript, Brython no gestiona el conteo de referencias (reference counting) como sí hace CPython.
  Por tanto,  no se llama al método `__del__()` cuando una instancia de una clase no se vuelve a referenciar.

- funciones como `time.sleep()`, que bloquean la ejecución durante un tiempo dado
  o hasta que se 'dispara' un evento, no se gestionan debido a que no existe un equivalente
  en Javascript. En este caso, la aplicación debe ser escrita con las funciones
  del módulo **browser.timer** (eg `set_timeout()`,
  `set_interval()`), o mediante manejadores de eventos (método `bind()` de los elementos del DOM).


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
