Problema
--------

Validar el contenido de un formulario antes de enviarlo al servidor


Solución
--------

En el formulario que se encuentra más abajo queremos comprobar si el usuario ha rellenado los campos marcados con un asterisco y que la fecha tiene un formato MM/DD/YYYY

Para ello, usaremos la función _validate()_  que será invocada cuando pulsemos en el botón "Enviar". Si hay un error, la función lo indicará y continuaremos en la misma página ; si no encontramos errores el formulario será enviado a una página que mostrará los datos enviados, usando _doc.query_

<table width="100%">
<tr>

<td style="background-color:#FF7400;text-align:center;">

<form action="cookbook/echo.html" id="myform">

<table cellpadding=5>
<tr>
<td align="right">Apellido *</td>
<td><INPUT id="name" name="name"></td>
</tr>
<tr>
<td align="right">Nombre</td>
<td><INPUT id="firstname" name="firstname"></td>
</tr>
<tr>
<td>Fecha de nacimiento (MM/DD/YYYY) * </td>
<td><INPUT id="date" name="date"></td>
</tr>
<tr>
<td>email</td>
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
    from browser import document as doc
    from browser import alert, window
    
    def validate(ev):
        if not doc['name'].value:
            alert('Por favor, introduce el nombre')
            doc['name'].focus()
            return False
        if not doc['date'].value:
            alert('Por favor, introduce la fecha')
            doc['date'].focus()
            return False
        elif not re.match(r'\d{2}/\d{2}/\d{4}$',doc['date'].value):
            alert("La fecha no tiene el formato apropiado")
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
