módulo **browser.markdown**
---------------------------

markdown es un modo de formateo de texto adaptado a la publicación en Internet, siendo más sencillo de editar que HTML

Una descripción completa está disponible en [la página de markdown](http://daringfireball.net/projects/markdown/). El módulo `markdown` es una versión ligeramente adaptada : para enriquecer las opciones de renderizado, las etiquetas markdown \_text\_ y \*text\* se asemejan a las etiquetas HTML : `<I>` y `<EM>`, además de \_\_text\_\_ y \*\*text\*\* que se asemejan a `<B>` y `<STRONG>`

El módulo `markdown` permite acceder a una única función : 

<code>mark(_src_)</code> 

>donde *src* es una cadena que contiene el texto formateado con la sintaxis markdown. La función devuelve una tupla de 2 elementos : *html, scripts* donde *html* es el códio HTML generado a partir del código markdown y *scripts* es una lista de todos los código fuente de scripts encontrados en la página.

El ejemplo que se muestra a continuación muestra como obtener el contenido de un fichero markdown en la dirección _url_, rellena una zona del documento con el código HTML generado y ejecuta todos los scripts de la página. Esta técnica es la que se usa en estas páginas de documentación

<blockquote>
    from browser import document as doc
    from browser import markdown
    mk,scripts = markdown.mark(open(url).read())
    doc['zone'].html = mk
    for script in scripts:
        exec(script,globals())
</blockquote>
