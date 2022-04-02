var $B = __BRYTHON__,
    Store = $B.ast.Store,
    NULL = undefined

function _seq_number_of_starred_exprs(seq){
    var n = 0
    for(var k of seq){
        if(! k.is_keyword){
            n++;
        }
    }
    return n
}

function _PyPegen_dummy_name(p){
    var cache = NULL;

    if (cache != NULL) {
        return cache;
    }

    var id = "",
        ast_obj = new $B.ast.Name(id, new $B.ast.Load())
    set_position_from_list(ast_obj, [1, 0, 1, 0])
    return cache;
}

function _PyPegen_seq_delete_starred_exprs(p, kwargs){
    var len = kwargs.length,
        new_len = len - _seq_number_of_starred_exprs(kwargs)
    if (new_len == 0) {
        return NULL;
    }
    var new_seq = []

    for (var k of kwargs){
        if (k.is_keyword) {
            new_seq.push(k.element)
        }
    }
    return new_seq
}

function _PyPegen_seq_extract_starred_exprs(p, kwargs){
    var new_len = _seq_number_of_starred_exprs(kwargs);
    if (new_len == 0) {
        return NULL;
    }
    var new_seq = []

    var idx = 0;
    for (var k of kwargs) {
        if (! k.is_keyword) {
            new_seq[idx++] = k.element
        }
    }
    return new_seq
}

function _PyPegen_collect_call_seqs(p, a, b,
                     lineno, col_offset, end_lineno,
                     end_col_offset, arena) {
    var args_len = a.length,
        total_len = args_len;

    if (b == NULL) {
        return _PyAST_Call(_PyPegen_dummy_name(p), a, NULL, lineno, col_offset,
                        end_lineno, end_col_offset, arena);

    }

    var starreds = _PyPegen_seq_extract_starred_exprs(p, b),
        keywords = _PyPegen_seq_delete_starred_exprs(p, b);

    if (starreds) {
        total_len += starreds.length
    }

    var args = []


    for (var i = 0; i < args_len; i++) {
        args[i] = a[i]
    }
    for (; i < total_len; i++) {
        args[i] = starreds[i - args_len]
    }

    return _PyAST_Call(_PyPegen_dummy_name(p), args, keywords, lineno,
                       col_offset, end_lineno, end_col_offset, arena);
}

function _PyPegen_join_sequences(p, a, b){
    return a.concat(b)
}

function _PyPegen_concatenate_strings(p, strings){
    // strings is a list of tokens
    var res = '',
        first = strings[0],
        last = $B.last(strings)
    for(var token of strings){
        var s = $B.prepare_string(token.string)
        console.log('result of prepare string', s)
        res += eval(s.value)
    }
    var ast_obj = new $B.ast.Constant(res)
    ast_obj.lineno = first.start[0]
    ast_obj.col_offset = first.start[1]
    ast_obj.end_lineno = last.end[0]
    ast_obj.end_col_offset = last.end[1]
    return ast_obj
}

function _PyPegen_set_expr_context(p, a, ctx){
    a.ctx = new ctx()
    return a
}

function _PyPegen_singleton_seq(p, a){
    return [a]
}

function _PyPegen_seq_flatten(p, seqs){
    var res = []
    for(var seq of seqs){
        for(var item of seq){
            res.push(item)
        }
    }
    return res
}

function _PyPegen_make_module(p, a){
    console.log('make module, a', a)
    var res = new $B.ast.Module(a)
    return res
}

function set_position_from_EXTRA(ast_obj, EXTRA){
    for(var key in EXTRA){
        ast_obj[key] = EXTRA[key]
    }
}

var positions = ['lineno', 'col_offset', 'end_lineno', 'end_col_offset']

function set_position_from_list(ast_obj, EXTRA){
    for(var i = 0; i < 4; i++){
        ast_obj[positions[i]] = EXTRA[i]
    }
}

function _PyAST_Assign(a, b, tc, EXTRA){
    var ast_obj = new $B.ast.Assign(a, b)
    set_position_from_EXTRA(ast_obj, EXTRA)
    return ast_obj
}

function _PyAST_Call(func, args, keywords, EXTRA){
    if(func instanceof $B.ast.Name){
        func.ctx = new $B.ast.Load()
    }
    var ast_obj = new $B.ast.Call(func, args || [], keywords || [])
    set_position_from_EXTRA(ast_obj, EXTRA)
    return ast_obj
}

function _PyAST_Expr(e, EXTRA){
    var ast_obj = new $B.ast.Expr(e)
    set_position_from_EXTRA(ast_obj, EXTRA)
    return ast_obj
}

function NEW_TYPE_COMMENT(x){
    return x
}

var debug = 0

var inf = Number.POSITIVE_INFINITY

// Python keywords don't match NAME rules, so that "pass = 7" is illegal
// The list doesn't include 'case' and 'match' that are 'soft keywords'
// in PEP 634
var keywords = ['and', 'as', 'elif', 'for', 'yield', 'while', 'assert', 'or',
    'continue', 'lambda', 'from', 'class', 'in', 'not', 'finally', 'is',
    'except', 'global', 'return', 'raise', 'break', 'with', 'def',
    'try', 'if', 'else', 'del', 'import', 'nonlocal', 'pass'
    ]

