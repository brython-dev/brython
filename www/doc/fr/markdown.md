module **browser.markdown**
---------------------------

markdown est un mode de formattage de texte adapté à la publication sur
Internet, plus simple que HTML.

Une description complète est fournie sur
[le site de markdown](http://daringfireball.net/projects/markdown/). Le
module `markdown` en fournit une implémentation légèrement adaptée : pour
enrichir le rendu, les balises markdown \_texte\_ et \*texte\* correspondent à
deux balises HTML différentes : `<I>` et `<EM>`, de même \_\_texte\_\_ et
\*\*texte\*\* correspondent à `<B>` et `<STRONG>`.

Le module `markdown` définit une fonction :

`mark(`_src_`)`
> _src_ est une chaine de caractères contenant le texte formatté avec
> markdown. Cette fonction retourne un tuple avec deux éléments :
> *html, scripts* où *html* est le code HTML correspondant au code source, et
> *scripts* est un tableau contenant tous les codes source des scripts
> contenus dans la page.

L'exemple ci-dessous montre comment récupérer le contenu d'un fichier markdown
à l'adresse _url_, remplir une zone du document avec le code HTML
correspondant, et exécuter tous les scripts présents dans la page. Cette
technique est utilisée notamment pour ces pages de documentation.

```python
from browser import document
import markdown
mk, scripts = markdown.mark(open(url).read())
document['zone'].html = mk
for script in scripts:
    exec(script, globals())
```