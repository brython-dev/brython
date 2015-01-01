Accessing elements
------------------

Getting access to an element can be done in different ways. The most usual is to use its identifier, ie its attribute _id_ : with an input field defined by

>    <input id="data">

we can get a reference to this field by

>    from browser import document
>    data = document["data"]

`document` is defined in module **browser** and refers to the HTML document. It behaves like a dictionary whose keys are the identifiers of the elements in the page. If no element has the specified id, the program raises a `KeyError` exception

We can also get all the elements of a given type, for instance all the hypertext links (HTML tag `A`), using the syntax

    from browser import document
    from browser import html

    links = document[html.A]

Finally, all the elements in the page have a method `get()` that can be used to search elements :

- `elt.get(name=N)` returns a list of all the elements descending from `elt` whose attribute `name` is equal to `N`
- `elt.get(selector=S)` returns a list with all the elements descending from `elt` whose CSS selector matches `S`

A few examples :

    document.get(selector='.foo')       # elements with class "foo"
    document.get(selector='form')       # list of tags "<form>"
    document.get(selector='H1.bar')     # H1 tags with class "bar"
    document.get(selector='#container') # the element with id "container", same as [document["container"]]
    document.get(selector='a[title]')   # A tags with an attribute "title"
