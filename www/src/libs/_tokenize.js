(function($B){

var _b_ = $B.builtins

$B.$import('token')

var TokenizerIter = $B.make_class('TokenizerIter',
    function(it){
        return {
            __class__: TokenizerIter,
            it: $B.$call(it)
        }
    }
)

TokenizerIter.__iter__ = function(self){
    var js_iter = function*(){
        var line_num = 0
        var err
        while(true){
            try{
                var line = self.it()
            }catch(err){
                // handled below
            }
            if(line.length == 0 || err){
                token = endmarker
                token.lineno++
                token.end_lineno++
                yield $B.fast_tuple([token.num_type, token.string,
                                     $B.fast_tuple([token.lineno, token.col_offset]),
                                     $B.fast_tuple([token.end_lineno, token.end_col_offset]),
                                     token.line])
                if(err){
                    throw err
                }else{
                    break
                }
            }
            line_num++
            //var line = _b_.bytes.decode(bytes, 'utf-8')
            console.log('line', line)
            if(line_num > 10){
                console.log('fini')
                break
            }
            for(var token of $B.tokenizer(line, 'test')){
                if(token.num_type == $B.py_tokens.ENCODING){ // skip encoding token
                    continue
                }else if(token.num_type == $B.py_tokens.ENDMARKER){
                    var endmarker = token
                    continue
                }else if(token.num_type == $B.py_tokens.ERRORTOKEN){
                    throw _b_.SyntaxError.$factory(token.message)
                }
                //token.type = token.num_type
                token.lineno = line_num
                token.end_lineno = line_num
                yield $B.fast_tuple([token.type, token.string,
                                     $B.fast_tuple([token.lineno, token.col_offset]),
                                     $B.fast_tuple([token.end_lineno, token.end_col_offset]),
                                     token.line])
            }
        }

    }
    return $B.generator.$factory(js_iter)()
}

TokenizerIter.__next__ = function*(self){

}

$B.set_func_names(TokenizerIter, '_tokenize')

$B.addToImported('_tokenize', {TokenizerIter})


})(__BRYTHON__)