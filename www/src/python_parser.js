// Python parser. Based on python.gram, transformed into a JS object in
// full_grammar.js.
// Implements the left-recursive algorithm described in
// http://web.cs.ucla.edu/~todd/research/pepm08.pdf

(function($B){

var _b_ = $B.builtins,
    debug = 0

// ---- Define names used by grammar actions

// Global parser object
var p = {feature_version: $B.version_info[1]}

var Store = new $B.ast.Store(),
    Load = new $B.ast.Load(),
    Del = new $B.ast.Del(),
    NULL = undefined

// actions such as Add, Not, etc.
for(var op_type of $B.op_types){
    for(var key in op_type){
        var klass_name = op_type[key]
        eval(`var ${klass_name} = new $B.ast.${klass_name}()`)
    }
}

var alias_ty = $B.ast.alias,
    keyword_ty = $B.ast.keyword,
    arguments_ty = $B.ast.arguments,
    expr_ty = $B.ast.expr,
    asdl_stmt_seq = Array,
    asdl_int_seq = Array,
    asdl_expr_seq = Array,
    asdl_keyword_seq = Array,
    asdl_identifier_seq = Array,
    asdl_pattern_seq = Array,
    AugOperator = $B.ast.AugAssign,
    Py_Ellipsis = {type: 'ellipsis'},
    Py_False = false,
    Py_True = true,
    Py_None = _b_.None,
    PyExc_SyntaxError = _b_.SyntaxError

var PyPARSE_IGNORE_COOKIE = 0x0010,
    PyPARSE_BARRY_AS_BDFL = 0x0020,
    PyPARSE_TYPE_COMMENTS = 0x0040,
    PyPARSE_ASYNC_HACKS = 0x0080,
    PyPARSE_ALLOW_INCOMPLETE_INPUT = 0x0100

var STAR_TARGETS = 'star_targets',
    FOR_TARGETS = 'for_targets',
    DEL_TARGETS = 'del_targets'

// Generate functions to create AST instances
$B._PyAST = {}

var template = `
$B._PyAST.<ast_class> = function(<args><sep>EXTRA){
    var ast_obj = new $B.ast.<ast_class>(<args>)
    set_position_from_EXTRA(ast_obj, EXTRA)
    return ast_obj
}
`

for(var ast_class in $B.ast_classes){ // in py_ast.js
    var args = $B.ast_classes[ast_class]
    if(Array.isArray(args)){
        continue
    }
    args = args.replace(/\*/g, '').replace(/\?/g, '')
    var sep = args.length > 0 ? ', ' : ''
    var function_code = template.replace(/<ast_class>/g, ast_class)
                                .replace(/<sep>/, sep)
                                .replace(/<args>/g, args)
    console.log(function_code)
    eval(function_code)
}


var inf = Number.POSITIVE_INFINITY

// Python keywords don't match NAME rules, so that "pass = 7" is illegal
// The list doesn't include 'case' and 'match' that are 'soft keywords'
// in PEP 634
var keywords = ['and', 'as', 'elif', 'for', 'yield', 'while', 'assert', 'or',
    'continue', 'lambda', 'from', 'class', 'in', 'not', 'finally', 'is',
    'except', 'global', 'return', 'raise', 'break', 'with', 'def',
    'try', 'if', 'else', 'del', 'import', 'nonlocal', 'pass'
    ]


function asdl_seq_LEN(t){
    return t.length
}

function asdl_seq_GET(t, i){
    return t[i]
}

function PyPegen_last_item(seq){
    return seq[seq.length - 1]
}

function CHECK(type, obj){
    if(Array.isArray(type)){
        var check
        for(var t of type){
            check = CHECK(t, obj)
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
}

function CHECK_VERSION(type, version, msg, node){
    return INVALID_VERSION_CHECK(p, version, msg, node)
}

function CHECK_NULL_ALLOWED(type, obj){
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
}

function INVALID_VERSION_CHECK(p, version, msg, node){
    if (node == NULL) {
        p.error_indicator = 1;  // Inline CHECK_CALL
        return NULL;
    }
    if (p.feature_version < version) {
        p.error_indicator = 1;
        return RAISE_SYNTAX_ERROR("%s only supported in Python 3.%i and greater",
                                  msg, version);
    }
    return node;
}

function NEW_TYPE_COMMENT(p, x){
    return x
}

function RAISE_ERROR_KNOWN_LOCATION(p, errtype,
                           lineno, col_offset,
                           end_lineno, end_col_offset,
                           errmsg){
    var va = [errmsg]
    $B._PyPegen.raise_error_known_location(p, errtype,
        lineno, col_offset, end_lineno, end_col_offset, errmsg, va);
    return NULL;
}

var RAISE_SYNTAX_ERROR = function(msg){
    var extra_args = []
    for(var i = 1, len = arguments.length; i < len; i++){
        extra_args.push(arguments[i])
    }
    get_last_token(p)
    $B._PyPegen.raise_error(p, _b_.SyntaxError, msg, ...extra_args)
}

function get_last_token(p){
    var last_token = p.tokens.last
    if(p.tokens.last.type == "ENDMARKER"){
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

var RAISE_INDENTATION_ERROR = function(msg, arg){
    if(arg !== undefined){
        msg = _b_.str.__mod__(msg, arg)
    }
    var last_token = p.tokens.last
    if(p.tokens.last.type == "ENDMARKER"){
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
}

var RAISE_SYNTAX_ERROR_KNOWN_LOCATION = function(a, err_msg, arg){
    if(arg !== undefined){
        err_msg = _b_.str.__mod__(err_msg, arg)
    }

    RAISE_ERROR_KNOWN_LOCATION(p, _b_.SyntaxError,
        a.lineno, a.col_offset,
        a.end_lineno, a.end_col_offset,
        err_msg)
}

function RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, msg){
    var extra_args = arguments[3]
    RAISE_ERROR_KNOWN_LOCATION(p, _b_.SyntaxError,
        a.lineno, a.col_offset,
        b.end_lineno, b.end_col_offset,
        msg, extra_args)
}


function RAISE_SYNTAX_ERROR_INVALID_TARGET(type, e){
    return _RAISE_SYNTAX_ERROR_INVALID_TARGET(p, type, e)
}

function _RAISE_SYNTAX_ERROR_INVALID_TARGET(p, type, e){
    var invalid_target = CHECK_NULL_ALLOWED(expr_ty,
        $B._PyPegen.get_invalid_target(e, type));
    if (invalid_target != NULL) {
        var msg;
        if (type == STAR_TARGETS || type == FOR_TARGETS) {
            msg = "cannot assign to %s";
        }else{
            msg = "cannot delete %s";
        }
        return RAISE_SYNTAX_ERROR_KNOWN_LOCATION(
            invalid_target,
            msg,
            $B._PyPegen.get_expr_name(invalid_target)
        )
    }
    return NULL;
}

function set_position_from_EXTRA(ast_obj, EXTRA){
    for(var key in EXTRA){
        ast_obj[key] = EXTRA[key]
    }
}


// ---- end of names used by grammar actions


// JS classes and functions used by the parsing algorithm

// Returns an object that has the interface of a list and consumes the
// generator on demand, if the index was not yet read.
// Used for the tokens. Reading all the tokens first would raise an exception
// if there is an invalid token at the end of a long script, instead of
// raising a possible SyntaxError at the beginning
function generator_as_list(generator){
    return new Proxy(generator,
      {
        get: function(target, ix){
            if(ix == 'last'){
                return $B.last(this.tokens)
            }
          if(this.tokens === undefined){
              this.tokens = []
          }
          if(ix >= this.tokens.length){
              // consume generator until we find a token other than ENCODING,
              // NL or COMMENT which are ignored by the grammar
              while(true){
                  var next = target.next()
                  if(! next.done){
                      var value = next.value
                      if(['ENCODING', 'NL', 'COMMENT'].indexOf(value.type) == -1){
                          this.tokens.push(value)
                          break
                      }
                  }else{
                      throw Error('tokenizer exhausted')
                  }
              }
          }
          return this.tokens[ix]
        }
      }
    )
}

// transform repeat string to min and max number of repetitions
var repeater = {
    '?' : [0, 1],
    '*': [0, inf],
    '+': [1, inf]
}

// Singletons for failure
var FAIL = {name: 'FAIL'},
    FROZEN_FAIL = {name: 'FROZEN_FAIL'}

// Classes used in the algorithm
function MemoEntry(match){
    this.match = match
}

function LR(seed, rule){
    this.seed = seed
    this.rule = rule
}

function HEAD(rule, involvedSet, evalSet){
    this.rule = rule
    this.involvedSet = involvedSet
    this.evalSet = evalSet
}

// An instance of Parser is created for each script / exec /
// f-string expression
var Parser = $B.Parser = function(src, filename){
    // Normalize line ends
    src = src.replace(/\r\n/gm, "\n")
    // Remove trailing \, cf issue 970
    // but don't hide syntax error if ends with \\, cf issue 1210
    if(src.endsWith("\\") && !src.endsWith("\\\\")){
        src = src.substr(0, src.length - 1)
    }

    var tokenizer = $B.tokenizer(src)
    this.tokens = generator_as_list(tokenizer)
    this.src = src
    this.filename = filename
    this.memo = {}
    if(filename){
        p.filename = filename
    }
}

Parser.prototype.parse = function(top_rule){
    // top_rule is 'file' for a script or exec(), 'eval' for eval()
    if(this.src.trim().length == 0){
        // eg empty __init__.py
        return new $B.ast.Module([])
    }
    var rule = $B.grammar[top_rule],
        match
    this.clear_memo()
    this.HEADS = {}
    this.LRStack = []
    // first pass skipping invalid_ rules
    this.use_invalid = false
    match = this.apply_rule(rule, 0)
    if(match === FAIL){
        // second pass using invalid_ rules
        this.use_invalid = true
        this.clear_memo()
        this.HEADS = {}
        this.LRStack = []
        try{
            match = this.apply_rule(rule, 0)
        }catch(err){
            throw err
        }
    }
    if(match === FAIL){
        var err_token = this.tokens.last
        p.filename = this.filename
        RAISE_ERROR_KNOWN_LOCATION(p, _b_.SyntaxError,
            err_token.start[0],
            err_token.start[1],
            err_token.end[0],
            err_token.end[1],
            'invalid syntax')
    }

    // If parsing succeeds, return AST object
    return make_ast(match, this.tokens)
}

Parser.prototype.clear_memo = function(){
    for(var key in this.memo){
        delete this.memo[key]
    }
}

Parser.prototype.get_memo = function(rule, position){
    if(this.memo[rule.name] === undefined ||
            this.memo[rule.name][position] === undefined){
        return null
    }
    var m = this.memo[rule.name][position]
    if(m.match === FAIL){
        return FAIL
    }
    return m
}

Parser.prototype.set_memo = function(rule, position, value){
    this.memo[rule.name] = this.memo[rule.name] || {}
    this.memo[rule.name][position] = value
}

Parser.prototype.apply_rule = function(rule, position){
    // apply rule at position
    var memoized = this.RECALL(rule, position),
        result
    if(memoized === null){
        var lr = new LR(FAIL, rule)
        this.LRStack.push(lr)
        var m = new MemoEntry(lr)
        this.set_memo(rule, position, m)
        // evaluate rule body
        var match = this.eval_body(rule, position)
        this.LRStack.pop()
        m.end = match.end

        if(lr.head){
            lr.seed = match
            result = this.LR_ANSWER(rule, position, m)
        }else{
            m.match = match
            result = match
        }
    }else{
        if(memoized.match instanceof LR){
            this.SETUP_LR(rule, memoized.match)
            result = memoized.match.seed
        }else{
            result = memoized === FAIL ? memoized : memoized.match
        }
    }
    return result
}

Parser.prototype.eval_option = function(rule, position){
    var tokens = this.tokens,
        result,
        start = position,
        join_position = false

    if(! rule.repeat){
        result = this.eval_option_once(rule, position)
    }else{
        var matches = [],
            start = position,
            repeat = repeater[rule.repeat]
        while(matches.length < repeat[1]){
            var match = this.eval_option_once(rule, position)
            if(match === FAIL){
                if(join_position){
                    result = {rule, matches, start, end: join_position - 1}
                    join_position = false
                    position = join_position - 1
                }else if(matches.length >= repeat[0]){
                    // Enough repetitions
                    result = {rule, matches, start, end: position}
                }else{
                    result = FAIL
                }
                break
            }
            matches.push(match)
            // If the rule is of the form "s.e" :
            // - if the next token matches "s", increment position and remain
            //   in the loop. Keep track of the position that matches "s". If
            //   the next tokens don't match the rule, the position will be
            //   reset to the position of the "s" character
            // - else break
            if(rule.join){
                if(tokens[match.end][1] == rule.join){
                    position = match.end + 1
                    join_position = position
                }else{
                    position = match.end
                    break
                }
             }else{
                 join_position = false
                 position = match.end
             }
        }
        if(! result){
            result = {rule, start, matches, end: position}
        }
    }
    if(rule.lookahead){
        switch(rule.lookahead){
            case 'positive':
                if(result !== FAIL){
                    result.end = result.start // don't consume input
                }
                break
            case 'negative':
                if(result === FAIL){
                    result = {rule, start, end: start}
                }else{
                    result = FAIL
                }
                break
        }
    }
    return result
}

Parser.prototype.eval_option_once = function(rule, position){
    var tokens = this.tokens
    if(rule.choices){
        for(var i = 0, len = rule.choices.length; i < len; i++){
            var choice = rule.choices[i],
                invalid = choice.items && choice.items.length == 1 &&
                    choice.items[0].name &&
                    choice.items[0].name.startsWith('invalid_')
            if(invalid && ! this.use_invalid){
                continue
            }
            var match = this.eval_option(choice, position)
            if(match === FROZEN_FAIL){
                // if a choice with a ~ fails, don't try other alternatives
                return FAIL
            }else if(match !== FAIL){
                if(invalid){
                    var _ast = make_ast(match, tokens)
                    if(_ast === undefined){
                        continue
                    }
                    match.invalid = true
                }
                match.rank = i
                return match
            }
        }
        return FAIL
    }else if(rule.items){
        var start = position,
            matches = [],
            frozen_choice = false // set to true if we reach a COMMIT_CHOICE (~)
        for(var item of rule.items){
            if(item.type == 'COMMIT_CHOICE'){
                frozen_choice = true
            }
            var match = this.eval_option(item, position)
            if(match !== FAIL){
                matches.push(match)
                position = match.end
            }else{
                if(frozen_choice){
                    return FROZEN_FAIL
                }
                return FAIL
            }
        }
        var match = {rule, matches, start, end: position}
        if(this.use_invalid && rule.parent_rule &&
                rule.parent_rule.startsWith('invalid_')){
            var _ast = make_ast(match, tokens)
            if(_ast === undefined){
                return FAIL
            }
            match.invalid = true
        }
        return match
    }else if(rule.type == "rule"){
        return this.apply_rule($B.grammar[rule.name], position)
    }else if(rule.type == "string"){
        return tokens[position][1] == rule.value ?
            {rule, start: position, end: position + 1} :
            FAIL
    }else if(rule.type == 'COMMIT_CHOICE'){
        // mark current option as frozen
        return {rule, start: position, end: position}
    }else if(rule.type == 'NAME'){
        var token = tokens[position],
            string = token.string,
            test = token.type == rule.type &&
            keywords.indexOf(token.string) == -1 &&
            ['True', 'False', 'None'].indexOf(token.string) == -1 &&
            (rule.value === undefined ? true : tokens[position][1] == rule.value)
        return test ? {rule, start: position, end: position + 1} : FAIL
    }else if(rule.type == 'ASYNC'){
        var test = tokens[position].type == 'NAME' && tokens[position].string == 'async'
        return test ? {rule, start: position, end: position + 1} : FAIL
    }else if(rule.type == 'AWAIT'){
        var test = tokens[position].type == 'NAME' && tokens[position].string == 'await'
        return test ? {rule, start: position, end: position + 1} : FAIL
    }else{
        var test = tokens[position][0] == rule.type &&
          (rule.value === undefined ? true : tokens[position][1] == rule.value)
        return test ? {rule, start: position, end: position + 1} : FAIL
    }
}

Parser.prototype.eval_body = function(rule, position){
    // Only for grammar rules
    var start = position
    if(rule.choices){
        for(var i = 0, len = rule.choices.length; i < len; i++){
            var choice = rule.choices[i],
                invalid = choice.items && choice.items.length == 1 &&
                    choice.items[0].name &&
                    choice.items[0].name.startsWith('invalid_')
            if(invalid && ! this.use_invalid){
                continue
            }
            var match = this.eval_option(choice, position)
            if(match === FROZEN_FAIL){
                // if a choice with a ~ fails, don't try other alternatives
                return FAIL
            }else if(match !== FAIL){
                if(invalid){
                    var _ast = make_ast(match, this.tokens)
                    if(_ast === undefined){
                        // ignore invalid match if its action returns NULL
                        continue
                    }
                }
                match.rank = i
                return match
            }
        }
        return FAIL
    }else if(rule.items){
        var matches = [],
            frozen_choice = false // set to true if we reach a COMMIT_CHOICE (~)
        for(var item of rule.items){
            if(item.type == 'COMMIT_CHOICE'){
                frozen_choice = true
            }
            var match = this.eval_option(item, position)
            if(match !== FAIL){
                matches.push(match)
                position = match.end
            }else{
                return frozen_choice ? FROZEN_FAIL : FAIL
            }
        }
        var match = {rule, matches, start, end: position}
        if(this.use_invalid && rule.parent_rule &&
                rule.parent_rule.startsWith('invalid_')){
            make_ast(match, this.tokens)
        }
        return match
    }
}

Parser.prototype.matched_string = function(match){
    var s = ''
    for(var i = match.start; i < match.end; i++){
        s += this.tokens[i].string
    }
    return s
}

Parser.prototype.RECALL = function(R, P){
    let m = this.get_memo(R, P)
    let h = this.HEADS[P]
    // If not growing a seed parse, just return what is stored
    // in the memo table.
    if(! h){
        return m
    }
    // Do not evaluate any rule that is not involved in this
    // left recursion.
    var set = new Set([h.head])
    for(var s of h.involvedSet){
        set.add(s)
    }
    if((! m) && ! set.has(R)){
        return new MemoEntry(FAIL)
    }
    // Allow involved rules to be evaluated, but only once,
    // during a seed-growing iteration.
    if(h.evalSet.has(R)){
        h.evalSet.delete(R)
        let ans = this.eval_body(R, P)
        m.match = ans
        m.end = ans === FAIL ? P : ans.end
    }
    return m
}

Parser.prototype.SETUP_LR = function(R, L){
    if(! L.head){
        L.head = new HEAD(R, new Set(), new Set())
    }
    let ix = this.LRStack.length -1,
        s = this.LRStack[ix]
    while(s && s.head !== L.head){
        s.head = L.head
        L.head.involvedSet.add(s.rule)
        ix--
        s = this.LRStack[ix]
    }
}

Parser.prototype.LR_ANSWER = function(R, P, M){
    let h = M.match.head
    if(h.rule != R){
        return M.match.seed
    }else{
        M.match = M.match.seed
    }
    if(M.match === FAIL){
        return FAIL
    }else{
        return this.grow_lr(R, P, M, h)
    }
}

Parser.prototype.grow_lr = function(rule, position, m, H){
    // Called after eval_body(rule, position) produced a match and ignored
    // an option that referenced itself (recursion) because at that time,
    // memo(rule, position) was a LeftReference.
    //
    // m is the MemoEntry for (rule, position); m.match is the latest match
    //
    // apply_rule(rule, position) will return this match
    //
    // In each iteration of the "while" loop, we try again eval_body(),
    // which uses the MemoEntry m for the rule. This allows an
    // expression such as "1 + 2 + 3" to set a first match for "1 + 2",
    // then a second for "1 + 2 + 3"
    this.HEADS[position] = H
    while(true){
        if(H){
            H.evalSet = new Set(H.involvedSet)
        }
        var match = this.eval_body(rule, position)
        if(match === FAIL || match.end <= m.end){
            break
        }
        m.match = match
        m.end = match.end
    }
    delete this.HEADS[position]
    return m.match
}

// Function that generates the AST for a match
function make_ast(match, tokens){
    // match.rule succeeds; make_ast() returns a value for the match, based on
    // the grammar action for the rule
    var rule = match.rule,
        names = {}
    p.tokens = tokens
    p.mark = match.start
    p.fill = match.start

    var test = false // show_rule(rule).indexOf('invalid_def_raw') > -1
    if(test){
        console.log('make_ast', show_rule(rule, true), '\n    match', match)
    }

    //if(match.end > match.start){
        // name EXTRA is used in grammar actions
        var token = tokens[match.start],
            EXTRA = {lineno: token.start[0],
                     col_offset: token.start[1],
                     end_lineno: token.end[0],
                     end_col_offset: token.end[1]
                     }
        p.arena = EXTRA
    //}

    if(rule.repeat){
        // If a repeated rule has an alias, it applies to the repetition list
        // The number of repetitions is len(match.matches)
        var res = []
        if(['STRING', 'string', 'NEWLINE'].indexOf(rule.type) > -1){
            for(var m of match.matches){
                res.push(tokens[m.start])
            }
            if(rule.alias){
                eval('var ' + rule.alias + ' = res')
            }
            if(rule.action){
                return eval(rule.action)
            }
            return res
        }else if(rule.type == 'NAME'){
            for(var m of match.matches){
                res.push(new $B.ast.Name(tokens[m.start].string,
                    new $B.ast.Load()))
            }
            if(rule.alias){
                eval('var ' + rule.alias + ' = res')
            }
            if(rule.action){
                return eval(rule.action)
            }
            return res
        }
        var makes = []
        for(var one_match of match.matches){
            // Each match matches rule.items
            if(one_match.rule === rule){
                var elts = []
                for(var i = 0; i < one_match.matches.length; i++){
                    var m = one_match.matches[i]
                    var _make = make_ast(m, tokens)
                    if(rule.items[i].alias){
                        eval('var ' + rule.items[i].alias + ' = _make')
                    }
                    elts.push(_make)
                }
                if(rule.action){
                    try{
                        makes.push(eval(rule.action))
                    }catch(err){
                        console.log('error eval action of', show_rule(rule), match)
                        throw err
                    }
                }else if(elts.length == 1){
                    makes.push(elts[0])
                }else{
                    makes.push(elts)
                }
            }else{
                makes.push(make_ast(one_match, tokens))
            }
        }
        if(makes.length == 0){
            return
        }
        if(repeater[rule.repeat][1] == 1){
            return makes[0]
        }
        return makes
    }

    if(rule.items){
        var makes = [],
            nb_consuming = 0,
            ast,
            _make
        if(match.matches.length > 0){
            var first = match.matches[0],
                last = $B.last(match.matches)
            EXTRA = {
                    lineno: tokens[first.start].start[0],
                    col_offset: tokens[first.start].start[1],
                    end_lineno: tokens[last.end - 1].end[0],
                    end_col_offset: tokens[last.end - 1].end[1]
                    }
            var pos = last.end - 1,
                last_line = tokens[pos].start[0]
            if(last_line > tokens[last.end - 1].start[0] + 1){
                last_token = {type: 'NL',
                              start: [last_line - 1, 0],
                              end: [last_line - 1, 0],
                              line: '\n'}
            }else{
                last_token = tokens[last.end - 1]
            }

            p.arena = {
                lineno: last_token.start[0],
                offset: last_token.start[1],
                end_lineno: last_token.end[0],
                end_col_offset: last_token.end[1]
            }
            if(test){
                console.log('last token', tokens[last.end])
                console.log('extra', EXTRA)
            }
        }
        for(var i = 0; i < match.matches.length; i++){
            var m = match.matches[i]
            if(test){
                console.log('  match', i, m)
            }
            if(m.end > m.start){
                _make = make_ast(m, tokens)
                makes.push(_make)
            }else{
                if(m.rule.repeat && repeater[m.rule.repeat][1] > 1){
                    // If m.rule has * or + modifier, return empty list
                    _make = []
                }else{
                    _make = undefined
                }
            }
            if(rule.items[i].alias){
                names[rule.items[i].alias] = _make
                eval('var ' + rule.items[i].alias + ' = _make')
                // console.log('alias', rule.items[i].alias, show_rule(rule.items[i]), _make)
            }
            if(! rule.items[i].lookahead){
                nb_consuming++
            }
        }
        if(rule.action){
            try{
                // console.log(show_rule(rule, true))
                ast = eval(rule.action)
            }catch(err){
                if($B.debug > 2){
                    var rule_str = show_rule(rule, true)
                    console.log('error eval action of', rule_str)
                    console.log('p', p)
                    console.log($B.frames_stack.slice())
                    console.log(err.message)
                    console.log(err.stack)
                }
                throw err
            }
        }else if(nb_consuming == 1){
            ast = makes[0]
        }else{
            ast = makes
        }
        return ast
    }else{
        if(rule.type == 'NAME'){
            var ast_obj = new $B.ast.Name(tokens[match.start].string,
                                          new $B.ast.Load())
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }else if(rule.type == 'NUMBER'){
            try{
                var prepared = $B.prepare_number(token[1])
            }catch(err){
                RAISE_SYNTAX_ERROR_KNOWN_LOCATION(p.arena,
                    'wrong number %s', token[1])

            }
            var ast_obj = new $B.ast.Constant(prepared)
            ast_obj.type = prepared.type
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }else if(['STRING', 'string'].indexOf(rule.type) > -1){
            var ast_obj = new $B.ast.Constant(tokens[match.start].string)
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }
        // ignore other rules such as DEDENT, NEWLINE etc.
    }
}

// Functions for debugging
function show(match, tokens, level){
    level = level || 0
    var s = '',
        prefix = '  '.repeat(level),
        rule = match.rule

    s += prefix + show_rule(rule)
    if(match.matches){
        s += ' (' + match.matches.length + ' matches'
        for(var m of match.matches){
            if(m.rule === rule){
                s += ' same rule ' + show_rule(m.rule)
            }
        }
        s += ')'
    }

    s += '\n'
    if(! match.rule.repeat){
        level += 1
    }

    if(match.matches){
        for(var m of match.matches){
            s += show(m, tokens, level)
        }
    }else{
        if(match.end > match.start){
            s += prefix
            if(['NAME', 'STRING', 'NUMBER', 'string'].indexOf(match.rule.type) > -1){
                s += match.rule.type + ' ' + tokens[match.start][1]
            }else{
                s += match.rule.type + ' ' + (match.rule.value || '') +
                    match.start + '-' + match.end
            }
            s += '\n'
        }
    }
    return s
}

function debug_head(n){
    var signs = '|:.',
        s = ''
    for(var i = 0; i < n; i++){
        s += '| '
    }
    return s
}

function show_rule(rule, show_action){
    var res = rule.name || ''
    if(rule.lookahead == 'positive'){
        res += '&'
    }else if(rule.lookahead == 'negative'){
        res += '!'
    }
    if(rule.type && rule.type != 'rule'){
        if(rule.type == 'string'){
            res += "'" + rule.value + "'"
        }else{
            res += rule.type
        }
    }

    if(rule.choices){
        res += ' (' + rule.choices.map(show_rule).join(' | ') + ')'
    }else if(rule.items){
        res += ' ' + rule.items.map(show_rule).join(' ')
    }

    if(rule.action && show_action){
        res += ' {' + rule.action + '}'
    }

    if(rule.repeat){
        if(rule.items && rule.items.length > 1){
            res = '(' + res + ')'
        }
        res += rule.repeat
    }
    if(rule.join){
        res = `'${rule.join}'.` + res
    }
    if(rule.alias){
        res = (rule.alias + '=' + res)
    }
    if(rule.parent_rule){
        res = '<' + rule.parent_rule +' #' + rule.rank +'>' + res
    }
    return res
}

// export names for use in other scripts (action_helpers.js)
$B.Parser.RAISE_SYNTAX_ERROR = RAISE_SYNTAX_ERROR
$B.Parser.RAISE_SYNTAX_ERROR_KNOWN_LOCATION = RAISE_SYNTAX_ERROR_KNOWN_LOCATION
$B.Parser.RAISE_ERROR_KNOWN_LOCATION = RAISE_ERROR_KNOWN_LOCATION
$B.Parser.RAISE_SYNTAX_ERROR_KNOWN_RANGE = RAISE_SYNTAX_ERROR_KNOWN_RANGE

})(__BRYTHON__)