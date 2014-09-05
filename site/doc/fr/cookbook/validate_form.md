Problème
--------

Valider le contenu d'un formulaire de saisie avant envoi au serveur


Solution
--------



Dans le formulaire ci-dessous on veut vérifier que l'utilisateur a complété tous les champs marqués d'une étoile et que la date est au format JJ/MM/AAAA

Pour cela, on exécute la fonction _validate()_ au moment d'appuyer sur "Envoi". S'il y a une erreur, la fonction le signale et on reste sur la page ; sinon le contrôle passe à une page qui affiche les données entrées en utilisant _doc.query_

<table width="100%">

<tr>
<td style="background-color:#FF7400;text-align:center;">
<form action="cookbook/echo.html" id="myform">

<table cellpadding=5>
<tr>
<td align="right">Nom *</td>
<td><INPUT id="name" name="name"></td>
</tr>
<tr>
<td align="right">Prénom</td>
<td><INPUT id="firstname" name="firstname"></td>
</tr>
<tr>
<td>Date de naissance (JJ/MM/AAAA) * </td>
<td><INPUT id="date" name="date"></td>
</tr>
<tr>
<td>Adresse mail</td>
<td><INPUT id="mail" name="mail"></td>
</tr>
<tr>
<td colspan=2><INPUT type="submit" value="Envoi" onclick="return validate()"></td>
</tr>
</table>

</form>
</td>
</tr>

<tr>
<td style="width:40%;padding-right:10px;" id="py_source">

    import re
    from browser import document as doc
    from browser import alert, window
    
    def validate():
        if not doc['name'].value:
            alert('Veuillez saisir le nom')
            doc['name'].focus()
            return False
        if not doc['date'].value:
            alert('Veuillez saisir la date')
            doc['date'].focus()
            return False
        elif not re.match(r'\d{2}/\d{2}/\d{4}',doc['date'].value):
            alert("La date n'est pas au bon format")
            doc['date'].focus()
            return False
            
    window.validate = validate
</td>

</tr>
</table>

<script type="text/python3">
src = doc['py_source'].text
exec(src)
</script>
