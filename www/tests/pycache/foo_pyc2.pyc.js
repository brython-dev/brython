var $module=(function(){
    var $B=__BRYTHON__;
var __builtins__=_b_=$B.builtins;
var $locals_foo_pyc2=$B.imported["foo_pyc2"] || {};var $locals=$locals_foo_pyc2;
$B.enter_frame(["foo_pyc2", $locals_foo_pyc2,"foo_pyc2", $locals_foo_pyc2]);
eval($B.InjectBuiltins());

    $locals_foo_pyc2["__doc__"]=None;
    $locals_foo_pyc2["__name__"]="foo_pyc2";
    $locals_foo_pyc2["__file__"]="http://localhost/brython/www/tests/pycache/foo_pyc2.py";None;

    ;$locals.$line_info="1,foo_pyc2";
    $locals_foo_pyc2["get_foo"]=(function(){
        ;_b_.None;
        return function($extra){
            var $locals_foo_pyc2_get_foo_337={}, $local_name="foo_pyc2_get_foo_337",$locals=$locals_foo_pyc2_get_foo_337;
            ;$B.enter_frame([$local_name, $locals,"foo_pyc2", $locals_foo_pyc2]);
            if(arguments.length>0 && arguments[arguments.length-1].$nat){
                var $ns = $B.$MakeArgs1("get_foo", 0, {}, [], arguments, {}, null, null);
                for(var $var in $ns){$locals[$var]=$ns[$var]};
            }
            else{
                if(arguments.length!=0){
                    if(arguments.length>0){throw TypeError("get_foo() takes 0 positional argument but more were given")}
                }
            }
            ;$locals.$line_info="2,foo_pyc2";
            var $res = "foo from pyc2";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;
        }
    }
    )();
    $locals_foo_pyc2["get_foo"].$infos = {
        __name__:"get_foo",
        __defaults__ : [],
        __module__ : "foo_pyc2",
        __doc__: None,
        __code__:{
        __class__:$B.$CodeDict,
        co_argcount:0,
        co_filename:$locals_foo_pyc2["__file__"],
        co_firstlineno:1,
        co_flags:67,
        co_kwonlyargcount:0,
        co_name: "get_foo",
        co_nlocals: 0,
        co_varnames: []}
};None;
    ;$locals.$line_info="4,foo_pyc2";
    $locals_foo_pyc2["get_bar"]=(function(){
        ;_b_.None;
        return function($extra){
            var $locals_foo_pyc2_get_bar_338={}, $local_name="foo_pyc2_get_bar_338",$locals=$locals_foo_pyc2_get_bar_338;
            ;$B.enter_frame([$local_name, $locals,"foo_pyc2", $locals_foo_pyc2]);
            if(arguments.length>0 && arguments[arguments.length-1].$nat){
                var $ns = $B.$MakeArgs1("get_bar", 0, {}, [], arguments, {}, null, null);
                for(var $var in $ns){$locals[$var]=$ns[$var]};
            }
            else{
                if(arguments.length!=0){
                    if(arguments.length>0){throw TypeError("get_bar() takes 0 positional argument but more were given")}
                }
            }
            ;$locals.$line_info="5,foo_pyc2";
            var $res = "bar from pyc2";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;
        }
    }
    )();
    $locals_foo_pyc2["get_bar"].$infos = {
        __name__:"get_bar",
        __defaults__ : [],
        __module__ : "foo_pyc2",
        __doc__: None,
        __code__:{
        __class__:$B.$CodeDict,
        co_argcount:0,
        co_filename:$locals_foo_pyc2["__file__"],
        co_firstlineno:4,
        co_flags:67,
        co_kwonlyargcount:0,
        co_name: "get_bar",
        co_nlocals: 0,
        co_varnames: []}
};None;
    ;$B.leave_frame("foo_pyc2");

    return $locals_foo_pyc2
}
)(__BRYTHON__)
