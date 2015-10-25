Brython implementa Python version 3, basado en la [referencia del lenguaje Python](https://docs.python.org/3/reference/index.html)
 
La implementación tiene en cuenta las limitaciones de los navegadores, en particular
aquellas relacionadas con el sistema de ficheros. La escritura es imposible Writing is impossible y la lectura está
limitada a aquellas carpetas accesibles mediante una petición Ajax.

Debido a las restricciones de Javascript, Brython soporta los enteros  de forma correctasolo en el rango
 [-2**53, 2**53]. Existe un módulo específico para programas qque manejan enteros
 de longitud arbitraria. 
 
 Keywords y funciones integradas (built-in functions)
----------------------------------------------------

Brython soporta la mayor parte de keywords y funciones de Python 3 :

- keywords : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, nonlocal, pass, return, True, try, while, with, yield`
- built-in functions : `abs(), all(), any(), ascii(), bin(), bool(), bytes(), callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), locals(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), super(), tuple(), type(), zip(), __import__()`

Por defecto, `print()` mostrará la salida en la consola del navegador de la misma forma que sucede con los errores. `sys.stderr` y `sys.stdout` se pueden asignar a un objeto usando el método `write()` permitiendo la redirección del 'output' a una ventana o área texto. 

`sys.stdin`, de momento, no ha sido implementado, sin embargo, existe la función integrada (built-in function) `input()` que abre un di&aacute;logo bloqueante de entrada (un 'prompt').

Para abrir un diálogo de impresión (a una impresora), llama a `window.print` (`window` se encuentra definido en el módulo **browser**)

Lo siguiente no ha sido implementado en la versi&oacute;n actual : 

- built-in functions `memoryview(), vars()`


Valor Built-in `__name__`
-------------------------

La variable built-in `__name__` se fija al valor del atributo `id`
del script. Por ejemplo:

```python
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
```python
<script type="text/python">
if __name__=='__main__':
    print('hello !')
</script>
```
</blockquote>

- Para el resto de script 'sin nombre', `__name__` se ajustará a un string aleatorio que comenzará 
 por `__main__`
