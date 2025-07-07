// Token constants
"use strict";
(function($B){

const tokens = [
    'ENDMARKER',
    'NAME',
    'NUMBER',
    'STRING',
    'NEWLINE',
    'INDENT',
    'DEDENT',
    'LPAR',
    'RPAR',
    'LSQB',
    'RSQB',
    'COLON',
    'COMMA',
    'SEMI',
    'PLUS',
    'MINUS',
    'STAR',
    'SLASH',
    'VBAR',
    'AMPER',
    'LESS',
    'GREATER',
    'EQUAL',
    'DOT',
    'PERCENT',
    'LBRACE',
    'RBRACE',
    'EQEQUAL',
    'NOTEQUAL',
    'LESSEQUAL',
    'GREATEREQUAL',
    'TILDE',
    'CIRCUMFLEX',
    'LEFTSHIFT',
    'RIGHTSHIFT',
    'DOUBLESTAR',
    'PLUSEQUAL',
    'MINEQUAL',
    'STAREQUAL',
    'SLASHEQUAL',
    'PERCENTEQUAL',
    'AMPEREQUAL',
    'VBAREQUAL',
    'CIRCUMFLEXEQUAL',
    'LEFTSHIFTEQUAL',
    'RIGHTSHIFTEQUAL',
    'DOUBLESTAREQUAL',
    'DOUBLESLASH',
    'DOUBLESLASHEQUAL',
    'AT',
    'ATEQUAL',
    'RARROW',
    'ELLIPSIS',
    'COLONEQUAL',
    'EXCLAMATION',
    'OP',
    'TYPE_IGNORE',
    'TYPE_COMMENT',
    'SOFT_KEYWORD',
    'FSTRING_START',
    'FSTRING_MIDDLE',
    'FSTRING_END',
    'COMMENT',
    'NL',
    // These aren't used by the C tokenizer but are needed for tokenize.py
    'ERRORTOKEN',
    'ENCODING',
    'N_TOKENS'
]

$B.py_tokens = {}

var pos = 0
for(var tok of tokens){
    $B.py_tokens[tok] = pos++
}

// Special definitions for cooperation with parser
$B.py_tokens['NT_OFFSET'] = 256

$B.EXACT_TOKEN_TYPES = {
    '!': 'EXCLAMATION',
    '!=': 'NOTEQUAL',
    '%': 'PERCENT',
    '%=': 'PERCENTEQUAL',
    '&': 'AMPER',
    '&=': 'AMPEREQUAL',
    '(': 'LPAR',
    ')': 'RPAR',
    '*': 'STAR',
    '**': 'DOUBLESTAR',
    '**=': 'DOUBLESTAREQUAL',
    '*=': 'STAREQUAL',
    '+': 'PLUS',
    '+=': 'PLUSEQUAL',
    ',': 'COMMA',
    '-': 'MINUS',
    '-=': 'MINEQUAL',
    '->': 'RARROW',
    '.': 'DOT',
    '...': 'ELLIPSIS',
    '/': 'SLASH',
    '//': 'DOUBLESLASH',
    '//=': 'DOUBLESLASHEQUAL',
    '/=': 'SLASHEQUAL',
    ':': 'COLON',
    ':=': 'COLONEQUAL',
    ';': 'SEMI',
    '<': 'LESS',
    '<<': 'LEFTSHIFT',
    '<<=': 'LEFTSHIFTEQUAL',
    '<=': 'LESSEQUAL',
    '=': 'EQUAL',
    '==': 'EQEQUAL',
    '>': 'GREATER',
    '>=': 'GREATEREQUAL',
    '>>': 'RIGHTSHIFT',
    '>>=': 'RIGHTSHIFTEQUAL',
    '@': 'AT',
    '@=': 'ATEQUAL',
    '[': 'LSQB',
    ']': 'RSQB',
    '^': 'CIRCUMFLEX',
    '^=': 'CIRCUMFLEXEQUAL',
    '{': 'LBRACE',
    '|': 'VBAR',
    '|=': 'VBAREQUAL',
    '}': 'RBRACE',
    '~': 'TILDE'
}

function ISTERMINAL(x){
    return x < NT_OFFSET
}

function ISNONTERMINAL(x){
    return x >= NT_OFFSET
}

function ISEOF(x){
    return x == ENDMARKER
}

})(__BRYTHON__);