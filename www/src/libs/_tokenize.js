(function($B){

var _b_ = $B.builtins

$B.$import('token')

var TokenizerIter = $B.make_class('TokenizerIter',
    function(it){
        var $ = $B.args('TokenizerIter', 3, {it: null, encoding: null, extra_tokens:null},
                    ['it', 'encoding', 'extra_tokens'], arguments,
                    {encoding: _b_.None, extra_tokens: false}, null, null)
        return {
            __class__: TokenizerIter,
            it: $B.$call($.it),
            encoding: $.encoding,
            extra_tokens: $.extra_tokens
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
                if(! $B.$isinstance(err, _b_.StopIteration)){
                    throw err
                }
                line = ''
            }
            if(line.length == 0){
                token = endmarker
                token.lineno++
                token.end_lineno++
                yield $B.fast_tuple([token.num_type, token.string,
                                     $B.fast_tuple([token.lineno, token.col_offset]),
                                     $B.fast_tuple([token.end_lineno, token.end_col_offset]),
                                     token.line])
                break
            }else if(self.encoding !== _b_.None){
                if(! $B.$isinstance(line, [_b_.bytes, _b_.bytearray])){
                    throw _b_.TypeError.$factory(
                        'readline() returned a non-bytes object')
                }
                line = _b_.bytes.decode(line, self.encoding)
            }
            line_num++
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