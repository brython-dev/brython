// module for Web Components
var $module = (function($B){

var _b_ = $B.builtins

function define(tag_name, cls, options){
    var $ = $B.args("define", 3, {tag_name: null, cls: null, options: null},
            ["tag_name", "cls", "options"], arguments, {options: _b_.None},
            null, null),
        tag_name = $.tag_name,
        cls = $.cls,
        options = $.options,
        _extends,
        extend_dom_name = 'HTMLElement'
    if(options !== _b_.None){
        if(! $B.$isinstance(options, _b_.dict)){
            throw _b_.TypeError.$factory('options can only be None or a ' +
                `dict, not '${$B.class_name(options)}'`)
        }
        try{
            _extends = _b_.dict.$getitem(options, 'extends')
        }catch(err){
            // ignore
        }
    }else{
        let stack = [...cls.__bases__];
        while(stack.length) {
        	base = stack.pop();
		if(base.__module__ === 'browser.html'){
		        _extends = base.__name__.toLowerCase()
		        break
		}
		    
		stack.push(...base.__bases__);
	}
    }

    if(_extends){
        if(typeof _extends != 'string'){
            throw _b_.TypeError.$factory('value for extends must be a ' +
                `string, not '${$B.class_name(_extends)}'`)
        }
        var elt = document.createElement(_extends)
        if(elt instanceof HTMLUnknownElement){
            throw _b_.ValueError.$factory(`'${_extends}' is not a valid ` +
                'tag name')
        }
        var extend_tag = _extends.toLowerCase()
        extend_dom_name = Object.getPrototypeOf(elt).constructor.name
    }
    if(typeof tag_name != "string"){
        throw _b_.TypeError.$factory("first argument of define() " +
            "must be a string, not '" + $B.class_name(tag_name) + "'")
    }else if(tag_name.indexOf("-") == -1){
        throw _b_.ValueError.$factory("custom tag name must " +
            "contain a hyphen (-)")
    }
    if(!$B.$isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("second argument of define() " +
            "must be a class, not '" + $B.class_name(tag_name) + "'")
    }
    cls.$webcomponent = true

    // Create the Javascript class used for the component. It must have
    // the same name as the Python class
    var src = String.raw`var WebComponent = class extends HTMLElement {
      constructor(){
        // Always call super first in constructor
        super()
        var html = $B.imported['browser.html']
        // Create tag in module html
        if(html['tag_name'] === undefined){
            html.maketag('tag_name', WebComponent)
        }
        var init = $B.$getattr(cls, "__init__", _b_.None)
        if(init !== _b_.None){
            try{
                var _self = $B.DOMNode.$factory(this),
                    attrs_before_init = []
                for(var i = 0, len = _self.attributes.length; i < len; i++){
                    attrs_before_init.push(_self.attributes.item(i))
                }
                _self.__class__ = cls
                $B.$call(init)(_self)
                if(WebComponent.initialized){
                    // Check that init() did not introduce new attributes,
                    // which is illegal
                    // cf. https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
                    for(var i = 0, len = _self.attributes.length; i < len; i++){
                        var item = _self.attributes.item(i)
                        if(attrs_before_init.indexOf(item) == -1){
                            throw _b_.TypeError.$factory("Custom element " +
                                "must not create attributes, found: " +
                                item.name + '="' + item.value + '"')
                        }
                    }
                }
            }catch(err){
                $B.handle_error(err)
            }
        }
      }
        static get observedAttributes(){
            var obs_attr = $B.$getattr(cls, "observedAttributes", null)
            if(obs_attr === null){
                return []
            }else if(typeof obs_attr == "function"){
                var warning = _b_.DeprecationWarning.$factory(
                    "Setting observedAttributes as a method " +
                    "is deprecated. Set it as a class attribute.")
                // module _warning is in builtin_modules.js
                $B.imported._warnings.warn(warning)
                return $B.$call(obs_attr)(this)
            }else if(Array.isArray(obs_attr)){
                return obs_attr
            }else{
                throw _b_.TypeError.$factory(
                    "wrong type for observedAttributes: " +
                    $B.class_name(obs_attr))
            }
        }
    }
    `
    var name = cls.__name__,
        code = src.replace(/WebComponent/g, name).
                   replace(/tag_name/g, tag_name).
                   replace(/HTMLElement/, extend_dom_name)
    var src = eval(code)
    var webcomp = eval(name) // JS class for component
    webcomp.$cls = cls

    // Override __getattribute__ to handle DOMNode attributes such as
    // attachShadow
    cls.__getattribute__ = function(self, attr){
        try{
            return $B.DOMNode.__getattribute__(self, attr)
        }catch(err){
            if($B.DOMNode[attr]){
                if(typeof $B.DOMNode[attr] == 'function'){
                    return function(){
                        var args = [self]
                        for(var i = 0, len = arguments.length; i < len; i++){
                            args.push(arguments[i])
                        }
                        return $B.DOMNode[attr].apply(null, args)
                    }
                }else{
                    return $B.DOMNode[attr]
                }
            }
            throw err
        }
    }

    var mro = [cls].concat(cls.__mro__).reverse()
    for(var i = 0, len = mro.length; i < len; i++){
        var pcls = mro[i]
        for(var key in pcls){
            if((! webcomp.hasOwnProperty(key)) &&
                    typeof pcls[key] == "function" &&
                    // don't set $factory (would make it a class)
                    key !== '$factory'
                    ){
                webcomp.prototype[key] = (function(attr, klass){
                    return function(){
                        try{
                            return $B.$call(klass[attr])($B.DOMNode.$factory(this), ...arguments)
                        }catch(err){
                            $B.show_error(err)
                        }
                    }
                })(key, pcls)
            }
        }
    }

    // define WebComp as the class to use for the specified tag name
    if(_extends){
        customElements.define(tag_name, webcomp, {extends: extend_tag})
    }else{
        customElements.define(tag_name, webcomp)
    }
    webcomp.initialized = true
}

function get(name){
    var ce = customElements.get(name)
    if(ce && ce.$cls){return ce.$cls}
    return _b_.None
}

return {
    define: define,
    get: get
}

})(__BRYTHON__)
