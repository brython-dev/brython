módulo **browser.svg**
----------------------

Para crear gráficos vectoriales (formato SVG), soportado por la mayoría de navegadores, puedes usar el módulo `browser.svg`. El nombre proviene de los componentes disponibles para dibujar formas y escribir texto

El módulo define los siguientes nombres : `a, altGlyph, altGlyphDef, altGlyphItem, animate, animateColor, animateMotion, animateTransform, circle, clipPath, color_profile,  cursor, defs, desc, ellipse, feBlend, g, image, line, linearGradient, marker, mask, path, pattern, polygon, polyline, radialGradient, rect, stop, svg, text, tref, tspan, use`

Por ejemplo, si el documento HTML posee una zona de gráficos SVG definida por

>    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
>        width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
>      <g id="panel">
>      </g>
>    </svg>

puedes insertar formas y texto :

<table>
<tr>
<td>
```exec
from browser import document, svg

titulo = svg.text('Titulo', x=70, y=25, font_size=22,
                 text_anchor="middle")
circulo = svg.circle(cx=70, cy=120, r=40,
                    stroke="black",stroke_width="2",fill="red")
panel = document['panel']
panel <= titulo
panel <= circulo
```
</td>

<td>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel">
  </g>
</svg>
</td>

</tr>

</table>

Para los atributos definidos en la norma SVG que contienen un guión (-), se deberá
reemplazar con un guión bajo (_) en los argumentos: *text\_anchor* en lugar de
*text-anchor* el cual mostraría un error de sintaxis Python.

En el ejemplo anterior hemos creado un elemento círculo y un elemento texto.
Para una lista de los colores puedes ver [esta referencia](http://www.w3.org/TR/SVG/types.html#ColorKeywords)
<p>
Abajo creamos un rectángulo azul con una anchura y una altura de 40 px.
</p>

<table>
<tr>
<td>
```exec
from browser import document, svg

rect = svg.rect(x="40",y="100", width="40", height="40",
    stroke_width="2",fill="blue")

panel = document['panel1']
panel <= rect
```
</td>
<td>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel1">
  </g>
</svg>
</td>

</tr>

</table>

Debajo puedes ver un ejemplo de una elipse verde:

<table>
<tr>
<td>
```exec
from browser import document, svg
ellipse = svg.ellipse(cx="70",cy="100", rx="40", ry="80",
    stroke="black",stroke_width="2",fill="green")

panel = document['panel2']
panel <= ellipse
```
</td>
<td>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel2">
  </g>
</svg>
</td>

</tr>

</table>


Aquí puedes ver un ejemplo  de una línea marrón de longitud 100 píxeles.

<table>
<tr>
<td>
```exec
from browser import document, svg

line = svg.line(x1="40",y1="50", x2="40", y2="150",
                stroke="brown",stroke_width="2")

panel = document['panel3']
panel <= line
```
</td>
<td>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel3">
  </g>
</svg>
</td>

</tr>

</table>

Un ejemplo de un polígono (una estrella roja con el contorno azul)

<table>
<tr>
<td>
```exec
from browser import document, svg

star = svg.polygon(fill="red", stroke="blue", stroke_width="10",
                   points=""" 75,38  90,80  135,80  98,107
                             111,150 75,125  38,150 51,107
                              15,80  60,80""")

panel = document['panel4']
panel <= star
```
</td>
<td>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel4">
  </g>
</svg>
</td>

</tr>

</table>

Ejemplo  de un rectángulo animado:

<table>
<tr>
<td>
```exec
from browser import document, svg, timer

rect = svg.rect(x=10, y=10, width=100, height=100)

def move_rect():
    # the attributes of the SVG element are strings, they must be explicitely
    # converted into integers
    rect.y = int(rect.y)+1
    
    # ends animation when the rectangle reaches its target
    if int(rect.y)>50:
        timer.clear_interval(loop)

panel = document['panel5']
panel <= rect

# initialise the animation loop
loop = timer.set_interval(move_rect, 30)
```
</td>
<td>
<svg id="panel5" xmlns="http://www.w3.org/2000/svg" viewPort="0 0 120 120" width="120" height="200" style="border-style:solid;border-width:1;border-color:#000;">
</svg>
</td>

</tr>

</table>

Para información más detallada de las formas SVG, sus atributos, etc, puedes ver la documentación
[SVG Shape](http://www.w3.org/TR/SVG/shapes.html)
