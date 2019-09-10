// module for Web Components
var $module = (function($B){

var _b_ = $B.builtins

function define(tag_name, cls){
    var $ = $B.args("define", 2, {tag_name: null, cls: null},
            ["tag_name", "cls"], arguments, {}, null, null),
        tag_name = $.tag_name,
        cls = $.cls
    if(typeof tag_name != "string"){
        throw _b_.TypeError.$factory("first argument of define() " +
            "must be a string, not '" + $B.class_name(tag_name) + "'")
    }else if(tag_name.indexOf("-") == -1){
        throw _b_.ValueError.$factory("custom tag name must " +
            "contain a hyphen (-)")
    }
    if(!_b_.isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("second argument of define() " +
            "must be a class, not '" + $B.class_name(tag_name) + "'")
    }
    class WebComponent extends HTMLElement {
      constructor() {
        // Always call super first in constructor
        super()
        // Make cls a subclass of JSObject and of DOMNode (issue #1203)
        var mro = cls.__mro__
        if(mro.indexOf($B.JSObject) == -1){
            cls.__mro__.splice(cls.__mro__.length - 2, 0, $B.JSObject)
        }
        if(mro.indexOf($B.DOMNode) == -1){
            cls.__mro__.splice(cls.__mro__.length - 2, 0, $B.DOMNode)
        }
        // Call method __init__ of class, with the WebComp object as self
        if(cls.__init__){
            try{
                var _self = $B.DOMNode.$factory(this)
                // make "self" an instance of cls (issue #1203)
                _self.__class__ = cls
                $B.$call(cls.__init__)(_self)
            }catch(err){
                $B.handle_error(err)
            }
        }
      }
    }
    for(key in cls){
        // Wrap other methods such as connectedCallback
        if(typeof cls[key] == "function"){
            WebComponent.prototype[key] = (function(attr){
                return function(){
                    return $B.pyobj2jsobj(cls[attr]).call(null, this, ...arguments)
                }
            })(key)
        }
    }

    // define WebComp as the class to use for the specified tag name
    customElements.define(tag_name, WebComponent)
}

return {define: define}

})(__BRYTHON__)