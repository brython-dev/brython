$vfs = {'hello_pyc' : ['.pyc.js',
                      'var $module=(function(){\n' +
                      'var $B=__BRYTHON__;\n' +
                      'var __builtins__=_b_=$B.builtins;\n' +
                      'var $locals_hello_pyc=$B.imported["hello_pyc"] || {};var $locals=$locals_hello_pyc;\n' +
                      '$B.enter_frame(["hello_pyc", $locals_hello_pyc,"hello_pyc", $locals_hello_pyc]);\n' +
                      'eval($B.InjectBuiltins());\n' +
                      '\n' +
                      '$locals_hello_pyc["__doc__"]=None;\n' +
                      '$locals_hello_pyc["__name__"]="hello_pyc";\n' +
                      '$locals_hello_pyc["__file__"]="http://localhost/brython/www/tests/test_pyc.vfs.js#hello_pyc";None;\n' +
                      '\n' +
                      ';$locals.$line_info="1,hello_pyc";\n' +
                      '$locals_hello_pyc["__all__"]=["get_hello","world"];\n' +
                      ';$locals.$line_info="2,hello_pyc";\n' +
                      '$locals_hello_pyc["get_hello"]=(function(){\n' +
                      ';_b_.None;\n' +
                      'return function($extra){\n' +
                      'var $locals_hello_pyc_get_hello_298={}, $local_name="hello_pyc_get_hello_298",$locals=$locals_hello_pyc_get_hello_298;\n' +
                      ';$B.enter_frame([$local_name, $locals,"hello_pyc", $locals_hello_pyc]);\n' +
                      'if(arguments.length>0 && arguments[arguments.length-1].$nat){\n' +
                      'var $ns = $B.$MakeArgs1("get_hello", 0, {}, [], arguments, {}, null, null);\n' +
                      'for(var $var in $ns){$locals[$var]=$ns[$var]};\n' +
                      '}\n' +
                      'else{\n' +
                      'if(arguments.length!=0){\n' +
                      'if(arguments.length>0){throw TypeError("get_hello() takes 0 positional argument but more were given")}\n' +
                      '}\n' +
                      '}\n' +
                      ';$locals.$line_info="3,hello_pyc";\n' +
                      'var $res = "Hello from pyc";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;\n' +
                      '}\n' +
                      '}\n' +
                      ')();\n' +
                      '$locals_hello_pyc["get_hello"].$infos = {\n' +
                      '__name__:"get_hello",\n' +
                      '__defaults__ : [],\n' +
                      '__module__ : "hello_pyc",\n' +
                      '__doc__: None,\n' +
                      '__code__:{\n' +
                      '__class__:$B.$CodeDict,\n' +
                      'co_argcount:0,\n' +
                      'co_filename:$locals_hello_pyc["__file__"],\n' +
                      'co_firstlineno:2,\n' +
                      'co_flags:67,\n' +
                      'co_kwonlyargcount:0,\n' +
                      'co_name: "get_hello",\n' +
                      'co_nlocals: 0,\n' +
                      'co_varnames: []}\n' +
                      '};None;\n' +
                      ';$B.leave_frame("hello_pyc");\n' +
                      '\n' +
                      'return $locals_hello_pyc\n' +
                      '}\n' +
                      ')(__BRYTHON__)', 1],
 'hello_pyc.world' : ['.pyc.js',
                      'var $module=(function(){\n' +
                      'var $B=__BRYTHON__;\n' +
                      'var __builtins__=_b_=$B.builtins;\n' +
                      'var $locals_hello_pyc_world=$B.imported["hello_pyc.world"] || {};var $locals=$locals_hello_pyc_world;\n' +
                      '$B.enter_frame(["hello_pyc.world", $locals_hello_pyc_world,"hello_pyc.world", $locals_hello_pyc_world]);\n' +
                      'eval($B.InjectBuiltins());\n' +
                      '\n' +
                      '$locals_hello_pyc_world["__doc__"]=None;\n' +
                      '$locals_hello_pyc_world["__name__"]="hello_pyc.world";\n' +
                      '$locals_hello_pyc_world["__file__"]="http://localhost/brython/www/tests/test_pyc.vfs.js#hello_pyc.world";None;\n' +
                      '\n' +
                      ';$locals.$line_info="1,hello_pyc.world";\n' +
                      '$locals_hello_pyc_world["get_world"]=(function(){\n' +
                      ';_b_.None;\n' +
                      'return function($extra){\n' +
                      'var $locals_hello_pyc_world_get_world_299={}, $local_name="hello_pyc_world_get_world_299",$locals=$locals_hello_pyc_world_get_world_299;\n' +
                      ';$B.enter_frame([$local_name, $locals,"hello_pyc.world", $locals_hello_pyc_world]);\n' +
                      'if(arguments.length>0 && arguments[arguments.length-1].$nat){\n' +
                      'var $ns = $B.$MakeArgs1("get_world", 0, {}, [], arguments, {}, null, null);\n' +
                      'for(var $var in $ns){$locals[$var]=$ns[$var]};\n' +
                      '}\n' +
                      'else{\n' +
                      'if(arguments.length!=0){\n' +
                      'if(arguments.length>0){throw TypeError("get_world() takes 0 positional argument but more were given")}\n' +
                      '}\n' +
                      '}\n' +
                      ';$locals.$line_info="2,hello_pyc.world";\n' +
                      'var $res = "pyc world";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;\n' +
                      '}\n' +
                      '}\n' +
                      ')();\n' +
                      '$locals_hello_pyc_world["get_world"].$infos = {\n' +
                      '__name__:"get_world",\n' +
                      '__defaults__ : [],\n' +
                      '__module__ : "hello_pyc.world",\n' +
                      '__doc__: None,\n' +
                      '__code__:{\n' +
                      '__class__:$B.$CodeDict,\n' +
                      'co_argcount:0,\n' +
                      'co_filename:$locals_hello_pyc_world["__file__"],\n' +
                      'co_firstlineno:1,\n' +
                      'co_flags:67,\n' +
                      'co_kwonlyargcount:0,\n' +
                      'co_name: "get_world",\n' +
                      'co_nlocals: 0,\n' +
                      'co_varnames: []}\n' +
                      '};None;\n' +
                      ';$B.leave_frame("hello_pyc.world");\n' +
                      '\n' +
                      'return $locals_hello_pyc_world\n' +
                      '}\n' +
                      ')(__BRYTHON__)\n' +
                      ''],
 'foo_pyc' : ['.pyc.js',
                      'var $module=(function(){\n' +
                      'var $B=__BRYTHON__;\n' +
                      'var __builtins__=_b_=$B.builtins;\n' +
                      'var $locals_foo_pyc=$B.imported["foo_pyc"] || {};var $locals=$locals_foo_pyc;\n' +
                      '$B.enter_frame(["foo_pyc", $locals_foo_pyc,"foo_pyc", $locals_foo_pyc]);\n' +
                      'eval($B.InjectBuiltins());\n' +
                      '\n' +
                      '$locals_foo_pyc["__doc__"]=None;\n' +
                      '$locals_foo_pyc["__name__"]="foo_pyc";\n' +
                      '$locals_foo_pyc["__file__"]="http://localhost/brython/www/tests/test_pyc.vfs.js#foo_pyc";None;\n' +
                      '\n' +
                      ';$locals.$line_info="1,foo_pyc";\n' +
                      '$locals_foo_pyc["get_foo"]=(function(){\n' +
                      ';_b_.None;\n' +
                      'return function($extra){\n' +
                      'var $locals_foo_pyc_get_foo_300={}, $local_name="foo_pyc_get_foo_300",$locals=$locals_foo_pyc_get_foo_300;\n' +
                      ';$B.enter_frame([$local_name, $locals,"foo_pyc", $locals_foo_pyc]);\n' +
                      'if(arguments.length>0 && arguments[arguments.length-1].$nat){\n' +
                      'var $ns = $B.$MakeArgs1("get_foo", 0, {}, [], arguments, {}, null, null);\n' +
                      'for(var $var in $ns){$locals[$var]=$ns[$var]};\n' +
                      '}\n' +
                      'else{\n' +
                      'if(arguments.length!=0){\n' +
                      'if(arguments.length>0){throw TypeError("get_foo() takes 0 positional argument but more were given")}\n' +
                      '}\n' +
                      '}\n' +
                      ';$locals.$line_info="2,foo_pyc";\n' +
                      'var $res = "foo from pyc";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;\n' +
                      '}\n' +
                      '}\n' +
                      ')();\n' +
                      '$locals_foo_pyc["get_foo"].$infos = {\n' +
                      '__name__:"get_foo",\n' +
                      '__defaults__ : [],\n' +
                      '__module__ : "foo_pyc",\n' +
                      '__doc__: None,\n' +
                      '__code__:{\n' +
                      '__class__:$B.$CodeDict,\n' +
                      'co_argcount:0,\n' +
                      'co_filename:$locals_foo_pyc["__file__"],\n' +
                      'co_firstlineno:1,\n' +
                      'co_flags:67,\n' +
                      'co_kwonlyargcount:0,\n' +
                      'co_name: "get_foo",\n' +
                      'co_nlocals: 0,\n' +
                      'co_varnames: []}\n' +
                      '};None;\n' +
                      ';$locals.$line_info="4,foo_pyc";\n' +
                      '$locals_foo_pyc["get_bar"]=(function(){\n' +
                      ';_b_.None;\n' +
                      'return function($extra){\n' +
                      'var $locals_foo_pyc_get_bar_301={}, $local_name="foo_pyc_get_bar_301",$locals=$locals_foo_pyc_get_bar_301;\n' +
                      ';$B.enter_frame([$local_name, $locals,"foo_pyc", $locals_foo_pyc]);\n' +
                      'if(arguments.length>0 && arguments[arguments.length-1].$nat){\n' +
                      'var $ns = $B.$MakeArgs1("get_bar", 0, {}, [], arguments, {}, null, null);\n' +
                      'for(var $var in $ns){$locals[$var]=$ns[$var]};\n' +
                      '}\n' +
                      'else{\n' +
                      'if(arguments.length!=0){\n' +
                      'if(arguments.length>0){throw TypeError("get_bar() takes 0 positional argument but more were given")}\n' +
                      '}\n' +
                      '}\n' +
                      ';$locals.$line_info="5,foo_pyc";\n' +
                      'var $res = "bar from pyc";if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;\n' +
                      '}\n' +
                      '}\n' +
                      ')();\n' +
                      '$locals_foo_pyc["get_bar"].$infos = {\n' +
                      '__name__:"get_bar",\n' +
                      '__defaults__ : [],\n' +
                      '__module__ : "foo_pyc",\n' +
                      '__doc__: None,\n' +
                      '__code__:{\n' +
                      '__class__:$B.$CodeDict,\n' +
                      'co_argcount:0,\n' +
                      'co_filename:$locals_foo_pyc["__file__"],\n' +
                      'co_firstlineno:4,\n' +
                      'co_flags:67,\n' +
                      'co_kwonlyargcount:0,\n' +
                      'co_name: "get_bar",\n' +
                      'co_nlocals: 0,\n' +
                      'co_varnames: []}\n' +
                      '};None;\n' +
                      ';$B.leave_frame("foo_pyc");\n' +
                      '\n' +
                      'return $locals_foo_pyc\n' +
                      '}\n' +
                      ')(__BRYTHON__)'],
 'test_issue7_pyc' : ['.pyc.js', 
                      'var $module=(function(){\n' +
                      'var $B=__BRYTHON__;\n' +
                      'var __builtins__=_b_=$B.builtins;\n' +
                      'var $locals_test_issue7_pyc=$B.imported["test_issue7_pyc"] || {};var $locals=$locals_test_issue7_pyc;\n' +
                      '$B.enter_frame(["test_issue7_pyc", $locals_test_issue7_pyc,"test_issue7_pyc", $locals_test_issue7_pyc]);\n' +
                      'eval($B.InjectBuiltins());\n' +
                      '\n' +
                      '$locals_test_issue7_pyc["__doc__"]=None;\n' +
                      '$locals_test_issue7_pyc["__name__"]="test_issue7_pyc";\n' +
                      '$locals_test_issue7_pyc["__file__"]="http://localhost/brython/www/tests/test_pyc.vfs.js#test_issue7_pyc";None;\n' +
                      '\n' +
                      ';$locals.$line_info="1,test_issue7_pyc";\n' +
                      '$locals_test_issue7_pyc["yyy"]=(function(){\n' +
                      ';_b_.None;\n' +
                      'return function($extra){\n' +
                      'var $locals_test_issue7_pyc_yyy_302={}, $local_name="test_issue7_pyc_yyy_302",$locals=$locals_test_issue7_pyc_yyy_302;\n' +
                      ';$B.enter_frame([$local_name, $locals,"test_issue7_pyc", $locals_test_issue7_pyc]);\n' +
                      'if(arguments.length>0 && arguments[arguments.length-1].$nat){\n' +
                      'var $ns = $B.$MakeArgs1("yyy", 0, {}, [], arguments, {}, null, null);\n' +
                      'for(var $var in $ns){$locals[$var]=$ns[$var]};\n' +
                      '}\n' +
                      'else{\n' +
                      'if(arguments.length!=0){\n' +
                      'if(arguments.length>0){throw TypeError("yyy() takes 0 positional argument but more were given")}\n' +
                      '}\n' +
                      '}\n' +
                      ';$locals.$line_info="2,test_issue7_pyc";\n' +
                      'var $res = (typeof $B.$search("xxx", $locals_test_issue7_pyc).valueOf() == "number" ? (typeof $B.$search("xxx", $locals_test_issue7_pyc) == "number" ? $B.mul($B.$search("xxx", $locals_test_issue7_pyc),3) : new $B.$FloatClass($B.mul($B.$search("xxx", $locals_test_issue7_pyc),3))): getattr($B.$search("xxx", $locals_test_issue7_pyc),"__mul__")(3));if($B.frames_stack.length>1){$B.frames_stack.pop()};return $res;\n' +
                      '}\n' +
                      '}\n' +
                      ')();\n' +
                      '$locals_test_issue7_pyc["yyy"].$infos = {\n' +
                      '__name__:"yyy",\n' +
                      '__defaults__ : [],\n' +
                      '__module__ : "test_issue7_pyc",\n' +
                      '__doc__: None,\n' +
                      '__code__:{\n' +
                      '__class__:$B.$CodeDict,\n' +
                      'co_argcount:0,\n' +
                      'co_filename:$locals_test_issue7_pyc["__file__"],\n' +
                      'co_firstlineno:1,\n' +
                      'co_flags:67,\n' +
                      'co_kwonlyargcount:0,\n' +
                      'co_name: "yyy",\n' +
                      'co_nlocals: 0,\n' +
                      'co_varnames: []}\n' +
                      '};None;\n' +
                      ';$B.leave_frame("test_issue7_pyc");\n' +
                      '\n' +
                      'return $locals_test_issue7_pyc\n' +
                      '}\n' +
                      ')(__BRYTHON__)']}
