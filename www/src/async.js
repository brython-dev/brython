;(function($B) {
_b_=$B.builtins

$B.execution_object = {}

$B.execution_object.queue=[]
$B.execution_object.start_flag=true

$B.execution_object.$execute_next_segment=function() {
   if ($B.execution_object.queue.length == 0) {
      return
   }

   $B.execution_object.start_flag=false

   var element = $B.execution_object.queue.shift()
   var code=element[0]
   var delay=10
   if (element.length == 2) delay=element[1]

   setTimeout(function() {
        //console.log('eval:' + $B.execution_object.queue.length)
        console.log(code)
        try {eval(code)}catch(e){console.log(e)}
        // if queue length is 0, set start_flag = true so that
        // next push to queue will start execution again..
        $B.execution_object.start_flag = $B.execution_object.queue.length == 0;
        //console.log('flag:')// + $B.execution_object.start_flag.toString())
        //console.log('eval:' + $B.execution_object.queue.length)
   }, delay);
}

$B.execution_object.$append=function(code, delay) {
   $B.execution_object.queue.push([code, delay]);
   if ($B.execution_object.start_flag) $B.execution_object.$execute_next_segment()
}

//$B.execution_object.$append("console.log('test');$B.execution_object.$execute_next_segment();", 10)
//$B.execution_object.$append("console.log('test2');$B.execution_object.$execute_next_segment();", 500)
//$B.execution_object.$append("console.log('test3');$B.execution_object.$execute_next_segment();", 500)

$B.execution_object.source_conversion=function(js) {
     js=js.replace("\n", "", 'g')
     js=js.replace("'", "\\'", 'g')
     js=js.replace('"', '\\"', 'g')

     js=js.replace("@@", "\'", 'g')

     js+="';$B.execution_object.$append($jscode, 10); "
     js+="$B.execution_object.$execute_next_segment(); "

     return "var $jscode='" + js
}

//$B.execution_object.$execute_next_segment()

_b_['brython_block']=function(f, sec) {
  if (sec === undefined || sec == _b_.None) sec=1
  // somehow we need to set a flag to specify that we need to generate
  // the javascript up to this point, and place that in $B.execution_queue

  return f
}

$B.builtin_funcs['brython_block']=true
$B.bound['__builtins__']['brython_block'] = true
   
_b_['brython_async']=function(f) {return f}
$B.builtin_funcs['brython_async']=true
$B.bound['__builtins__']['brython_async'] = true

})(__BRYTHON__)
