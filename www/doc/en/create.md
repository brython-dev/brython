Creating a document
-------------------

Brython is made to program web applications, thus HTML pages that the user can interact with

A page is made of elements (texts, images, sounds...) that can be included in the page in two different ways :

- writing HTML code with tags, for instance

```xml
<html>
<body>
<b>Brython</b> is an implementation of <a href="http://www.python.org">Python</a>
for web browsers
</body>
</html>
```

- or writing Python code, using the built-in module **browser.html**

```xml
<html>
<body>
<script type="text/python">
from browser import document
from browser.html import A,B

document <= B("Brython")+"is an implementation of "
document <= A("Python",href="http://www.python.org")+" for web browsers"
</script>
</body>
</html>
```
