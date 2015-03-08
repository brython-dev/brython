Introduction
------------

For the interface with the browser, Brython is compliant with the Document Object Model interface, which is widely documented on the web :

- [W3C reference](http://www.w3.org/DOM/)
- [Wikipedia page](http://en.wikipedia.org/wiki/Document_Object_Model)
- [Mozilla site](https://developer.mozilla.org/en-US/docs/DOM)

This interface is language-independent. With Brython, all the operations described in the DOM API rely on two objects defined in the module **browser** : _document_ and _window_

_document_ implements the interface `Document` defined in the DOM API. For instance, it supports the following methods :

<code>_document_.getElementById(_elt\_id_)</code>

> returns a reference to the DOM element whose id is _elt\_id_

<code>_document_.createElement(_tagName_)</code>

> returns a new element of type _tagName_ ; for instance, to create an hypertext link :

>    link = document.createElement('A')

<code>_document_.appendChild(_elt_)</code>

> add the element _elt_ to the document

Besides this standard interface, Brython propose an alternative interface, more familiar for Brython developers. It is described in the following pages

