from browser import doc, markdown, html

def keydown(ev, path, zone, page):
    if ev.keyCode in [39,40]: # key right or down : next page
        show(path, zone, page+1)
        ev.preventDefault()    
    elif ev.keyCode in [37,38]: #key left or up: previous page
        show(path, zone, page-1)
        ev.preventDefault()

def move_to(ev, path, zone, nb_pages):
    pc = (ev.x-ev.target.left)/ev.target.width
    page = round(nb_pages*pc)
    new_pos = '%spx' %(ev.x-ev.target.left-(doc['tl_pos'].width/2))
    # show page at specified position
    show(path, zone, page)
    # set new cursor position
    doc['tl_pos'].style.left = new_pos

def click_on_tl_pos(ev):
    # don't move if user clicks on current timeline position
    ev.stopPropagation()

def show(path, zone, page_num=0):
    src = open(path).read()
    title = ''
    show_page_num = False
    
    # table of contents : matches matter with page number
    contents = []
    
    # directives for the document
    while src.startswith('@'):
        line_end = src.find('\n')
        key,value = src[:line_end].split(' ',1)
        if key=='@title':
            title = value
        elif key=='@pagenum':
            show_page_num = True
        elif key=="@index":
            contents.append([value, 0])
        src = src[line_end+1:]

    zone.html = ''
    pages = src.split('../..\n')
    
    # table of contents
    for num, _page in enumerate(pages):
        if num==0:
            continue
        if _page.startswith('@index'):
            line_end = _page.find('\n')
            key,value = _page[:line_end].split(' ',1)
            contents.append([value, num])
            pages[num] = _page[line_end+1:]
    
    if page_num<0:
        page_num = 0
    elif page_num >= len(pages):
        page_num = len(pages)-1
    doc.unbind('keydown')
    doc.bind('keydown',lambda ev:keydown(ev, path, zone, page_num))
    
    # if table of contents is not empty, add it
    if contents:
        toc = html.SELECT(name="toc")
        toc.bind('change', lambda ev: show(path, zone, 
            int(ev.target.options[ev.target.selectedIndex].value)))
        for content in contents:
            toc <= html.OPTION(content[0], value=content[1],
                selected=page_num>=content[1])
            
    body = html.DIV()
    body.html = markdown.mark(pages[page_num])[0]

    if contents:
        body = html.DIV(toc+body)

    footer = html.DIV(Id="footer")
    if title:
        footer <= html.DIV(title,style=dict(display='inline'))
    if show_page_num:
        footer <= html.SPAN(' (%s/%s)' %(page_num+1, len(pages)),
            style=dict(display='inline'))
    timeline = html.DIV(Id='timeline')
    tl_pos = html.DIV(Id='tl_pos')
    timeline <= tl_pos
    timeline.bind('click', lambda ev:move_to(ev, path, zone, len(pages)))
    tl_pos.bind('click', click_on_tl_pos)
    zone <= body+footer+timeline
    tl_pos.style.left = '%spx' %(timeline.width*page_num/len(pages))

