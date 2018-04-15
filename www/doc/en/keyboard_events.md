Keyboard events
===============

<script type="text/python">
from browser import document, alert
</script>

Keyboard events are

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>triggered when the value of an &lt;input&gt; or &lt;textarea&gt;
element is modified, or the content of a `contenteditable` element is
modified
</td>
</tr>

<tr>
<td>*keydown*</td><td>fired when any key on the keyboard is pressed down</td>
</tr>

<tr><td>*keypress*</td><td>a key is pressed down and that key normally
produces a character value. For instance, when entering Ctrl+C, the event
*keypress* is only fired when the key C is pressed down, whereas *keydown* is
fired as soon as the Ctrl key is pressed</td></tr>

<tr><td>*keyup*</td><td>a key is released</td></tr>

</table>

`DOMEvent` object attributes
----------------------------

For keyboard events, the `DOMEvent` instance has the following attributes

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`
> `True` if the Alt (or Option, on Mac) key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Alt+&lt;key&gt; was entered, or just &lt;key&gt;
</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Alt key
<p><input id="altKey" value="" autocomplete="off">&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

# the entry field has the id "altKey"
def keypress(ev):
    document["traceAltKey"].text = f"altKey: {ev.altKey}"

document["altKey"].bind("keypress", keypress)
```
</td>
</tr>

<td>
`charCode`
> The Unicode reference number of the key

> This attribute is used only by the *keypress* event

> It is set to a different value if the Shift key is pressed or not
</td>
<td>
#### Example

Enter text in the entry below. Note that the character can be read by
`ch(ev.charCode)`

<input id="charCode" value="" autocomplete="off">&nbsp;
<span id="traceCharCode">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def charCode(ev):
    trace = document["traceCharCode"]
    char = chr(ev.charCode)
    trace.text = f"charCode: {ev.charCode}, character: {char}"

document["charCode"].bind("keypress", charCode)
```
</td>

<tr>
<td>
`ctrlKey`
> `True` if the Control key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Ctrl+&lt;key&gt;
> was entered, or just &lt;key&gt;</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Ctrl key

<input id="ctrlKey" value="" autocomplete="off">
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def keypress(ev):
    trace = document["traceCtrlKey"]
    trace.text = f"ctrlKey : {ev.ctrlKey}"
    ev.preventDefault()

document["ctrlKey"].bind("keypress", keypress)
```

Note that `ev.preventDefault()` is used to avoid the default behaviour of
some keyboard shortcuts using the Ctrl key.

</td>
</tr>

<tr>
<td>
`keyCode`
> A system and implementation dependent numerical code identifying the
> unmodified value of the pressed key

> The value doesn't change if the keys Alt, Ctrl or Shift are pressed

> Note that the result is not the same depending on the handled events
> *keydown*, *keyup* or *keypress*
</td>
<td>
#### Example

Enter text in the entry fields below. Note that the character can be read by
`ch(ev.charCode)` with the *keypress* event

with *keydown* <input id="keyCodeKeydown" value="" autocomplete="off">

<p>with *keypress* <input id="keyCodeKeypress" value="" autocomplete="off">
&nbsp;<span id="traceKeyCode">&nbsp;</span>

<p>with *keyup* <input id="keyCodeKeyup" value="" autocomplete="off">

#### Code

```exec_on_load
from browser import document

def keyCode(ev):
    trace = document["traceKeyCode"]
    trace.text = f"event {ev.type}, keyCode : {ev.keyCode}"
    ev.stopPropagation()

document["keyCodeKeydown"].bind("keydown", keyCode)
document["keyCodeKeypress"].bind("keypress", keyCode)
document["keyCodeKeyup"].bind("keyup", keyCode)
```
</td>
</tr>

<tr>
<td>
`shiftKey`
> `True` if the Shift key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Shift+&lt;key&gt;
> was entered, or just &lt;key&gt;</td>
</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Shift key

<input id="shiftKey" value="" autocomplete="off">
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def keypress(ev):
    trace = document["traceShiftKey"]
    trace.text = f"shiftKey : {ev.shiftKey}"

document["shiftKey"].bind("keypress", keypress)
```
</td>
</tr>

<tr>
<td>
`which`
> A system and implementation dependent numeric code identifying the
> unmodified value of the pressed key

> Note that the result is not the same depending on the handled events
> *keydown*, *keyup* or *keypress*
</td>
<td>
#### Example

Enter text in the entry below. Note that the character can be read by
`chr(ev.which)` for the *keypress* event


<table>
<tr>
<td>
with *keydown* <input id="whichKeydown" autocomplete="off">

<p>with *keypress* <input id="whichKeypress" autocomplete="off">

<p>with *keyup* <input id="whichKeyup" autocomplete="off">

 </td>
 <td>
 <span id="traceWhich">&nbsp;</span>
 </td>
 </tr>
 <tr>
 <td colspan=2>

#### Code

```exec_on_load
from browser import document

def which(ev):
    trace = document["traceWhich"]
    trace.html = f"event : {ev.type}<br>which: {ev.which}"
    if ev.type == "keypress":
        trace.html += f"<br>character : {chr(ev.which)}"

document["whichKeydown"].bind("keydown", which)
document["whichKeypress"].bind("keypress", which)
document["whichKeyup"].bind("keyup", which)
```
 </td>
 </tr>
 </table>
</td>
</tr>
</table>

