Problem
-------

Display content in an element of the web page


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
document['zone'] <= "blah "
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
Initial content<p>
</td>
</tr>
</table>

`document["zone"]` is the element in the web page with the id "zone" (here, 
the colored table cell)

