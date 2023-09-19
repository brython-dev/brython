function empty_list(){return []}
function list1(){return [1, 2, 'a', ['b']]}
function jsobj(){return {a:1}}

// test if an object with length and item() supports subscription
window.subscriptable = function(data){
    this.data = data
}

Object.defineProperty(window.subscriptable.prototype, 'length',
    {
        get: function(){
            return this.data.length
        }
    }
)

window.subscriptable.prototype.item = function(rank){
    return this.data[rank]
}

// test constructors
function get_constructor() {
    return function() {
        this.foo = 'hi';
    };
}

// test dynamic constructor creation
function base_class() {
    this.name = 'base';
}

base_class.extra = 'extra';

base_class.extend = function() {
    var parent = this;
    return function() {
        this.extra = parent.extra;
        return parent.apply(this, arguments);
    }
}

function jsReturnsUndefined() {
    return undefined;
}
