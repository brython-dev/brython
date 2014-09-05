Problema
--------

Validar o conteúdo de um formulário antes de mandá-lo ao servidor.


Solução
-------

No formulário abaixo nós queremos verificar se o usuário preencheu
todos os campos marcados com um asterisco e que a data tem o formato
DD/MM/YYYY.

Para isso, nós usamos a função _validate()_ quando clcado em
"Enviar". Se houver um erro, a função o reporta e continuamos na
página; caso contrário, o formulário é enviado para uma página que
mostra os dados enviados usando _doc.query_.

<table width="100%">
<tr>

<td style="background-color:#FF7400;text-align:center;">

<form action="cookbook/echo.html" id="myform">

<table cellpadding=5>
<tr>
<td align="right">Sobrenome *</td>
<td><INPUT id="name" name="name"></td>
</tr>
<tr>
<td align="right">Nome</td>
<td><INPUT id="firstname" name="firstname"></td>
</tr>
<tr>
<td>Data de nascimento (DD/MM/YYYY) * </td>
<td><INPUT id="date" name="date"></td>
</tr>
<tr>
<td>Endereço</td>
<td><INPUT id="mail" name="mail"></td>
</tr>
<tr>
<td colspan=2><INPUT type="submit" value="Enviar" onclick="return validate()"></td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="width:40%;padding-right:10px;" id="py_source">

    import re
    from browser import doc, alert, window
    
    def validate():
        if not doc['name'].value:
            alert('Por favor digite um sobrenome')
            doc['name'].focus()
            return False
        if not doc['date'].value:
            alert('Por favor digite a data')
            doc['date'].focus()
            return False
        elif not re.match(r'\d{2}/\d{2}/\d{4}$',doc['date'].value):
            alert("A data não está no formato correto")
            doc['date'].focus()
            return False

    window.validate = validate            
</td>
</tr>
</table>
</form>

<script type="text/python3">
src = doc['py_source'].text
exec(src)
</script>
