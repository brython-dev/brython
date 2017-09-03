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


### Débogueur de code Python

Un débogueur incrémental permettant de naviguer en avant ou en arrière est
implémenté [ici](../../tests/debugger.html)

A l'heure actuelle il n'est pas complet et ne supporte que l'exécution
ligne par ligne. Vous trouverez de la documentation sur la façon dont
chaque fonction du débogueur fonctionne au cas où vous voudriez le
compléter.


### Brython_Debugger pour les développeurs

Le débogueur fournit 4 points d'entrée(_on\_debugging\_started_, _on\_step\_update_, 
_on\_debugging\_end_, et _on\_debugging\_error_) qui prennent comme argument une
fonction de retour que vous pouvez définir selon vos besoins.

La façon dont le débogueur fonctionne en mode enregistrement (le mode par
défaut) quand on exécute `start_debugger` est de traduire le code Python
en code Javascript et ensuite d'injecter une fonction de trace entre chaque
occurrence de $line_info (ce qui suppose d'exécuter le code Brython en mode
de débogage supérieur à 0).

Des appels supplémentaires sont injectés au début du code avant la première
ligne, et après les boucles `while` et à la fin du programme, pour pointer
vers les bonnes lignes quand on débogue dans l'éditeur.

Comme le débogueur n'est pas exécuté en direct mais enregistré, le parseur
remplace chaque appel à la fonction `input` de Brython par une trace de type
input avec les arguments qui devaient être passés à la fonction `input`
(ne supporte pour le moment que les chaines de caractère littérales).

Quand l'injection des traces est terminée, le débogueur exécute le code, qui
déclenche les appels de trace pendant l'exécution.

Le débogueur est encore en développement et des changements pourront être
apportés à l'API.

Le débogueur est disponible dans l'espace de noms global comme attribut
`Brython_Debugger` de l'objet `window`.

Pour un exemple de son fonctionnement voir [cette page](../../tests/debugger.html)

La suite est l'API publique du débogueur, vous pourrez trouver une description
plus détaillés dans le code à www/tests/debugger/main.js.

**Brython_Debugger**.`start_debugger()`
> commence la session de débogage, prend le code à déboguer comme paramètre ainsi qu'un booléen optionnel pour indiquer si déboguer en direct ou  enregistrer. Pour l'instant le débogage en direct n'est pas pris en charge et le débogage commence en mode enregistrement. La fonction de retour   `on_debugging_started` est appelée à la fin de cette étape

**Brython_Debugger**.`stop_debugger()`
> fonction à appeler quand vous voulez terminer la session de débogage. La fonction `on_debugging_end` est appelée à cette étape

**Brython_Debugger**.`step_debugger()`
> quand cette fonction est appelée on avance d'un pas dans la session de débogage enregistrée

**Brython_Debugger**.`step_back_debugger()`
> quand cette fonction est appelée, on revient en arrière d'un pas dans la session de débogage enregistrée

**Brython_Debugger**.`can_step(n)`
> indique si on peut aller à l'étape spécifiée

**Brython_Debugger**.`set_step(n)`
> recherche une étape spécifique dans la session de débogage enregistrée; prend un nombre entre 0 et la dernière étape comme paramètre. Si un nombre plus grand que la dernière étape est fourni, il ne se passe rien

**Brython_Debugger**.`is_debugging()`
> indique si une session de débogage est active

**Brython_Debugger**.`is_recorded()`
> indique si le débogueur est en mode enregistrement

**Brython_Debugger**.`is_last_step()`
> indique si l'étape courante est la dernière

**Brython_Debugger**.`is_first_step()`
> indique si l'étape courante est la première

**Brython_Debugger**.`get_current_step()`
> renvoie le numéro de l'étape courante

**Brython_Debugger**.`get_current_frame()`
> renvoie la frame ou l'état courant

**Brython_Debugger**.`get_recorded_frames()`
> renvoie tous les états enregistrés

**Brython_Debugger**.`set_trace_limit(Number)`
> le nombre maximum d'étapes exécutées avant que le débogueur ne s'arrête. Vaut 10000 par défaut

**Brython_Debugger**.`set_trace(objet)`
> `objet` contient les données à passer ultérieurement à la fonction `set_trace`. Ne pas utiliser des noms d'événements déjà utilisées par  le débogueur

**Brython_Debugger**.`set_trace_call(string)`
> change le nom de la fonction `traceCall` qui est injectée dans le Javascript généré à partir du code Brython. La valeur par défaut est `Brython_Debugger.set_trace`. 

**Brython_Debugger**.`on_debugging_started(cb)`
> `cb` est appelé après le démarrage de la session de débogage

**Brython_Debugger**.`on_debugging_end(cb)`
> `cb` est appelé après la fin de la session de débogage

**Brython_Debugger**.`on_debugging_error(cb)`
> `cb` est appelé après une erreur de syntaxe ou une exception

**Brython_Debugger**.`on_step_update(cb)`
> `cb` est appelé quand un état est changé par `setState`


### Profilage de scripts

Pour permettre le profilage il faut passer l'option "profile" à la fonction 
`brython()`:

> brython({'profile':1})

Quand l'option `profile` est > 0 le compilateur ajoute du code additionel qui
récupère des informations de profilage. Le module `profile` donne accès à ces 
informations. Il fournit une interface très proche de celle du module `profile` 
de la distribution standard Python.

La principale différence est qu'il ne permet pas à l'utilisateur de définir
des chronomètres et ne fait aucun calibrage. Les méthodes du module standard
qui enregistrent des données sur disque enregistrent un version sérialisée en 
JSON de ces données dans le stockage local du navigateur.

#### Usage basique:

>       from profile import Profile
>
>       p = Profile()
>       p.enable()
>       do_something()
>       do_something_else()
>       p.create_stats()

Ceci imprimera quelque chose comme:

>           1 run in 0.249 seconds
>
>       Ordered by: standard name (averaged over 1 run)
>
>       ncalls  tottime  percall  cumtime  var percall  module.function:lineno
>        101/1    0.023    0.000    1.012        0.010               .fact:180

où chaque ligne correspond à une fonction et les colonnes correspondent à

    ncalls      le nombre total de fois où la fonction a été appelée
                (si la fonction a été appelée de façon non récursive, le 
                deuxième nombre après la barre oblique indique combien 
                d'appels étaient des appels de premier niveau dans la 
                récursion)

    tottime     la durée totale (en secondes) passée dans la fonction, sans 
                inclure les sous-appels

    percall     le temps moyen passée dans la fonction par appel, sans inclure
                les sous-appels

    cumtime     le temps total passé dans la fonction, en comptant les
                sous-appels

    var percall le tempas moyen passé dans la fonction pour chaque appel
                non récursif

    standard name est le nom de la fonction sous la forme 
                module.nom_fonction:numero_ligne

Il est aussi possible d'utiliser la forme suivante pour exécuter le code 
plusieurs fois et prendre la moyenne :

>       from profile import Profile
>
>       p = Profile()
>       p.call(function_to_profile, 200, arg1, arg2, kwarg1=v1)

qui imprimera quelque chose comme:

>           200 runs in 0.249 seconds
>
>       Ordered by: standard name (averaged over 1 run)
>
>       ncalls  tottime  percall  cumtime  var percall  module.function:lineno
>        101/1    0.023    0.000    1.012        0.010  function_to_profile:16

Les données de profilage collectées peuvent être enregistrées dans le
stockage local pour utilisation ultérieure:

>        p.dump_stats('run1')

Pour relire les données de profilage:

>        data = Stats('run1')

et sous forme agrégée

>        data.add(p.dump_stats())
>        print(data)
