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
class Rectangle {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
    surface(){
        return this.height * this.width
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
