// global object with brython built-ins
$version_info = [1,2,"20131130-160525"]

function script_loader(name, version) {
   var $src, $version, $brython_path;

   if(typeof Storage!==undefined){
      $src = localStorage.getItem(name)
      $version = localStorage.getItem(name + '_version')
   }

   if(!$src || $version !==version){ // local copy not valid
      var $scripts = document.getElementsByTagName('script')
      for(var $i=0;$i<$scripts.length;$i++){
        if($scripts[$i].src.substr($scripts[$i].src.length-13)==='/py_loader.js'){
           $brython_path = $scripts[$i].src.substr(0,$scripts[$i].src.length-13)
           break
        }
      }
        
      // get source code by an Ajax call
      if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
         var $xmlhttp=new XMLHttpRequest();
      }else{// code for IE6, IE5
         var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }

      $xmlhttp.open('GET',$brython_path+'/' + name + '.js',false)
      $xmlhttp.send()

      if($xmlhttp.readyState===4 && $xmlhttp.status===200){
          $src = $xmlhttp.responseText
      }
   }

   if ($src === undefined) { // houston, we have a problem!!!
      //need to figure out what to do, if we cannot access source.
      return;
   }

   if(typeof Storage!==undefined){
      localStorage.setItem(name,$src)
      localStorage.setItem(name+'_version',version)
   }

   // eval in global scope
   if (window.execScript) {
      window.execScript($src);
      return;
   }
          
   var fn = function() {
       window.eval.call(window,$src);
   };
   fn();
}

script_loader('brython', $version_info[2]);
// uncomment the line below to save/load from localStorage
//script_loader('py_VFS', $version_info[2]);
