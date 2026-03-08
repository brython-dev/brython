// module for Web Components
(function($B){

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
            $B.RAISE(_b_.TypeError, 'options can only be None or a ' +
                `dict, not '${$B.class_name(options)}'`)
        }
        try{
            _extends = _b_.dict.$getitem(options, 'extends')
        }catch(err){
            // ignore
        }
    }else{
        let stack = [...cls.tp_bases];
        while(stack.length) {
            base = stack.pop();
            if(base.__module__ === 'browser.html'){
                    _extends = base.__name__.toLowerCase()
                    break
            }
            stack.push(...base.tp_bases);
        }
    }

    if(_extends){
        if(typeof _extends != 'string'){
            $B.RAISE(_b_.TypeError, 'value for extends must be a ' +
                `string, not '${$B.class_name(_extends)}'`)
        }
        var elt = document.createElement(_extends)
        if(elt instanceof HTMLUnknownElement){
            $B.RAISE(_b_.ValueError, `'${_extends}' is not a valid ` +
                'tag name')
        }
        var extend_tag = _extends.toLowerCase()
        extend_dom_name = Object.getPrototypeOf(elt).constructor.name
    }
    if(typeof tag_name != "string"){
        $B.RAISE(_b_.TypeError, "first argument of define() " +
            "must be a string, not '" + $B.class_name(tag_name) + "'")
    }else if(tag_name.indexOf("-") == -1){
        $B.RAISE(_b_.ValueError, "custom tag name must " +
            "contain a hyphen (-)")
    }
    if(!$B.$isinstance(cls, _b_.type)){
        $B.RAISE(_b_.TypeError, "second argument of define() " +
            "must be a class, not '" + $B.class_name(tag_name) + "'")
    }
    cls.$webcomponent = true
    cls.tp_mro.splice(cls.tp_mro.length - 1, 0, $B.DOMNode)
    $B.make_getattr(cls)

    // Create the Javascript class used for the component. It must have
    // the same name as the Python class
    var src = String.raw`var WebComponent = class extends HTMLElement {
      constructor(){
        // Always call super first in constructor
        super()
        var html = $B.imported['browser.html']
        // Create tag in module html
        if($B.module_getattr(html, 'tag_name', $B.NULL) === $B.NULL){
            var maketag = $B.module_getattr(html, 'maketag')
            $B.$call(maketag, 'tag_name', WebComponent)
        }
        var init = $B.$getattr(cls, "__init__", _b_.None)
        if(init !== _b_.None){
            try{
                var _self = $B.DOMNode.$factory(this),
                    attrs_before_init = []
                for(var i = 0, len = _self.attributes.length; i < len; i++){
                    attrs_before_init.push(_self.attributes.item(i))
                }
                _self.ob_type = cls
                _self.dict = $B.empty_dict()
                $B.$call(init, _self)
                if(WebComponent.initialized){
                    // Check that init() did not introduce new attributes,
                    // which is illegal
                    // cf. https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
                    for(var i = 0, len = _self.attributes.length; i < len; i++){
                        var item = _self.attributes.item(i)
                        if(attrs_before_init.indexOf(item) == -1){
                            $B.RAISE(_b_.TypeError, "Custom element " +
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
            }
            if($B.$isinstance(obs_attr, _b_.property)){ // issue 2454
                obs_attr = obs_attr.prop_get(cls)
            }
            if(obs_attr === null){
                return []
            }else if(typeof obs_attr == "function"){
                var warning = $B.EXC(_b_.DeprecationWarning,
                    "Setting observedAttributes as a method " +
                    "is deprecated. Set it as a class attribute.")
                // module _warning is in builtin_modules.js
                $B.imported._warnings.warn(warning)
                return $B.$call(obs_attr, this)
            }else if(Array.isArray(obs_attr)){
                return obs_attr
            }else{
                $B.RAISE(_b_.TypeError,
                    "wrong type for observedAttributes: " +
                    $B.class_name(obs_attr))
            }
        }
    }
    `
    var name = cls.tp_name,
        code = src.replace(/WebComponent/g, name).
                   replace(/tag_name/g, tag_name).
                   replace(/HTMLElement/, extend_dom_name)
    eval(code)
    var webcomp = eval(name) // JS class for component
    webcomp.$cls = cls

    var mro = cls.tp_mro
    for(var i = mro.length - 1; i >= 0; i--){
        var pcls = mro[i]
        for(var entry of _b_.dict.$iter_items(pcls.dict)){
            var key = entry.key,
                value = entry.value
            if((! webcomp.hasOwnProperty(key)) &&
                    typeof value == "function"){
                webcomp.prototype[key] = (function(attr, v){
                    return function(){
                        try{
                            return $B.$call(v, $B.DOMNode.$factory(this), ...arguments)
                        }catch(err){
                            $B.show_error(err)
                        }
                    }
                })(key, value)
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

var module = {
    define: define,
    get: get
}

$B.addToImported('_webcomponent', module)

})(__BRYTHON__)
