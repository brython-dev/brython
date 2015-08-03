var $module=(function(){
    var $B=__BRYTHON__;
var __builtins__=_b_=$B.builtins;
var $locals_test_issue7_pyc2=$B.imported["test_issue7_pyc2"] || {};var $locals=$locals_test_issue7_pyc2;
$B.enter_frame(["test_issue7_pyc2", $locals_test_issue7_pyc2,"test_issue7_pyc2", $locals_test_issue7_pyc2]);
eval($B.InjectBuiltins());

    $locals_test_issue7_pyc2["__doc__"]=None;
    $locals_test_issue7_pyc2["__name__"]="test_issue7_pyc2";
    $locals_test_issue7_pyc2["__file__"]="http://localhost/brython/www/tests/pycache/test_issue7_pyc2.py";None;

    ;$locals.$line_info="1,test_issue7_pyc2";
    $locals_test_issue7_pyc2["yyy"]=(function(){
        ;_b_.None;
        return function($extra){
            var $locals_test_issue7_pyc2_yyy_340={}, $local_name="test_issue7_pyc2_yyy_340",$locals=$locals_test_issue7_pyc2_yyy_340;
            ;$B.enter_frame([$local_name, $locals,"test_issue7_pyc2", $locals_test_issue7_pyc2]);
            if(arguments.length>0 && arguments[arguments.length-1].$nat){
                var $ns = $B.$MakeArgs1("yyy", 0, {}, [], arguments, {}, null, null);
                for(var $var in $ns){$locals[$var]=$ns[$var]};
            }
            else{
                if(arguments.length!=0){
                    if(arguments.length>0){throw TypeError("yyy() takes 0 positional argument but more were given")}
                }
            }
            ;$locals.$line_info="2,test_issue7_pyc2";
            var $res = (typeof $B.$search("xxx", $locals_test_issue7_pyc2).valueOf() == "number" ? (typeof $B.$search("xxx", $locals_test_issue7_pyc2) == "number" ? $B.sub($B.$search("xxx", $locals_test_issue7_pyc2),3) : new $B.$FloatClass($B.sub($B.$search("xxx", $locals_test_issue7_pyc2),3))): getattr($B.$search("xxx", $locals_test_issue7_pyc2),"__sub__")(3));if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;
        }
    }
    )();
    $locals_test_issue7_pyc2["yyy"].$infos = {
        __name__:"yyy",
        __defaults__ : [],
        __module__ : "test_issue7_pyc2",
        __doc__: None,
        __code__:{
        __class__:$B.$CodeDict,
        co_argcount:0,
        co_filename:$locals_test_issue7_pyc2["__file__"],
        co_firstlineno:1,
        co_flags:67,
        co_kwonlyargcount:0,
        co_name: "yyy",
        co_nlocals: 0,
        co_varnames: []}
};None;
    ;$B.leave_frame("test_issue7_pyc2");

    return $locals_test_issue7_pyc2
}
)(__BRYTHON__)
