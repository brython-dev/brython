test_jsobj = {
    null_value:null,
    undef_value:undefined,
    test_num:10
}

function test_null(attr){
    return test_jsobj[attr] === null;
}
function test_none(attr) {
    return (test_jsobj[attr] === undefined);
}

a_table = {headers:[{name:"test",type:"string", value: 8, s: "a"}],rows:[]}

class JS_A {
}

function initClass() {
    return new JS_A();
}

class JSWithEq {
  __eq__(other) {
    return true;
  }
}

function initJSWithEq() {
  return new JSWithEq();
}

var root = {
    x: 1,
    children:[
        {
            x: 2,
            y: 3
        },
        {
            x: 5,
            y: 8
        }
    ]
}

// Class: used to test how a Python class can inherit from a JS class
// Class: used to test how a Python class can inherit from a JS class
class Polygon {
    nb_sides(){
        return 'sides'
    }
}
class Rectangle extends Polygon{
    constructor(height, width) {
        super()
        this.height = height;
        this.width = width;
    }
    surface(){
        return this.height * this.width
    }
    get area(){
        return this.height * this.width
    }
    set area(x){
        console.log('set area to', x, this.height, this.width)
        var s = this.height * this.width,
            ratio = Math.sqrt(x / s)
        this.height *= ratio
        this.width *= ratio
    }
    *getSides() {
      yield this.height;
      yield this.width;
      yield this.height;
      yield this.width;
    }

  static displayName = "Rectangle";
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.hypot(dx, dy);
  }
}

window.Rectangle = Rectangle // required !

// Constructor: used to test how a Python class can inherit from a
// JS constructor

function Square(x){
    this.x = x
    this.surface = function(){
        return this.x * this.x
    }
}

// issue 1486
function get_float() {
  return 57.735026919;
}

// issue 1696
function jsFunction1696() {
}

var js_list = ['b', 'a', 'c']

// for issue 2059
window.make_js_list = function(){
  return [0.5, 0.5]
}

window.test = function(t, ix, value){
  if(t[ix] != value){
    throw _b_.AssertionError.$factory(`at ${ix}, ${t[ix]} is not equal to ${value}`)
  }
}

window.set_array_proto = function(){
    Array.prototype.test = function () {
        return "Array test"
    }
}

window.del_array_proto = function(){
    delete Array.prototype.test
}

// issue 2165
function call(args, kwargs) {
  console.debug(args, kwargs)
  a = JSON.stringify(args)
  b = JSON.stringify(kwargs)
}
