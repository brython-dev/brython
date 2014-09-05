## Query string

**browser**.`document` soporta el atributo `query`, que devuelve la cadena pedida como un objeto con los siguientes atributos y métodos :

- <code>document.query[<i>key</i>]</code> : devuelve el valor asociado con _`key`_. Si una clave tiene m&aacute;s de un valor (caso, por ejemplo, de etiquetas SELECT con el atributo MULTIPLE o para etiquetas `<INPUT type="checkbox">`), devuelve una lista de los valores. Se obtendr&aacute; un `KeyError` si no hay valor asociado con la clave

- <code>document.query.getfirst(<i>key[,default]</i>)</code> : devuelve el primer valor para _`key`_. Si no existe un valor asociado con la clave, devolver&aacute; _`default`_ si se le proporciona, en otros casos devolver&aacute; `None`

- <code>document.query.getlist(<i>key</i>)</code> : devuelve la lista de valores asociados con _`key`_ (devolver&aacute; una lista vacia en el caso de que no haya valor asociado a la clave)

- <code>document.query.getvalue(<i>key[,default]</i>)</code> : mismo comportamiento que `doc.query[key]`, pero devuelve _`default`_ o `None` si no hay valor asociado a la clave
