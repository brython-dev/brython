Problem
-------

Validate the content of a form before sending it to the server


Solution
--------

In the form below we want to check that the user filled all the fields marked with a star, and that the date has the format MM/DD/YYYY

For this, we use the function _validate()_ when clicking on the "Send" button. If there is an error, the function reports it and we stay on the page ; otherwise the form is sent to a page that prints the data sent, using _doc.query_

<table width="100%">
<tr>

<td style="background-color:#FF7400;text-align:center;">

<form action="cookbook/echo.html" id="myform">

<table cellpadding=5>
<tr>
<td align="right">Surname *</td>
<td><INPUT id="name" name="name"></td>
</tr>
<tr>
<td align="right">First name</td>
<td><INPUT id="firstname" name="firstname"></td>
</tr>
<tr>
<td>Birth date (MM/DD/YYYY) * </td>
<td><INPUT id="date" name="date"></td>
</tr>
<tr>
<td>Adresse mail</td>
<td><INPUT id="mail" name="mail"></td>
</tr>
<tr>
<td colspan=2><INPUT type="submit" value="Send" onclick="return validate()"></td>
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
            alert('Please enter the name')
            doc['name'].focus()
            return False
        if not doc['date'].value:
            alert('Please enter the date')
            doc['date'].focus()
            return False
        elif not re.match(r'\d{2}/\d{2}/\d{4}$',doc['date'].value):
            alert("The date is not at the right format")
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
