
function make_class(name){
  eval('function ' + name + '(value){return new ' +
    '_' + name + '(value)}')
  eval('function _' + name + '(value){this.name = "' + name + '";' +
    'this.value = value; this.min = 1; this.max = 1; this.num = rule_num++}')
  var klass = eval('_' + name)

  klass.prototype.join = function(string){
    this.join = string
    return this
  }

  klass.prototype.match = function(tokens, pos){
    // if the token at position pos has its first item set to the klass
    // name, and if the class value is set, its second item equal to value,
    // the token matches the klass, so we return 1 (the number of tokens
    // consumed in the match). Otherwise return false
    console.log('match', this.name, tokens[pos])
    var matches = [],
        start = pos
    while(pos < tokens.length && matches.length < this.max){
        var test = tokens[pos][0] == this.name &&
          (this.value === undefined ? true : tokens[pos][1] == this.value)
        if(test){
            matches.push({rule: this, start: pos, end: pos + 1})
            pos++
            if(matches.length >= this.max){
                break
            }
        }else if(matches.length < this.min){
            return FAIL
        }
    }
    console.log(this.name, 'match', {rule: this, start, end: pos})
    return {rule: this, matches, start, end: pos}
  }

  klass.prototype.repeat = function(min, max){
    this.min = min
    this.max = max
    return this
  }

  return eval(name)
}

var NAME = make_class('NAME'),
    STRING = make_class('STRING'),
    NUMBER = make_class('NUMBER'),
    OP = make_class('OP')
    NEWLINE = make_class('NEWLINE'),
    ENCODING = make_class('ENCODING'),
    ENDMARKER = make_class('ENDMARKER'),
    TYPE_COMMENT = make_class('TYPE_COMMENT'),
    ASYNC = make_class('ASYNC'),
    AWAIT = make_class('AWAIT'),
    INDENT = make_class('INDENT'),
    DEDENT = make_class('DEDENT')

function OR(...choices){
    return new Or(choices)
}

function Or(choices){
  this.choices = choices
  this.type = 'OR'
  this.min = 1
  this.max = 1
  this.num = rule_num++
}

Or.prototype.join = function(string){
    this.join = string
    return this
}

Or.prototype.repeat = function(min, max){
    this.min = min
    this.max = max
    return this
}

function SEQ(...items){
    return new Seq(items)
}

function Seq(items){
  this.items = items
  this.type = "SEQ"
  this.num = rule_num++
  this.min = 1
  this.max = 1
}

Seq.prototype.at = function(pos){
  return this.items[pos]
}

Seq.prototype.repeat = Or.prototype.repeat

function ELT(name, min, max){
  return new Elt(name, min, max)
}

function Elt(name){
  this.name = name
  this.min = 1
  this.max = 1
}

Elt.prototype.join = Or.prototype.join

Elt.prototype.repeat = Seq.prototype.repeat

var inf = Number.POSITIVE_INFINITY

var rule_num = 0

var grammar = {
  file: SEQ(
               ELT('statement').repeat(0, inf),
               ENDMARKER()
           ),
  statement: SEQ(
                 OR(
                     ELT('assignment'),
                     ELT('return_stmt'),
                     ELT('raise_stmt'),
                     ELT('expression')
                 ),
                 NEWLINE()
             ),
  assignment: SEQ(NAME(), OP('='), ELT('expression')),
  expression: OR(NAME(), STRING(), NUMBER()),
  return_stmt: SEQ(NAME('return'), ELT('expression')),
  raise_stmt: SEQ(NAME('raise'), ELT('expression', 0, 1))
}

var grammar = {
  file: SEQ(
          SEQ(
            NUMBER(),
            OP('+'),
            NUMBER(),
            NEWLINE()
          ).repeat(0, inf),
          ENDMARKER()
        )
}

var grammar = {

  statement: SEQ(
                 ELT('expr'),
                 NEWLINE(),
                 ENDMARKER()
             ),

  expr: OR(
            SEQ(
                ELT('expr'),
                OP('-'),
                NUMBER()
            ),
            NUMBER()
        )
}

for(var name in grammar){
    grammar[name].name = grammar[name].name || name
    grammar[name].num = rule_num++
}

function Parser(){
  this.state = {type: 'program', pos: 0}
}

Parser.prototype.feed = function(tokens){
  if(tokens[0][0] !== 'ENCODING'){
      throw Error('missing encoding')
  }
  grammar.first_rule = grammar.expr
  return parse(grammar, tokens.slice(1))
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
    return memo[rule.name][position]
}

function set_memo(rule, position, value){
    memo[rule.name] = memo[rule.name] || {}
    memo[rule.name][position] = value
}

var FAIL = {name: 'FAIL'}

function LeftRecursion(detected){
    this.type = 'LeftRecursion'
    this.detected = detected // true or false
}

function eval_body(rule, tokens, position){
    console.log('eval body of rule', rule, 'position', position)
    if(rule instanceof Or){
        for(var choice of rule.choices){
            var match = eval_body(choice, tokens, position)
            if(match !== FAIL){
                return match
            }
        }
        return FAIL
    }else if(rule instanceof Seq){
        var start = position,
            matches = []
        for(var item of rule.items){
            var match = eval_body(item, tokens, position)
            if(match !== FAIL){
                matches.push(match)
                position = match.end
                if(match.end === undefined){
                    console.log('no end', match)
                    alert()
                }
            }else{
                console.log('item', item, 'of sequence', rule, 'fails')
                return FAIL
            }
        }
        return {rule, matches, start, end: position}
    }else if(rule instanceof Elt){
        console.log('in eval body, element', rule.name)
        return apply_rule(rule, tokens, position)
    }else{
        return rule.match(tokens, position)
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
    console.log('grow_lr, rule', rule, position, 'current MemoEntry', m)
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

    if(rule instanceof Elt){
        rule = grammar[rule.name]
    }else if(! grammar[rule.name]){
        // internal check, remove when algo is ok
        console.log('apply rule', rule)
        throw Error('not a rule')
    }
    console.log('apply rule', rule.name, rule, position, 'memo', memo)

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
        console.log('read from memo', memoized)
        if(memoized.match instanceof LeftRecursion){
            console.log('left recursion !')
            memoized.match.detected = true
            return FAIL
        }else{
            return memoized
        }
    }
}

function parse(grammar, tokens){
    var position = 0,
        rule = grammar.statement,
        match
    clear_memo()
    while(position < tokens.length){
        match = apply_rule(rule, tokens, position)
        if(match === FAIL){
            console.log('rule', rule, 'fails')
            rule = backtrack(rule)
            if(rule === null){
                return FAIL
            }
        }else{
            position = match.end
        }
    }
    console.log('parse succeeds !')
}
