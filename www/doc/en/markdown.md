module **browser.markdown**
---------------------------

markdown is a mode of text formatting adapted to publication on Internet, more simple to edit than HTML

A complete description is available on [the mardown site](http://daringfireball.net/projects/markdown/). The module `markdown` is a slightly adapted version : to enrich the rendering options, the markdown tags \_text\_ and \*text\* match two different HTML tags : `<I>` and `<EM>`, as well as \_\_text\_\_ and \*\*text\*\* that match `<B>` and `<STRONG>`

The module `markdown` exposes a single function : 

`mark(`_src_`)`
> _src_ is a string holding text formatted with the markdown syntax. The function returns a 2-element tuple : *html, scripts* where *html* is the HTML code generated from the source, and *scripts* is a list of all the source code of scripts found in the page

The example below shows how to get the content of a markdown file at address _url_, fill a zone in the document with the matching HTML code, and run all the scripts in the page. This technique is used in these documentation pages

<blockquote>
    from browser import document as doc
    from browser import markdown
    mk,scripts = markdown.mark(open(url).read())
    doc['zone'].html = mk
    for script in scripts:
        exec(script,globals())
</blockquote>
