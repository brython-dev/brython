module **browser.svg**
----------------------

Pour créer des graphiques au format SVG, supporté par la plupart des
navigateurs, on utilise le module intégré `svg`, qui contient les noms des
éléments disponibles pour tracer des formes ou écrire du texte.

Le module définit les noms suivants : <code>a, altGlyph, altGlyphDef, altGlyphItem,
animate, animateColor, animateMotion, animateTransform, circle, clipPath,
color_profile, cursor, defs, desc, ellipse, feBlend, g, image, line,
linearGradient, marker, mask, path, pattern, polygon, polyline, radialGradient,
rect, stop, svg, text, tref, tspan, use</code>.

(Noter `color_profile` à la place de `color-profile`.)

Par exemple, si le document HTML possède une zone de graphique SVG définie par 

>    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
>        width="140" height="200" style="border-style:solid;border-width:1;border-color:#000;">
>      <g id="panel"></g>
>    </svg>

on peut intégrer des tracés et des textes par :

<table>
<tr>
<td>
```exec
from browser import document, svg

titre = svg.text('Titre', x=70, y=25, font_size=22,
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
  <g id="panel"></g>
</svg>
</td>
</tr>
</table>

Pour les attributs définis dans la norme SVG qui contiennent un tiret (-), il
faut le remplacer par un souligné (_) dans les arguments : *text\_anchor* au 
lieu de *text-anchor* qui provoquerait une erreur de syntaxe Python

Dans l'exemple ci-dessous nous avons créé un élément texte et un élément cercle.
Les mots-clés pour les couleurs sont accessibles sur [ce lien](http://www.w3.org/TR/SVG/types.html#ColorKeywords)
<p>
Ci-dessous nous créons un rectangle bleu, de hauteur et largeur égales à 40 px.
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

Ci-dessous un exemple d'ellipse verte:

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


Voici un exemple de ligne brune de longueur 100 pixels.

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



Voici un exemple de polygone (une étoile rouge avec une bordure bleue)

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


Et un exemple d'animation sur un rectangle:

<table>
<tr>
<td>
```exec
from browser import document, svg, timer

rect = svg.rect(x=10, y=10, width=100, height=100)

def move_rect():
    # les attributs de l'élément SVG sont des chaines, il faut les convertir
    # explicitement en entiers
    rect.y = int(rect.y)+1
    
    # termine l'animation quand le rectangle arrive à la cible
    if int(rect.y)>50:
        timer.clear_interval(loop)

panel = document['panel5']
panel <= rect

# initialise la boucle d'animation
loop = timer.set_interval(move_rect, 30)
```
</td>

<td>

<svg id="panel5" xmlns="http://www.w3.org/2000/svg" viewPort="0 0 120 120" width="120" height="200" style="border-style:solid;border-width:1;border-color:#000;">
</svg>
</td>

</tr>

</table>

Pour des informations plus détaillées sur les formes SVG, leurs attributs etc. voyez 
[SVG Shape Documentation](http://www.w3.org/TR/SVG/shapes.html)
