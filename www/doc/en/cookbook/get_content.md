Problem
-------
Get the content of an element of a web page


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

### Show text

```exec
from browser import alert, document

# document['zone'] is the colored cell
alert(document['zone'].text)
```

### Show HTML code

```exec
from browser import alert, document
alert(document['zone'].html)
```

### Show value in entry field

```exec
from browser import alert, document
# document['entry'] is the input field
alert(document['entry'].value)
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
<B>Cell content</B><p>
<INPUT id="entry" value="input field">
</td>
</tr>
</table>

Each element in the page has an attribute `text`, a string with the text 
shown in the element

It also has an attribute `html`, a string with the HTML code inside the 
element

Input fields have an attribute `value`, a string with the current field value

`alert()` is a function defined in module **browser** that shows its argument 
in a popup window
