// Python parser. Based on python.gram, transformed into a JS object in
// full_grammar.js.
// Implements the left-recursive algorithm described in
// http://web.cs.ucla.edu/~todd/research/pepm08.pdf

(function($B){
"use strict";
var _b_ = $B.builtins,
    debug = 0

// ---- Define names used by grammar actions

// Global parser object
var p = {feature_version: $B.version_info[1]}

$B.parser_constants = {
    Store: new $B.ast.Store(),
    Load: new $B.ast.Load(),
    Del: new $B.ast.Del(),
    NULL: undefined,
    alias_ty: $B.ast.alias,
    keyword_ty: $B.ast.keyword,
    arguments_ty: $B.ast.arguments,
    expr_ty: $B.ast.expr,
    asdl_stmt_seq: Array,
    asdl_int_seq: Array,
    asdl_expr_seq: Array,
    asdl_keyword_seq: Array,
    asdl_identifier_seq: Array,
    asdl_pattern_seq: Array,
    asdl_type_param_seq: Array,
    AugOperator: $B.ast.AugAssign,
    IsNot: $B.ast.IsNot,
    Py_Ellipsis: _b_.Ellipsis,
    Py_False: false,
    Py_True: true,
    Py_None: _b_.None,
    PyExc_SyntaxError: _b_.SyntaxError,
    STAR_TARGETS: 1,
    DEL_TARGETS: 2,
    FOR_TARGETS: 3
}

// actions such as Add, Not, etc.
for(var op_type of $B.op_types){
    for(var key in op_type){
        var klass_name = op_type[key]
        $B.parser_constants[klass_name] = new $B.ast[klass_name]()
    }
}

var NULL = $B.parser_constants.NULL

// Generate functions to create AST instances
$B._PyAST = {}

for(var ast_class in $B.ast_classes){ // in py_ast.js
    var args = $B.ast_classes[ast_class]
    if(Array.isArray(args)){
        continue
    }
    args = args.replace(/\*/g, '').replace(/\?/g, '')
    var arg_names = args.split(',')

    $B._PyAST[ast_class] = (function(ast_name, ast_args){
        return function(){
            var _args = Array.from(arguments).slice(0, ast_args.length + 1)
            var EXTRA = _args.pop()
            var ast_obj = new $B.ast[ast_name](..._args)
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }
    })(ast_class, arg_names)
}

function get_last_token(p){
    var last_token = $B.last(p.tokens)
    if(last_token.type == "ENDMARKER"){
        var src = $B.file_cache[p.filename]
        if(src){
            for(var token of $B.tokenizer(src)){
                if(token.type == "ENDMARKER"){
                    break
                }
                if(token.type != "DEDENT"){
                    last_token = token
                }
            }
        }else{
            last_token = undefined
        }
    }
    p.known_err_token = last_token
}

var helper_functions = {
    CHECK: function(type, obj){
        if(Array.isArray(type)){
            var check
            for(var t of type){
                check = helper_functions.CHECK(t, obj)
                if(check){
                    return check
                }
            }
            return undefined
        }
        if(obj instanceof type){
            return obj
        }
        return undefined
    },

    CHECK_VERSION: function(type, version, msg, node){
        return helper_functions.INVALID_VERSION_CHECK(p, version, msg, node)
    },

    CHECK_NULL_ALLOWED: function(type, obj){
        if(obj !== NULL){
            if(type instanceof Array){
                for(var t of type){
                    if(obj instanceof t){
                        return obj
                    }
                }
                return
            }else{
                return obj instanceof type ? obj : undefined
            }
        }
        return obj
    },

    INVALID_VERSION_CHECK: function(p, version, msg, node){
        if (node == NULL) {
            p.error_indicator = 1;  // Inline CHECK_CALL
            return NULL;
        }
        if (p.feature_version < version) {
            p.error_indicator = 1;
            return helper_functions.RAISE_SYNTAX_ERROR("%s only supported in Python 3.%i and greater",
                                      msg, version);
        }
        return node;
    },

    NEW_TYPE_COMMENT: function(p, x){
        return x
    },

    RAISE_ERROR_KNOWN_LOCATION: function(p, errtype,
                               lineno, col_offset,
                               end_lineno, end_col_offset,
                               errmsg){
        var va = [errmsg]
        $B._PyPegen.raise_error_known_location(p, errtype,
            lineno, col_offset, end_lineno, end_col_offset, errmsg, va);
        return NULL;
    },

    RAISE_SYNTAX_ERROR: function(p, msg){
        var extra_args = []
        for(var i = 1, len = arguments.length; i < len; i++){
            extra_args.push(arguments[i])
        }
        get_last_token(p)
        $B._PyPegen.raise_error(p, _b_.SyntaxError, msg, ...extra_args)
    },


    RAISE_INDENTATION_ERROR: function(p, msg, arg){
        if(arg !== undefined){
            msg = _b_.str.__mod__(msg, arg)
        }
        var last_token = $B.last(p.tokens)
        if(last_token.type == "ENDMARKER"){
            var src = $B.file_cache[p.filename]
            if(src){
                for(var token of $B.tokenizer(src)){
                    if(token.type == "ENDMARKER"){
                        break
                    }
                    last_token = token
                }
            }
        }
        get_last_token(p)
        $B._PyPegen.raise_error(p, _b_.IndentationError, msg)
    },

    RAISE_SYNTAX_ERROR_KNOWN_LOCATION: function(p, a, err_msg, arg){
        if(arg !== undefined){
            err_msg = _b_.str.__mod__(err_msg, arg)
        }

        helper_functions.RAISE_ERROR_KNOWN_LOCATION(p, _b_.SyntaxError,
            a.lineno, a.col_offset,
            a.end_lineno, a.end_col_offset,
            err_msg)
    },

    RAISE_SYNTAX_ERROR_KNOWN_RANGE: function(p, a, b, msg){
        var extra_args = arguments[3]
        helper_functions.RAISE_ERROR_KNOWN_LOCATION(p, _b_.SyntaxError,
            a.lineno, a.col_offset,
            b.end_lineno, b.end_col_offset,
            msg, extra_args)
    },


    RAISE_SYNTAX_ERROR_INVALID_TARGET: function(p, type, e){
        return helper_functions._RAISE_SYNTAX_ERROR_INVALID_TARGET(p, type, e)
    },

    _RAISE_SYNTAX_ERROR_INVALID_TARGET(p, type, e){
        var invalid_target = $B.helper_functions.CHECK_NULL_ALLOWED($B.ast.expr,
            $B._PyPegen.get_invalid_target(e, type));
        if (invalid_target != NULL) {
            var msg;
            if (type == $B.parser_constants.STAR_TARGETS ||
                    type == $B.parser_constants.FOR_TARGETS) {
                msg = "cannot assign to %s";
            }else{
                msg = "cannot delete %s";
            }
            return helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(
                p,
                invalid_target,
                msg,
                $B._PyPegen.get_expr_name(invalid_target)
            )
        }
        return NULL;
    },

    RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN: function(p, msg){
        return helper_functions.RAISE_SYNTAX_ERROR(p, msg)
    },

    asdl_seq_LEN: (t) => t.length,

    asdl_seq_GET: (t, i) => t[i]

}


$B.helper_functions = helper_functions

// XXX redundant with above functions
function raise_error_known_location(type, filename, lineno, col_offset,
        end_lineno, end_col_offset, line, message){
    var exc = type.$factory(message)
    exc.filename = filename
    exc.lineno = lineno
    exc.offset = col_offset + 1
    exc.end_lineno = end_lineno
    exc.end_offset = end_col_offset + 1
    exc.text = line
    exc.args[1] = $B.fast_tuple([filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset])
    exc.$frame_obj = $B.frame_obj
    throw exc
}

$B.raise_error_known_location = raise_error_known_location

function raise_error_known_token(type, filename, token, message){
    var exc = type.$factory(message)
    exc.filename = filename
    exc.lineno = token.lineno
    exc.offset = token.col_offset + 1
    exc.end_lineno = token.end_lineno
    exc.end_offset = token.end_col_offset + 1
    exc.text = token.line
    exc.args[1] = $B.fast_tuple([filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset])
    exc.$frame_obj = $B.frame_obj
    throw exc
}

$B.raise_error_known_token = raise_error_known_token


function set_position_from_EXTRA(ast_obj, EXTRA){
    for(var key in EXTRA){
        ast_obj[key] = EXTRA[key]
    }
}


var Parser = $B.Parser = function(src, filename, mode){
    // mode is 'file' for a script or exec(), 'eval' for eval()
    // Normalize line ends
    src = src.replace(/\r\n/gm, "\n")
    var tokenizer = $B.tokenizer(src, filename, mode, this)
    this.tokenizer = tokenizer
    this.tok = tokenizer
    this.mark = 0
    this.fill = 0
    this.level = 0
    this.size = 1
    this.starting_lineno = 0;
    this.starting_col_offset = 0;

    this.tokens = [] // generator_as_list(tokenizer)
    this.src = src
    this.filename = filename
    this.mode = mode
    this.memo = {}
    this.arena = {
        a_objects: []
    }
    if(filename){
        p.filename = filename
    }
}

var ignored = [$B.py_tokens.ENCODING,
    $B.py_tokens.NL,
    $B.py_tokens.COMMENT]

Parser.prototype.read_token = function(){
    while(true){
        var next = this.tokenizer.next()
        if(! next.done){
            var value = next.value
            if(! ignored.includes(value.num_type)){
                this.tokens.push(value)
                return value
            }
        }else{
            throw Error('tokenizer exhausted')
        }
    }
}

})(__BRYTHON__)