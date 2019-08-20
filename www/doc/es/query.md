## Query string

**browser**.`document` soporta el atributo `query`, que devuelve la cadena pedida como un objeto con los siguientes atributos y métodos :

- <code>document.query[<i>key</i>]</code> : devuelve el valor asociado con _`key`_. Si una clave tiene más de un valor (caso, por ejemplo, de etiquetas SELECT con el atributo MULTIPLE o para etiquetas `<INPUT type="checkbox">`), devuelve una lista de los valores. Se obtendrá un `KeyError` si no hay valor asociado con la clave

- <code>document.query.getfirst(<i>key[,default]</i>)</code> : devuelve el primer valor para _`key`_. Si no existe un valor asociado con la clave, devolverá _`default`_ si se le proporciona, en otros casos devolverá `None`

- <code>document.query.getlist(<i>key</i>)</code> : devuelve la lista de valores asociados con _`key`_ (devolverá una lista vacía en el caso de que no haya valor asociado a la clave)

- <code>document.query.getvalue(<i>key[,default]</i>)</code> : mismo comportamiento que `doc.query[key]`, pero devuelve _`default`_ o `None` si no hay valor asociado a la clave
