Le paquetage **browser** définit les noms et les modules intégrés spécifiques
à Brython.

**browser**.`alert(`_message_`)`
> une fonction qui affiche le _message_ dans une fenêtre. Retourne la valeur
> `None`

**browser**.`bind(`_cible, evenement_`)`
> une fonction utilisée comme décorateur pour définir des gestionnaires
> d'événement. Cf. la section [Evénements](events.html).

**browser**.`confirm(`_message_`)`
> une fonction qui affiche le _message_ dans une fenêtre et deux boutons de
> réponse (ok/annuler). Retourne `True` si ok, `False` sinon.

**browser**.`console`
> un objet avec des méthodes pour interagir avec la console du navigateur. Son
> interface est propre à chaque navigateur. Il expose au moins la méthode
> `log(msg)`, qui imprime le message _msg_ dans la console.

**browser**.`document`
> un objet représentant le document HTML présenté dans le navigateur.
> L'interface de ce document est décrite dans la section "Interface avec le
> navigateur"

**browser**.`DOMEvent`
> la classe des événements DOM

**browser**.`DOMNode`
> la classe des noeuds DOM

**browser**.`is_webworker`
> booléen qui indique si le script courant est exécuté dans un Web Worker

**browser**.`load(`_script\_url_`)`
> Fonction pour charger la librairie Javascript à l'adresse _script\_url_.

> Cette fonction utilise un appel Ajax bloquant. Il faut l'utiliser quand on
> ne peut pas insérer la librairie dans la page html par
> `<script src="prog.js"></script>`.

> Les noms que la librairie insère dans l'espace de noms global Javascript
> sont accessibles depuis le script Brython comme attributs de l'objet
> `window`.

**browser**.`prompt(`_message[,defaut]_`)`
> une fonction qui affiche le _message_ dans une fenêtre et une zone de
> saisie. Retourne la valeur saisie ; si aucune valeur n'est saisie, retourne
> _defaut_, ou la chaine vide si _defaut_ n'est pas fourni

**browser**.`run_script(`_src[, nom]_`)`
> cette fonction exécute le code source Python dans _src_ avec un _nom_
> optionnel. Elle peut être utilisée comme une alternative à `exec()`, avec
> l'avantage de bénéficier du cache indexedDB pour l'import de modules de la
> bibliothèque standard.

**browser**.`scope`
> référence à l'espace de noms disponible dans le navigateur, indépendamment
> du contexte d'exécution (script ou web worker). Equivalent à 
> [`globalThis`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
> en Javascript

**browser**.`window`
> un objet représentant la fenêtre du navigateur (voir la
> [documentation MDN](https://developer.mozilla.org/fr/docs/Web/API/Window))

En outre, l'objet `__BRYTHON__` qui référence toutes les propriétés et les
fonctions qui permettent à Brython de fonctionner est disponible par
**browser**.`__BRYTHON__`
