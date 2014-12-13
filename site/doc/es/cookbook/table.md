Problema
--------

Crear una tabla HTML


Solución
--------

En este ejemplo y en el siguiente solo vamos a mostrar el script Python ; el 
código HTML asociado es similar al mostrado en los ejemplos previos

Para crear una tabla usamos las siguientes etiquetas HTML : `TABLE` (la 
tabla), `TR` (una fila de la tabla),`TH` (una celda cabecera) and `TD` (una 
celda)

La tabla está hecha por filas, cada fila se compone de celdas ; la primera 
fila suele dedicarse a 'celdas cabecera' que describen el valor de la columna

Aquí podéis ver un ejemplo simple :

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
from browser.html import TABLE, TR, TH, TD
table = TABLE()
row = TR() # create a row
# add header cells
row <= TH("País")
row <= TH("Capital")
table <= row # add the row to the table

# add a row
row = TR()
row <= TD("Estados Unidos")+TD("Washington")
table <= row

# erase initial content
document['zone'].clear()

# insert table in the element
document['zone'] <= table
```exec

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenido 
inicial<p>
</td>
</tr>
</table>

Podemos construir una tabla a partir de una lista de listas :

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
from browser.html import TABLE, TR, TH, TD

lines = [ ['Morrissey','vocalista'],
    ['Johnny Marr','guitarrista'],
    ['Mike Joyce','batería'],
    ['Andy Rourke','bajista']
    ]
t = TABLE()
for line in lines:
    t <= TR(TD(line[0])+TD(line[1]))
document['zone1'].text = ''
document['zone1']<= t
```
</td>
<td id="zone1" style="background-color:#FF7400;text-align:center;">Contenido 
inicial<p>
</td>
</tr>
</table>
