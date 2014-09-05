Problem
-------

Read the content of a file


Solution
--------

We use the built-in function `open()` to load the file content

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    import time
    from browser import document as doc
    
    fake_qs = '?foo=%s' %time.time()
    doc['zone'].value = open('cookbook/file.txt'+fake_qs).read()

<button id="get_file">Test it</button>

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Initial content</textarea>
</td>
</tr>
</table>

<script type="text/python3">
def get_file(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

doc['get_file'].bind('click', get_file)
</script>


Note the query string with a random value at the end of the file name : it is required to refresh the result if the source file is changed between two calls

The next example adds a timeout function to print a message in case the file was not found after 4 seconds :

    import time
    from browser import document as doc    

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["zone"].value = req.text
        else:
            doc["zone"].value = "error "+req.text
    
    def err_msg():
        doc["zone"].text = "server didn't reply after %s seconds" %timeout
    
    timeout = 4
    
    def go(url):
        req = ajax()
        req.on_complete = on_complete
        req.set_timeout(timeout,err_msg)
        req.open('GET',url,True)
        req.send()

    go('cookbook/file.txt?foo=%s' %time.time())

