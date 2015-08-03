var $module=(function(){
    var $B=__BRYTHON__;
var __builtins__=_b_=$B.builtins;
var $locals_hello_pyc2=$B.imported["hello_pyc2"] || {};var $locals=$locals_hello_pyc2;
$B.enter_frame(["hello_pyc2", $locals_hello_pyc2,"hello_pyc2", $locals_hello_pyc2]);
eval($B.InjectBuiltins());

    $locals_hello_pyc2["__doc__"]=None;
    $locals_hello_pyc2["__name__"]="hello_pyc2";
    $locals_hello_pyc2["__file__"]="http://localhost/brython/www/tests/pycache/hello_pyc2/__init__.py";None;

    ;$locals.$line_info="1,hello_pyc2";
    $locals_hello_pyc2["__all__"]=["get_hello","world"];
    ;$locals.$line_info="3,hello_pyc2";
    $locals_hello_pyc2["get_hello"]=(function(){
        ;_b_.None;
        return function($extra){
            var $locals_hello_pyc2_get_hello_333={}, $local_name="hello_pyc2_get_hello_333",$locals=$locals_hello_pyc2_get_hello_333;
            ;$B.enter_frame([$local_name, $locals,"hello_pyc2", $locals_hello_pyc2]);
            if(arguments.length>0 && arguments[arguments.length-1].$nat){
                var $ns = $B.$MakeArgs1("get_hello", 0, {}, [], arguments, {}, null, null);
                for(var $var in $ns){$locals[$var]=$ns[$var]};
            }
            else{
                if(arguments.length!=0){
                    if(arguments.length>0){throw TypeError("get_hello() takes 0 positional argument but more were given")}
                }
            }
            ;$locals.$line_info="4,hello_pyc2";
            var $res = "Hello from pyc2";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;
        }
    }
    )();
    $locals_hello_pyc2["get_hello"].$infos = {
        __name__:"get_hello",
        __defaults__ : [],
        __module__ : "hello_pyc2",
        __doc__: None,
        __code__:{
        __class__:$B.$CodeDict,
        co_argcount:0,
        co_filename:$locals_hello_pyc2["__file__"],
        co_firstlineno:3,
        co_flags:67,
        co_kwonlyargcount:0,
        co_name: "get_hello",
        co_nlocals: 0,
        co_varnames: []}
};None;
    ;$B.leave_frame("hello_pyc2");

    return $locals_hello_pyc2
}
)(__BRYTHON__)
