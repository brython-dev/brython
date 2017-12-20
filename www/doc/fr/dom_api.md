Introduction
------------

Pour l'interface avec le navigateur, Brython respecte l'interface du Document
Object Model, sur lequel on trouve une abondante documentation :

- [référence du W3C](http://www.w3.org/DOM/)
- [article Wikipedia](http://fr.wikipedia.org/wiki/Document_Object_Model)
- [site Mozilla](https://developer.mozilla.org/fr/docs/DOM)

Cette interface est indépendante du langage de programmation. Avec Brython,
toutes les opérations décrites dans l'API DOM reposent sur deux objets définis
dans le module **browser** : _document_ et _window_.

_document_ implémente l'interface `Document` définie dans l'API DOM. On peut
donc par exemple lui appliquer les méthodes suivantes :

<code>_document_.getElementById(_elt\_id_)</code>

> retourne une référence à l'élément du DOM dont l'identifiant vaut _elt\_id_

<code>_document_.createElement(_tagName_)</code>

> retourne un nouvel élément de type _tagName_ ; par exemple, pour créer un
> lien hypertexte :

>    link = document.createElement('A')

<code>_document_.appendChild(_elt_)</code>

> ajout l'élément _elt_ au document

En plus de cette interface standard, Brython propose une interface
alternative, plus familière aux développeurs Python. Elle est décrite dans les
pages suivantes.

