(function($B){

/*
#include <Python.h>
#include "pycore_ast.h"           // _PyAST_Validate(),
#include "pycore_pystate.h"       // _PyThreadState_GET()
#include <errcode.h>

#include "tokenizer.h"
#include "pegen.h"
*/

// Internal parser functions

var _b_ = __BRYTHON__.builtins

const Load = new $B.ast.Load()

function strchr(s, char){
    return s.includes(char)
}

function strlen(s){
    return s.length
}

function strncmp(a, b){
    return a < b ? -1 : a > b ? 1 : 0
}

function PyOS_strtol(s, end, base){
    return parseFloat(s)
}

function PyOS_strtoul(s, end, base){
    return parseFloat(s)
}

function PyOS_string_to_double(s, x, y){
    return parseFloat(s)
}

function PyFloat_FromDouble(x){
    return x
}

const NSTATISTICS = 2000,
      memo_statistics = {},
      TYPE_IGNORE = 'TYPE_IGNORE',
      ERRORTOKEN = 'ERRORTOKEN',
      NEWLINE = $B.py_tokens.NEWLINE,
      DEDENT = $B.py_tokens.DEDENT,
      Py_single_input = 'py_single_input'

function PyUnicode_IS_ASCII(char){
    return char.codePointAt(0) < 128
}

function PyBytes_FromStringAndSize(s){
    var dest = new Uint8Array(s.length * 3)
    var encoder = new TextEncoder()
    var result = encoder.encodeInto(s, dest)
    return $B.fast_bytes(Array.from(dest.slice(0, result.written)))
}

function _PyArena_AddPyObject(arena, obj){
    // arena.a_objects.push(obj)
    return 1
}

function set_position_from_token(ast_obj, token){
    for(var attr of ['lineno', 'col_offset', 'end_lineno', 'end_col_offset']){
        ast_obj[attr] = token[attr]
    }
}

$B._PyPegen.interactive_exit = function(p){
    if (p.errcode) {
        (p.errcode) = E_EOF;
    }
    return NULL;
}

$B._PyPegen.byte_offset_to_character_offset_raw = function(str, col_offset){
    var len = str.length
    if (col_offset > len + 1) {
        col_offset = len + 1;
    }
    // assert(col_offset >= 0);
    var text = PyUnicode_DecodeUTF8(str, col_offset, "replace");
    if (!text) {
        return -1;
    }
    return text.length
}

// Calculate the extra amount of width space the given source
// code segment might take if it were to be displayed on a fixed
// width output device. Supports wide unicode characters and emojis.
$B._PyPegen.calculate_display_width = function(line, character_offset){
    var segment = line.substring(0, character_offset);
    if (!segment) {
        return -1;
    }

    // Fast track for ascii strings
    if (PyUnicode_IS_ASCII(segment)) {
        return character_offset;
    }

    var width_fn = _PyImport_GetModuleAttrString("unicodedata", "east_asian_width");
    if (!width_fn) {
        return -1;
    }

    var width = 0;
    var len = segment.length
    for (let i = 0; i < len; i++) {
        var chr = segment.substring(i, i + 1);
        if (!chr) {
            Py_DECREF(segment);
            Py_DECREF(width_fn);
            return -1;
        }

        var width_specifier = PyObject_CallOneArg(width_fn, chr);
        if (!width_specifier) {
            Py_DECREF(segment);
            Py_DECREF(width_fn);
            return -1;
        }

        if (width_specifier == "W" ||
            width_specifier == "F") {
            width += 2;
        } else {
            width += 1;
        }
    }

    return width;
}

$B._PyPegen.byte_offset_to_character_offset = function(line, col_offset){
    var str = line
    return _PyPegen_byte_offset_to_character_offset_raw(str, col_offset);
}

// Here, mark is the start of the node, while p->mark is the end.
// If node==NULL, they should be the same.
$B._PyPegen.insert_memo = function(p, mark, type, node){
    // Insert in front
    var m = {
        type,
        node,
        mark: p.mark,
        next: p.tokens[mark].memo
    }
    p.tokens[mark].memo = m;
    return 0;
}

// Like _PyPegen_insert_memo(), but updates an existing node if found.
$B._PyPegen.update_memo = function(p, mark, type, node){
    for (let m = p.tokens[mark].memo; m != NULL; m = m.next) {
        if (m.type == type) {
            // Update existing node.
            m.node = node;
            m.mark = p.mark;
            return 0;
        }
    }
    // Insert new node.
    return $B._PyPegen.insert_memo(p, mark, type, node);
}

function init_normalization(p){
    if (p.normalize) {
        return 1;
    }
    p.normalize = _PyImport_GetModuleAttrString("unicodedata", "normalize");
    if (!p.normalize)
    {
        return 0;
    }
    return 1;
}

function growable_comment_array_init(arr, initial_size) {
    // assert(initial_size > 0);
    arr.items = new Array(initial_size * arr.items.length);
    arr.size = initial_size;
    arr.num_items = 0;

    return arr.items != NULL;
}

function growable_comment_array_add(arr, lineno, comment) {
    return 1
    /*
    if (arr.num_items >= arr.size) {
        var new_size = arr.size * 2;
        var new_items_array = PyMem_Realloc(arr->items, new_size * sizeof(*arr->items));
        if (!new_items_array) {
            return 0;
        }
        arr->items = new_items_array;
        arr->size = new_size;
    }

    arr->items[arr->num_items].lineno = lineno;
    arr->items[arr->num_items].comment = comment;  // Take ownership
    arr->num_items++;
    return 1;
    */
}

function growable_comment_array_deallocate(arr) {
    /*
    for (unsigned i = 0; i < arr->num_items; i++) {
        PyMem_Free(arr->items[i].comment);
    }
    PyMem_Free(arr->items);
    */
}

function _get_keyword_or_name_type(p, new_token){
    return p.keywords[new_token.string] ?? NAME
    /*
    var name_len = new_token.end_col_offset - new_token.col_offset;
    // assert(name_len > 0);

    if (name_len >= p.n_keyword_lists ||
        p.keywords[name_len] == NULL ||
        p.keywords[name_len].type == -1) {
        return NAME;
    }
    for (var k = p.keywords[name_len]; k != NULL && k.type != -1; k++) {
        if (strncmp(k.str, new_token.start, name_len) == 0) {
            return k.type;
        }
    }
    return NAME;
    */
}

function initialize_token(p, parser_token, new_token, token_type) {
    // assert(parser_token != NULL);

    parser_token.num_type = (token_type == NAME) ? _get_keyword_or_name_type(p, new_token) : token_type;
    if(parser_token.num_type == -1){
        console.log('bizarre', new_token)
        console.log('keywords', p.keywords)
        alert()
    }
    parser_token.bytes = PyBytes_FromStringAndSize(new_token.string)

    _PyArena_AddPyObject(p.arena, parser_token.bytes)
    parser_token.metadata = NULL;
    if (new_token.metadata != NULL) {
        _PyArena_AddPyObject(p.arena, new_token.metadata)
        parser_token.metadata = new_token.metadata;
        new_token.metadata = NULL;
    }

    parser_token.level = new_token.level;
    parser_token.lineno = new_token.lineno;
    parser_token.col_offset = p.tok.lineno == p.starting_lineno ? p.starting_col_offset + new_token.col_offset
                                                                    : new_token.col_offset;
    parser_token.end_lineno = new_token.end_lineno;
    parser_token.end_col_offset = p.tok.lineno == p.starting_lineno ? p.starting_col_offset + new_token.end_col_offset
                                                                 : new_token.end_col_offset;

    p.fill += 1;

    if (token_type == ERRORTOKEN && p.tok.done == E_DECODE) {
        return _Pypegen_raise_decode_error(p);
    }

    return (token_type == ERRORTOKEN ? _Pypegen_tokenizer_error(p) : 0);
}

function _PyToken_Init(token) {
    token.metadata = NULL;
}

function _PyTokenizer_Get(tok, new_token){
    var token = tok.next().value
    for(var key in token){
        new_token[key] = token[key]
    }
    return token.num_type
}


function get_next_token(p, new_token){
    var token = p.tokens[p.fill] ?? p.read_token()
    for(var key in token){
        new_token[key] = token[key]
    }
    return token.num_type
}

$B._PyPegen.fill_token = function(p){
    var new_token = {metadata: NULL}
    //_PyToken_Init(new_token);
    var type = get_next_token(p, new_token);

    // Record and skip '# type: ignore' comments
    while (type == TYPE_IGNORE) {
        type = get_next_token(p, new_token);
    }

    // If we have reached the end and we are in single input mode we need to insert a newline and reset the parsing
    if (p.start_rule == Py_single_input && type == ENDMARKER && p.parsing_started) {
        type = NEWLINE; /* Add an extra newline */
        p.parsing_started = 0;

        if (p.tok.indent && !(p.flags & PyPARSE_DONT_IMPLY_DEDENT)) {
            p.tok.pendin = -p.tok.indent;
            p.tok.indent = 0;
        }
    }
    else {
        p.parsing_started = 1;
    }

    var t = p.tokens[p.fill];
    return initialize_token(p, t, new_token, type);

}

/*
#if defined(Py_DEBUG)
// Instrumentation to count the effectiveness of memoization.
// The array counts the number of tokens skipped by memoization,
// indexed by type.

#define NSTATISTICS _PYPEGEN_NSTATISTICS
#define memo_statistics _PyRuntime.parser.memo_statistics
*/

$B._PyPegen.clear_memo_statistics = function(){
    for (let i = 0; i < NSTATISTICS; i++) {
        memo_statistics[i] = 0;
    }
}

$B._PyPegen.get_memo_statistics = function(){
    var ret = new Array(NSTATISTICS);
    if (ret == NULL) {
        return NULL;
    }
    for (let i = 0; i < NSTATISTICS; i++) {
        var value = PyLong_FromLong(memo_statistics[i]);
        if (value == NULL) {
            return NULL;
        }
        // PyList_SetItem borrows a reference to value.
        if (PyList_SetItem(ret, i, value) < 0) {
            Py_DECREF(ret);
            return NULL;
        }
    }
    return ret;
}
// #endif


$B._PyPegen.is_memoized = function(p, type, pres){
    if (p.mark == p.fill) {
        if ($B._PyPegen.fill_token(p) < 0) {
            p.error_indicator = 1;
            return -1;
        }
    }

    var t = p.tokens[p.mark];

    for (var m = t.memo; m != NULL; m = m.next) {
        if (m.type == type) {
            /* #if defined(PY_DEBUG)
            if (0 <= type && type < NSTATISTICS) {
                var count = m.mark - p.mark;
                // A memoized negative result counts for one.
                if (count <= 0) {
                    count = 1;
                }
                memo_statistics[type] += count;
            }
            #endif */
            p.mark = m.mark;
            pres.value = m.node;
            return 1;
        }
    }
    return 0;
}

$B._PyPegen.lookahead_with_name = function(positive, func, p){
    var mark = p.mark;
    var res = func(p);
    p.mark = mark;
    return (res != NULL) == positive;
}

$B._PyPegen.lookahead_with_string = function(positive, func, p, arg){
    var mark = p.mark;
    var res = func(p, arg);
    p.mark = mark;
    return (res != NULL) == positive;
}

$B._PyPegen.lookahead_with_int = function(positive, func, p, arg){
    var mark = p.mark;
    var res = func(p, arg);
    p.mark = mark;
    return (res != NULL) == positive;
}

$B._PyPegen.lookahead = function(positive, func, p){
    var mark = p.mark;
    var res = func(p);
    p.mark = mark;
    return (res != NULL) == positive;
}

$B._PyPegen.expect_token = function(p, type){
    if (p.mark == p.fill) {
        if ($B._PyPegen.fill_token(p) < 0) {
            p.error_indicator = 1;
            return NULL;
        }
    }
    var t = p.tokens[p.mark];
    if (t.num_type != type) {
       return NULL;
    }
    p.mark += 1;
    return t;
}

$B._PyPegen.expect_forced_result = function(p, result, expected) {

    if (p.error_indicator == 1) {
        return NULL;
    }
    if (result == NULL) {
        RAISE_SYNTAX_ERROR("expected (%s)", expected);
        return NULL;
    }
    return result;
}

$B._PyPegen.expect_forced_token = function(p, type, expected) {

    if (p.error_indicator == 1) {
        return NULL;
    }

    if (p.mark == p.fill) {
        if ($B._PyPegen.fill_token(p) < 0) {
            p.error_indicator = 1;
            return NULL;
        }
    }
    var t = p.tokens[p.mark];
    if (t.num_type != type) {
        $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(t, "expected '%s'", expected);
        return NULL;
    }
    p.mark += 1;
    return t;
}

$B._PyPegen.expect_soft_keyword = function(p, keyword){
    if (p.mark == p.fill) {
        if ($B._PyPegen.fill_token(p) < 0) {
            p.error_indicator = 1;
            return NULL;
        }
    }
    var t = p.tokens[p.mark];
    if (t.num_type != NAME) {
        return NULL;
    }

    const s = t.string // PyBytes_AsString(t.bytes);
    if (!s) {
        p.error_indicator = 1;
        return NULL;
    }
    if (strcmp(s, keyword) != 0) {
        return NULL;
    }
    return $B._PyPegen.name_token(p);
}

$B._PyPegen.get_last_nonnwhitespace_token = function(p){
    // assert(p.mark >= 0);
    var token = NULL;
    for (let m = p.mark - 1; m >= 0; m--) {
        token = p.tokens[m];
        if (token.num_type != ENDMARKER && (token.num_type < NEWLINE || token.num_type > DEDENT)) {
            break;
        }
    }
    return token;
}

$B._PyPegen.new_identifier = function(p, n){
    var id = n
    /* PyUnicode_DecodeUTF8 should always return a ready string. */
    // assert(PyUnicode_IS_READY(id));
    /* Check whether there are non-ASCII characters in the
       identifier; if so, normalize to NFKC. */
    if (! PyUnicode_IS_ASCII(id)){
        var id2;
        if (!init_normalization(p))
        {
            return error();
        }
        var form = PyUnicode_InternFromString("NFKC");
        if (form == NULL)
        {
            return error();
        }
        var args = {form, id};
        id2 = _PyObject_FastCall(p.normalize, args, 2);
        if (!id2) {
            return error()
        }
        if (!PyUnicode_Check(id2)){
            PyErr_Format(PyExc_TypeError,
                         "unicodedata.normalize() must return a string, not " +
                         "%.200s",
                         _PyType_Name(Py_TYPE(id2)));
            return error()
        }
        id = id2;
    }
    PyUnicode_InternInPlace(id);
    if (_PyArena_AddPyObject(p.arena, id) < 0)
    {
        return error()
    }
    return id;

    function error(){
        p.error_indicator = 1;
        return NULL;
    }
}

$B._PyPegen.name_from_token = function(p, t){
    if (t == NULL) {
        return NULL;
    }
    var s = t.string
    if (!s) {
        p.error_indicator = 1;
        return NULL;
    }
    /*
    var id = $B._PyPegen.new_identifier(p, s);
    if (id == NULL) {
        p.error_indicator = 1;
        return NULL;
    }
    */
    var res = new $B.ast.Name(s, Load)
    set_position_from_token(res, t)
    return res
}

$B._PyPegen.name_token = function(p){
    var t = $B._PyPegen.expect_token(p, NAME);
    return $B._PyPegen.name_from_token(p, t);
}

$B._PyPegen.string_token = function(p){
    return $B._PyPegen.expect_token(p, STRING);
}

$B._PyPegen.soft_keyword_token = function(p) {
    var t = $B._PyPegen.expect_token(p, NAME);
    if (t == NULL) {
        return NULL;
    }
    var the_token;
    var size;
    the_token = _b_.bytes.decode(t.bytes, 'iso-8859-1');
    for (let keyword = p.soft_keywords; keyword != NULL; keyword++) {
        if (strncmp(keyword, the_token, size) == 0) {
            return $B._PyPegen.name_from_token(p, t);
        }
    }
    return NULL;
}

function prepared_number_value(prepared){
    switch(prepared.type){
        case 'float':
            return $B.fast_float(prepared.value)
        case 'imaginary':
            return $B.make_complex(0, prepared_number_value(prepared.value))
        case 'int':
            var res = parseInt(prepared.value[1], prepared.value[0])
            if(! Number.isSafeInteger(res)){
                var base = prepared.value[0],
                    num_str = prepared.value[1]
                switch(base){
                    case 8:
                        return $B.fast_long_int(BigInt('0x' + num_str))
                    case 10:
                        return $B.fast_long_int(BigInt(num_str))
                    case 16:
                        return $B.fast_long_int(BigInt('0x' + num_str))
                }
            }
            return res
    }
}

function parsenumber_raw(s){
    var prepared = $B.prepare_number(s) // in number_parser.js
    return prepared_number_value(prepared)
    /*
    var nd,
        x,
        dx,
        compl,
        imflag;

    // assert(s != NULL);
    errno = 0;
    end = strlen(s) - 1;
    console.log('end', end, 'last', s[end])
    imflag = s[end] == 'j' || s[end] == 'J';
    if (s[0] == '0') {
        x = PyOS_strtoul(s, end, 0);
        if (x < 0 && errno == 0) {
            return PyLong_FromString(s, 0, 0);
        }
    } else {
        x = PyOS_strtol(s, end, 0);
    }
    if (end == '\0') {
        if (errno != 0) {
            return PyLong_FromString(s, 0, 0);
        }
        return PyLong_FromLong(x);
    }
    if (imflag) {
        compl.real = 0.;
        compl.imag = PyOS_string_to_double(s, end, NULL);
        if (compl.imag == -1.0 && PyErr_Occurred()) {
            return NULL;
        }
        return PyComplex_FromCComplex(compl);
    }
    dx = PyOS_string_to_double(s, NULL, NULL);
    if (dx == -1.0 && PyErr_Occurred()) {
        return NULL;
    }
    return PyFloat_FromDouble(dx);
    */
}

function parsenumber(s){
    var dup;
    var end;
    var res = NULL;

    // assert(s != NULL);

    if (strchr(s, '_') == NULL) {
        return parsenumber_raw(s);
    }
    /* Create a duplicate without underscores. */
    dup = s.replace(/_/g, '')
    res = parsenumber_raw(dup);
    return res;
}

$B._PyPegen.number_token = function(p){
    var t = $B._PyPegen.expect_token(p, NUMBER);
    if (t == NULL) {
        return NULL;
    }

    var num_raw = t.string // PyBytes_AsString(t.bytes);
    if (num_raw == NULL) {
        p.error_indicator = 1;
        return NULL;
    }

    if (p.feature_version < 6 && strchr(num_raw, '_') != NULL) {
        p.error_indicator = 1;
        return RAISE_SYNTAX_ERROR("Underscores in numeric literals are only supported " +
                                  "in Python 3.6 and greater");
    }

    var c = parsenumber(num_raw);

    if (c == NULL) {
        p.error_indicator = 1;
        var tstate = _PyThreadState_GET();
        // The only way a ValueError should happen in _this_ code is via
        // PyLong_FromString hitting a length limit.
        if (tstate.current_exception != NULL &&
            Py_TYPE(tstate.current_exception) == PyExc_ValueError
        ) {
            var exc = PyErr_GetRaisedException();
            /* Intentionally omitting columns to avoid a wall of 1000s of '^'s
             * on the error message. Nobody is going to overlook their huge
             * numeric literal once given the line. */
            RAISE_ERROR_KNOWN_LOCATION(
                p, PyExc_SyntaxError,
                t.lineno, -1 /* col_offset */,
                t.end_lineno, -1 /* end_col_offset */,
                "%S - Consider hexadecimal for huge integer literals " +
                "to avoid decimal conversion limits.",
                exc);
        }
        return NULL;
    }

    if (_PyArena_AddPyObject(p.arena, c) < 0) {
        Py_DECREF(c);
        p.error_indicator = 1;
        return NULL;
    }
    var res = new $B.ast.Constant(c, NULL);
    set_position_from_token(res, t)
    return res
}

/* Check that the source for a single input statement really is a single
   statement by looking at what is left in the buffer after parsing.
   Trailing whitespace and comments are OK. */
function bad_single_statement(p){
    var cur = p.tok.cur;
    var c = cur;
    var pos = 0

    for (;;) {
        while (c == ' ' || c == '\t' || c == '\n' || c == '\014') {
            c = cur[pos++]
        }

        if (!c) {
            return 0;
        }

        if (c != '#') {
            return 1;
        }

        /* Suck up comment. */
        while (c && c != '\n') {
            c = cur[pos++]
        }
    }
}

function compute_parser_flags(flags){
    var parser_flags = 0;
    if (!flags) {
        return 0;
    }
    if (flags.cf_flags & PyCF_DONT_IMPLY_DEDENT) {
        parser_flags |= PyPARSE_DONT_IMPLY_DEDENT;
    }
    if (flags.cf_flags & PyCF_IGNORE_COOKIE) {
        parser_flags |= PyPARSE_IGNORE_COOKIE;
    }
    if (flags.cf_flags & CO_FUTURE_BARRY_AS_BDFL) {
        parser_flags |= PyPARSE_BARRY_AS_BDFL;
    }
    if (flags.cf_flags & PyCF_TYPE_COMMENTS) {
        parser_flags |= PyPARSE_TYPE_COMMENTS;
    }
    if ((flags.cf_flags & PyCF_ONLY_AST) && flags.cf_feature_version < 7) {
        parser_flags |= PyPARSE_ASYNC_HACKS;
    }
    if (flags.cf_flags & PyCF_ALLOW_INCOMPLETE_INPUT) {
        parser_flags |= PyPARSE_ALLOW_INCOMPLETE_INPUT;
    }
    return parser_flags;
}

// Parser API

$B._PyPegen.Parser_New = function(tok, start_rule, flags,
                    feature_version, errcode, arena){
    var p = {} // PyMem_Malloc(sizeof(Parser));
    if (p == NULL) {
        return PyErr_NoMemory();
    }
    // assert(tok != NULL);
    tok.type_comments = (flags & PyPARSE_TYPE_COMMENTS) > 0;
    tok.async_hacks = (flags & PyPARSE_ASYNC_HACKS) > 0;
    p.tok = tok;
    p.keywords = NULL;
    p.n_keyword_lists = -1;
    p.soft_keywords = NULL;
    p.tokens = [] // PyMem_Malloc(sizeof(Token *));
    if (!p.tokens) {
        PyMem_Free(p);
        return PyErr_NoMemory();
    }
    p.tokens[0] = PyMem_Calloc(1, sizeof(Token));

    /*
    if (!growable_comment_array_init(&p.type_ignore_comments, 10)) {
        PyMem_Free(p.tokens[0]);
        PyMem_Free(p.tokens);
        PyMem_Free(p);
        return (Parser *) PyErr_NoMemory();
    }
    */

    p.mark = 0;
    p.fill = 0;
    p.size = 1;

    p.errcode = errcode;
    p.arena = arena;
    p.start_rule = start_rule;
    p.parsing_started = 0;
    p.normalize = NULL;
    p.error_indicator = 0;

    p.starting_lineno = 0;
    p.starting_col_offset = 0;
    p.flags = flags;
    p.feature_version = feature_version;
    p.known_err_token = NULL;
    p.level = 0;
    p.call_invalid_rules = 0;

    p.debug = _Py_GetConfig().parser_debug;

    return p;
}

$B._PyPegen.Parser_Free = function(p){
    /*
    for (int i = 0; i < p->size; i++) {
        PyMem_Free(p->tokens[i]);
    }
    PyMem_Free(p->tokens);
    growable_comment_array_deallocate(&p->type_ignore_comments);
    PyMem_Free(p);
    */
}

function reset_parser_state_for_error_pass(p){
    for (let i = 0; i < p.fill; i++) {
        p.tokens[i].memo = NULL;
    }
    p.mark = 0;
    p.call_invalid_rules = 1;
    // Don't try to get extra tokens in interactive mode when trying to
    // raise specialized errors in the second pass.
    // p.tok.interactive_underflow = IUNDERFLOW_STOP;
}

function _is_end_of_source(p) {
    var err = p.tok.done;
    return err == E_EOF || err == E_EOFS || err == E_EOLS;
}

$B._PyPegen.run_parser = function(p){
    var res = $B._PyPegen.parse(p);
    // assert(p->level == 0);
    if (res == NULL) {
        /*
        if ((p.flags & PyPARSE_ALLOW_INCOMPLETE_INPUT) &&  _is_end_of_source(p)) {
            PyErr_Clear();
            return RAISE_SYNTAX_ERROR("incomplete input");
        }
        if (PyErr_Occurred() && !PyErr_ExceptionMatches(PyExc_SyntaxError)) {
            return NULL;
        }
        */
       // Make a second parser pass. In this pass we activate heavier and slower checks
        // to produce better error messages and more complete diagnostics. Extra "invalid_*"
        // rules will be active during parsing.
        var last_token = p.tokens[p.fill - 1];
        reset_parser_state_for_error_pass(p);
        $B._PyPegen.parse(p);

        // Set SyntaxErrors accordingly depending on the parser/tokenizer status at the failure
        // point.
        console.log('error', p)
        $B.raise_error_known_location(_b_.SyntaxError, p.filename,
            last_token.lineno, last_token.col_offset,
            last_token.end_lineno, last_token.end_col_offset,
            last_token.line, 'invalid syntax')
    }

    if (p.start_rule == Py_single_input && bad_single_statement(p)) {
        p.tok.done = E_BADSINGLE; // This is not necessary for now, but might be in the future
        return RAISE_SYNTAX_ERROR("multiple statements found while compiling a single statement");
    }

    // test_peg_generator defines _Py_TEST_PEGEN to not call PyAST_Validate()
// #if defined(Py_DEBUG) && !defined(_Py_TEST_PEGEN)
    /*
    if (p.mode == 'single' ||
        p.mode == 'file' ||
        p.mode == 'eval')
    {
        if (!_PyAST_Validate(res)) {
            return NULL;
        }
    }
    */
// #endif
    return res;
}

$B._PyPegen.run_parser_from_file_pointer = function(fp, start_rule, filename_ob,
                             enc, ps1, ps2,
                             flags, errcode, arena){
    var tok = _PyTokenizer_FromFile(fp, enc, ps1, ps2);
    if (tok == NULL) {
        if (PyErr_Occurred()) {
            _PyPegen_raise_tokenizer_init_error(filename_ob);
            return NULL;
        }
        return NULL;
    }
    if (!tok.fp || ps1 != NULL || ps2 != NULL ||
        PyUnicode_CompareWithASCIIString(filename_ob, "<stdin>") == 0) {
        tok.fp_interactive = 1;
    }
    // This transfers the ownership to the tokenizer
    tok.filename = Py_NewRef(filename_ob);

    // From here on we need to clean up even if there's an error
    var result = NULL;

    var parser_flags = compute_parser_flags(flags);
    var p = $B._PyPegen.Parser_New(tok, start_rule, parser_flags, PY_MINOR_VERSION,
                                    errcode, arena);
    if (p == NULL) {
        return error()
    }

    result = _PyPegen_run_parser(p);
    _PyPegen_Parser_Free(p);

    function error(){
        _PyTokenizer_Free(tok);
        return result;
    }
}

$B._PyPegen.run_parser_from_string = function(str, start_rule, filename_ob,
                       flags, arena){
    var exec_input = start_rule == Py_file_input;

    var tok;
    if (flags != NULL && flags.cf_flags & PyCF_IGNORE_COOKIE) {
        tok = _PyTokenizer_FromUTF8(str, exec_input, 0);
    } else {
        tok = _PyTokenizer_FromString(str, exec_input, 0);
    }
    if (tok == NULL) {
        if (PyErr_Occurred()) {
            _PyPegen_raise_tokenizer_init_error(filename_ob);
        }
        return NULL;
    }
    // This transfers the ownership to the tokenizer
    tok.filename = Py_NewRef(filename_ob);

    // We need to clear up from here on
    var result = NULL;

    var parser_flags = compute_parser_flags(flags);
    var feature_version = flags && (flags.cf_flags & PyCF_ONLY_AST) ?
        flags.cf_feature_version : PY_MINOR_VERSION;
    var p = $B._PyPegen.Parser_New(tok, start_rule, parser_flags, feature_version,
                                    NULL, arena);
    if (p == NULL) {
        return error()
    }

    result = _PyPegen_run_parser(p);
    _PyPegen_Parser_Free(p);

    function error(){
        // _PyTokenizer_Free(tok);
        return result;
    }
}

})(__BRYTHON__)
