Le paquetage **browser** définit les noms et les modules intégrés spécifiques à Brython

**browser**.`alert(`_message_`)`
> une fonction qui affiche le _message_ dans une fenêtre. Retourne la valeur `None`

**browser**.`confirm(`_message_`)`
> une fonction qui affiche le _message_ dans une fenêtre et deux boutons de réponse (ok/annuler). Retourne `True` si ok, `False` sinon

**browser**.`console`
> un objet avec des méthods pour interagir avec la console du navigateur. Son interface est propre à chaque navigateur. Il expose au moins la méthode `log(msg)`, qui imprime le message _msg_ dans la console

**browser**.`document`
> un objet représentant le document HTML présenté dans le navigateur. L'interface de ce document est décrite dans la section "Interface avec le navigateur"

**browser**.`DOMEvent`
> la classe des événements DOM

**browser**.`DOMNode`
> la classe des noeuds DOM

**browser**.`prompt(`_message[,defaut]_`)`
> une fonction qui affiche le _message_ dans une fenêtre et une zone de saisie. Retourne la valeur saisie ; si aucune valeur n'est saisie, retourne _defaut_, ou la chaine vide si _defaut_ n'est pas fourni

**browser**.`window`
> un objet représentant la fenêtre du navigateur
