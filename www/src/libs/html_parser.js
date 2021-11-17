var $module = (function($B){

_b_ = $B.builtins

var ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    COMMENT_NODE =    8,
    DOCUMENT_TYPE_NODE =    10

var HTMLNode = $B.make_class("HTMLNode",
    function(){
        return {
            __class__: HTMLNode,
            nodeType: TEXT_NODE,
            text: ""
        }
    }
)

HTMLNode.__str__ = function(self){
    return self.text
}

$B.set_func_names(HTMLNode, "_html_parser")

function* tokenize(src){
    var node = HTMLNode.$factory(),
        pos = 0,
        tag = "",
        type = "text"
    while(pos < src.length){
        var char = src[pos]
        switch(type){
            case "text":
                if(char == "<"){
                    // starts a tag if immediately followed by a letter or by /
                    var tag_mo = /^(\/?)[a-zA-Z]+/.exec(src.substr(pos + 1))
                    if(tag_mo){
                        yield node
                        node = HTMLNode.$factory()
                        type = "tag"
                        node.tagName = ""
                        node.nodeType = ELEMENT_NODE
                        node.closing = tag_mo[1] != ""
                        node.attrs = []
                    }else{
                        // doctype declaration
                        var decl_mo = /^<!doctype\s+(.*?)>/i.exec(src.substr(pos))
                        if(decl_mo){
                            yield node
                            node = HTMLNode.$factory()
                            node.text = decl_mo[0]
                            node.doctype = decl_mo[1]
                            node.nodeType = DOCUMENT_TYPE_NODE
                            yield node
                            node = HTMLNode.$factory()
                            type = "text"
                            pos += decl_mo[0].length
                            break
                        }else{
                            // comment
                            var comment_mo = /^\<!(.*?)>/.exec(src.substr(pos))
                            if(comment_mo){
                                yield node
                                node = HTMLNode.$factory()
                                node.text = comment_mo[0]
                                node.comment = comment_mo[1]
                                node.nodeType = COMMENT_NODE
                                yield node
                                node = HTMLNode.$factory()
                                type = "text"
                                pos += comment_mo[0].length
                                break
                            }
                        }
                    }
                }
                pos++
                node.text += char
                break
            case "tag":
                if(char.search(/[_a-zA-Z]/) > -1){
                    var mo = /\w+/.exec(src.substr(pos))
                    if(mo !== null){
                        pos += mo[0].length
                        if(node.tagName == ""){
                            node.tagName = mo[0].toUpperCase()
                        }
                        node.text += mo[0]
                    }else{
                        pos++
                    }
                }else if(char == ">"){
                    node.text += char
                    yield node
                    node = HTMLNode.$factory()
                    type = "text"
                    pos++
                }else if(char == "="){
                    node.text += char
                    pos++
                }else if(char == "'" || char == '"'){
                    var i = pos + 1,
                        found_string_end = false
                    while(i < src.length){
                        if(src[i] == char){
                            var nb_escape = 0
                            while(src[i - 1 - nb_escape] == '/'){
                                nb_escape++
                            }
                            if(nb_escape % 2 == 0){
                                node.text += src.substr(pos, i + 1 - pos)
                                pos = i + 1
                                found_string_end = true
                                break
                            }else{
                                i++
                            }
                        }else if(src[i] == '>'){
                            break
                        }else{
                            i++
                        }
                    }
                    if(! found_string_end){
                        // unterminated string: ignore
                        pos++
                    }
                }else{
                    node.text += char
                    pos++
                }
                break
            default:
                pos++
        }
    }
    yield node
}
return  {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE:    8,
    DOCUMENT_TYPE_NODE:    10,
    tokenize: tokenize
}

})(__BRYTHON__)
