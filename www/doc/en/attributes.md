Elements attributes and methods
-------------------------------

The elements in a page have attributes and methods that depend on the element 
type ; they are defined by the W3C and can be found on many Internet sites.

Since their name may vary depending on the browser, Brython defines additional 
attributes that work in all cases :

<table border=1 cellpadding=3>
<tr>
<th>Name</th><th>Type</th><th>Description</th><th>R = read only<br>R/W = 
read + write</th>
</tr>

<tr>
<td>*abs_left*</td><td>integer</td><td>position of the element relatively to the window left border</td><td>R</td>
</tr>

<tr>
<td>*abs_top*</td><td>integer</td><td>position of the element relatively to the window top border</td><td>R</td>
</tr>

<tr>
<td>*children*</td><td>list</td><td>the element's children in the document 
tree</td><td>R</td>
</tr>

<tr>
<td>*class\_name*</td><td>string</td><td>the name of the element's class (tag 
attribute *class*)</td><td>R/W</td>
</tr>

<tr>
<td>*clear*</td><td>méthod</td><td><code>`elt.clear()</code>` removes all the 
descendants of the element</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>integer</td><td>element height in pixels (2)</td><td>R/W</td>
</tr>

<tr>
<td>*html*</td><td>string</td><td>the HTML code inside the element</td>
<td>R/W</td>
</tr>

<tr>
<td>*inside*</td><td>method</td><td>`elt.inside(other)` tests if `elt` is
contained inside element `other`</td><td>-</td>
</tr>

<tr>
<td>*left*</td><td>integer</td><td>the position of the element relatively to 
the left border of the first positioned parent (1)</td><td>R/W</td>
</tr>

<tr>
<td>*parent*</td><td>`DOMNode` instance</td><td>the element's parent (`None` 
for `doc`)</td><td>R</td>
</tr>

<tr>
<td>*remove*</td><td>function</td><td><code>remove(_child_)</code> removes 
*child* from the list of the element's children</td><td>R</td>
</tr>

<tr>
<td>*text*</td><td>string</td><td>the text inside the element</td><td>R/W</td>
</tr>

<tr>
<td>*top*</td><td>integer</td><td>the position of the element relatively to 
the upper border of the first positioned parent (1)</td><td>R/W</td>
</tr>

<tr>
<td>*width*</td><td>integer</td><td>element width in pixels (2)</td><td>R/W</td>
</tr>

</table>

(1) When going up the DOM tree, we stop at the first parent whose attribute 
`style.position` is set to a value different of "static". `left` and `top` are 
computed like `style.left` and `style.top` but are integer, not strings ending 
with `px`.

(2) Same as `style.height` and `style.width` but as integers.

To add a child to an element, use the operator __<=__ (think of it as a left 
arrow for assignment)

>    from browser import document, html
>    document['zone'] <= html.INPUT(Id="data")

Iterating on an element's children can be done using the usual Python syntax : 

>    for child in element:
>        (...)

To destroy an element, use the keyword `del`
>    zone = document['zone']
>    del zone

The `options` collection associated with a SELECT object has an interface of a
 Python list :

- access to an option by its index : `option = elt.options[index]`
- insertion of an option at the _index_ position : `elt.options.insert(index,option)`
- insertion of an option at the end of the list : `elt.options.append(option)`
- deleting an option : `del elt.options[index]`