function Parser(src){
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

function eval_body_once(rule, tokens, position){
    if(debug){
        console.log('eval_body_once of rule', rule, 'position', position)
    }
    if(rule.choices){
        for(var i = 0, len = rule.choices.length; i < len; i++){
            var choice = rule.choices[i]
            var match = eval_body(choice, tokens, position)
            if(match === FROZEN_FAIL){
                // if a choice with a ~ fails, don't try other alternatives
                return FAIL
            }else if(match !== FAIL){
                match.rank = i
                return match
            }
        }
        return FAIL
    }else if(rule.items){
        var start = position,
            matches = [],
            frozen_choice = false // set to true if we reach a COMMIT_CHOICE (~)
        var test = rule.items[0].name == 'star_targets' &&
                   rule.items[0].alias == 'z'
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
                    console.log('item', item, 'of sequence', rule, 'fails')
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
        return {rule, matches, start, end: position}
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
        console.log('apply rule', rule, position, 'memo', memo)
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
            console.log('read from memo', memoized)
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

function parse(grammar, tokens, src){
    var position = 0,
        rule = grammar.file,
        match
    clear_memo()
    for(rule_name in grammar){
        grammar[rule_name].name = rule_name
        if(grammar[rule_name].choices){
            grammar[rule_name].choices.forEach(function(item, rank){
                item.parent_rule = rule_name
                item.rank = rank
            })
        }
    }
    while(position < tokens.length){
        match = apply_rule(rule, tokens, position)
        if(match === FAIL){
            console.log('rule', rule, 'fails')
            return
        }else{
            position = match.end
        }
    }
    console.log('parse succeeds !', match)
    console.log(show(match, tokens))

    var _ast = make(match, tokens)
    console.log(_ast)
    var symtable = $B._PySymtable_Build(_ast, 'main')
    var js_from_ast = $B.js_from_root(_ast, symtable, 'filename')
    console.log('js', js_from_ast)

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
                s += 'same rule ' + show_rule(m.rule)
            }
        }
        s += ')'
    }

    s += '\n'
    if(! match.rule.repeat){
        level += 1
    }

    if(match.matches){
        for(var match of match.matches){
            s += show(match, tokens, level)
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

function make(match, tokens){
    // match.rule succeeds; make() returns a value for the match, based on the
    // grammar action for the rule
    var rule = match.rule,
        names = {},
        p = {}

    console.log('make, rule', show_rule(rule), rule)
    console.log('    match', match.matches, match.start, match.end)

    if(match.end > match.start){
        var token = tokens[match.start],
            EXTRA = {lineno: token.start[0],
                     col_offset: token.start[1],
                     end_lineno: token.end[0],
                     end_col_offset: token.end[1]
                     }
    }

    if(rule.repeat){
        // if a repeated rule has an alias, it applies to the repetition list
        // The number of repetitions is len(match.matches)
        var res = [],
            same_rule
        if(rule.type == 'STRING'){
            for(var m of match.matches){
                res.push(tokens[m.start])
            }
            if(rule.alias){
                eval(rule.alias + ' = res')
            }
            if(rule.action){
                return eval(rule.action)
            }
            return res
        }
        for(var one_match of match.matches){
            // Each of the matches matches rule.items
            same_rule = one_match.rule === rule
            var makes = []
            for(var i = 0; i < one_match.matches.length; i++){
                var m = one_match.matches[i]
                if(m.end == m.start){
                    continue
                }
                var _make = make(m, tokens)
                makes.push(_make)
                if(rule.items){
                    var r = rule.items[i]
                    if(r.alias){
                        eval(r.alias + ' = _make')
                    }
                }
            }
            if(rule.alias){
                eval(rule.alias + ' = makes')
            }
            if(rule.action){
                res.push(eval(rule.action))
            }else{
                if(makes.length == 1){
                    res.push(makes[0])
                }else{
                    res.push(makes)
                }
            }
        }

        if(rule.repeat[1] == 1){
            return res[0]
        }
        return res
    }

    // If there is an explicit action, get the names in the rule expression
    if(rule.action){
        for(var i = 0; i < match.matches.length; i++){
            if(rule.items[i].alias){
                names[rule.items[i].alias] = make(match.matches[i], tokens)
            }
        }
        console.log('action', rule.action, 'of rule', show_rule(rule), 'names', names)
        for(var name in names){
            eval(`var ${name} = names.${name}`)
            console.log('    name', name, 'evals to', eval(name))
        }
        var action = rule.action.trim()
        action = action.replace(/^\(.*?\)/, '')
        var res = eval(action)
        console.log('rule', show_rule(rule), 'evals to', res)
        return res
    }else{
        // If rule has items, each submatch matches one of the items
        // Otherwise, rule.name is in the grammar and each submatch matches
        // the grammar rule
        if(rule.items){
            var elts = []
            for(var m of match.matches){
                if(m.end > m.start){
                    var _make = make(m, tokens)
                    elts.push(_make)
                }
            }
            if(elts.length == 1){
                elts = elts[0]
            }
            if(rule.alias){
                var res = {name: rule.alias, elts}
            }else{
                res = elts
            }
            console.log('rule', show_rule(rule), rule, 'evals to', res)
            if(rule.parent_rule == 'args'){
                console.log('matches', match.matches)
                alert()
            }
            return res
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
                console.log('anomalie', rule.name, 'not in grammar')
                alert()
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
}