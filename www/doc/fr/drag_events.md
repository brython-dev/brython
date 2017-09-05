Evénements glisser-déposer
==========================

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Les événements associés aux opérations de glisser-déposer sont

<table cellpadding=3 border=1>
<tr>
<td>*drag*</td>
<td>Cet évènement est déclenché à la source du glisser-déposer, l'élément sur lequel l'évènement *dragstart* a été déclenché
</td>
</tr>

<tr>
<td>*dragend*</td><td>La source du glisser-déposer recevra un évènement de ce type lorsque l'opération de glisser-déposer est terminée, qu'elle se soit bien déroulée ou non</td>
</tr>

<tr>
<td>*dragenter*</td><td>Déclenché lorsque le pointeur de la souris est déplacée pour la première fois au dessus d'un élément pendant le glisser-déposer. Un écouteur d'évènement pourrait alors indiquer si le dépôt des données courantes est autorisée ou non sur cette zone. Si aucun écouteur n'a été défini, ou si ce dernier n'entraîne aucune action, alors, le dépôt n'est par défaut, pas autorisé. C'est également l'évènement à prendre en charge pour donner des retours à l'utilisateur quand à la possibilité qu'il a déposer le contenu du glisser-déposer en affichant une surbrillance ou un marqueur d'insertion</td>
</tr>

<tr>
<td>*dragleave*</td><td>Cet évènement est déclenché quand la souris quite un élément durant un glisser-déposer. Les écouteurs évènement devraient retirer toute surbrillance ou marqueur d'insertion de cette zone</td>
</tr>

<tr>
<td>*dragover*</td><td>Cet évènement est déclenché lorsque la souris est déplacée au dessus d'un élément durant un glisser-déposer. La plupart du temps, cet évènement est utilisé pour les mêmes buts que l'évènement dragenter</td>
</tr>

<tr>
<td>*dragstart*</td><td>Déclenché sur un élément lorsque qu'un glisser-déposer est entrepris. L'utilisateur requiert la possibilité de glisser-déposer l'élément sur lequel cet évènement est déclenché</td>
</tr>

<tr>
<td>*drop*</td><td>L'évènement *drop* est déclenché sur l'élément sur lequel le dépôt a été effectué à la fin de l'opération de glisser déposer. Un écouteur d'évènement devrait être responsable de la récupération des données sources du glisser-déposer et de leur insertion sur la zone de dépôt. Cet évènement ne sera déclenché que si le dépôt est désiré. Il ne sera pas déclenché si l'utilisateur annule ce dernier en pressant, par exemple, sur la touche "Echap" de son clavier ou si le bouton de la souris a été relâché alors que le curseur était au-dessus d'une zone pour laquelle le glisser-déposer n'était pas autorisé</td>
</tr>

</table>

Attributs de l'objet `DOMEvent`
-------------------------------

`dataTransfer`
> un "magasin de données" utilisé pour transporter des informations pendant le processus de glisser-déposer 

Attributs et méthodes du magasin de données
-------------------------------------------

Les "magasins de données" possèdent les attributs et méthodes suivants :

`dropEffect`

> Une chaine qui représente l'effect qui sera utilisé, il doit toujours être une des valeurs possibles de  `effectAllowed`.

> Pour les événements *dragenter* et *dragover*, le `dropEffect` sera initialisé en fonction de l'action requise par l'utilisateur. La manière dont cela est déterminé dépend de la plateforme, mais typiquement l'utilisateur peut appuyer sur des touches de modification pour préciser l'action souhaitée. A l'intérieur d'un gestionnaire d'événement pour *dragenter* ou *dragover*, le `dropEffect` doit être modifié si l'action que l'utilisateur requiert n'est pas celle qui est souhaitée.

> Pour les événements *dragstart*, *drag* et *dragleave*, le `dropEffect` est initialisé à "none". On peut affecter une valeur à `dropEffect`, mais cette valeur ne sera pas utilisée.

> Pour les événements *drop* et *dragend*, la valeur de `dropEffect` sera l'action souhaitée, c'est-à-dire celle que `dropEffect` avait après le dernier événement *dragenter* ou *dragover*.

> Les valeurs possibles sont :

-    "copy" : une copie de l'élément source est effectuée dans le nouvel emplacement.
-    "move" : un élément est déplacé dans le nouvel emplacement.
-    "link" : un lien vers l'élément source est établie dans le nouvel emplacement.
-    "none" : l'élément ne peut pas être déposé.

> Affecter une autre valeur n'a aucun effet et ne modifie pas la valeur courante.


`effectAllowed`

> Une chaine qui spécifie les effets autorisés pour le déplacement. On peut le définir dans l'événement *dragstart* pour indiquer les effets souhaités pour la source, et dans les événements *dragenter* et *dragover* pour insiquer les effets souhiatés pour la cible. La valeur n'est pas utilisée pour les autres événements.

> Les valeurs possibles sont:

- "copy" : une copie de la source peut être effectuée au nouvel emplacement.
- "move" : un élément peut être déplacé au nouvel emplacement.
- "link" : un lien peut être établi vers la source dans le nouvel emplacement.
- "copyLink" : une opération de copie ou de lien est autorisée.
- "copyMove" : une opération de copie ou de déplacement est autorisée.
- "linkMove" : une opération de lien ou de déplacement est autorisée.
- "all" : toutes les opérations sont autorisées.
- "none" : l'élement ne peut pas être déposé.
- "uninitialized" : la valeur par défaut quand l'effet n'a pas été défini, équivalent à "all".

> Affecter une autre valeur n'a aucun effet et ne modifie pas la valeur courante.

`files`

> La liste de tous les fichiers locaux disponibles pour le transfert de données. Si l'opération de déplacement n'implique pas de glisser-déposer de fichiers, cette propriété est une liste vide. Une tentative d'accès à un élément de cette liste avec un index non valide renvoie `None`.

<code>getData(_type_)</code>

> Récupère la donnée pour un type donné, ou une chaine vide si la donnée pour ce type n'existe pas ou que l'attribut `dataTransfer` ne contient aucune donnée

<code>setData(_type_, _valeur_)</code>

> Affecte une valeur à un type donné. S'il n'y a pas de données pour ce type, elle est ajoutée à la fin, de façon que le dernier élément de la liste des types sera le nouveau format. Si la donnée pour ce type existe déjà, la valeur courante est remplacée à la même position. Autrement dit, l'ordre de la liste des types n'est pas modifiée quand on change la valeur pour un type.

`types`

> La liste des types de formats des données stockées pour le premier élément, dans l'ordre où les données ont été ajoutées. Si aucune donnée n'a été ajoutée, cette propriété est une liste vide.


#### Exemple

Voir la recette de glisser-déposer dans le menu Recettes
