Elements attributes, properties and methods
-------------------------------------------

### DOM attributes and properties

The DOM defines two different concepts for elements :

- _attributes_, which are defined in the HTML (or SVG) tag : for instance,
  `<img src="icon.png">` defines the attribute `src` of the element created
  by the `<img>` tag
- _properties_, that can be attached to an element by the dotted syntax : set
  by `element.property_name = value`, read by `value = element.property_name`

The DOM also defines a relation between _some_ attributes and _some_
properties. Generally, for the attributes that are expected for a given tag
(eg "id" or "class" for any kind of tag, "src" for IMG tags, "href" for A
tags, etc), when the attribute is set, the property is also set. Most of the
time, the property name is the same as the attribute name, but there are
exceptions : the property for the attribute "class" is "className". Generally,
the property value is the same as the attribute value, but not always : for
instance, for an element defined by `<INPUT type="checkbox" checked="checked">`,
the value of attribute "checked" is "checked", and the value of property
"checked" is the boolean "true".

Besides the attributes defined by the specification for a given tag, custom
attributes can be defined (template engine use this a lot) ; for these
attributes, the property of the same name is not set. Custom properties can
also be defined for an element, and this doesn't set the attribute of the
same name.

Attribute values are always strings, while property values can be of any type.
Attributes are case-insensitive for HTML elements and case-sensitive for SVG
elements ; properties are always case-sensitive.

### Attributes and properties management in Brython

Brython manages DOM attributes with the attribute `attrs` of `DOMNode`
instances ; it manages properties with the dotted syntax.

`element.attrs` is a dictionary-like object.

```python
# set a value to an attribute
element.attrs[name] = value

# get an attribute value
value = element.attrs[name] # raises KeyError if element has no attribute
                            # "name"
value = element.attrs.get(name, default)

# test if an attribute is present
if name in element.attrs:
    ...

# remove an attribute
del element.attrs[name]

# iterate on the attributes of an element
for name in element.attrs:
    ...

for attr in element.attrs.keys():
    ...

for value in element.attrs.values():
    ...

for attr, value in element.attrs.items():
    ...
```

### Brython-specific properties and methods

For convenience, Brython defines a few additional properties and methods:

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
<td>*bind*</td><td>method</td><td>event binding, see the section [events](events.html)</td><td>-</td>
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
<td>*clear*</td><td>method</td><td><code>`elt.clear()</code>` removes all the
descendants of the element</td><td>-</td>
</tr>

<tr>
<td>*closest*</td>
<td>method</td>
<td><code>elt.closest(tag_name)</code> returns the first parent element of
`elt` with the specified tag name. Raises `KeyError` if no element is found.</td>
<td>-</td>
</tr>

<tr>
<td>*get*</td><td>method</td><td>selects elements (cf <a href="access.html">access to elements</a>)</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>integer</td><td>element height in pixels (2)</td><td>R/W</td>
</tr>

<tr>
<td>*html*</td><td>string</td><td>the HTML code inside the element</td>
<td>R/W</td>
</tr>

<tr>
<td>*index*</td>
<td>method</td>
<td>`elt.index([selector])` returns the index (an integer) of the element
among its parent's children. If _selector_ is specified, only the elements
matching the CSS selector are taken into account ; in this case, if no
element matches, the method returns -1.
</td><td>-</td>
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
<td>*select*</td><td>method</td><td>`elt.select(css_selector)` returns the elements matching the specified CSS selector</td><td>-</td>
</tr>

<tr>
<td>*select_one*</td>
<td>method</td>
<td>`elt.select_one(css_selector)` returns the elements matching the specified CSS selector, otherwise `None`</td>
<td>-</td>
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

```python
from browser import document, html
document['zone'] <= html.INPUT(Id="data")
```

Iterating on an element's children can be done using the usual Python syntax :
```python
for child in element:
    ...
```
To destroy an element, use the keyword `del`
```python
zone = document['zone']
del zone
```

The `options` collection associated with a SELECT object has an interface of a
 Python list :

- access to an option by its index : `option = elt.options[index]`
- insertion of an option at the _index_ position : `elt.options.insert(index,option)`
- insertion of an option at the end of the list : `elt.options.append(option)`
- deleting an option : `del elt.options[index]`
