## Chaîne de requête

L'objet `document` du module **browser** possède un attribut `query` qui contient la chaine de requête _(query string)_ sous la forme d'un objet dont l'interface est la suivante :

- <code>document.query[<i>cle</i>]</code> : renvoie la valeur associée à _`cle`_. Si une clé a plus d'une valeur (ce qui peut se produire avec une balise SELECT avec l'attribut MULTIPLE, ou pour des balises `<INPUT type="checkbox">`), renvoie une liste de valeurs. Déclenche `KeyError` s'il n'y a pas de valeur pour cette clé

- <code>document.query.getfirst(<i>cle[,defaut]</i>)</code> : renvoie la première valeur pour _`cle`_. Si aucune valeur n'est associée à la clé, renvoie _`defaut`_ s'il est fourni, sinon renvoie `None`

- <code>document.query.getlist(<i>cle</i>)</code> : renvoie la liste des valeurs associées à la _`cle`_ (la liste vide s'il n'y a pas de valeur pour cette clé)

- <code>document.query.getvalue(<i>cle[,defaut]</i>)</code> : comme `document.query()[key]`, mais renvoie _`defaut`_ ou `None` s'il n'y a pas de valeur pour la clé


