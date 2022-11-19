Accessing elements
------------------

Getting access to an element can be done in different ways. The most usual is
to use its identifier, ie its attribute _id_ : with an input field defined by

```xml
<input id="data">
```

we can get a reference to this field by

```python
from browser import document
data = document["data"]
```

`document` is defined in module **browser** and refers to the HTML document.
It behaves like a dictionary whose keys are the identifiers of the elements in
the page. If no element has the specified id, the program raises a `KeyError`
exception.

All the elements in the page have a method `get()` that can be used to search
elements:

- `elt.get(name=N)` returns a list of all the elements descending from `elt`
  whose attribute `name` is equal to `N`
- `elt.get(selector=S)` returns a list with all the elements descending from
  `elt` whose CSS selector matches `S`

`elt.select(S)` is an alias for `elt.get(selector=S)`. A few examples :

```python
document.select('.foo')       # elements with class "foo"
document.select('form')       # list of elements "<form>"
document.select('H1.bar')     # H1 elements with class "bar"
document.select('#container') # the element with id "container", same as
                              # [document["container"]]
document.select('a[title]')   # A elements with an attribute "title"
document.select('#tid td')    # the TD elements inside the element with id #tid
```

See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
for more information and examples of CSS selectors.