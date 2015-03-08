módulo **browser.svg**
----------------------

Para criar gráficos no formato SVG, suportado pela maioria dos
navegadores, use o módulo **browser.svg**. Ele contém os nomes dos
componentes disponíveis para desenhar formas e escrever texto.

O módulo define os seguintes nomes: <code>a, altGlyph, altGlyphDef,
altGlyphItem, animate, animateColor, animateMotion, animateTransform,
circle, clipPath, color_profile, cursor, defs, desc, ellipse, feBlend,
g, image, line, linearGradient, marker, mask, path, pattern, polygon,
polyline, radialGradient, rect, stop, svg, text, tref, tspan, use</code>.

Por exemplo, se o documento HTML tem uma zona de gráfico SVG definida
por:

>    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
>        width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
>      <g id="panel">
>      </g>
>    </svg>

você pode inserir formas e texto:
<table>
<tr>
<td>
    from browser import doc, svg
    title = svg.text('Title',x=70,y=25,font_size=22,
        text_anchor="middle")
    circle = svg.circle(cx="70",cy="120",r="40",
        stroke="black",stroke_width="2",fill="red")
    
    panel = doc['panel']
    panel <= title
    panel <= circle
</td>
<td>
<button id="run_svg">click !</button>
</td>

<td>
<script type="text/python">
def run_svg(ev):
    title = svg.text('Título',x=70,y=25,font_size=22,
        text_anchor="middle")
    circle = svg.circle(cx=70,cy=120,r=40,stroke="black",
        stroke_width=2,fill="red")
    
    panel = doc['panel']
    panel <= title
    panel <= circle

doc['run_svg'].bind('click', run_svg)
</script>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel">
  </g>
</svg>
</td>

</tr>

</table>

No exemplo acima, criamos um elemento de texto e um elemento de
círculo. Para uma lista de referência de nomes de cores visite este
[link](http://www.w3.org/TR/SVG/types.html#ColorKeywords)

<p>
Abaixo criamos um retângulo azul, largura e altura de 40 px.
</p>

<table>
<tr>
<td>
    from browser import doc, svg
    rect = svg.rect(x="40",y="100", width="40", height="40",
        stroke_width="2",fill="blue")
    
    panel = doc['panel1']
    panel <= rect
</td>
<td>
<button id="run_svg1">click !</button>
</td>

<td>
<script type="text/python">
from browser import doc, svg
def run_svg1(ev):
    rect = svg.rect(x="40",y="100", width="40", height="40",
        stroke_width="2",fill="blue")
    
    panel = doc['panel1']
    panel <= rect

doc['run_svg1'].bind('click', run_svg1)
</script>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel1">
  </g>
</svg>
</td>

</tr>

</table>

Abaixo, um exemplo de um elipse verde:

<table>
<tr>
<td>
    from browser import doc, svg
    ellipse = svg.ellipse(cx="70",cy="100", rx="40", ry="80",
        stroke="black",stroke_width="2",fill="green")
    
    panel = doc['panel2']
    panel <= ellipse
</td>
<td>
<button id="run_svg2">click !</button>
</td>

<td>
<script type="text/python">
from browser import doc, svg
def run_svg2(ev):
    ellipse = svg.ellipse(cx="70",cy="100", rx="40", ry="80",
        stroke="black",stroke_width="2",fill="green")
    
    panel = doc['panel2']
    panel <= ellipse

doc['run_svg2'].bind('click', run_svg2)
</script>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel2">
  </g>
</svg>
</td>

</tr>

</table>


Aqui um exemplo de uma linha marrom com comprimento de 100 pixels:


<table>
<tr>
<td>
    from browser import doc, svg
    line = svg.line(x1="40",y1="50", x2="40", y2="150",
                    stroke="brown",stroke_width="2")
    
    panel = doc['panel3']
    panel <= line
</td>
<td>
<button id="run_svg3">click !</button>
</td>

<td>
<script type="text/python">
from browser import doc, svg
def run_svg3(ev):
    line = svg.line(x1="20",y1="100", x2="100", y2="20",
                    stroke="brown",stroke_width="2")
    
    panel = doc['panel3']
    panel <= line

doc['run_svg3'].bind('click', run_svg3)
</script>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel3">
  </g>
</svg>
</td>

</tr>

</table>



Aqui um exemplo de um polígono (uma estrela vermelha com contorno azul):

<table>
<tr>
<td>
    from browser import doc, svg
    star = svg.polygon(fill="red", stroke="blue", stroke_width="10",
                       points=""" 75,38  90,80  135,80  98,107
                                 111,150 75,125  38,150 51,107
                                  15,80  60,80""")
    
    panel = doc['panel4']
    panel <= star
</td>
<td>
<button id="run_svg4">click !</button>
</td>

<td>
<script type="text/python">
from browser import doc, svg
def run_svg4(ev):
    star = svg.polygon(fill="red", stroke="blue", stroke_width="2",
                       points=""" 75,38  90,80  135,80  98,107
                                 111,150 75,125  38,150 51,107
                                  15,80  60,80""")
    
    panel = doc['panel4']
    panel <= star

doc['run_svg4'].bind('click', run_svg4)
</script>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel4">
  </g>
</svg>
</td>

</tr>

</table>


Aqui um exemplo de um retângulo animado:

<table>
<tr>
<td>
    from browser import doc, svg
    rect = svg.rect(x=0, y=10, width=100, height=100)
    rect <= svg.animate(attributeName="x", From=-100, to=120,
                        dur="10s", repeatCount="indefinite")
    
    panel = doc['panel5']
    panel <= rect
</td>
<td>
<button id="run_svg5">click !</button>
</td>

<td>
<script type="text/python">
from browser import doc, svg
def run_svg5(ev):
    rect = svg.rect(x=10, y=10, width=100, height=100)
    rect <= svg.animate(attributeName="x", From=-100, to=120, attributeType="XML",
                        dur="10s", repeatCount="indefinite")
    
    panel = doc['panel5']
    panel <= rect

doc['run_svg5'].bind('click', run_svg5)
</script>

<svg id="panel5" xmlns="http://www.w3.org/2000/svg" 
  viewPort="0 0 120 120"
  width="120" height="200" 
  style="border-style:solid;border-width:1;border-color:#000;">
</svg>
</td>

</tr>

</table>

Para informações mais detalhadas sobre formas SVG, seus atributos etc
veja a
[Documentação de Formas SVG](http://www.w3.org/TR/SVG/shapes.html)
