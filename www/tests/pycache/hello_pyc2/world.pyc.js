var $module=(function(){
    var $B=__BRYTHON__;
var __builtins__=_b_=$B.builtins;
var $locals_hello_pyc2_world=$B.imported["hello_pyc2.world"] || {};var $locals=$locals_hello_pyc2_world;
$B.enter_frame(["hello_pyc2.world", $locals_hello_pyc2_world,"hello_pyc2.world", $locals_hello_pyc2_world]);
eval($B.InjectBuiltins());

    $locals_hello_pyc2_world["__doc__"]=None;
    $locals_hello_pyc2_world["__name__"]="hello_pyc2.world";
    $locals_hello_pyc2_world["__file__"]="http://localhost/brython/www/tests/pycache/hello_pyc2/world.py";None;

    ;$locals.$line_info="1,hello_pyc2.world";
    $locals_hello_pyc2_world["get_world"]=(function(){
        ;_b_.None;
        return function($extra){
            var $locals_hello_pyc2_world_get_world_335={}, $local_name="hello_pyc2_world_get_world_335",$locals=$locals_hello_pyc2_world_get_world_335;
            ;$B.enter_frame([$local_name, $locals,"hello_pyc2.world", $locals_hello_pyc2_world]);
            if(arguments.length>0 && arguments[arguments.length-1].$nat){
                var $ns = $B.$MakeArgs1("get_world", 0, {}, [], arguments, {}, null, null);
                for(var $var in $ns){$locals[$var]=$ns[$var]};
            }
            else{
                if(arguments.length!=0){
                    if(arguments.length>0){throw TypeError("get_world() takes 0 positional argument but more were given")}
                }
            }
            ;$locals.$line_info="2,hello_pyc2.world";
            var $res = "pyc2 world";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;
        }
    }
    )();
    $locals_hello_pyc2_world["get_world"].$infos = {
        __name__:"get_world",
        __defaults__ : [],
        __module__ : "hello_pyc2.world",
        __doc__: None,
        __code__:{
        __class__:$B.$CodeDict,
        co_argcount:0,
        co_filename:$locals_hello_pyc2_world["__file__"],
        co_firstlineno:1,
        co_flags:67,
        co_kwonlyargcount:0,
        co_name: "get_world",
        co_nlocals: 0,
        co_varnames: []}
};None;
    ;$B.leave_frame("hello_pyc2.world");

    return $locals_hello_pyc2_world
}
)(__BRYTHON__)
