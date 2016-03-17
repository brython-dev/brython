function empty_list(){return []}
function list1(){return [1, 2, 'a', ['b']]}
function jsobj(){return {a:1}}

// test if an object with length and item() supports subscription
function subscriptable(data){
    return {data: data,
        length: data.length,
        item: function(rank){
            return data.charAt(rank)
        }
    }
}

// test constructors
function get_constructor() {
    return function() {
        this.foo = 'hi';
    };
}