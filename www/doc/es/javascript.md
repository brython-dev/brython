módulo **javascript**
---------------------

El módulo **javascript** permite la interacción con objetos definidos en otros programas o librerías 
escritos en javascript presentes en la misma página donde se encuentra el script Brython

**javascript**.`py2js(`_src_`)`

> Devuelve el código Javascript generado por Brython a partir del código fuente Python _src_.

**javascript**.`this()`

> Devuelve el objeto Brython equivalente al objeto Javascript `this`. Puede ser útil cuando se usan frameworks 
> Javascript, eg cuando una función _callback_ usa el valor de `this`.
