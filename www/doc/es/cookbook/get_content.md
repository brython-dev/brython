Problema
--------
Obtener el contenido de un elemento de la p&aacute;gina


Solución
--------

<table width="100%">
<tr>
<td style="width:50%;">

### Mostrar texto

```exec
from browser import alert, document

# document['zone'] is the colored cell
alert(document['zone'].text)
```

### Mostrar código HTML

```exec
from browser import alert, document
alert(document['zone'].html)
```

### Mostrar texto introducido

```exec
from browser import alert, document
# document['entry'] es el campo de entrada
alert(document['entry'].value)
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
<B>Contenido de la celda</B><p>
<INPUT id="entry" value="campo de entrada">
</td>
</tr>
</table>

Cada elemento en la página posee un atributo `text`, una cadena con el testo mostrado en el elemento

Además, posee un atributo `html`, una cadena con el código HTML dentro del elemento

Los campos de entrada poseen un atributo `value`, una cadena con el valor actual del campo de entrada

`alert()` es una función definida en el módulo **browser** que muestra su argumento en una ventana emergente (popup window)
