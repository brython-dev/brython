(function($B){

var _b_ = $B.builtins,
    grammar = $B.grammar,
    Store = new $B.ast.Store(),
    Load = new $B.ast.Load(),
    Del = new $B.ast.Del(),
    NULL = undefined

// Set variables used in grammar actions such as Add, Not, etc.
for(var op_type of $B.op_types){
    for(var key in op_type){
        var klass_name = op_type[key]
        eval(`var ${klass_name} = new $B.ast.${klass_name}()`)
    }
}

var debug = 0

var alias_ty = $B.ast.alias,
    keyword_ty = $B.ast.keyword,
    arguments_ty = $B.ast.arguments,
    asdl_stmt_seq = Array,
    asdl_int_seq = Array,
    asdl_expr_seq = Array,
    asdl_keyword_seq = Array,
    asdl_identifier_seq = Array

var PyPARSE_IGNORE_COOKIE = 0x0010,
    PyPARSE_BARRY_AS_BDFL = 0x0020,
    PyPARSE_TYPE_COMMENTS = 0x0040,
    PyPARSE_ASYNC_HACKS = 0x0080,
    PyPARSE_ALLOW_INCOMPLETE_INPUT = 0x0100

function CHECK(type, obj){
    return obj instanceof type ? obj : undefined
}

function CHECK_VERSION(type, version, msg, node){
    return INVALID_VERSION_CHECK(p, version, msg, node)
}

function CHECK_NULL_ALLOWED(type, obj){
    if(obj !== NULL){
        return obj instanceof type ? obj : undefined
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

function RAISE_ERROR_KNOWN_LOCATION(errtype,
                           lineno, col_offset,
                           end_lineno, end_col_offset,
                           errmsg){
    var va = [errmsg]
    var _col_offset = col_offset //Py_ssize_t _col_offset = (col_offset == CURRENT_POS ? CURRENT_POS : col_offset + 1);
    var _end_col_offset = end_col_offset //Py_ssize_t _end_col_offset = (end_col_offset == CURRENT_POS ? CURRENT_POS : end_col_offset + 1);
    $B._PyPegen.raise_error_known_location(errtype, lineno, _col_offset, end_lineno, _end_col_offset, errmsg, va);
    return NULL;
}

function RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, msg){
    var extra_args = arguments[3]
    RAISE_ERROR_KNOWN_LOCATION(_b_.SyntaxError,
        a.lineno, a.col_offset,
        b.end_lineno, b.end_col_offset,
        msg, extra_args)
}

function set_position_from_EXTRA(ast_obj, EXTRA){
    for(var key in EXTRA){
        ast_obj[key] = EXTRA[key]
    }
}

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
    args = args.replace(/\*/g, '')
    var sep = args.length > 0 ? ', ' : ''
    var function_code = template.replace(/<ast_class>/g, ast_class)
                                .replace(/<sep>/, sep)
                                .replace(/<args>/g, args)
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

var Parser = $B.Parser = function(src){
  this.state = {type: 'program', pos: 0}
  this.src = src
}

Parser.prototype.feed = function(){
  var tokens = $B.tokens = []
  for(var token of __BRYTHON__.tokenizer(this.src)){
      if(['COMMENT', 'NL', 'ENCODING', 'TYPE_COMMENT'].indexOf(token[0]) == -1){
          tokens.push(token)
      }
  }
  return parse(grammar, tokens, this.src)
}

function MemoEntry(match, end){
    this.match = match
    this.position = end
}

var memo = {},
    rules = {}

function clear_memo(){
    for(var key in memo){
        delete memo[key]
    }
}

function get_memo(rule, position){
    if(memo[rule.name] === undefined ||
            memo[rule.name][position] === undefined){
        return null
    }
    var m = memo[rule.name][position]
    if(m.match === FAIL){
        return FAIL
    }
    return m
}

function set_memo(rule, position, value){
    memo[rule.name] = memo[rule.name] || {}
    memo[rule.name][position] = value
}

var FAIL = {name: 'FAIL'},
    FROZEN_FAIL = {name: 'FROZEN_FAIL'}

function LeftRecursion(detected){
    this.type = 'LeftRecursion'
    this.detected = detected // true or false
}

function eval_body(rule, tokens, position){
    var result,
        start = position,
        join_position = false
    if(! rule.repeat){
        result = eval_body_once(rule, tokens, position)
    }else{
        var matches = [],
            start = position
        while(matches.length < rule.repeat[1]){
            var match = eval_body_once(rule, tokens, position)
            if(match === FAIL){
                if(join_position){
                    result = {rule, matches, start, end: join_position - 1}
                    join_position = false
                    position = join_position - 1
                }else if(matches.length >= rule.repeat[0]){
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
    if(result !== FAIL){
        // console.log('result for rule', show_rule(rule), result)
    }
    return result
}

var use_invalid = {value: false}

function eval_body_once(rule, tokens, position){
    if(debug){
        console.log('eval_body_once of rule', show_rule(rule), rule, 'position', position, tokens[position])
    }
    if(rule.choices){
        for(var i = 0, len = rule.choices.length; i < len; i++){
            var choice = rule.choices[i],
                invalid = choice.items && choice.items.length == 1 &&
                    choice.items[0].name &&
                    choice.items[0].name.startsWith('invalid_')
            if(invalid && ! use_invalid.value){
                continue
            }
            var match = eval_body(choice, tokens, position)
            if(match === FROZEN_FAIL){
                // if a choice with a ~ fails, don't try other alternatives
                return FAIL
            }else if(match !== FAIL){
                if(invalid){
                    handle_invalid_match(match, tokens)
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
            var match = eval_body(item, tokens, position)
            if(item.debug){
                console.log('eval item', item, 'at position', position,
                    tokens[position], 'previous matches', matches,
                    'match', match)
            }
            if(match !== FAIL){
                matches.push(match)
                position = match.end
                if(match.end === undefined){
                    console.log('no end, rule', rule, 'item', item,
                        'result of eval_body', match)
                    alert()
                }
            }else{
                if(debug){
                    console.log('item', show_rule(item), 'of sequence', show_rule(rule),
                        'at position', position, tokens[position].string, 'fails')
                }
                if(frozen_choice){
                    return FROZEN_FAIL
                }
                return FAIL
            }
        }
        if(rule.items && rule.items.length != matches.length){
            console.log('bizarre', rule, matches)
            alert()
        }
        var match = {rule, matches, start, end: position}
        if(use_invalid.value && rule.parent_rule &&
                rule.parent_rule.startsWith('invalid_')){
            handle_invalid_match(match, tokens)
            match.invalid = true
        }
        if(debug){
            console.log('rule', show_rule(rule), 'succeeds', matches, match)
        }
        return match
    }else if(rule.type == "rule"){
        return apply_rule(grammar[rule.name], tokens, position)
    }else if(rule.type == "string"){
        return tokens[position][1] == rule.value ?
            {rule, start: position, end: position + 1} :
            FAIL
    }else if(rule.type == 'COMMIT_CHOICE'){
        // mark current option as frozen
        return {rule, start: position, end: position}
    }else if(rule.type == 'NAME'){
        var test = tokens[position][0] == rule.type &&
            keywords.indexOf(tokens[position][1]) == -1 &&
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

function grow_lr(rule, tokens, position, m){
    // Called after eval_body(rule, position) produced a match and ignored
    // an option that referenced itself (recursion) because at that time,
    // memo(rule, position) was a LeftReference.
    //
    // m is the MemoEntry for (rule, position); m.match is the latest match,
    // m.pos is the last position in tokens
    //
    // apply_rule(rule, position) will return this match
    //
    // In each iteration of the "while" loop, we try again eval_body(),
    // which uses the MemoEntry m for the rule. This allows an
    // expression such as "1 + 2 + 3" to set a first match for "1 + 2",
    // then a second for "1 + 2 + 3"
    if(debug){
        console.log('grow_lr, rule', rule, position, 'current MemoEntry', m)
    }
    while(true){
        var match = eval_body(rule, tokens, position)
        if(match === FAIL || match.end <= m.end){
            break
        }
        m.match = match
        m.end = match.end
    }
    return m.match
}

function apply_rule(rule, tokens, position){
    // apply rule at position
    if(debug){
        console.log('apply rule', show_rule(rule), position, 'memo', memo)
    }
    // search if result is in memo
    var memoized = get_memo(rule, position)
    if(memoized === null){
        // for left recursion, initialize with LeftRecursion set to false
        var LR = new LeftRecursion(false),
            m = new MemoEntry(LR, position)
        set_memo(rule, position, m)
        // evaluate body of rule
        // if the rule includes itself at the same position, it will be found
        // in memo as LR; LR.detected will be set to true and the branch of
        // eval_body containing rule will return FAIL, but eval_body can
        // match with another branch that doesn't contain rule
        var match = eval_body(rule, tokens, position)

        // change memo(rule, position) with result of match
        m.match = match
        m.end = match.end

        if(LR.detected && match !== FAIL){
            // recursion detected when executing eval_body
            // memo(rule, position) now contains the match with a branch
            // without recursion
            // grow_lr will try again at position, and use memo(rule, position)
            // to search a longer match
            return grow_lr(rule, tokens, position, m)
        }else{
            return match
        }
    }else{
        if(debug){
            console.log('read from memo', show_rule(rule), memoized)
        }
        if(memoized.match instanceof LeftRecursion){
            if(debug){
                console.log('recursion !')
            }
            memoized.match.detected = true
            return FAIL
        }else{
            if(memoized !== FAIL && memoized.match.start === undefined){
                console.log('pas de start', rule, position, memoized)
                alert()
            }
            return memoized === FAIL ? memoized : memoized.match
        }
    }
}

$B.parser_state = {}

function parse(grammar, tokens, src){
    if(src.trim().length == 0){
        // eg empty __init__.py
        return new $B.ast.Module([])
    }
    var position = 0,
        rule = grammar.file,
        match
    clear_memo()
    $B.parser_state.src = src
    for(var rule_name in grammar){
        grammar[rule_name].name = rule_name
        if(grammar[rule_name].choices){
            grammar[rule_name].choices.forEach(function(item, rank){
                item.parent_rule = rule_name
                item.rank = rank
            })
        }
    }
    // first pass skipping invalid_ rules
    use_invalid.value = false
    while(position < tokens.length){
        match = apply_rule(rule, tokens, position)
        if(match === FAIL){
            break
        }else{
            position = match.end
        }
    }
    if(match === FAIL){
        // second pass using invalid_ rules
        position = 0
        clear_memo()
        use_invalid.value = true
        while(position < tokens.length){
            match = apply_rule(rule, tokens, position)
            if(match === FAIL){
                console.log('rule fails', rule, tokens, position)
                console.log(src.substr(0, 200))
            }
            position = match.end
        }
    }
    // console.log('parse succeeds !', match)
    // console.log(show(match, tokens))
    if(match === FAIL){
        console.log('match fails')
    }

    var _ast = make(match, tokens)
    return _ast
}

function handle_invalid_match(match, tokens){
    var res = make(match, tokens)
}

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

function show_rule(rule){
    var res = rule.name || ''
    if(rule.type && rule.type != 'rule'){
        if(rule.lookahead == 'positive'){
            res += '&'
        }else if(rule.lookahead == 'negative'){
            res += '!'
        }
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

    if(rule.action){
        res += ' {' + rule.action + '}'
    }

    if(rule.repeat){
        if(rule.items && rule.items.length > 1){
            res = '(' + res + ')'
        }
        if(rule.repeat[0] == 0 && rule.repeat[1] == 1){
            res += '?'
        }else if(rule.repeat[0] == 0 && rule.repeat[1] == Number.POSITIVE_INFINITY){
            res += '*'
        }else if(rule.repeat[0] == 1 && rule.repeat[1] == Number.POSITIVE_INFINITY){
            res += '+'
        }
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

// Global parser object
var p = {feature_version: $B.version_info[1]}

function make(match, tokens){
    // match.rule succeeds; make() returns a value for the match, based on the
    // grammar action for the rule
    var rule = match.rule,
        names = {}
    p.tokens = tokens
    p.mark = match.start

    if(! rule){
        console.log('match without rule', match)
    }

    /* console.log('make, rule', show_rule(rule),
        (match.matches ? match.matches.length + ' matches' : match)) */

    if(match.end > match.start){
        var token = tokens[match.start],
            EXTRA = {lineno: token.start[0],
                     col_offset: token.start[1],
                     end_lineno: token.end[0],
                     end_col_offset: token.end[1]
                     }
        p.arena = EXTRA
    }

    if(rule.repeat){
        // If a repeated rule has an alias, it applies to the repetition list
        // The number of repetitions is len(match.matches)
        var res = []
        if(rule.type == 'STRING'){
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
            // Each of the matches matches rule.items
            if(one_match.rule === rule){
                var elts = []
                if(! one_match.matches){
                    console.log('one match no matches', match)
                }
                for(var i = 0; i < one_match.matches.length; i++){
                    var m = one_match.matches[i]
                    //if(m.end > m.start){
                        var _make = make(m, tokens)
                        if(rule.items[i].alias){
                            eval('var ' + rule.items[i].alias + ' = _make')
                        }
                        elts.push(_make)
                    //}
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
                makes.push(make(one_match, tokens))
            }
        }
        if(makes.length == 0){
            return
        }
        if(rule.repeat[1] == 1){
            //console.log('rule', show_rule(rule), 'evals to', makes[0])
            return makes[0]
        }
        //console.log('rule', show_rule(rule), 'evals to', makes)
        return makes
    }

    if(rule.items){
        if(rule.items.length != match.matches.length){
            alert('rule items and match.matches have different lengths')
        }
        var makes = [],
            nb_consuming = 0,
            ast,
            _make
        for(var i = 0; i < match.matches.length; i++){
            var m = match.matches[i]
            if(m.end > m.start){
                _make = make(match.matches[i], tokens)
                makes.push(_make)
            }else{
                _make = undefined
            }
            if(rule.items[i].alias){
                names[rule.items[i].alias] = _make
                eval('var ' + rule.items[i].alias + ' = _make')
            }
            if(! rule.items[i].lookahead){
                nb_consuming++
            }
        }
        if(rule.action){
            try{
                ast = eval(rule.action)
            }catch(err){
                console.log('error eval action of', show_rule(rule))
                throw err
            }
        }else if(nb_consuming == 1){
            ast = makes[0]
        }else{
            ast = makes
        }
        //console.log(show_rule(rule), '\nevals to', ast, 'match', match)
        return ast
    }else{
        if(match.matches){
            alert('rule without items has matches')
        }
        if(rule.type == 'NAME'){
            var ast_obj = new $B.ast.Name(tokens[match.start].string,
                                          new $B.ast.Load())
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }else if(rule.type == 'NUMBER'){
            try{
                var prepared = $B.prepare_number(token[1])
            }catch(err){
                $_SyntaxError(context, [err.message])
            }
            var ast_obj = new $B.ast.Constant(prepared)
            ast_obj.type = prepared.type
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }else if(['STRING', 'string'].indexOf(rule.type) > -1){
            var ast_obj = new $B.ast.Constant(tokens[match.start].string)
            set_position_from_EXTRA(ast_obj, EXTRA)
            return ast_obj
        }else if(grammar[rule.name] === undefined){
            //
        }else{
            var grammar_rule = grammar[rule_name]
            console.log('apply grammar rule', show_rule(grammar_rule))
            console.log('    rule', grammar_rule)
            console.log('    match', match)
            var elts = []
            for(var m of match.matches){
                elts.push(make(m, tokens))
            }
            console.log('rule', show_rule(rule), 'evals to', elts)
            return elts
        }
    }
}

})(__BRYTHON__)