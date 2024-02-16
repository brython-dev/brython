function document_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // prolog
  this.items = ['prolog', 'element', 'Misc*', "<class 'grammar_parser.End'>"]
}

document_rule.prototype.feed = function(char){
  console.log('document_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // prolog
      rule = new prolog_rule(this, 1, {})
      return rule.feed(char)
    case 1: // element
      rule = new element_rule(this, 2, {})
      return rule.feed(char)
    case 2: // Misc*
      rule = new Misc_rule(this, 3, {quantifier: '*'})
      return rule.feed(char)
    case 3: // <class 'grammar_parser.End'>
      if(char == END){
        console.log('fin');alert()
      }
      break
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

document_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

document_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function prolog_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // XMLDecl?
  this.items = ['XMLDecl?', 'Misc*', 'tmp_1?']
}

prolog_rule.prototype.feed = function(char){
  console.log('prolog_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // XMLDecl?
      rule = new XMLDecl_rule(this, 1, {quantifier: '?'})
      return rule.feed(char)
    case 1: // Misc*
      rule = new Misc_rule(this, 2, {quantifier: '*'})
      return rule.feed(char)
    case 2: // tmp_1?
      rule = new tmp_1_rule(this, -1, {quantifier: '?'})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

prolog_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

prolog_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_1_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // doctypedecl
  this.items = ['doctypedecl', 'Misc*']
}

tmp_1_rule.prototype.feed = function(char){
  console.log('tmp_1_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // doctypedecl
      rule = new doctypedecl_rule(this, 1, {})
      return rule.feed(char)
    case 1: // Misc*
      rule = new Misc_rule(this, -1, {quantifier: '*'})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_1_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_1_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function XMLDecl_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<?xml'
  this.items = ["'<?xml'", 'VersionInfo', 'EncodingDecl?', 'SDDecl?', 'S?', "'?>'"]
}

XMLDecl_rule.prototype.feed = function(char){
  console.log('XMLDecl_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // '<?xml'
      rule = new LITERAL(this, '<?xml', 1, {})
      return rule.feed(char)
    case 1: // VersionInfo
      rule = new VersionInfo_rule(this, 2, {})
      return rule.feed(char)
    case 2: // EncodingDecl?
      rule = new EncodingDecl_rule(this, 3, {quantifier: '?'})
      return rule.feed(char)
    case 3: // SDDecl?
      rule = new SDDecl_rule(this, 4, {quantifier: '?'})
      return rule.feed(char)
    case 4: // S?
      rule = new S_rule(this, 5, {quantifier: '?'})
      return rule.feed(char)
    case 5: // '?>'
      rule = new LITERAL(this, '?>', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

XMLDecl_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

XMLDecl_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function VersionInfo_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'version'", 'Eq', 'tmp_2']
}

VersionInfo_rule.prototype.feed = function(char){
  console.log('VersionInfo_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // S
      rule = new S_rule(this, 1, {})
      return rule.feed(char)
    case 1: // 'version'
      rule = new LITERAL(this, 'version', 2, {})
      return rule.feed(char)
    case 2: // Eq
      rule = new Eq_rule(this, 3, {})
      return rule.feed(char)
    case 3: // tmp_2
      rule = new tmp_2_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

VersionInfo_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

VersionInfo_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_2_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_3
  this.items = ['tmp_3', 'tmp_4']
}

tmp_2_rule.prototype.feed = function(char){
  console.log('tmp_2_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // tmp_3
      rule = new tmp_3_rule(this, 1, {next_if_fail: 1, save_pos: get_pos(this)})
      return rule.feed(char)
    case 1: // tmp_4
      rule = new tmp_4_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_2_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_2_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_3_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'VersionNum', '"\'"']
}

tmp_3_rule.prototype.feed = function(char){
  console.log('tmp_3_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // "'"
      rule = new LITERAL(this, '\'', 1, {})
      return rule.feed(char)
    case 1: // VersionNum
      rule = new VersionNum_rule(this, 2, {})
      return rule.feed(char)
    case 2: // "'"
      rule = new LITERAL(this, '\'', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_3_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_3_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_4_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'VersionNum', '\'"\'']
}

tmp_4_rule.prototype.feed = function(char){
  console.log('tmp_4_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // '"'
      rule = new LITERAL(this, '"', 1, {})
      return rule.feed(char)
    case 1: // VersionNum
      rule = new VersionNum_rule(this, 2, {})
      return rule.feed(char)
    case 2: // '"'
      rule = new LITERAL(this, '"', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_4_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_4_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function Eq_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'='", 'S?']
}

Eq_rule.prototype.feed = function(char){
  console.log('Eq_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // S?
      rule = new S_rule(this, 1, {quantifier: '?'})
      return rule.feed(char)
    case 1: // '='
      rule = new LITERAL(this, '=', 2, {})
      return rule.feed(char)
    case 2: // S?
      rule = new S_rule(this, -1, {quantifier: '?'})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

Eq_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

Eq_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function VersionNum_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '1.0'
  this.items = ["'1.0'"]
}

VersionNum_rule.prototype.feed = function(char){
  console.log('VersionNum_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // '1.0'
      rule = new LITERAL(this, '1.0', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

VersionNum_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

VersionNum_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function EncodingDecl_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'encoding'", 'Eq', 'tmp_5']
}

EncodingDecl_rule.prototype.feed = function(char){
  console.log('EncodingDecl_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // S
      rule = new S_rule(this, 1, {})
      return rule.feed(char)
    case 1: // 'encoding'
      rule = new LITERAL(this, 'encoding', 2, {})
      return rule.feed(char)
    case 2: // Eq
      rule = new Eq_rule(this, 3, {})
      return rule.feed(char)
    case 3: // tmp_5
      rule = new tmp_5_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

EncodingDecl_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

EncodingDecl_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_5_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_6
  this.items = ['tmp_6', 'tmp_7']
}

tmp_5_rule.prototype.feed = function(char){
  console.log('tmp_5_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // tmp_6
      rule = new tmp_6_rule(this, 1, {next_if_fail: 1, save_pos: get_pos(this)})
      return rule.feed(char)
    case 1: // tmp_7
      rule = new tmp_7_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_5_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_5_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_6_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'EncName', '\'"\'']
}

tmp_6_rule.prototype.feed = function(char){
  console.log('tmp_6_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // '"'
      rule = new LITERAL(this, '"', 1, {})
      return rule.feed(char)
    case 1: // EncName
      rule = new EncName_rule(this, 2, {})
      return rule.feed(char)
    case 2: // '"'
      rule = new LITERAL(this, '"', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_6_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_6_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_7_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'EncName', '"\'"']
}

tmp_7_rule.prototype.feed = function(char){
  console.log('tmp_7_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // "'"
      rule = new LITERAL(this, '\'', 1, {})
      return rule.feed(char)
    case 1: // EncName
      rule = new EncName_rule(this, 2, {})
      return rule.feed(char)
    case 2: // "'"
      rule = new LITERAL(this, '\'', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_7_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_7_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function EncName_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [A-Za-z]
  this.items = ['[A-Za-z]', 'tmp_8*']
}

EncName_rule.prototype.feed = function(char){
  console.log('EncName_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // [A-Za-z]
      rule = new CHARSET_rule(this, 'A-Za-z', 1, {})
    case 1: // tmp_8*
      rule = new tmp_8_rule(this, -1, {quantifier: '*'})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

EncName_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

EncName_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_8_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [A-Za-z0-9._]
  this.items = ['[A-Za-z0-9._]', "'-'"]
}

tmp_8_rule.prototype.feed = function(char){
  console.log('tmp_8_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // [A-Za-z0-9._]
      rule = new CHARSET_rule(this, 'A-Za-z0-9._', 1, {next_if_fail: 1, save_pos: get_pos(this)})
    case 1: // '-'
      rule = new LITERAL(this, '-', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_8_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_8_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function SDDecl_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'standalone'", 'Eq', 'tmp_13']
}

SDDecl_rule.prototype.feed = function(char){
  console.log('SDDecl_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // S
      rule = new S_rule(this, 1, {})
      return rule.feed(char)
    case 1: // 'standalone'
      rule = new LITERAL(this, 'standalone', 2, {})
      return rule.feed(char)
    case 2: // Eq
      rule = new Eq_rule(this, 3, {})
      return rule.feed(char)
    case 3: // tmp_13
      rule = new tmp_13_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

SDDecl_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

SDDecl_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_9_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'yes'
  this.items = ["'yes'", "'no'"]
}

tmp_9_rule.prototype.feed = function(char){
  console.log('tmp_9_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // 'yes'
      rule = new LITERAL(this, 'yes', 1, {next_if_fail: 1, save_pos: get_pos(this)})
      return rule.feed(char)
    case 1: // 'no'
      rule = new LITERAL(this, 'no', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_9_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_9_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_10_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'yes'
  this.items = ["'yes'", "'no'"]
}

tmp_10_rule.prototype.feed = function(char){
  console.log('tmp_10_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // 'yes'
      rule = new LITERAL(this, 'yes', 1, {next_if_fail: 1, save_pos: get_pos(this)})
      return rule.feed(char)
    case 1: // 'no'
      rule = new LITERAL(this, 'no', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_10_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_10_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_11_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'tmp_9', '\'"\'']
}

tmp_11_rule.prototype.feed = function(char){
  console.log('tmp_11_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // '"'
      rule = new LITERAL(this, '"', 1, {})
      return rule.feed(char)
    case 1: // tmp_9
      rule = new tmp_9_rule(this, 2, {})
      return rule.feed(char)
    case 2: // '"'
      rule = new LITERAL(this, '"', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_11_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_11_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_12_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'tmp_10', '"\'"']
}

tmp_12_rule.prototype.feed = function(char){
  console.log('tmp_12_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // "'"
      rule = new LITERAL(this, '\'', 1, {})
      return rule.feed(char)
    case 1: // tmp_10
      rule = new tmp_10_rule(this, 2, {})
      return rule.feed(char)
    case 2: // "'"
      rule = new LITERAL(this, '\'', -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_12_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_12_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

function tmp_13_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_12
  this.items = ['tmp_12', 'tmp_11']
}

tmp_13_rule.prototype.feed = function(char){
  console.log('tmp_13_rule expects', this.items[this.expect] || 'END', 'char', char)
  var res, rule, save_pos
  if(char === FAIL){
    return this.origin.handle_fail(this)
  }
  switch(this.expect){
    case 0: // tmp_12
      rule = new tmp_12_rule(this, 1, {next_if_fail: 1, save_pos: get_pos(this)})
      return rule.feed(char)
    case 1: // tmp_11
      rule = new tmp_11_rule(this, -1, {})
      return rule.feed(char)
    case -1:
      this.origin.expect = this.next_if_ok
      return this.origin.feed(char)
  }
  return this
}

tmp_13_rule.prototype.store_result = function(obj){
  console.log('store result', obj)
  var rank = obj.rank
  this.result_store[rank] = this.result_store[rank] ?? []
  this.result_store[rank].push(obj.value)
  console.log('results', this.result_store)
}

tmp_13_rule.prototype.handle_fail = function(char){
  console.log('handle_fail', this, char)
  reset_pos(this, this.pos)
  var q = this.args.quantifier
  if('*?'.includes(q)){
    this.origin.expect = this.next_if_ok
    return this.origin.feed(read_char(this))
  }else if(this.args.next_if_fail){
    this.origin.expect = this.args.next_if_fail
    return this.origin.feed(read_char(this))
  }
}

