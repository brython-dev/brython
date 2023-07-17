var $module = (function($B){

var _b_ = $B.builtins

$B.$import('token')


var TokenizerIter = $B.make_class('TokenizerIter',
    function(it){
        return {
            __class__: TokenizerIter,
            it
        }
    }
)

TokenizerIter.__iter__ = function(self){
    var js_iter = function*(){
        var line_num = 0
        while(true){
            try{
                var bytes = self.it()
            }catch(err){
                if($B.is_exc(err, [_b_.StopIteration])){
                    token = endmarker
                    token.start[0]++
                    token.end[0]++
                    var type_code = $B.imported.token[token.type]
                    yield $B.fast_tuple([type_code, token.string,
                                         $B.fast_tuple(token.start),
                                         $B.fast_tuple(token.end),
                                         token.line])
                }
                throw err
            }
            line_num++
            var line = _b_.bytes.decode(bytes, 'utf-8')
            for(var token of $B.tokenizer(line, 'test')){
                if(token.type == 'ENCODING'){ // skip encoding token
                    continue
                }else if(token.type == 'ENDMARKER'){
                    var endmarker = token
                    continue
                }
                token.start[0] = line_num
                token.end[0] = line_num
                var type_code = $B.imported.token[token.type]
                yield $B.fast_tuple([type_code, token.string,
                                     $B.fast_tuple(token.start),
                                     $B.fast_tuple(token.end),
                                     token.line])
            }
        }

    }
    return $B.generator.$factory(js_iter)()
}

TokenizerIter.__next__ = function*(self){

}

$B.set_func_names(TokenizerIter, '_tokenize')

return {TokenizerIter}

})(__BRYTHON__)