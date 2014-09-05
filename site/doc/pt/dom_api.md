Introdução
----------

Para interface com o navegador, Brython está em conformidade com a
interface do Modelo de Objetos de Documentos (DOM), que é amplamente
documentada na web:

- [Referência W3C](http://www.w3.org/DOM/)
- [Página da Wikipedia (pt)](http://pt.wikipedia.org/wiki/Modelo_de_Objeto_de_Documentos)
- [Página da Wikipedia (en)](http://en.wikipedia.org/wiki/Document_Object_Model)
- [Site da Mozilla (en)](https://developer.mozilla.org/en-US/docs/DOM)
- [Site da Mozilla (pt-BR)](https://developer.mozilla.org/pt-BR/docs/DOM)
- [Site da Mozilla (pt-PT)](https://developer.mozilla.org/pt-PT/docs/DOM)

Esta interface é independente de linguagens. Com Brython, todas as
operações descritas na DOM API se baseiam em dois objetos definidos no
módulo **browser**: _document_ e _window_

_document_ implementa a interface `Document` definida na DOM API. Por
exemplo, ele suporta os seguintes métodos:

<code>_document_.getElementById(_elt\_id_)</code>

> Retorna uma referência ao elemento DOM cuja id é _elt\_id_.

<code>_document_.createElement(_tagName_)</code>

> Retorna um novo elemento do tipo _tagName_; por exemplo, para criar
> um link de hipertexto:

>    link = document.createElement('A')

<code>_document_.appendChild(_elt_)</code>

> Adiciona o elemento _elt_ ao documento.

Além desta interface padrão, Brython propõe uma interface alternativa,
mais familiar aos desenvolvedores Brython. Ela é descrita nas páginas
seguintes.
