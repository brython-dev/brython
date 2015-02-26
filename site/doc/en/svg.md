module **browser.svg**
----------------------

To create graphics in the SVG format, supported by most browsers, use the built-in module `svg`. It holds the name of the components available to draw forms or write text

The module defines the following names : <code>a, altGlyph, altGlyphDef, altGlyphItem, animate, animateColor, animateMotion, animateTransform, circle, clipPath, color_profile,  cursor, defs, desc, ellipse, feBlend, g, image, line, linearGradient, marker, mask, path, pattern, polygon, polyline, radialGradient, rect, stop, svg, text, tref, tspan, use</code>.

For instance, if the HTML document has an SVG graphics zone defined by

>    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
>        width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
>      <g id="panel">
>      </g>
>    </svg>

you can insert forms and text by :

<table>
<tr>
<td>
```exec
from browser import document, svg

titre = svg.text('Title', x=70, y=25, font_size=22,
                 text_anchor="middle")
cercle = svg.circle(cx=70, cy=120, r=40,
                    stroke="black",stroke_width="2",fill="red")
panel = document['panel']
panel <= titre
panel <= cercle
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

For the attributes defined in the SVG norm that contain a hyphen (-), it must
be replaced by an underscore (_) in the arguments : *text\_anchor* instead of
*text-anchor* which would raise a Python syntax error.



In the above example, we created a text element and a circle element.
For a list of color keywords reference this [link](http://www.w3.org/TR/SVG/types.html#ColorKeywords)
<p>
Below we create a blue rectangle, width and height of 40 px.
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

Below is an example of a green ellipse:

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


Here's an example of a brown line of length 100 pixels.

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

Here's an example of a polygon (a red star with a blue outline)

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
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="150" height="200" style="border-style:solid;border-width:1;border-color:#000;">
  <g id="panel4">
  </g>
</svg>
</td>

</tr>

</table>

Here's an example of animating a rectangle:

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

For more detailed information about SVG shapes, their attributes, etc see the
[SVG Shape Documentation](http://www.w3.org/TR/SVG/shapes.html)
