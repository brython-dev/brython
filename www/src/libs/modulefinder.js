var $module=(function($B){

var _b_=$B.builtins
var _mod = {}

$ModuleFinderDict = {__class__:$B.$type,__name__:'ModuleFinder'}
$ModuleFinderDict.__mro__ = [$ModuleFinderDict,_b_.object.$dict]

$ModuleFinderDict.run_script = function(self, pathname){
    // pathname is the url of a Python script
    var py_src = _b_.$open(pathname).read()
    // transform into internal Brython tree structure
    var root = $B.py2js(py_src)
    // walk the tree to find occurences of imports
    function walk(node){
        var modules = []
        var ctx = node.context
        if(ctx && ctx.type=='node'){ctx = ctx.tree[0]}

        if(ctx && ctx.type=="import"){
            for(var i=0, _len_i = ctx.tree.length; i < _len_i;i++){
                if(modules.indexOf(ctx.tree[i].name)==-1){
                    modules.push(ctx.tree[i].name)
                }
            }
        }else if(ctx && ctx.type=="from"){
            if(modules.indexOf(ctx.module)==-1){
                modules.push(ctx.module)
            }
        }
        
        for(var i=0, _len_i = node.children.length; i < _len_i;i++){
            mods = walk(node.children[i])
            for(var j=0, _len_j = mods.length; j < _len_j;j++){
                if(modules.indexOf(mods[j])==-1){modules.push(mods[j])}
            }
        }
        return modules
    }
    self.modules = walk(root)
}

_mod.ModuleFinder = function(){return {__class__:$ModuleFinderDict}
}
_mod.ModuleFinder.$dict = $ModuleFinderDict
_mod.ModuleFinder.__class__ = $B.$factory
$ModuleFinderDict.$factory = _mod.ModuleFinder

return _mod
})(__BRYTHON__)
