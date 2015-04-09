;(function($B) {
_b_=$B.builtins

$B.execution_object = $B.execution_object || {}

$B.execution_object.queue=[]
$B.execution_object.done=true

$B.execution_object.$execute_next_segment=function() {
   if ($B.execution_object.queue.length == 0) {
      $B.execution_object.done=true
      return
   }

   $B.execution_object.done=false

   var element = $B.execution_object.queue.shift()
   var code=element[0]
   var delay=10
   if (element.length == 2) delay=element[1]

   setTimeout(function() {eval(code)}, delay);
}

$B.execution_object.$append=function(code, delay) {
   $B.execution_object.queue.push([code, delay]);
   if ($B.execution_object.done) $B.execution_object.$execute_next_segment()
}

$B.execution_object.$append("console.log('test');$B.execution_object.$execute_next_segment();", 10)
$B.execution_object.$append("console.log('test2');$B.execution_object.$execute_next_segment();", 500)
$B.execution_object.$append("console.log('test3');$B.execution_object.$execute_next_segment();", 500)

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
