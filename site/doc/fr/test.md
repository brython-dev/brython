### Test interactif

Le site Brython, ou son miroir disponible en téléchargement, comporte une console dans laquelle vous pouvez tester du code Python

A noter que l'espace de noms n'est pas mis à jour quand on clique sur le bouton "run", pour le réinitialiser il faut recharger la page

Pour le développement et le test de Brython, un certain nombre de scripts de tests sont regroupés dans le répertoire `tests` ; on peut y accéder en cliquant sur le lien "Pages de test" depuis la console, puis sélectionner les différents tests et les exécuter

### Débogage des scripts

Quel que soit le niveau de débogage, les erreurs de syntaxe sont signalées dans la console du navigateur (ou à l'endroit défini par `sys.stderr`)

Par exemple, le code

>    x = $a

génère le message

>    SyntaxError: unknown token [$]
>    module '__main__' line 1
>    x = $a
>        ^

En mettant le niveau de débogage à 1 dans l'appel de la fonction <code>brython(_debug\_mode_)</code>, les exceptions levées à l'exécution et non interceptées par un `except` produisent également un message d'erreur, aussi proche que possible de celui généré par Python

Ce code :

>    x = [1,2]
>    x[3]

genère :

>    IndexError: list index out of range
>    module '__main__' line 2
>    x[3]
