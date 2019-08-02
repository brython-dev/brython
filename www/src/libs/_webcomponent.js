// module for Web Components
var $module = (function($B){

function define(tag_name, cls){
    class WebComp extends HTMLElement {
      constructor() {
        // Always call super first in constructor
        super()
        // Call method __init__ of class, with the WebComp object as self
        if(cls.__init__){
            $B.$call(cls.__init__)($B.JSObject.$factory(this))
        }
      }
    }
    for(key in cls){
        // Wrap other methods such as connectedCallback
        if(typeof cls[key] == "function"){
            WebComp.prototype[key] = (function(attr){
                return function(){
                    return $B.pyobj2jsobj(cls[attr]).call(null, this, ...arguments)
                }
            })(key)
        }
    }

    // define WebComp as the class to use for the specified tag name 
    customElements.define(tag_name, WebComp)
}

return {define: define}

})(__BRYTHON__)