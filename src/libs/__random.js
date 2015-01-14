$module = (function($B){

    var _b_ = $B.builtins
    var $s=[]
    for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
    eval($s.join(';'))

    //for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}
    
    return {
        choice:function(seq){
            var rank = parseInt(getattr(seq,'__len__')()*Math.random())
            return getattr(seq,'__getitem__')(rank)
        },
        random:function(){
          if(arguments.length > 0){
            throw TypeError("random() takes no arguments ("+arguments.length+" given)")
          } else {
            return float(Math.random());
          }
        },
        randint:function(a,b){
           if (a == undefined) throw _b_.TypeError("randint missing 2 required positional arguments: 'a' and 'b'");
           if (b == undefined) throw _b_.TypeError("randint missing 1 required positional argument: 'b'");

           if (!(isinstance(a, _b_.int) || isinstance(b, _b_.int))) throw _b_.ValueError("non-integer arg 1 for randrange")

           return int(Math.floor(Math.random()*(b-a+1)+a))
        },
        randrange:function(start,stop,step){
          if(step === undefined) {
            step=1;
          } else if(step == 0) { 
            //raise ValueError("zero step for randrange()");
          }
    
          if(stop === undefined) {
             stop=start;
             start=0;
          }
          var width=stop-start;
          if (step==1 && width > 0) {
            return start + int(Math.floor(Math.random()*width));
          } else {
            // raise ValueError("empty range for randrange() ("+start+","+stop+','+step+')');
          }
          
          var n;
          if (step > 0) {
             n=Math.floor((width+step-1)/step);
          } else {
             n=Math.floor((width+step+1)/step);
          }
          return start + step*int(Math.floor(Math.random()*n))
          //return int(Math.random()*(stop/step-start/step)*step + start)
        },
        shuffle:function(x, rnd){
          if (x.length <= 1) { return x}
    
          if (rnd === undefined) {
             rnd=Math.random
          }
    
          for(var j, o, i = x.length; i; j = parseInt(rnd() * i), o = x[--i], x[i] = x[j], x[j] = o);
        }
    }

})(__BRYTHON__)
