var _b_ = __BRYTHON__.builtins

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

// issue 2172
Array.prototype.test2172 = function () {
    console.debug("does work!")
}

demo_array  = []
demo_array.test2172()
demo_array.demo_array2 = []
demo_array.demo_array2.test2172()

// issue in Google group
// https://groups.google.com/g/brython/c/y3eAGcl1hfY
window.js_error = function(){
    throw Error('catching JS error')
}

// issue 2248
window.func_returns_null = function() { return null }
window.func_returns_undefined = function() { return undefined }
window.func_returns_nothing = function() { }

class F2248 {
    get _null() { return null }
    get _undefined() { return undefined }
}

window.obj_with_getters = new F2248()

window.test_py_returns_undefined = function(){
    var res = window.py_returns_undefined()
    if(res !== undefined){
        throw Error('window.py_returns_undefined should return undefined, ' +
            'returns ' + res)
    }
}

// issue 2249
class X2249 {}

class Z2249 {
    constructor() {
        this.x = new X2249()
    }

    get me() {
        return this.x
    }
}

let z2249 = new Z2249();
window.x2249 = z2249

console.log(window.Date === window.Date)
console.log(window.x2249 == window.x2249)
console.log(window.x2249 === window.x2249.me)
console.log(window.x2249.me === window.x2249.me)

// issue 2251
var m = new Map()
window.async_func_with_python_callback = async function(faa, c) {
    m.set(faa, 'faa')
    p = faa(c)
    if(! p instanceof Promise){
        throw Error('p is not a Promise')
    }
    await p.then(e => e)
}

// issue 2261
var aws = [[false, false], false];

window.array_with_subitem = aws;
window.array_with_subitem0 = aws[0];

window.set_subitem_value = function(){
    aws[0][0] = true
    aws[1] = true
}

// issue 2262 : recursive array
function init_array(){
  let array = [0, 1];
  array[0] = array;
  array[2] = window.xv
  window.array = array;
}

// using Javascript non-integers numbers in Python
window.test_py_func_from_javascript = function(){
    console.log(window.py_func(null)) // 'x is null'
    console.log(window.py_func(3.14)) // JS representation of Brython None
}

window.test_pyfunc_receives_js_number = function(){
    console.log('py module name', window.py_module_name)
    __BRYTHON__.imported[window.py_module_name].pyfunc_receives_js_number(3.14)
}

// consistency between function calls and reference
window.get_array_from_func_call = function(){
  return [4.5, 'a', {x: 'abc'}]
}

window.array_by_reference = [4.5, 'a', {x: 'abc'}]
