Criando um documento
-------------------

Brython foi criado para programação de aplicações web, logo páginas HTML que um usuário possa interagir

Uma página é feita de elementos (textos, imagens, sons...) que podem ser incluídos em uma página de duas formas diferentes:

- Escrevendo código HTML com tags, por exemplo

```xml
<html>
<body>
<b>Brython</b> is an implementation of <a href="http://www.python.org">Python</a>
for web browsers
</body>
</html>
```

- ou escrevendo código Python, usando o módulo embutido **browser.html**

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
