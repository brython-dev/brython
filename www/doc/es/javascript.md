módulo **javascript**
---------------------

El módulo **javascript** permite la interacción con objetos definidos en otros programas o librerías 
escritos en javascript presentes en la misma página donde se encuentra el script Brython

**javascript**.`py2js(`_src_`)`
> Devuelve el código Javascript generado por Brython a partir del código fuente Python _src_.

**javascript**.`this()`
> Devuelve el objeto Brython equivalente al objeto Javascript `this`. Puede ser útil cuando se usan frameworks 
> Javascript, e.g. cuando una función _callback_ usa el valor de `this`.

El módulo también permite usar objetos definidos mediante el lenguaje Javascript.
Por favor, usa la documentación de esos objetos.

**javascript**.`Date` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
> Constructor de objetos date / time (fecha / hora).

<blockquote>
```python
from javascript import Date

date = Date.new(2012, 6, 10)
print(date.toDateString())
```
</blockquote>

**javascript**.`JSON` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
> Objeto para convertir desde y hacia objetos JSON. expone dos funciones:

>> `stringify`: serializa objetos simples (diccionarios, listas, tuplea,
>> enteros, reales, strings)

>> `parse`: conversión de un *string* con formato JSON a un objeto simple

**javascript**.`Math` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
> Objeto para funciones matemáticas y constantes.

**javascript**.`Number` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> Constructor para objetos de tipo "number".

**javascript**.`RegExp` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
> Constructor de objetos "regular expression", usando la sintaxis específica de Javascript
> la cual no es totalmente idéntica a la disponible en Python.
> El método `exec()` de las instancias de esta clase se puede aplicar a *strings* Python:
<blockquote>
```python
from javascript import RegExp

re = RegExp.new(r"^test(\d+)$")
print(re.exec("test44"))
```
</blockquote>

**javascript**.`String` [doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
> Constructor de objetos Javascript de tipo "string". Se debe usar para llamar
> a métodos que aceptan expresiones regulares Javascript como parámetros:
<blockquote>
```python
from javascript import RegExp, String

re = RegExp.new(r"^test(\d+)$")
print(String.new("test33").search(re))
```
</blockquote>