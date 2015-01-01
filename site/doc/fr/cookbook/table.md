Problème
--------

Créer une table HTML


Solution
--------


Dans cet exemple et dans les suivants, nous ne montrerons plus que le script 
Python ; le code HTML environnant reste le même que dans les recettes 
précédentes

Pour créer une table, nous utilisons les balises HTML : `TABLE` (la table),
`TR` (une rangée de table), `TH` (une cellule d'entête) et `TD` (une cellule 
ordinaire)

La table est constituée de rangées, chaque rangée est constituée de cellules ;
 la première rangée est généralement constituée de "cellules d'entête" qui 
 décrivent la valeur dans la colonne correspondante

Voici un exemple simple :

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document as doc
from browser.html import TABLE, TR, TH, TD
table = TABLE()
row = TR() # create a row
# add header cells
row <= TH("Pays")
row <= TH("Capitale")
table <= row # add the row to the table

# add a row
row = TR()
row <= TD("Russie")+TD("Moscou")
table <= row

# erase initial content
doc['zone'].clear()

# insert table in the element
doc['zone'] <= table
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
Contenu initial<p>
</td>
</tr>
</table>

On peut créer une table à partir d'une liste de listes :

<table width="100%">
<tr>
<td style="width:50%;">
```exec
from browser import document
from browser.html import TABLE, TR, TH, TD

lignes = [ ['Morrissey','voix'],
    ['Johnny Marr','guitare'],
    ['Mike Joyce','batterie'],
    ['Andy Rourke','basse']
    ]
t = TABLE()
for ligne in lignes:
    t <= TR(TD(ligne[0])+TD(ligne[1]))
document['zone1'].text = ''
document['zone1']<= t
```

</td>
<td id="zone1" style="background-color:#FF7400;text-align:center;">Contenu initial<p>
</td>
</tr>
</table>
