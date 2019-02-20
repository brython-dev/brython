var $module=(function($B){

var _b_ = $B.builtins

function parts(format_string){
    var result = [],
        _parts = $B.split_format(format_string) // defined in py_string.js
    for(var i = 0; i < _parts.length; i+= 2){
        result.push({pre: _parts[i], fmt: _parts[i + 1]})
    }
    return result
}

function Tuple(){
    var args = []
    for(var i=0, len=arguments.length; i < len; i++){
        args.push(arguments[i])
    }
    return _b_.tuple.$factory(args)
}

return{

    formatter_field_name_split: function(fieldname){
        // Split the argument as a field name
        var parsed = $B.parse_format(fieldname),
            first = parsed.name,
            rest = []
        if(first.match(/\d+/)){first = parseInt(first)}
        parsed.name_ext.forEach(function(ext){
            if(ext.startsWith("[")){
                var item = ext.substr(1, ext.length - 2)
                if(item.match(/\d+/)){
                    rest.push(Tuple(false, parseInt(item)))
                }else{
                    rest.push(Tuple(false, item))
                }
            }else{
                rest.push(Tuple(true, ext.substr(1)))
            }
        })
        return Tuple(first, _b_.iter(rest))
    },
    formatter_parser: function(format_string){
        // Parse the argument as a format string

        if(! _b_.isinstance(format_string, _b_.str)){
            throw _b_.ValueError.$factory("Invalid format string type: " +
                $B.class_name(format_string))
        }

        var result  = []
        parts(format_string).forEach(function(item){
            var pre = item.pre === undefined ? "" : item.pre,
                fmt = item.fmt
            if(fmt === undefined){
               result.push(Tuple(pre, _b_.None, _b_.None, _b_.None))
            }else if(fmt.string == ''){
               result.push(Tuple(pre, '', '', _b_.None))
            }else{
               result.push(Tuple(pre,
                   fmt.raw_name + fmt.name_ext.join(""),
                   fmt.raw_spec,
                   fmt.conv || _b_.None))
           }
        })
        return result
    }
}
})(__BRYTHON__)