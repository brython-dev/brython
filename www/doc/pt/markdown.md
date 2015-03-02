módulo **browser.markdown**
---------------------------

markdown é um modo de formatação de texto adaptado para publicação na
Internet, mais simples de editar do que HTML.

Uma descrição completa está disponível no
[site de markdown](http://daringfireball.net/projects/markdown/). O
módulo **browser.markdown** é uma versão ligeiramente adaptada: para
enriquecer as opções de renderização, as etiquetas markdown \_text\_ e
\*text\* correspondem a duas etiquetas HTML diferentes: `<I>` e
`<EM>`, assim como \_\_text\_\_ e \*\*text\*\* correspondem a `<B>` e
`<STRONG>`

O módulo **browser.markdown** expõe uma única função:

`mark(`_src_`)`

> _src_ é a cadeia contendo o texto formatado com a sintaxe
> _markdown. A função retorna uma tupla de dois elementos: *html,
> scripts* onde *html* é o código HTML gerado da origem e *scripts* é
> uma lista de todos os códigos-fonte de scripts encontrados na
> página._

O exemplo abaixo mostra como obter o conteúdo de um arquivo markdown
no endereço _url_, preencher uma zona no documento com o código HTML
correspondente e executar todos os scripts na página. Esta técnica é
usada nestas páginas de documentação.

<blockquote>
    from browser import doc,markdown
    mk,scripts = markdown.mark(open(url).read())
    doc['zone'].html = mk
    for script in scripts:
        exec(script,globals())
</blockquote>
