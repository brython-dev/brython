Mouse events
============

<script type="text/python">
from browser import doc, alert
</script>

The mouse-related events (movement, pressing a button) are

<table cellpadding=3 border=1>
<tr>
<td>*mouseenter*</td>
<td>A pointing device is moved onto the element that has the listener attached
</td>
</tr>
<tr><td>*mouseleave*</td><td>a pointing device is moved off the element that
has the listener attached</td></tr>

<tr><td>*mouseover*</td><td>a pointing device is moved onto the element that
has the listener attached or onto one of its children</td></tr>
<tr><td>*mouseout*</td><td>a pointing device is moved off the element that has
the listener attached or off one of its children</td></tr>

<tr><td>*mousemove*</td><td>a pointing device is moved over an element</td>
</tr>

<tr><td>*mousedown*</td><td>a pointing device button (usually a mouse) is
pressed on an element</td></tr>
<tr><td>*mouseup*</td><td>a pointing device button is released over an
element</td></tr>

<tr><td>*click*</td><td>a pointing device button has been pressed and
released on an element</td></tr>
<tr><td>*dblclick*</td><td>a pointing device button is clicked twice on an
element</td></tr>

</table>

Examples
--------

*mouseenter* and *mouseleave*

> these events are triggered when the mouse enters or leaves an element. If an
> element includes other ones, the event is triggered every time the mouse enters
> or leaves a child element

<table>
<tr>
<td>
<div id="yellow1" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue1" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td><div id="trace1">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
```exec_on_load
from browser import document

def mouseenter(ev):
    document["trace1"].text = f'entering {ev.currentTarget.id}'

def mouseleave(ev):
    document["trace1"].text = f'leaving {ev.currentTarget.id}'

for elt_id in ("yellow1", "blue1"):
    document[elt_id].bind('mouseenter', mouseenter)
    document[elt_id].bind('mouseleave', mouseleave)
```
</blockquote>
</td>
</tr>
</table>


*mouseover* and *mouseout*

> the difference with *mouseenter* and *mouseleave* is that once the mouse
> entered an element, the event is not triggered on its children elements

<table>
<tr>
<td>
<div id="yellow2" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue2" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td>
<div id="trace2">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>
<blockquote>
```exec_on_load
from browser import document

def mouseover(ev):
    document["trace2"].text = f'entering {ev.currentTarget.id}'

def mouseout(ev):
    document["trace2"].text = f'leaving {ev.currentTarget.id}'

for elt_id in ("yellow2", "blue2"):
    document["yellow2"].bind('mouseover', mouseover)
    document["yellow2"].bind('mouseout', mouseout)
```
</blockquote>
</td>
</tr>
</table>

*mousemove*

<table>
<tr><td>
<div id="green" style="padding:5px;background-color:#8F8;width:150px;">move
the mouse</div>
</td>
<td><div id="trace3">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
```exec_on_load
from browser import document

def mousemove(ev):
    document["trace3"].text = f"coordinates : {ev.x}, {ev.y}"

document["green"].bind("mousemove", mousemove)
```
</blockquote>
</td>
</tr>
</table>

`DOMEvent` instance attributes
------------------------------

For mouse events, the instance of `DOMEvent` has the following attributes

<table cellpadding=3 border=1>
<tr>
  <td>*button*</td>
  <td>indicates which button was pressed on the mouse to trigger the event</td>
</tr>
<tr>
  <td>*buttons*</td>
  <td>indicates which buttons were pressed on the mouse to trigger the event.

  Each button that can be pressed is represented by a given number (1  : Left
  button, 2  : Right button, 4  : Wheel button). If more than one button is
  pressed, the value of the buttons is combined to produce a new number. For
  example, if the right button (2) and the wheel button (4) are pressed, the
  value is equal to 2|4, which is 6
  </td>
</tr>

<tr>
  <td>*x*</td>
  <td>position of the mouse relatively to the left border of the window (in
  pixels)</td>
</tr>
<tr>
  <td>*y*</td>
  <td>position of the mouse relatively to the upper border of the window (in
  pixels)</td>
</tr>

<tr>
  <td>*clientX*</td>
  <td>the X coordinate of the mouse pointer in local (DOM content)
  coordinates</td>
</tr>
<tr>
  <td>*clientY*</td>
  <td>the Y coordinate of the mouse pointer in local (DOM content)
  coordinates</td>
</tr>

<tr>
  <td>*screenX*</td>
  <td>the X coordinate of the mouse pointer in global (screen)
  coordinates</td>
</tr>
<tr>
  <td>*screenY*</td>
  <td>the Y coordinate of the mouse pointer in global (screen)
  coordinates</td>
</tr>

</table>

