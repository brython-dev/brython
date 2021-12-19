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
`key`
> A string for the key pressed:

>> - the character if the key produces a character

>> - a string that describes the key for special keys (eg "Control" for the
>>   Ctrl key)

</td>
<td>
#### Example

Put the cursor in the input boxes below and hit keys on the keyboard

<table>
<tr>
<td>keydown</td>
<td><input id="key_keydown" autocomplete="off"></td>
<td rowspan="3"><span id="traceKey">&nbsp;</span></td>
</tr>
<tr>
<td>keypress</td>
<td><input id="key_keypress" autocomplete="off"></td>
</tr>
<tr>
<td>keyup</td>
<td><input id="key_keyup" autocomplete="off"></td>
</tr>
</table>

#### Code

```exec_on_load
from browser import bind, document

def keyevent(ev):
    trace = document["traceKey"]
    trace.text = f"type: {ev.type}, key: {ev.key}"
    ev.stopPropagation()

document["key_keydown"].bind("keydown", keyevent)
document["key_keypress"].bind("keypress", keyevent)
document["key_keyup"].bind("keyup", keyevent)
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
`code`
> a string that describes the physical keyboard touch that is hit

> this value is the same regardless of the character produced when hitting
> the key: for instance on an AZERTY keyboard, hitting key A will produce
> the code "KeyQ"
</td>
<td>
#### Example

Put the cursor in the entry fields below and hit random keys.

with *keydown* <input id="codeKeydown" value="" autocomplete="off">

<p>with *keypress* <input id="codeKeypress" value="" autocomplete="off">
&nbsp;<span id="traceKeyCode">&nbsp;</span>

<p>with *keyup* <input id="codeKeyup" value="" autocomplete="off">

#### Code

```exec_on_load
from browser import document

def keyCode(ev):
    trace = document["traceKeyCode"]
    trace.text = f"event: {ev.type}, code: {ev.code}"
    ev.stopPropagation()

document["codeKeydown"].bind("keydown", keyCode)
document["codeKeypress"].bind("keypress", keyCode)
document["codeKeyup"].bind("keyup", keyCode)
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


</table>

