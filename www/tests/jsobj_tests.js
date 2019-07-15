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
