// Regular expression

var $B = __BRYTHON__,
    _b_ = $B.builtins

var MAXGROUPS = 2147483647,
    MAXREPEAT = 2147483648

var is_word = {}
var word_gcs = ['Ll', 'Lu', 'Lm', 'Lt', 'Lo',
                'Nd',
                'Mc', 'Me', 'Mn',
                'Pc']
for(var word_gc of word_gcs){
    for(var cp in $B.unicode_tables[word_gc]){
        is_word[cp] = true
    }
}

var is_ascii_word = {}

for(var cp = 0; cp <= 127; cp++){
    if(is_word[cp]){
        is_ascii_word[cp] = true
    }
}

var is_digit = {}

for(var cp in $B.unicode_tables['Nd']){
    is_digit[cp] = true
}

var is_ascii_digit = {}

for(var cp = 0; cp <= 127; cp++){
    if(is_digit[cp]){
        is_ascii_digit[cp] = true
    }
}

var $error_2 = {
    $name: "error",
    $qualname: "error",
    $is_class: true,
    __module__: "re"
}

var error = $B.make_class("error",
    function(message){
        return {
            __class__: error,
            msg: message,
            args: $B.fast_tuple([])
        }
    })
error.__bases__ = [_b_.Exception, _b_.object]
error.__mro__ = [_b_.Exception, _b_.object]

error.__str__ = function(self){
    var s = self.msg + ' at position ' + self.pos
    if(self.lineno > 1){
        s += ` (line ${self.lineno}, column ${self.colno})`
    }
    return s
}

$B.set_func_names(error, "re")

function $last(t){
    return t[t.length - 1]
}

function fail(message, pos, pattern){
    var err = error.$factory(message)
    err.msg = message
    err.pos = pos
    if(pattern){
        err.pattern = pattern.py_obj // Python object passed to compile()
        err.lineno = 1
        var linestart = 0
        for(var i = 0, len = pattern.string.length; i < pos; i++){
            if(pattern.string[i] == '\n'){
                err.lineno++
                linestart = i + 1
            }
        }
        err.colno = pos - linestart + 1
    }
    throw err
}

function warn(klass, message, pos, text){
    var frame = $B.last($B.frames_stack),
        file = frame[3].__file__,
        src = $B.file_cache[file]
    if(text === undefined){
        var lineno = frame[1].$lineno
        var lines = src.split('\n'),
            line = lines[lineno - 1]
    }else{
        if(Array.isArray(text)){
            text = from_codepoint_list(text)
        }
        var lineno = 1,
            line_start = 0
        for(var i = 0; i < pos; i++){
            if(text[i] == '\n'){
                lineno++
                line_start = i + 1
            }
        }
        var line_end = text.substr(line_start).search('\n'),
            line
        if(line_end == -1){
            line = text.substr(line_start)
        }else{
            line = text.substr(line_start, line_end)
        }
        var col_offset = pos - line_start
    }
    var warning = klass.$factory(message)
    warning.pos = pos
    warning.args[1] = [file, lineno, col_offset, lineno, col_offset,
        line]
    warning.filename = file
    warning.lineno = warning.end_lineno = lineno
    warning.offset = warning.end_offset = col_offset
    warning.line = line
    // module _warning is in builtin_modules.js
    $B.imported._warnings.warn(warning)
}

var Flag = $B.make_class("Flag",
    function(value){
        return {
            __class__: Flag,
            value
        }
    }
)

Flag.__and__ = function(self, other){
    if(other.__class__ === Flag){
        return Flag.$factory(self.value & other.value)
    }else if(typeof other == "number" || typeof other == "boolean"){
        return Flag.$factory(self.value & other)
    }
    return _b_.NotImplemented
}

Flag.__index__ = function(self){
    return self.value
}

Flag.__invert__ = function(self){
    return Flag.$factory(~self.value)
}

Flag.__eq__ = function(self, other){
    return self.value == other.value
}

Flag.__or__ = function(self, other){
    if(other.__class__ === Flag){
        return Flag.$factory(self.value | other.value)
    }else if(typeof other == "number" || typeof other == "boolean"){
        return Flag.$factory(self.value | other)
    }
    return _b_.NotImplemented
}

Flag.__rand__ = function(self, other){
    if(typeof other == "number" || _b_.isinstance(other, _b_.int)){
        if(other == 0){
            return false // Flag.$factory(self.value)
        }
        return self.value & other
    }
    return _b_.NotImplemented
}

Flag.__ror__ = function(self, other){
    if(typeof other == "number" || _b_.isinstance(other, _b_.int)){
        if(other == 0){
            return self.value
        }
        return self.value | other
    }
    return _b_.NotImplemented
}

Flag.__repr__ = Flag.__str__ = function(self){
    if(self.value == 0){
        return "re.none"
    }
    var inverted = self.value < 0

    var t = [],
        value = inverted ? ~self.value : self.value
    for(var flag in inline_flags){
        if(value & inline_flags[flag].value){
            t.push('re.' + flag_names[flag])
            value &= ~inline_flags[flag].value
        }
    }
    if(value > 0){
        t.push('0x' + value.toString(16))
    }
    var res = t.join('|')
    if(inverted){
        if(t.length > 1){
            return '~(' + res + ')'
        }else{
            return '~' + res
        }
    }
    return res
}

Flag.__xor__ = function(self, other){
    return Flag.$factory(self.value ^ other.value)
}

$B.set_func_names(Flag, "re")

var no_flag = {}

var Scanner = $B.make_class("Scanner",
    function(pattern, string){
        return {
            __class__: Scanner,
            $string: string,
            pattern
        }
    }
)

Scanner.match = function(self){
    return BPattern.match(self.pattern, self.$string)
}

Scanner.search = function(self){
    if(! self.$iterator){
        self.$iterator = $module.finditer(self.pattern, self.$string)
    }
    try{
        var nxt = _b_.next(self.$iterator)
    }catch(err){
        if($B.is_exc(err, [_b_.StopIteration])){
            return _b_.None
        }
        throw err
    }
    return nxt
}

var BPattern = $B.make_class("Pattern",
    function(pattern){
        var nb_groups = 0
        for(var key in pattern.groups){
            if(isFinite(key)){
                nb_groups++
            }
        }
        return {
            __class__: BPattern,
            pattern: pattern.text,
            groups: nb_groups,
            flags: pattern.flags,
            $groups: pattern.groups,
            $pattern: pattern
        }
    }
)

BPattern.__eq__ = function(self, other){
    if(other.$pattern && self.$pattern.type != other.$pattern.$type){
        // warn(_b_.BytesWarning, "cannot compare str and bytes pattern", 1)
    }
    return self.pattern == other.pattern &&
        self.flags.value == other.flags.value
}

BPattern.__hash__ = function(self){
    // best effort ;-)
    return _b_.hash(self.pattern) + self.flags.value
}

BPattern.__repr__ = BPattern.__str__ = function(self){
    var text = self.$pattern.text,
        s = text
    if(self.$pattern.type == "bytes"){
        s = _b_.str.$factory(_b_.str.encode(s, 'latin-1'))
    }else{
        s = _b_.repr(s)
    }
    s = s.substr(0, 200)
    var res = `re.compile(${s}`,
        flags = self.$pattern.flags
    if(flags === no_flag){
        return res + ')'
    }
    // mask UNICODE flag
    if(flags.__class__ === Flag){
        // copy flag, otherwise U.value would become 0
        flags = Flag.$factory(flags.value)
        flags.value &= ~U.value
    }else if(typeof flags == "number"){
        flags &= ~U.value
    }
    if(flags != 0 && flags.value != 0){
        res += `, ${_b_.str.$factory(flags)}`
    }
    return res + ')'
}

BPattern.findall = function(self){
    var iter = BPattern.finditer.apply(null, arguments).js_gen,
        res = []

    while(true){
        var next = iter.next()
        if(next.done){
            return res
        }
        var bmo = next.value,
            mo = bmo.mo,
            groups = BMO.groups(bmo)

        // replace None by the empty string
        for(var i = 0, len = groups.length; i < len; i++){
            groups[i] = groups[i] === _b_.None ? "" : groups[i]
        }
        if(groups.length > 0){
            if(groups.length == 1){
                res.push(groups[0])
            }else{
                res.push($B.fast_tuple(groups))
            }
        }else{
            res.push(mo.string.substring(mo.start, mo.end))
        }
    }
}

BPattern.finditer = function(self){
    var $ = $B.args("finditer", 4,
            {self: null, string: null, pos: null, endpos: null},
            'self string pos endpos'.split(' '), arguments,
            {pos: 0, endpos: _b_.None}, null, null)
    var original_string = $.string,
        data = prepare({string: $.string})
    var endpos = $.endpos === _b_.None ? data.string.length : $.endpos
    return $B.generator.$factory(iterator)(self.$pattern, data.string,
            no_flag, $.string, $.pos, endpos)
}

BPattern.fullmatch = function(self, string){
    var $ = $B.args("match", 4,
                    {self: null, string: null, pos: null, endpos: null},
                    ["self", "string", "pos", "endpos"], arguments,
                    {pos: 0, endpos: _b_.None}, null, null)
    if($.endpos === _b_.None){
        $.endpos = $.string.length
    }
    var data = prepare({string: $.string})
    if(self.$pattern.type != data.string.type){
        throw _b_.TypeError.$factory("not the same type for pattern " +
            "and string")
    }
    var mo = match($.self.$pattern, data.string, $.pos, $.endpos)
    if(mo && mo.end - mo.start == $.endpos - $.pos){
        return BMO.$factory(mo)
    }else{
        return _b_.None
    }
}
var GroupIndex = $B.make_class("GroupIndex",
    function(self, _default){
        var res = $B.empty_dict()
        res.__class__ = GroupIndex
        for(var key in self.$groups){
            if(isNaN(parseInt(key))){
                _b_.dict.$setitem(res, key, self.$groups[key].num)
            }
        }
        return res
    }
)
GroupIndex.__mro__ = [_b_.dict, _b_.object]
GroupIndex.__setitem__ = function(){
    throw _b_.TypeError.$factory("read only")
}

$B.set_func_names(GroupIndex, "re")

BPattern.groupindex = {
    __get__: function(self){
        return GroupIndex.$factory(self)
    }
}

BPattern.match = function(self, string){
    var $ = $B.args("match", 4,
                    {self: null, string: null, pos: null, endpos: null},
                    ["self", "string", "pos", "endpos"], arguments,
                    {pos: 0, endpos: _b_.None}, null, null)
    if($.endpos === _b_.None){
        $.endpos = $.string.length
    }
    var data = prepare({string: $.string})
    if(self.$pattern.type != data.string.type){
        throw _b_.TypeError.$factory("not the same type for pattern " +
            "and string")
    }
    var mo = match($.self.$pattern, data.string, $.pos,
        $.endpos)
    return mo ? BMO.$factory(mo) : _b_.None
}

BPattern.scanner = function(self, string){
    return Scanner.$factory(self, string)
}

BPattern.search = function(self, string){
    var $ = $B.args("match", 4,
                    {self: null, string: null, pos: null, endpos: null},
                    ["self", "string", "pos", "endpos"], arguments,
                    {pos: 0, endpos: _b_.None}, null, null)
    if($.endpos === _b_.None){
        $.endpos = $.string.length
    }
    var data = prepare({string: $.string})
    if(self.$pattern.type != data.string.type){
        throw _b_.TypeError.$factory("not the same type for pattern " +
            "and string")
    }
    var pos = $.pos
    while(pos < $.endpos){
        var mo = match(self.$pattern, data.string, pos)
        if(mo){
            return BMO.$factory(mo)
        }else{
            pos++
        }
    }
    return _b_.None
}

BPattern.split = function(){
    return $module.split.apply(null, arguments)
}

BPattern.sub = function(){
    var $ = $B.args("match", 4,
                    {self: null, repl: null, string: null, count: null},
                    "self repl string count".split(' '), arguments,
                    {count: 0}, null, null)
    var data = prepare({string: $.string})
    if($.self.$pattern.type != data.string.type){
        throw _b_.TypeError.$factory("not the same type for pattern " +
            "and string")
    }

    return $module.sub($.self, $.repl, $.string, $.count)
}

$B.set_func_names(BPattern, "re")

function Node(parent){
    this.parent = parent
    this.items = []
}

Node.prototype.add = function(item){
    this.items.push(item)
    item.parent = this
}

Node.prototype.fixed_length = function(){
    // Return the sum of items lengths if fixed, else undefined
    if(this.repeat){
        return false
    }
    var len = 0
    for(var item of this.items){
        if(item.fixed_length === undefined){
            console.log("pas de fixed length", item)
            alert()
        }
        var sublen = item.fixed_length()
        if(sublen === false){
            return false
        }
        len += sublen
    }
    return len
}

function get_top(node){
    var top = node.parent
    while(top.parent){
        top = top.parent
    }
    return top
}

var BackReference = function(pos, type, value){
    // for "\number"
    this.name = "BackReference"
    this.pos = pos
    this.type = type // "name" or "num"
    this.value = value
    this.groups = []
}

BackReference.prototype.fixed_length = function(){
    // Return length of referenced group if it is fixed, else undefined
    if(this.repeat){
        return undefined
    }
    var group = this.get_group()
    if(group.fixed_length === undefined){
        console.log("group", group, "no fixed length")
        alert()
    }
    return group === undefined ? false : group.fixed_length()
}

BackReference.prototype.get_group = function(){
    var top = get_top(this)
    return top.$groups[this.value]
}

BackReference.prototype.match = function(string, pos, groups){
    this.repeat = this.repeat || {min: 1, max: 1}

    var group = groups[this.value]
    if(group === undefined){
        if(this.repeat.min == 0){
            return {
                nb_min: 0,
                nb_max: 0
            }
        }
        return false
    }

    // Get the codepoints matched by the referenced group
    group_cps = string.codepoints.slice(group.start, group.end)

    // search (repetitions of) the matched group codepoints
    var _pos = pos,
        nb = 0,
        len = string.codepoints.length,
        group_len = group_cps.length,
        flag
    while(_pos < len && nb < this.repeat.max){
        flag = true
        for(var i = 0; i < group_len; i++){
            if(string.codepoints[_pos + i] != group_cps[i]){
                flag = false
                break
            }
        }
        if(flag){
            nb++
            _pos += group_len
        }else{
            break
        }
    }
    if(nb >= this.repeat.min){
        // Returns the accepted minimum and maximum number of repeats
        // and the length of each repeat
        return {
            nb_min: this.repeat.min,
            nb_max: nb,
            group_len
        }
    }
    return false
}

BackReference.prototype.toString = function(){
    return "BackRef to group" + this.value
}

var Case = function(){
    this.name = "Case"
    this.items = []
    this.groups = []
    this.text = 'Case '
}

Case.prototype.add = function(item){
    this.items.push(item)
    item.parent = this
    this.text += item.toString()
}

Case.prototype.fixed_length = function(){
    var len
    for(var item of this.items){
        var fl = item.fixed_length()
        if(fl === false){
            return false
        }else if(len === undefined){
            len = fl
        }else{
            len += fl
        }
    }
    return len
}

Case.prototype.toString = function(){
    return 'Case ' + this.text
}

var Choice = function(){
    this.type = "choice"
    this.items = []
    this.groups = []
}

Choice.prototype.add = Node.prototype.add

Choice.prototype.fixed_length = function(){
    var len
    for(var item of this.items){
        var fl = item.fixed_length()
        if(fl === false){
            return false
        }else if(len === undefined){
            len = fl
        }else if(len != fl){
            return false
        }
     }
     return len
}

function subgroups(item){
    // Return all the subgroups below item
    var groups = []
    if(item.items){
        for(var subitem of item.items){
            if(subitem instanceof Group && subitem.num){
                groups.push(subitem.num)
                if(subitem.name){
                    groups.push(subitem.name)
                }
            }
            groups = groups.concat(subgroups(subitem))
        }
    }
    return item.$subgroups = groups
}

Choice.prototype.toString = function(){
    return 'Choice'
}

var EmptyString = {
        toString: function(){
            return ''
        },
        match: function(string, pos){
            return {nb_min: 0, nb_max: 0}
        },
        fixed_length: function(){
            return 1
        },
        length: 0
    },
    Flags = function(flags){
        this.flags = flags
    },
    GroupEnd = function(pos){
        this.name = "GroupEnd"
        this.pos = pos
        this.text = ')'
        this.toString = function(){
            return '[end of group #' + this.group.num + ']'
        }
    },
    Or = function(pos){
        this.name = "Or"
        this.pos = pos
        this.text = '|'
        this.toString = function(){
            return '|'
        }
    },
    Repeater = function(pos, op){
        this.name = "Repeater"
        this.pos = pos
        this.op = op
    }

function cased_cps(cp, ignore_case, ascii){
    // If cp is the codepoint of a cased Unicode character, return the list
    // of the codepoints that match the character in a case-insensitive way

    // ignore_case = this.flags && this.flags.value & IGNORECASE.value
    // ascii = this.flags.value & ASCII.value
    var cps,
        char = $B.codepoint2jsstring(cp)
    if(! ignore_case){
        return [cp]
    }
    if(ascii){
        // only test ASCII letters
        ignore_case = ignore_case && (
            (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z'))
    }
    if(ignore_case){
        var char_up = char.toUpperCase(),
            char_low = char.toLowerCase(),
            cps = new Set([cp, $B.jsstring2codepoint(char_low),
                $B.jsstring2codepoint(char_up)])
        // special cases
        if(char.toLowerCase() == "k"){
            cps.add(0x212a) // Kelvin sign
        }
        if(cp == 0x212a){
            cps.add(ord('k'))
            cps.add(ord('K'))
        }
        if(char.toLowerCase() == "s"){
            cps.add(0x017f) //  (Latin small letter long s)
        }
        if(cp == 0x017f){
            cps.add(ord('s'))
            cps.add(ord('S'))
        }
        if(char.toLowerCase() == 'i'){
            cps.add(0x0130) //  (Latin capital letter I with dot above)
            cps.add(0x0131) //  (Latin small letter dotless i)
        }
        if(cp == 0x0130 || cp == 0x0131){
            cps.add(ord('i'))
            cps.add(ord('I'))
        }
        return Array.from(cps)
    }else{
        cps = [cp]
    }
    return cps
}

var Char = function(pos, cp, groups){
    // character in a regular expression or in a character set
    // pos : position of the character in the pattern string
    // cp : the character's codepoint
    // groups (optional) : the groups that contain the character
    this.pos = pos
    this.cp = cp
    this.char = chr(this.cp)
    this.text = this.char
}

Char.prototype.fixed_length = function(){
    if(this.repeat){
        return this.repeat.min
    }
    return this.char === EmptyString ? 0 : 1
}

Char.prototype.match = function(string, pos){
    // Returns {pos1, pos2} such that "this" matches all the substrings
    // string[pos:i] with pos1 <= i < pos2, or false if no match
    this.repeat = this.repeat || {min: 1, max: 1}

    var len = string.codepoints.length,
        i = 0

    // browse string codepoints until they don't match, or the number of
    // matches is above the maximum allowed
    if(this.flags){
        if(this.flags.value & ASCII.value){
            if(this.cp > 127){
                return false
            }
        }
        if(this.flags.value & IGNORECASE.value &&
                (! this.is_bytes || this.cp <= 127)){
            // Flag IGNORECASE set
            // For bytes pattern, case insensitive matching only works
            // for ASCII characters
            var char_upper = this.char.toUpperCase(),
                char_lower = this.char.toLowerCase()
            while(i < this.repeat.max && pos + i < len){
                var char = chr(string.codepoints[pos + i])
                if(char.toUpperCase() != char_upper &&
                        char.toLowerCase() != char_lower){
                   break
                }
                i++
            }
        }else{
            while(string.codepoints[pos + i] == this.cp &&
                    i < this.repeat.max){
                i++
            }
        }
    }else{
        while(string.codepoints[pos + i] == this.cp && i < this.repeat.max){
            i++
        }
    }
    var nb = i
    if(nb >= this.repeat.min){
        // Number of repeats ok
        return {
            nb_min: this.repeat.min,
            nb_max: nb
        }
    }else{
        return false
    }
}

Char.prototype.toString = function(){
    var res = 'Char ' + this.text
    if(this.repeat !== undefined){
        res += ' repeat {' + this.repeat.min + ',' + this.repeat.max + '}'
        if(this.non_greedy){
            res += '?'
        }
    }
    return res
}

function CharSeq(chars){
    // sequence of consecutive characters
    this.chars = chars
}

CharSeq.prototype.fixed_length = function(){
    var len = 0
    for(var char of this.chars){
        len += char.fixed_length()
    }
    return len
}

CharSeq.prototype.match = function(string, pos){
    var mos = [],
        i = 0,
        backtrack,
        nb
    for(var i = 0, len = this.chars.length; i < len; i++){
        var char =  this.chars[i],
            mo = char.match(string, pos) // form {nb_min, nb_max}
        if(mo){
            nb = char.non_greedy ? mo.nb_min : mo.nb_max
            mos.push({nb,
                      nb_min: mo.nb_min,
                      nb_max: mo.nb_max,
                      non_greedy: !!char.non_greedy
                     })
            pos += nb
        }else{
            // backtrack
            backtrack = false
            while(mos.length > 0){
                i--
                mo = mos.pop()
                pos -= mo.nb
                if(mo.non_greedy && nb + 1 < mo.nb_max){
                    nb += 1
                    backtrack = true
                }else if(! mo.non_greedy && nb - 1 >= mo.nb_min){
                    nb -= 1
                    backtrack = true
                }
                if(backtrack){
                    pos += nb
                    mo.nb = nb
                    mos.push(mo)
                    i++
                    break
                }
            }
            if(mos.length == 0){
                return false
            }
        }
    }
    var match_len = 0
    for(var mo of mos){
        match_len += mo.nb
    }
    return {
        nb_min: match_len,
        nb_max: match_len
    }
}




CharSeq.prototype.toString = function(){
    var res = ''
    for(var char of this.chars){
        res += char.text
    }
    return 'CharSeq ' + res
}

function CharacterClass(pos, cp, length, groups){
    this.cp = cp
    this.value = chr(cp)
    this.length = length
    this.pos = pos

    var flags = this.flags

    // Test function : test(string, pos) returns:
    // - true if "this" matches 1 character string[pos]
    // - [true, 0] if "this" matches the empty string at pos
    // - false or undefined if "this" doesn't match
    switch(this.value){
        case 'A':
            this.test_func = function(string, pos){
                if(pos == 0){
                    return [true, 0]
                }
            }
            break
        case 's':
            this.test_func = function(string, pos){
                var cp = string.codepoints[pos]
                return $B.unicode_tables.Zs[cp] !== undefined ||
                    $B.unicode_bidi_whitespace.indexOf(cp) > -1
            }
            break
        case 'S':
            this.test_func = function(string, pos){
                var cp = string.codepoints[pos]
                return cp !== undefined &&
                    $B.unicode_tables.Zs[cp] === undefined &&
                    $B.unicode_bidi_whitespace.indexOf(cp) == -1
            }
            break
        case '.':
            this.test_func = function(string, pos){
                if(string.codepoints[pos] === undefined){
                    return false
                }
                if(this.flags.value & DOTALL.value){
                    return true
                }else{
                    return string.codepoints[pos] != 10
                }
            }
            break
        case 'd':
            this.test_func = function(string, pos){
                if(this.flags === undefined){
                    console.log("\\d, no flags", this)
                }
                var cp = string.codepoints[pos],
                    table = (this.flags.value & ASCII.value) ?
                        is_ascii_digit : is_digit
                return table[cp]
            }
            break
        case 'D':
            this.test_func = function(string, pos){
                var cp = string.codepoints[pos],
                    table = (this.flags.value & ASCII.value) ?
                        is_ascii_digit : is_digit
                return ! table[cp]
            }
            break
        case 'b':
            this.test_func = function(string, pos){
                var table = is_word
                if(this.is_bytes || (this.flags.value & ASCII.value)){
                    table = is_ascii_word
                }
                var cp = string.codepoints[pos],
                    len = string.codepoints.length,
                    ok = {nb_min: 0, nb_max: 0}

                // return true if char at pos is at the beginning or start
                // of a word
                if(pos == 0 && table[cp]){
                    return ok
                }
                if(pos == len && table[string.codepoints[pos - 1]]){
                    return ok
                }
                if(pos > 0 && pos < len){
                    if((table[string.codepoints[pos - 1]]) !==
                            table[cp]){
                        return ok
                    }
                }
                return false
            }
            break
        case 'B':
            this.test_func = function(string, pos){
                var table = is_word
                if(this.is_bytes || (this.flags.value & ASCII.value)){
                    table = is_ascii_word
                }

                var cp = string.codepoints[pos],
                    len = string.codepoints.length,
                    ok = {nb_min: 0, nb_max: 0}
                // test is true if char at pos is not at the beginning or
                // start of a word
                if(pos == 0 && table[cp]){
                    return false
                }
                if(pos == len && table[string.codepoints[pos - 1]]){
                    return false
                }
                if(pos > 0 && pos < len){
                    if((table[string.codepoints[pos - 1]]) !==
                            table[cp]){
                        return false
                    }
                }
                return ok
            }
            break
        case 'w':
            this.test_func = function(string, pos){
                var table = is_word
                if(this.is_bytes || (this.flags.value & ASCII.value)){
                    table = is_ascii_word
                }
                return table[string.codepoints[pos]]
            }
            break
        case 'W':
            this.test_func = function(string, pos){
                var table = is_word
                if(this.is_bytes || (this.flags.value & ASCII.value)){
                    table = is_ascii_word
                }
                return ! table[string.codepoints[pos]]
            }
            break
        case 'Z':
            this.test_func = function(string, pos){
                if(pos >= string.codepoints.length){
                    return {nb_min: 0, nb_max: 0}
                }
            }
            break
    }
}

CharacterClass.prototype.fixed_length = function(){
    return this.repeat ? false : 1
}

CharacterClass.prototype.match = function(string, pos){
    // Returns {pos1, pos2} such that "this" matches all the substrings
    // string[pos:i] with pos1 <= i < pos2, or false if no match
    this.repeat = this.repeat || {min: 1, max: 1}
    var len = string.codepoints.length,
        i = 0

    // browse string codepoints until they don't match, or the number of
    // matches is above the maximum allowed
    while(pos + i <= len &&
            i < this.repeat.max &&
            this.test_func(string, pos + i, this.flags)){
        i++
    }
    var nb = i
    if(nb >= this.repeat.min){
        // Number of repeats ok
        if('bBAZ'.indexOf(this.value) > -1 ){
            return {nb_min: 0, nb_max: 0}
        }
        return {
            nb_min: this.repeat.min,
            nb_max: nb
        }
    }else{
        return false
    }
}

CharacterClass.prototype.nb_repeats = Char.prototype.nb_repeats

CharacterClass.prototype.toString = function(){
    return '\\' + this.value
}

var CharacterSet = function(pos, set, groups){
    // character set
    this.pos = pos
    this.set = set
    this.neg = set.neg
}

CharacterSet.prototype.fixed_length = function(){
    return 1
}

CharacterSet.prototype.match = function(string, pos){
    var ignore_case = this.flags && (this.flags.value & IGNORECASE.value),
        test,
        match = false,
        len = string.codepoints.length,
        i = 0,
        cp

    this.repeat = this.repeat || {min: 1, max: 1}

    while(i < this.repeat.max && pos + i < len){
        test = false
        cp = string.codepoints[pos + i]

        if(pos >= len){
            cp = EmptyString
        }
        try{
            $B.codepoint2jsstring(cp)
        }catch(err){
            console.log(err.message)
            throw _b_.Exception.$factory('mauvais codepoint')
        }
        var char = $B.codepoint2jsstring(cp),
            cps = cased_cps(cp, ignore_case, this.flags.value & ASCII.value),
            char_is_cased = cps.length > 1

        for(var cp1 of cps){
            for(var item of this.set.items){
                if(Array.isArray(item.ord)){
                    if(cp1 >= item.ord[0] &&
                            cp1 <= item.ord[1]){
                        test = true
                        break
                    }else if(ignore_case && char_is_cased){
                        var start1 = chr(item.ord[0]).toUpperCase(),
                            end1 = chr(item.ord[1]).toUpperCase(),
                            char1 = char.toUpperCase()
                        if(char1 >= start1 && char1 <= end1){
                            test = true
                        }
                        var start1 = chr(item.ord[0]).toLowerCase(),
                            end1 = chr(item.ord[1]).toLowerCase(),
                            char1 = char.toLowerCase()
                        if(char1 >= start1 && char1 <= end1){
                            test = true
                        }
                    }
                }else if(item instanceof CharacterClass){
                    test = !! item.match(string, pos + i) // boolean
                }else{
                    if(item.ord == cp1){
                        test = true
                        break
                    }
                    if(ignore_case && char_is_cased &&
                            (char.toUpperCase() == chr(item.ord).toUpperCase() ||
                            char.toLowerCase() == chr(item.ord).toLowerCase())){
                        test = true
                        break
                    }
                }
            }
        }
        if(this.neg){
            test = ! test
        }
        if(test){
            i++
        }else{
            break
        }
    }
    var nb = i
    if(nb >= this.repeat.min){
        // Number of repeats ok
        return {
            nb_min: this.repeat.min,
            nb_max: nb
        }
    }else{
        return false
    }

}

CharacterSet.prototype.nb_repeats = Char.prototype.nb_repeats

CharacterSet.prototype.toString = function(){
    return 'CharSet'
}

var ConditionalBackref = function(pos, group_ref){
    this.type = "conditional backref"
    this.pos = pos
    this.group_ref = group_ref
    this.chars = []
    this.match_codepoints = []
    this.nb_success = 0
    this.re_if_exists = new Group(pos)
    this.re_if_not_exists = new Group(pos)
    this.nb_options = 1
}

ConditionalBackref.prototype.add = function(item){
    if(this.nb_options == 1){
        this.re_if_exists.add(item)
    }else if(this.nb_options == 2){
        this.re_if_not_exists.add(item)
    }
    item.parent = this
}

ConditionalBackref.prototype.fixed_length = function(){
    var len = this.re_if_exists.fixed_length()
    if(len !== false && len == this.re_if_not_exists.fixed_length()){
        return len
    }
    return false
}

ConditionalBackref.prototype.match = function(string, pos, groups){
    var re = groups[this.group_ref] ? this.re_if_exists :
            this.re_if_not_exists,
        pattern = {node: re, text: re + ''},
        mo = match(pattern, string, pos, undefined,
            false, groups)
    if(mo){
        return {nb_min: mo.end - mo.start, nb_max: mo.end - mo.start}
    }
    return false
}

ConditionalBackref.prototype.toString = function(){
    return 'ConditionalBackref'
}

var Group = function(pos, extension){
    this.type = "group"
    this.pos = pos
    this.items = []
    this.chars = []
    this.groups = []
    for(key in extension){
        this[key] = extension[key]
    }
    if(extension && extension.type){
        if(extension.type.indexOf('lookahead') > -1){
            this.is_lookahead = true
        }else if(extension.type.indexOf('lookbehind') > -1){
            this.is_lookbehind = true
        }
    }
}

Group.prototype.add = Node.prototype.add

Group.prototype.toString = function(){
    var res = 'Group #' + this.num + ' ' + this.pattern
    if(this.repeat !== undefined){
        res += ' repeat {' + this.repeat.min + ',' + this.repeat.max + '}'
        if(this.non_greedy){
            res += '?'
        }
    }
    return res
}

BackReference.prototype.nb_repeats = Group.prototype.nb_repeats

Group.prototype.fixed_length = Node.prototype.fixed_length

function GroupRef(group_num, item){
    this.num = group_num
    this.item = item
}

GroupRef.prototype.fixed_length = function(){
    return this.item.fixed_length()
}

function Lookbehind(item){
    this.re = item
    this.neg = this.re.type == "negative_lookbehind"
}

Lookbehind.prototype.match = function(string, pos, groups){
    var ok = {nb_min: 0, nb_max: 0},
        pattern = {node: this.re, text: this.re + ''},
        length = this.re.length,
        mo
    if(pos - length < 0){
        mo = false
    }else{
        mo = match(pattern, string, pos - length, undefined,
            false, groups)
    }
    if(mo){
        return this.neg ? false : ok
    }else{
        return this.neg ? ok : false
    }
}

Lookbehind.prototype.fixed_length = function(){
    return this.re.fixed_length()
}

Lookbehind.prototype.toString = function(){
    return "Lookbehind"
}

function SetFlags(pos, flags){
    this.pos = pos
    this.on_flags = flags.on_flags
    this.off_flags = flags.off_flags
    this.items = []
}

SetFlags.prototype.add = Node.prototype.add

function StringStart(pos){
    this.pos = pos
}

StringStart.prototype.match = function(string, pos){
    var ok = {nb_min:0, nb_max: 0}
    if(this.flags.value & MULTILINE.value){
        return (pos == 0 || string.codepoints[pos - 1] == 10) ? ok : false
    }
    return pos == 0 ? ok : false
}

StringStart.prototype.fixed_length = function(){
    return 0
}

StringStart.prototype.toString = function(){
    return '^'
}

function StringEnd(pos){
    this.pos = pos
}

StringEnd.prototype.match = function(string, pos){
    var ok = {nb_min:0, nb_max: 0}
    if(this.flags.value & MULTILINE.value){
        return (pos > string.codepoints.length - 1 ||
            string.codepoints[pos] == 10) ? ok : false
    }
    return pos > string.codepoints.length - 1 ? ok :
           (pos == string.codepoints.length - 1 &&
               string.codepoints[pos] == 10) ? ok : false
}

StringEnd.prototype.fixed_length = function(){
    return 0
}

StringEnd.prototype.toString = function(){
    return '$<end>'
}

function validate(name, pos){
    // name is a StringObj
    sname = name.string
    name = name.codepoints
    if(name.length == 0){
        fail("missing group name", pos)
    }else if(chr(name[0]).match(/\d/) || name.indexOf(ord('.')) > - 1){
        fail(`bad character in group name '${sname}'`, pos)
    }

    var $B = window.__BRYTHON__,
        cp = name[0]
    if($B.unicode_tables.XID_Start[cp]){
        var pos = 1
        while(pos < name.length){
            cp = name[pos]
            if($B.unicode_tables.XID_Continue[cp]){
                pos++
            }else{
                break
            }
        }
        if(pos != name.length){
            console.log("bad character", pos, name)
            fail(`bad character in group name '${sname}'`, pos)
        }
    }else{
        fail(`bad character in group name '${sname}'`, pos)
    }
}

function chr(i){
    if(i < 0 || i > 1114111){
        throw _b_.ValueError.$factory('Outside valid range')
    }else if(i >= 0x10000 && i <= 0x10FFFF){
        var code = (i - 0x10000)
        return String.fromCodePoint(0xD800 | (code >> 10)) +
            String.fromCodePoint(0xDC00 | (code & 0x3FF))
    }else{
        return String.fromCodePoint(i)
    }
}

var character_classes = {
    in_charset: to_codepoint_list('bdDsSwW'),
    in_re: to_codepoint_list('AbBdDsSwWZ')
}

function escaped_char(args){
    var cps = args.codepoints,
        pos = args.pos,
        in_charset = args.in_charset,
        is_bytes = args.is_bytes // if pattern is bytes
    var special = cps[pos + 1]
    if(special === undefined){
        fail('bad escape (end of pattern)', pos)
    }
    var key = in_charset ? 'in_charset' : 'in_re'
    if(character_classes[key].indexOf(special) > -1){
        return new CharacterClass(pos, special, 2)
    }else if(special == ord('N') && ! is_bytes){
        if(cps[pos + 2] != ord('{')){
            fail('missing {', pos)
        }
        var i = pos + 3,
            description = []
        while(i < cps.length){
            if(cps[i] == ord('}')){
                break
            }
            description.push(cps[i])
            i++
        }
        if(description.length == 0){
            fail("missing character name", pos)
        }
        if(i == cps.length){
            fail("missing }, unterminated name", pos)
        }
        var cp = validate_named_char(from_codepoint_list(description), pos)
        return {
            type: 'N',
            ord: cp,
            char: chr(cp),
            length: i - pos + 1
        }
    }else if(special == ord('x')){
        // \xhh = character with hex value hh
        var rest = from_codepoint_list(cps.slice(pos + 2)),
            mo = /^[0-9a-fA-F]{0,2}/.exec(rest),
            hh = mo ? mo[0] : ''
        if(mo && mo[0].length == 2){
            var cp = eval("0x" + mo[0])
            return {
                type: 'x',
                ord: cp,
                char: chr(cp),
                length: 2 + mo[0].length
            }
        }
        fail('incomplete escape \\x' + hh, pos)
    }else if(special == ord('u')){
        // \uxxxx = character with 16-bit hex value xxxx
        var rest = from_codepoint_list(cps.slice(pos + 2)),
            mo = /^[0-9a-fA-F]{0,4}/.exec(rest),
            xx = mo ? mo[0] : ''
        if(mo && mo[0].length == 4){
            var cp = eval("0x" + mo[0])
            return {
                type: 'u',
                ord: cp,
                char: chr(cp),
                length: 2 + mo[0].length
            }
        }
        fail('incomplete escape \\u' + xx, pos)
    }else if(special == ord('U')){
        // \Uxxxxxxxx = character with 32-bit hex value xxxxxxxx
        var rest = from_codepoint_list(cps.slice(pos + 2)),
            mo = /^[0-9a-fA-F]{0,8}/.exec(rest),
            xx = mo ? mo[0] : ''
        if(mo && mo[0].length == 8){
            var cp = eval("0x" + mo[0])
            if(cp > 0x10FFFF){
                fail(`bad escape \\U${mo[0]}`, pos)
            }
            return {
                type: 'U',
                ord: cp,
                char: chr(cp),
                length: 2 + mo[0].length
            }
        }
        fail('incomplete escape \\U' + xx, pos)
    }else{
        // octal ?
        // If the first digit of number is 0, or number is 3 octal digits
        // long, it will not be interpreted as a group match, but as the
        // character with octal value number
        var rest = from_codepoint_list(cps.slice(pos + 1)),
            mo = /^[0-7]{3}/.exec(rest)
        if(mo == null){
            mo = /^0[0-7]*/.exec(rest)
        }
        if(mo){
            var octal_value = eval('0o' + mo[0])
            if(octal_value > 0o377){
                fail(`octal escape value \\` +
                    `${mo[0]} outside of range 0-0o377`, pos)
            }
            return {
                type: 'o',
                ord: octal_value,
                char: chr(octal_value),
                length: 1 + mo[0].length
            }
        }
        var mo = /^\d+/.exec(rest)
        if(mo){
            return {
                type: 'backref',
                value: parseInt(mo[0]),
                length: 1 + mo[0].length
            }
        }
        var trans = {f: '\f', n: '\n', r: '\r', t: '\t', v: '\v'},
            res = trans[chr(special)]
        if(res){
            return ord(res)
        }
        if(chr(special).match(/[a-zA-Z]/)){
            fail("bad escape \\" + chr(special), pos)
        }else{
            return special
        }
    }
}

function check_character_range(t, positions){
    // Check if last 2 items in t are a valid character range
    var start = t[t.length - 2],
        end = t[t.length - 1]
    if(start instanceof CharacterClass || end instanceof CharacterClass){
        fail(`bad character range ${start}-${end}`,
            positions[positions.length - 2])
    }else if(end < start){
        fail(`bad character range ${start}-${end}`,
            positions[positions.length - 2])
    }
    t.splice(t.length - 2, 2, {
        type: 'character_range',
        start: start,
        end: end,
        ord: [start.ord, end.ord]
    })
}

function parse_character_set(text, pos, is_bytes){
    // Parse character set starting at position "pos" in "text"
    // pos is the position of the leading "["
    var start = pos,
        result = {items: []},
        positions = []
    pos++
    if(text[pos] == ord('^')){
        result.neg = true
        pos++
    }else if(text[pos] == ord(']')){
        // a leading ] is the character "]", not the set end
        result.items.push(']')
        positions.push(pos)
        pos++
    }else if(text[pos] == ord('[')){
        // send FutureWarning
        warn(_b_.FutureWarning, "Possible nested set", pos, text)
    }
    var range = false
    while(pos < text.length){
        var cp = text[pos],
            char = chr(cp)
        if(char == ']'){
            if(pos == start + 2 && result.neg){
                // in "[^]]", the first ] is the character "]"
                result.items.push(']')
            }else{
                return [result, pos]
            }
        }
        if(char == '\\'){
            var escape = escaped_char({
                    codepoints: text,
                    pos,
                    in_charset: true,
                    is_bytes
                })
            if(typeof escape == "number"){
                var s = chr(escape)
                escape = {
                    ord: escape,
                    length: 2,
                    toString: function(){
                        return s
                    }
                }
            }
            if(escape.type == "num"){
                // [\9] is invalid
                fail("bad escape 1 \\" +
                    escape.value.toString()[0], pos)
            }
            result.items.push(escape)
            positions.push(pos)
            if(range){
                check_character_range(result.items, positions)
            }
            range = false
            pos += escape.length
        }else if(char == '-'){
            // Character range, or character "-"
            if(pos == start + 1 ||
                    (result.neg && pos == start + 2) ||
                    pos == text.length - 1 ||
                    range ||
                    (result.items.length > 0 &&
                    result.items[result.items.length - 1].type ==
                        "character_range")){
                result.items.push({
                    ord: cp,
                    char,
                    toString: function(){
                        return this.char
                    }
                })
                if(text[pos + 1] == cp){
                    warn(_b_.FutureWarning, "Possible set difference", pos, text)
                }
                pos++
                if(range){
                    check_character_range(result.items, positions)
                }
                range = false
            }else{
                range = true
                if(text[pos + 1] == cp){
                    warn(_b_.FutureWarning, "Possible set difference", pos, text)
                }
                pos++
            }
        }else{
            positions.push(pos)
            result.items.push({
                ord: cp,
                char,
                toString: function(){
                    return this.char
                }
            })
            if(range){
                check_character_range(result.items, positions)
            }
            range = false
            // FutureWarning for consecutive "&", "|" or "~"
            if(char == "&" && text[pos + 1] == cp){
                warn(_b_.FutureWarning, "Possible set intersection", pos, text)
            }else if(char == "|" && text[pos + 1] == cp){
                warn(_b_.FutureWarning, "Possible set union", pos, text)
            }else if(char == "~" && text[pos + 1] == cp){
                warn(_b_.FutureWarning, "Possible set symmetric difference",
                    pos, text)
            }
            pos++
        }
    }
    fail("unterminated character set", start)
}

function open_unicode_db(){
    if($B.unicodedb === undefined){
        var xhr = new XMLHttpRequest
        xhr.open("GET",
            $B.brython_path + "unicode.txt?" + (new Date()).getTime(), false)
        xhr.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    $B.unicodedb = this.responseText
                }else{
                    console.log(
                        "Warning - could not load unicode.txt")
                }
            }
        }
        xhr.send()
    }
}

function validate_named_char(description, pos){
    // validate that \N{<description>} is in the Unicode db
    // Load unicode table if not already loaded
    if(description.length == 0){
        fail("missing character name", pos)
    }
    open_unicode_db()
    if($B.unicodedb !== undefined){
        var re = new RegExp("^([0-9A-F]+);" +
            description.toUpperCase() + ";.*$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            fail(`undefined character name '${description}'`, pos)
        }
        return eval("0x" + search[1])
    }else{
        fail("could not load unicode.txt", pos)
    }
}

var cache = new Map()

function compile(pattern, flags){
    // data has attributes "pattern" (instance of StringObj)
    // and "type" ("str" or "bytes")
    if(pattern.__class__ === BPattern){
        if(flags !== no_flag){
            throw _b_.ValueError.$factory("no flags")
        }
        return pattern
    }
    if(cache.has(pattern.py_obj)){
        if(cache.get(pattern.py_obj).has(flags.value || 0)){
            return cache.get(pattern.py_obj).get(flags.value || 0)
        }
    }
    var original_pattern = pattern,
        original_flags = flags,
        type = pattern.type,
        choices
    pattern = pattern.codepoints
    var is_bytes = type !== "str"
    if(is_bytes && flags && (flags.value & U.value)){
        throw _b_.ValueError.$factory("cannot use UNICODE flag with " +
            "a bytes pattern")
    }
    if(flags && (flags.value & U.value) &&
            (flags.value & ASCII.value)){
        throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
            "are incompatible")
    }
    if(is_bytes){
        // bytes patterns ignore re.ASCII flag
        flags = Flag.$factory(flags.value || 0)
        //flags.value &= ~ASCII.value
    }
    var group_num = 0,
        group_stack = [],
        groups = {},
        pos,
        lookbehind,
        node = new Node(),
        accept_inline_flag = true,
        verbose = (flags.value || 0) & VERBOSE.value
    node.$groups = groups
    for(var item of tokenize(pattern, type, verbose)){
        item.flags = flags
        item.is_bytes = is_bytes
        if(lookbehind){
            item.lookbehind = lookbehind
            lookbehind.parent = item
            lookbehind = false
        }
        if(item instanceof Group){
            group_stack.push(item)
            node.add(item)
            item.state = "open"
            group_num++
            item.num = group_num
            node = item // next items will be stored as group's items
            pos = item.pos
            if(item.non_capturing){
                delete item.num
                group_num--
            }else if(item.type == "name_def"){
                var value = item.value
                validate(value, pos)
                if(groups[value.string] !== undefined){
                    fail(`redefinition of group name` +
                        ` '${value.string}' as group ${group_num}; was group` +
                        ` ${groups[value.string].num}`, pos)
                }
                item.name = value.string
                groups[value.string] = groups[group_num] =
                    new GroupRef(group_num, item)
            }else if(item.is_lookahead){
                // a lookahead assertion is relative to the previous regexp
                group_num--
                while(node.items.length > 0){
                    item.add(node.items.shift())
                }
                node = item
            }else if(item.is_lookbehind){
                // a lookbehind assertion is relative to the next regexp
                node.parent.items.pop() // remove from node items
                // temporarily create a group
                groups[group_num] = new GroupRef(group_num, item)
            }else if(item.type == "flags"){
                // save flags before a group with inline flags, eg "(?i:a)"
                item.flags_before = Flag.$factory(flags.value | 0)
            }else{
                groups[group_num] = new GroupRef(group_num, item)
            }
        }else if(item instanceof GroupEnd){
            end_pos = item.pos
            if(group_stack.length == 0){
                fail("unbalanced parenthesis", end_pos, original_pattern)
            }
            var item = group_stack.pop()
            item.end_pos = end_pos
            try{
                item.pattern = from_codepoint_list(
                    pattern.slice(item.pos, end_pos + 1))
            }catch(err){
                console.log("err avec pattern substring", pattern)
                throw err
            }
            if(item.is_lookbehind){
                delete groups[group_num]
                group_num--
                // check that all elements have a fixed length
                item.length = item.fixed_length()
                if(item.length === false){
                    fail("look-behind requires fixed-width pattern", pos)
                }
                item.parent.add(new Lookbehind(item))
                item.non_capturing = true
                // store in variable "lookbehind", will be applied to next item
                lookbehind = item
            }else if(item.is_lookahead){
                delete item.num
            }
            if(item instanceof Group && item.items.length == 0){
                item.add(new Char(pos, EmptyString, group_stack.concat([item])))
            }else if(item instanceof ConditionalBackref){
                if(item.re_if_exists.items.length == 0){
                    item.re_if_exists.add(EmptyString)
                }else if(item.re_if_not_exists.items.length == 0){
                    item.re_if_not_exists.pos = pos
                    item.re_if_not_exists.add(EmptyString)
                }
            }else if(item.type == "flags"){
                // restore flags when entering the group
                flags = Flag.$factory(item.flags_before.value)
            }
            item.state = 'closed'
            node = item.parent
        }else if(item instanceof ConditionalBackref){
            var pos = item.pos,
                group_ref = item.group_ref
            if(typeof group_ref == "number"){
                if(group_ref == 0){
                    fail(`bad group number`, pos + 3)
                }else if(group_ref >= MAXGROUPS){
                    fail(`invalid group reference ${group_ref}`, pos + 1)
                }else if(groups[group_ref] &&
                        groups[group_ref].item.state == "open"){
                    fail("cannot refer to an open group", pos)
                }
            }else if(groups[group_ref] !== undefined){
                if(groups[group_ref].item.state == "open"){
                    fail("cannot refer to an open group", pos)
                }
            }else{
                fail(`unknown group name '${group_ref}'`, pos)
            }
            group_stack.push(item)
            node.add(item)
            item.state = "open"
            node = item // next items will be stored as group's items
        }else if(item instanceof BackReference){
            pos = item.pos
            if(item.type == "num" && item.value > 99){
                var head = item.value.toString().substr(0, 2)
                fail(`invalid group reference ${head}`, pos + 1)
            }
            if(groups[item.value] !== undefined){
                if(groups[item.value].item.state == "open"){
                    fail("cannot refer to an open group", pos)
                }
                var ref_item = groups[item.value].item.parent
                while(ref_item){
                    if(ref_item.is_lookbehind){
                        fail("cannot refer to group defined in the same lookbehind subpattern", pos)
                    }
                    ref_item = ref_item.parent
                }
            }else if(item.type == "name"){
                fail(`unknown group name '${item.value}'`, pos)
            }else if(item.type == "num"){
                fail(`invalid group reference ${item.value}`, pos)
            }
            node.add(item)
        }else if(item instanceof Char ||
                item instanceof CharacterClass ||
                item instanceof CharacterSet){
            if(item instanceof CharacterSet){
                for(var elt of item.set.items){
                    elt.flags = flags
                }
            }
            var added_to_charseq = false
            if(item instanceof Char){
                if(node.items && node.items.length > 0){
                    var previous = $last(node.items)
                    if(previous instanceof CharSeq){
                        previous.chars.push(item)
                        added_to_charseq = true
                    }else if(previous instanceof Char && ! previous.repeater){
                        node.items.pop()
                        node.items.push(new CharSeq([previous, item]))
                        added_to_charseq = true
                    }
                }
            }
            if(! added_to_charseq){
                node.add(item)
            }
        }else if(item instanceof Repeater){
            // check that item is not in a lookbehind group
            var pnode = node
            while(pnode){
                if(pnode.extension && pnode.extension.type &&
                        pnode.extension.type.indexOf("lookbehind") > -1){
                    fail("look-behind requires fixed-width pattern", pos)
                }
                pnode = pnode.parent
            }
            pos = item.pos
            if(node.items.length == 0){
                fail("nothing to repeat", pos)
            }
            previous = $last(node.items)
            if(previous instanceof Char ||
                    previous instanceof CharSeq ||
                    previous instanceof CharacterClass ||
                    previous instanceof CharacterSet ||
                    previous instanceof Group ||
                    previous instanceof BackReference){
                if(previous instanceof GroupEnd){
                    // associate repeat with Group
                    previous = previous.group
                }else if(previous instanceof CharSeq){
                    previous = $last(previous.chars)
                }
                if(previous.repeater){
                    if(item.op == '?' && ! previous.non_greedy){
                        previous.non_greedy = true
                        if(previous instanceof CharacterClass &&
                                previous.value == '.'){
                            previous.min_repeat_one = true
                        }
                    }else{
                        fail("multiple repeat", pos)
                    }
                }else{
                    // convert to minimum and maximum number of repeats
                    var min = 1,
                        max = 1
                    if(Array.isArray(item.op)){
                        min = item.op[0]
                        if(min >= MAXREPEAT){
                            throw _b_.OverflowError.$factory(
                                "the repetition number is too large")
                        }
                        max = item.op[1] === undefined ? min : item.op[1]
                        if(isFinite(max) && max >= MAXREPEAT){
                            throw _b_.OverflowError.$factory(
                                "the repetition number is too large")
                        }
                        if(max < min){
                            fail('min repeat greater than max repeat', pos)
                        }
                    }else if(item.op == "?"){
                        min = 0
                        max = 1
                    }else if(item.op == "*"){
                        min = 0
                        max = Number.POSITIVE_INFINITY
                    }else if(item.op == "+"){
                        min = 1
                        max = Number.POSITIVE_INFINITY
                    }
                    previous.repeater = item
                    previous.repeat = {min, max}
                    // mark all parents of item as no fixed length
                    var parent = item
                    while(parent){
                        parent.fixed_length = false
                        parent = parent.parent
                    }
                }
            }else{
                fail("nothing to repeat", pos)
            }
        }else if(item instanceof Or){
            if(group_stack.length > 0){
                item.group = group_stack[group_stack.length - 1]
            }else{
                item.group = false
            }
            pos = item.pos
            if(node instanceof ConditionalBackref){
                // case '(?(num)a|'
                if(node.nb_options == 1){
                    node.nb_options++
                }else{
                    fail('conditional backref with more than ' +
                       'two branches', pos)
                }
            }else if(node.items.length == 0){
                // token "|" in  "(|...)" : first option is the empty string
                var choice = new Choice(),
                    case1 = new Case()
                case1.add(new Char(pos, EmptyString))
                choice.add(case1)
                node.add(choice)
                var case2 = new Case()
                choice.add(case2)
                node = case2
            }else if(node instanceof Case){
                // node.parent is already a Choice
                var new_case = new Case()
                node.parent.add(new_case)
                node = new_case
            }else{
                // token "|" in "(ab|...)"
                var previous = node.items[node.items.length - 1]
                if(previous instanceof Case){
                    var new_case = new Case()
                    previous.add(new_case)
                    node = new_case
                }else{
                    var choice = new Choice(),
                        case1 = new Case(),
                        first_rank = node.items[0].rank
                    while(node.items.length > 0){
                        case1.add(node.items.shift())
                    }
                    case1.groups = node.$groups
                    for(var group of group_stack){
                        choice.groups.push(group)
                    }
                    choice.add(case1)
                    node.add(choice)
                    var case2 = new Case()
                    choice.add(case2)
                    node = case2
                }
            }
        }else if(item instanceof StringStart ||
                 item instanceof StringEnd){
            node.add(item)
        }else if(item instanceof SetFlags){
            // copy flags, otherwise re.ASCII etc might be modified
            flags = Flag.$factory(flags.value || U.value)
            if(item.on_flags.indexOf('u') > -1){
                if(is_bytes){
                    fail("re.error: bad inline flags: cannot use 'u' flag " +
                        "with a bytes pattern", pos)
                }
                if(flags && flags.value & ASCII.value){
                    // switch to Unicode
                    flags.value ^= ASCII.value
                }
                if(group_stack.length == 0 &&
                        original_flags && original_flags.value & ASCII.value){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
                if(item.on_flags.indexOf('a') > -1){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
            }else if(item.on_flags.indexOf('a') > -1){
                if(group_stack.length == 0 &&
                        original_flags && original_flags.value & U.value){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
                if(flags && flags.value & U.value){
                    // switch to ASCII
                    flags.value ^= U.value
                }
                if(item.on_flags.indexOf('u') > -1){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
            }
            if(flags.value === undefined){
                flags.value = 32
            }
            if(item.items.length == 0){
                if(! accept_inline_flag && group_stack.length == 0){
                    var s = from_codepoint_list(pattern)
                    warn(_b_.DeprecationWarning,
                        `Flags not at the start of the expression '${s}'`,
                        pos)
                }
                for(var on_flag of item.on_flags){
                    if(! is_bytes || on_flag !== 'a'){
                        flags.value |= inline_flags[on_flag].value
                    }
                }
                for(var off_flag of item.off_flags){
                    if(! is_bytes || off_flag !== 'a'){
                        flags.value ^= inline_flags[off_flag].value
                    }
                }
            }else{
                node.add(item)
            }
        }else{
            fail("unknown item type " + item, pos)
        }
        if(! (item instanceof SetFlags) &&
                ! (item instanceof Group && item.type == "flags")){
            accept_inline_flag = false
        }
    }
    if(group_stack.length > 0){
        var last = group_stack[group_stack.length - 1]
        fail("missing ), unterminated subpattern", last.pos)
    }
    while(node.parent){
        node = node.parent
    }
    node.pattern = from_codepoint_list(pattern)
    node.groups = group_num
    flags = flags === no_flag ? 32 : flags
    node.flags = flags
    var res = {
        node,
        groups,
        flags,
        original_flags,
        text: from_codepoint_list(pattern),
        type, // "str" or "bytes"
        fixed_length: node.fixed_length()
    }
    if(! cache.has(original_pattern.py_obj)){
        cache.set(original_pattern.py_obj, new Map())
    }
    cache.get(original_pattern.py_obj).set(original_flags.value || 0, res)
    show(node)
    return res
}

function show(node, indent){
    indent = indent === undefined ? 0 : indent
    if(indent == 0){
        log('root', node)
    }
    log(' '.repeat(indent) + node)
    if(node.items !== undefined){
        for(var item of node.items){
            show(item, indent + 1)
        }
    }
}

function ord(char){
    return char.charCodeAt(0)
}

function* tokenize(pattern, type, _verbose){
    // pattern is a list of codepoints
    var is_bytes = type == "bytes"
    // verbose_stack is the stack of verbose state for each group in the regex
    var verbose_stack = [_verbose],
        verbose = _verbose
    var pos = 0
    while(pos < pattern.length){
        var cp = pattern[pos],
            char = String.fromCharCode(cp)
        if(verbose){
            // current group is in verbose mode
            if(char == "#"){
                // skip until next line feed
                while(pos < pattern.length && pattern[pos] != 10){
                    pos++
                }
                pos++
                continue
            }else{
                while(pos < pattern.length &&
                        [9, 10, 11, 12, 13, 32].indexOf(pattern[pos]) > -1){
                    pos++
                }
            }
            cp = pattern[pos]
            if(cp === undefined){
                break
            }
            char = String.fromCharCode(cp)
            if(char == '#'){
                continue
            }
        }
        if(char == '('){
            if(pattern[pos + 1] == ord('?')){
                if(pattern[pos + 2] == ord('P')){
                    if(pattern[pos + 3] == ord('<')){
                        var name = [],
                            i = pos + 4
                        while(i < pattern.length){
                            if(pattern[i] == ord('>')){
                                break
                            }else if(pattern[i] == ord(')')){
                                fail("missing >, unterminated name", pos)
                            }
                            name.push(pattern[i])
                            i++
                        }
                        name = StringObj.from_codepoints(name)
                        validate(name, pos)
                        if(i == pattern.length){
                            fail("missing >, unterminated name", pos)
                        }
                        yield new Group(pos, {type: 'name_def', value: name})
                        verbose_stack.push(verbose)
                        pos = i + 1
                        continue
                    }else if(pattern[pos + 3] == ord('=')){
                        var name = [],
                            i = pos + 4
                        while(i < pattern.length){
                            if(pattern[i] == ord(')')){
                                break
                            }
                            name.push(pattern[i])
                            i++
                        }
                        name = StringObj.from_codepoints(name)
                        validate(name, pos)
                        if(i == pattern.length){
                            fail("missing ), unterminated name", pos)
                        }
                        yield new BackReference(pos, 'name', name.string)
                        pos = i + 1
                        continue
                    }else if(pattern[pos + 3] === undefined){
                        fail("unexpected end of pattern", pos)
                    }else{
                        fail("unknown extension ?P" + chr(pattern[pos + 3]), pos)
                    }
                }else if(pattern[pos + 2] == ord('(')){
                    var ref = [],
                        i = pos + 3
                    while(i < pattern.length){
                        if(pattern[i] == ord(')')){
                            break
                        }
                        ref.push(pattern[i])
                        i++
                    }
                    var sref = StringObj.from_codepoints(ref)
                    if(sref.string.match(/^\d+$/)){
                        ref = parseInt(sref.string)
                    }else{
                        validate(sref, pos)
                        ref = sref.string
                    }
                    if(i == pattern.length){
                        fail("missing ), unterminated name", pos)
                    }
                    yield new ConditionalBackref(pos, ref)
                    pos = i + 1
                    continue
                }else if(pattern[pos + 2] == ord('=')){
                    // (?=...) : lookahead assertion
                    yield new Group(pos, {type: 'lookahead_assertion'})
                    verbose_stack.push(verbose)
                    pos += 3
                    continue
                }else if(pattern[pos + 2] == ord('!')){
                    // (?!...) : negative lookahead assertion
                    yield new Group(pos, {type: 'negative_lookahead_assertion'})
                    verbose_stack.push(verbose)
                    pos += 3
                    continue
                }else if(from_codepoint_list(pattern.slice(pos + 2, pos + 4)) == '<!'){
                    // (?<!...) : negative lookbehind
                    yield new Group(pos, {type: 'negative_lookbehind'})
                    verbose_stack.push(verbose)
                    pos += 4
                    continue
                }else if(from_codepoint_list(pattern.slice(pos + 2, pos + 4)) == '<='){
                    // (?<=...) : positive lookbehind
                    yield new Group(pos, {type: 'positive_lookbehind'})
                    verbose_stack.push(verbose)
                    pos += 4
                    continue
                }else if(pattern[pos + 2] == ord('<')){
                    pos += 3
                    if(pos == pattern.length){
                        fail("unexpected end of pattern", pos)
                    }
                    fail("unknown extension ?<" + _b_.chr(pattern[pos]), pos)
                }else if(pattern[pos + 2] == ord(':')){
                    yield new Group(pos, {non_capturing: true})
                    verbose_stack.push(verbose)
                    pos += 3
                    continue
                }else if(pattern[pos + 2] === undefined){
                    fail("unexpected end of pattern", pos)
                }

                var flags = to_codepoint_list('aiLmsux'),
                    auL_flags = to_codepoint_list('auL'),
                    flags_start = pos
                if(pattern[pos + 2] == ord('-') ||
                        flags.indexOf(pattern[pos + 2]) > -1){
                    if(pattern[pos + 2] == ord('-')){
                        var on_flags = [],
                            has_off = true,
                            off_flags = []
                        pos += 3
                    }else{
                        var on_flags = [chr(pattern[pos + 2])],
                            has_off = false,
                            off_flags = [],
                            auL = auL_flags.indexOf(pattern[pos + 2]) > -1 ?
                                1 : 0,
                            closed = false
                        pos += 3
                        while(pos < pattern.length){
                            if(flags.indexOf(pattern[pos]) > -1){
                                if(auL_flags.indexOf(pattern[pos]) > -1){
                                    auL++
                                    if(auL > 1){
                                        fail("bad inline flags: flags 'a', 'u'" +
                                            " and 'L' are incompatible", pos)
                                    }
                                }
                                on_flags.push(chr(pattern[pos]))
                                pos++
                            }else if(pattern[pos] == ord('-')){
                                has_off = true
                                closed = true
                                pos++
                                break
                            }else if(String.fromCharCode(pattern[pos]).
                                    match(/[a-zA-Z]/)){
                                fail("unknown flag", pos)
                            }else if(pattern[pos] == ord(')')){
                                closed = true
                                break
                            }else if(pattern[pos] == ord(':')){
                                yield new Group(pos, {name: "Group", type: "flags"})
                                verbose_stack.push(verbose)
                                closed = true
                                break
                            }else{
                                fail("missing -, : or )", pos)
                            }
                        }
                        if(! closed){
                            fail("missing -, : or )", pos)
                        }
                    }
                    if(has_off){
                        while(pos < pattern.length){
                            if(flags.indexOf(pattern[pos]) > -1){
                                if(auL_flags.indexOf(pattern[pos]) > -1){
                                    fail("bad inline flags: cannot turn off " +
                                        "flags 'a', 'u' and 'L'", pos)
                                }
                                if(on_flags.indexOf(chr(pattern[pos])) > -1){
                                    fail("bad inline flags: flag turned on and off", pos)
                                }
                                off_flags.push(chr(pattern[pos]))
                                pos++
                            }else if(pattern[pos] == ord(':')){
                                yield new Group(pos, {name: "Group", type: "flags"})
                                verbose_stack.push(verbose)
                                break
                            }else if(String.fromCharCode(pattern[pos]).
                                    match(/[a-zA-Z]/)){
                                fail("unknown flag", pos)
                            }else if(off_flags.length == 0){
                                fail("missing flag", pos)
                            }else{
                                fail("missing :", pos)
                            }
                        }
                        if(off_flags.length == 0){
                            fail("missing flag", pos)
                        }
                    }
                    if(has_off && pattern[pos] != ord(':')){
                        fail("missing :", pos)
                    }
                    if(on_flags.length == 0 && off_flags.length == 0){
                        fail("missing flag", pos)
                    }
                    var set_flags = new SetFlags(flags_start,
                        {on_flags, off_flags})
                    yield set_flags
                    // reset verbose
                    if(on_flags.indexOf('x') > -1){
                        verbose = true
                    }
                    if(off_flags.indexOf('x') > -1){
                        verbose = false
                    }
                    if(! closed){
                        node = set_flags
                    }
                    pos++
                }else if(pattern[pos + 2] == ord('#')){
                    pos += 3
                    while(pos < pattern.length){
                        if(pattern[pos] == ord(')')){
                            break
                        }
                        pos++
                    }
                    if(pos == pattern.length){
                        fail("missing ), unterminated comment", pos)
                    }
                    pos++
                    continue
                }else{
                    fail("unknown extension ?" + _b_.chr(pattern[pos + 2]),
                        pos)
                }
            }else{
                yield new Group(pos)
                verbose_stack.push(verbose)
                pos++
            }
        }else if(cp == ord(')')){
            yield new GroupEnd(pos)
            verbose_stack.pop()
            verbose = $last(verbose_stack)
            pos++
        }else if(cp == ord('\\')){
            var escape = escaped_char({codepoints: pattern, pos, is_bytes})
            if(escape instanceof CharacterClass){
                yield escape
                pos += escape.length
            }else if(escape.char !== undefined){
                yield new Char(pos, escape.ord)
                pos += escape.length
            }else if(escape.type == "backref"){
                yield new BackReference(pos, "num", escape.value)
                pos += escape.length
            }else if(typeof escape == "number"){
                // eg "\."
                var esc = new Char(pos, escape)
                esc.escaped = true
                yield esc
                pos += 2
            }else{
                yield new Char(pos, escape)
                pos += escape.length
            }
        }else if(cp == ord('[')){
            // Set of characters
            var set,
                end_pos
            [set, end_pos] = parse_character_set(pattern, pos, is_bytes)
            yield new CharacterSet(pos, set)
            pos = end_pos + 1
        }else if('+?*'.indexOf(char) > -1){
            yield new Repeater(pos, char)
            pos++
        }else if(cp == ord('{')){
            var reps = /\{(\d*)((,)(\d*))?\}/.exec(
                    from_codepoint_list(pattern.slice(pos)))
            if(reps && reps[0] != '{}'){
                if(reps[1] == ""){
                    var limits = [0]
                }else{
                    var limits = [parseInt(reps[1])]
                }
                if(reps[4] !== undefined){
                    if(reps[4] == ""){
                        var max = Number.POSITIVE_INFINITY
                    }else{
                        var max = parseInt(reps[4])
                    }
                    limits.push(max)
                }
                yield new Repeater(pos, limits)
                pos += reps[0].length
            }else if(pattern[pos + 1] == ord('}')){
                // {} is the characters "{" and "}"
                yield new Char(pos, ord('{'))
                pos++
            }else{
                yield new Char(pos, ord('{'))
                pos++
            }
        }else if(cp == ord('|')){
            yield new Or(pos)
            pos++
        }else if(cp == ord('.')){
            yield new CharacterClass(pos, cp, 1)
            pos++
        }else if(cp == ord('^')){
            yield new StringStart(pos)
            pos++
        }else if(cp == ord('$')){
            yield new StringEnd(pos)
            pos++
        }else{
            yield new Char(pos, cp)
            pos++
        }
    }
}

function to_codepoint_list(s){
    var items = []
    if(typeof s == "string" || _b_.isinstance(s, _b_.str)){
        if(typeof s != "string"){
            s = s.valueOf()
        }
        for(const char of s){
            items.push(char.codePointAt(0))
        }
        items.type = "unicode"
    }else if(_b_.isinstance(s, bytes_like)){
        if(_b_.isinstance(s, _b_.memoryview)){
            items = s.obj.source
        }else{
            items = s.source
        }
        items.type = "bytes"
    }else{
        throw Error('invalid type ' + $B.class_name(s))
    }
    return items
}

function from_codepoint_list(codepoints, type){
    // Return a string
    if(type == "bytes"){
        return _b_.bytes.$factory(codepoints)
    }
    var s = ''
    for(const cp of codepoints){
        s += _b_.chr(cp)
    }
    return $B.String(s)
}

var bytes_like = [_b_.bytes, _b_.bytearray, _b_.memoryview]

function string2bytes(s){
    var t = []
    for(var i = 0, len = s.length; i < len; i++){
        t.push(s.charCodeAt(i))
    }
    return _b_.bytes.$factory(t)
}

function check_pattern_flags(pattern, flags){
    if(pattern.__class__ === BPattern){
        if(flags !== no_flag){
            throw _b_.ValueError.$factory(
                "cannot process flags argument with a compiled pattern")
        }
    }
    return pattern
}

function transform_repl(data, pattern){
    // data.repl is a StringObj instance
    var repl = data.repl.string
    repl = repl.replace(/\\n/g, '\n')
    repl = repl.replace(/\\r/g, '\r')
    repl = repl.replace(/\\t/g, '\t')
    repl = repl.replace(/\\b/g, '\b')
    repl = repl.replace(/\\v/g, '\v')
    repl = repl.replace(/\\f/g, '\f')
    repl = repl.replace(/\\a/g, '\x07')
    // detect backreferences
    var pos = 0,
        escaped = false,
        br = false,
        repl1 = "",
        has_backref = false
    while(pos < repl.length){
        br = false
        if(repl[pos] == "\\"){
            escaped = ! escaped
            if(escaped){
                pos++
                continue
            }
        }else if(escaped){
            escaped = false
            var mo = /^\d+/.exec(repl.substr(pos))
            if(mo){
                var cps = to_codepoint_list(repl)
                var escape = escaped_char({
                        codepoints: cps,
                        pos: pos - 1,
                        is_bytes: cps.type == "bytes"
                     })
                if(escape.type == "o"){
                    if(escape.ord > 0o377){
                        fail(`octal escape value \\${mo[0]} ` +
                            " outside of range 0-0o377", pos)
                    }
                    repl1 += escape.char
                    pos += escape.length - 1
                    continue
                }else if(escape.type != "backref"){
                    var group_num = mo[0].substr(0,
                        Math.min(2, mo[0].length))
                    fail(`invalid group reference ${group_num}`, pos)
                }else{
                    // only keep first 2 digits
                    var group_num = mo[0].substr(0,
                        Math.min(2, mo[0].length))
                    // check that pattern has the specified group num
                    if(pattern.groups === undefined){
                        console.log("pattern", pattern)
                        throw _b_.AttributeError.$factory("$groups")
                    }
                    if(pattern.groups[group_num] === undefined){
                        fail(`invalid group reference ${group_num}`,
                            pos)
                    }else{
                        mo[0] = group_num
                    }
                }
                if(! has_backref){
                    var parts = [repl.substr(0, pos - 1),
                            parseInt(mo[0])]
                }else{
                    parts.push(repl.substring(next_pos, pos - 1))
                    parts.push(parseInt(mo[0]))
                }
                has_backref = true
                var next_pos = pos + mo[0].length
                br = true
                pos += mo[0].length
            }else if(repl[pos] == "g"){
                pos++
                if(repl[pos] != '<'){
                    fail("missing <", pos)
                }
                pos++
                mo = /(.*?)>/.exec(repl.substr(pos))
                if(mo){
                    if(mo[1] == ""){
                        pos += mo[0].length
                        fail("missing group name", pos - 1)
                    }
                    var group_name = mo[1]
                    if(/^\d+$/.exec(group_name)){
                        if(pattern.groups[group_name] === undefined){
                            fail(`invalid group reference ${group_name}`,
                                pos)
                        }
                    }else{
                        if(! _b_.str.isidentifier(group_name)){
                            var cps = to_codepoint_list(group_name)
                            if($B.unicode_tables.XID_Start[cps[0]] === undefined){
                                fail("bad character in group name '" +
                                    group_name + "'", pos)
                            }else{
                                for(cp of cps.slice(1)){
                                    if($B.unicode_tables.XID_Continue[cp] === undefined){
                                        fail("bad character in group name '" +
                                            group_name + "'", pos)
                                    }
                                }
                            }
                        }
                        if(pattern.groups[group_name] === undefined){
                            throw _b_.IndexError.$factory(
                                `unknown group name '${group_name}'`,
                                pos)
                        }
                    }
                    if(! has_backref){
                        var parts = [repl.substr(0, pos - 3),
                                mo[1]]
                    }else{
                        parts.push(repl.substring(next_pos, pos - 3))
                        parts.push(mo[1])
                    }
                    has_backref = true
                    var next_pos = pos + mo[0].length
                    br = true
                    pos = next_pos
                }else{
                    if(repl.substr(pos).length > 0){
                        fail("missing >, unterminated name", pos)
                    }else{
                        fail("missing group name", pos)
                    }
                }
            }else{
                if(/[a-zA-Z]/.exec(repl[pos])){
                    fail("unknown escape", pos)
                }
                pos += repl[pos]
            }
        }
        if(! br){
            repl1 += repl[pos]
            pos ++
        }
    }
    data.repl1 = repl1
    if(has_backref){
        parts.push(repl.substr(next_pos))
data.repl = function(bmo){
            var mo = bmo.mo,
                res = parts[0],
                groups = mo.$groups,
                s = mo.string,
                group,
                is_bytes = s.type == 'bytes'
            for(var i = 1, len = parts.length; i < len; i += 2){
                if(groups[parts[i]] === undefined){
                    if(mo.node.$groups[parts[i]] !== undefined){
                        // group is defined in the RE, but didn't contribute
                        // to the match
                        // groups[parts[i]] = ''
                    }else{
                        // group is not defined in the RE
                        pos++
                        group_num = parts[i].toString().substr(0, 2)
                        fail(`invalid group reference ${group_num}`, pos)
                    }
                }else{
                    group = groups[parts[i]]
                    var x = s.substring(group.start, group.end)
                    if(is_bytes){
                        x = _b_.bytes.decode(x, 'latin-1')
                    }
                    res += x
                }
                res += parts[i + 1]
            }
            return res
        }
    }else{
        data.repl = new StringObj(repl)
    }
    return data
}

function StringObj(obj){
    // A StringObj object is a bridge between a Python string or bytes-like
    // object and Javascript
    // obj is the Python object
    // this.string is a Javascript string
    this.py_obj = obj
    this.codepoints = []
    this.type = "str"
    if(typeof obj == "string" ||
            (obj instanceof String && ! obj.codepoints)){
        // Python object represented as a Javascript string
        this.string = obj
        // Maps a position in codepoints to position in string
        this.index_map = {}
        for(var i = 0, len = obj.length; i < len; i++){
            this.index_map[this.codepoints.length] = i
            var cp = obj.codePointAt(i)
            this.codepoints.push(cp)
            if(cp >= 0x10000){
                i++
            }
        }
        if(obj instanceof String){
            // store for next use
            obj.codepoints = this.codepoints
            obj.index_map = this.index_map
        }
    }else if(obj instanceof String){
        // string with surrogate pairs
        this.string = obj.string
        this.codepoints = obj.codepoints
        this.index_map = obj.index_map
    }else if(_b_.isinstance(obj, _b_.str)){ // str subclass
        var so = new StringObj(obj.valueOf())
        this.string = so.string
        this.codepoints = so.codepoints
    }else if(_b_.isinstance(obj, [_b_.bytes, _b_.bytearray])){
        this.string = _b_.bytes.decode(obj, 'latin1')
        this.codepoints = obj.source
        this.type = "bytes"
    }else if(_b_.isinstance(obj, _b_.memoryview)){
        this.string = _b_.bytes.decode(obj.obj, 'latin1')
        this.codepoints = obj.obj.source
        this.type = "bytes"
    }else if(obj.__class__ && obj.__class__.$buffer_protocol){
        // eg array.array
        this.codepoints = _b_.list.$factory(obj)
        this.string = from_codepoint_list(this.codepoints, "bytes")
        this.type = "bytes"
    }else if(Array.isArray(obj)){
        // list of codepoints
        this.codepoints = obj
    }else{
        throw _b_.TypeError.$factory(
            'expected string or bytes-like object')
    }
    this.length = this.codepoints.length
}

StringObj.prototype.substring = function(start, end){
    // Returns a string
    var s
    if(this.string && this.index_map){
        if(this.index_map[start] === undefined){
            return ''
        }
        if(end === undefined){
            return this.string.substr(this.index_map[start])
        }
        return this.string.substring(this.index_map[start],
            this.index_map[end])
    }
    var codepoints,
        res = ''
    if(end === undefined){
        codepoints = this.codepoints.slice(start)
    }else{
        codepoints = this.codepoints.slice(start, end)
    }
    return from_codepoint_list(codepoints, this.type)
}

StringObj.prototype.to_str = function(){
    return from_codepoint_list(this.codepoints, this.type)
}

StringObj.from_codepoints = function(cps){
    var res = new StringObj('')
    res.codepoints = cps
    for(var cp of cps){
        res.string += _b_.chr(cp)
    }
    return res
}

function prepare(args){
    // Check that all arguments are of the same type (string of bytes-like)
    // Return an object with all attributes transformed into CodePoints
    // instances
    var res = {},
        keys = Object.keys(args),
        first = keys[0]
    res[first] = new StringObj(args[first])
    res.type = res[first].type
    for(var key of keys.slice(1)){
        res[key] = new StringObj(args[key])
        if(res[key].type != res.type){
            throw _b_.TypeError.$factory(`not the same type for ${first} and ${key}`)
        }
    }
    return res
}

function subn(pattern, repl, string, count, flags){
    // string is a StringObj instance
    // pattern is either a Pattern instance or a StringObj instance
    var res = '',
        pos = 0,
        nb_sub = 0

    if(pattern instanceof StringObj){
        pattern = compile(pattern, flags)
    }
    if(typeof repl != "function"){
        var data1 = transform_repl({repl}, pattern)
        repl1 = data1.repl1
    }
    pos = 0
    for(var bmo of $module.finditer(BPattern.$factory(pattern), string.to_str()).js_gen){
        // finditer yields instances of BMatchObject
        var mo = bmo.mo // instance of MatchObject
        res += from_codepoint_list(string.codepoints.slice(pos, mo.start))
        if(typeof repl == "function"){
            var x = $B.$call(repl)(bmo)
            if(x.__class__ === _b_.bytes){
                x = _b_.bytes.decode(x, 'latin-1')
            }
            res += x // $B.$call(repl)(bmo)
        }else{
            res += repl1
        }
        nb_sub++
        pos = mo.end
        if(pos >= string.length){
            break
        }
        if(count != 0 && nb_sub >= count){
            break
        }
    }
    res += from_codepoint_list(string.codepoints.slice(pos))
    if(pattern.type === "bytes"){
        res = _b_.str.encode(res, "latin-1")
    }
    return [res, nb_sub]
}

// escaped chars : '\t\n\x0b\x0c\r #$&()*+-.?[\\]^{|}~'
var escaped = [9, 10, 11, 12, 13, 32, 35, 36, 38, 40, 41, 42, 43, 45, 46, 63,
               91, 92, 93, 94, 123, 124, 125, 126]

function* iterator(pattern, string, flags, original_string, pos, endpos){
    var result = [],
        pos = pos | 0
    while(pos <= string.length){
        var mo = match(pattern, string, pos, endpos)
        if(mo){
            yield BMO.$factory(mo)
            if(mo.end == mo.start){
                // If match has zero with, retry at the same position but
                // with the flag no_zero_width set, to avoid infinite loops
                mo = match(pattern, string, pos, endpos, true)
                if(mo){
                    yield BMO.$factory(mo)
                    pos = mo.end
                }else{
                    pos++ // at least 1, else infinite loop
                }
            }else{
                pos = mo.end
            }
        }else{
            pos++
        }
    }
    delete original_string.in_iteration
}

var _debug = {value: false}

function MO(node, pos, mo, len){
    this.node = node
    this.start = pos
    this.mo = mo
    this.nb_min = mo.nb_min
    this.nb_max = mo.nb_max
    this.len = len
    this.nb = this.node.non_greedy ? mo.nb_min : mo.nb_max
    this.end = pos + len * this.nb
}

MO.prototype.backtrack = function(string, groups){
    if(this.node.non_greedy && this.nb < this.nb_max){
        this.nb++
        this.end = this.start + this.len * this.nb
        return true
    }else if((! this.node.non_greedy) && this.nb > this.nb_min){
        this.nb--
        this.end = this.start + this.len * this.nb
        return true
    }else{
        return false
    }
}

function del_groups(groups, node){
    if(node.num !== undefined){
        delete groups[node.num]
        groups.$last.splice(groups.$last.indexOf(node.num), 1)
        if(node.name !== undefined){
            delete groups[node.name]
        }
    }
    for(var child of node.items){
        if(child instanceof Group){
            del_groups(groups, child)
        }
    }
}

function GroupMO(node, start, matches, string, groups, endpos){
    this.node = node
    this.start = start
    this.matches = matches
    this.string = string
    this.end = matches.length > 0 ? $last(matches).end : start
    this.endpos = endpos === undefined ? this.end : endpos
    this.$groups = groups
}

GroupMO.prototype.backtrack = function(string, groups){
    // Try backtracking in the last match
    if(this.matches.length > 0){
        var _match = $last(this.matches),
            mos = _match.mos,
            nb0 = mos.length
        while(mos.length > 0){
            var mo = mos.pop()
            if(mo.node instanceof Case){
                var rank = mo.node.parent.items.indexOf(mo.node)
                for(var _case of mo.node.parent.items.slice(rank + 1)){
                    var _mo = match({node: _case, text: _case.text},
                        string, mo.start)
                    if(_mo){
                        // update GroupMO object
                        mos.push(_mo)
                        this.end = _mo.end
                        var ix = this.$groups.$last[this.$groups.$last.length - 1]
                        this.$groups[ix].end = _mo.end
                        return true
                    }
                }
            }
            if(mo.backtrack(string, groups)){
                mos.push(mo)
                if(this.node.num !== undefined){
                    groups[this.node.num].end = mo.end
                }
                this.end = mo.end
                return true
            }
        }
    }
    // Else, remove last match if possible
    if(this.matches.length > this.node.repeat.min &&
            this.matches.length >= 1){
        this.matches.pop()
        if(this.matches.length > 0){
            this.end = $last(this.matches).end
        }else{
            // remove this group and its children from groups
            del_groups(groups, this.node)
            this.end = this.start
        }
        return true
    }
    return false
}

GroupMO.prototype.toString = function(){
    var repr = _b_.repr(this.string.substring(this.start, this.end))
    repr = repr.substring(0, 50)
    return '<re.Match object; span=(' + this.start + ', ' + this.end +
        '), match=' + repr + '>'
}

GroupMO.prototype.groups = function(_default){
    var res = [],
        groupobj = this.$groups

    for(var key in this.node.$groups){
        if(isFinite(key)){
            res[key] = groupobj[key] === undefined ? _default :
                this.string.substring(groupobj[key].start, groupobj[key].end)
        }
    }
    res.shift()
    return $B.fast_tuple(res)
}

var BMO = $B.make_class("Match",
    function(mo){
        return {
            __class__: BMO,
            mo
        }
    }
)

BMO.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, key: null},
                ['self', 'key'], arguments, {}, null, null),
        self = $.self,
        key = $.key
    if(Array.isArray(key)){
        throw _b_.IndexError.$factory("no such group")
    }
    if(key == 0){
        return self.mo.string.substring(self.mo.start, self.mo.end)
    }
    var match = self.mo.$groups[key]
    if(match !== undefined){
        return self.mo.string.substring(match.start, match.end)
    }else if(self.mo.node.$groups[key] !== undefined){
        return _b_.None
    }
    throw _b_.IndexError.$factory("no such group")
}

BMO.__repr__ = BMO.__str__ =  function(self){
    return self.mo.toString()
}

BMO.end = function(self){
    var $ = $B.args('end', 2, {self: null, group: null}, ['self', 'group'],
                arguments, {group: 0}, null, null)
    var group = BMO.group(self, $.group)
    if(group === _b_.None){
        return -1
    }else if($.group == 0){
        return self.mo.end
    }else{
        return self.mo.$groups[$.group].end
    }
}

BMO.endpos = {
    __get__: function(self){
        return self.mo.endpos
    }
}

BMO.expand = function(){
    var $ = $B.args("expand", 2, {self: null, template: null},
                ['self', 'template'], arguments, {}, null, null)
    var data = {
        repl: new StringObj($.template),
    }
    data = transform_repl(data, {groups: $.self.mo.node.$groups})
    if(typeof data.repl == "function"){
        return $B.$call(data.repl)(BMO.$factory($.self.mo))
    }else{
        return data.repl1
    }
}

BMO.group = function(self){
    var $ = $B.args("group", 1, {self: null}, ['self'], arguments,
                {}, 'args', null),
            self = $.self,
            args = $.args
    if(args.length == 0){
        args[0] = 0
    }
    var groupobj = self.mo.$groups,
        result = []
    for(var group_id of args){
        if($B.rich_comp('__eq__', group_id, 0)){
            result.push(self.mo.string.substring(self.mo.start, self.mo.end))
            continue
        }
        try{
            // Convert group_id to int if possible
            group_id = $B.PyNumber_Index(group_id) // in py_utils.js
        }catch(err){
            // group_id can be an identifier
        }
        if(self.mo.node.$groups[group_id] === undefined){
            throw _b_.IndexError.$factory("no such group")
        }
        var group = groupobj[group_id] // found in match
        result.push(group === undefined ?
            _b_.None :
            self.mo.string.substring(group.start, group.end))
    }
    if(args.length == 1){
        return result[0]
    }
    return $B.fast_tuple(result)
}

BMO.groupdict = function(){
    /*
    Return a dictionary containing all the named subgroups of the match, keyed
    by the subgroup name. The default argument is used for groups that did not
    participate in the match; it defaults to None.
    */
    var $ = $B.args("groupdict", 2, {self: null, default: null},
                ['self', 'default'], arguments, {default: _b_.None},
                null, null),
        self = $.self,
        groupobj = $.self.mo.$groups,
        d = $B.empty_dict()
    for(var key in $.self.mo.node.$groups){
        if(! isFinite(key)){
            var value = groupobj[key] === undefined ? $.default :
                    groupobj[key]
            if(value !== $.default){
                value = self.mo.string.substring(value.start, value.end)
            }
            _b_.dict.$setitem(d, key, value)
        }
    }
    return d
}

BMO.groups = function(self){
    var $ = $B.args("group", 2, {self: null, default: null},
                ['self', 'default'], arguments,
                {default: _b_.None}, null, null),
            self = $.self,
            _default = $.default
    return self.mo.groups(_default)
}

BMO.lastindex = {
    /* The integer index of the last matched capturing group, or None if no
       group was matched at all.
    */
    __get__: function(self){
        var last = self.mo.$groups.$last
        if(last.length == 0){
            return _b_.None
        }
        return parseInt($last(last))
    }
}

BMO.lastgroup = {
    /* The name of the last matched capturing group, or None if the group
       didn't have a name, or if no group was matched at all.
    */
    __get__: function(self){
        var lastindex = BMO.lastindex.__get__(self)
        if(lastindex === _b_.None){
            return _b_.None
        }
        var group = self.mo.node.$groups[lastindex],
            name = group.item.name
        return name === undefined ? _b_.None : name
    }
}

BMO.pos = {
    __get__: function(self){
        return self.mo.start
    }
}

BMO.re = {
    __get__: function(self){
        return self.mo.node.pattern
    }
}

BMO.regs = {
    __get__: function(self){
        var res = [$B.fast_tuple([self.mo.start, self.mo.end])]
        for(var group_num in self.mo.node.$groups){
            if(isFinite(group_num)){
                var group = self.mo.node.$groups[group_num].item
                // group.pattern includes the opening and closing brackets
                res.push($B.fast_tuple([group.pos,
                    group.pos + group.pattern.length - 2]))
            }
        }
        return $B.fast_tuple(res)
    }
}

BMO.span = function(){
    /*
    Match.span([group])

    For a match m, return the 2-tuple (m.start(group), m.end(group)). Note
    that if group did not contribute to the match, this is (-1, -1). group
    defaults to zero, the entire match.
    */
    var $ = $B.args("span", 2, {self: null, group: null},
                ['self', 'group'], arguments,
                {group: 0}, null, null),
            self = $.self,
            group = $.group
    if(group == 0){
        return $B.fast_tuple([self.mo.start, self.mo.end])
    }
    var span = self.mo.$groups[group]
    if(span === undefined){
        return $B.fast_tuple([-1, -1])
    }
    return $B.fast_tuple([span.start, span.end])
}

BMO.start = function(self){
    var $ = $B.args('end', 2, {self: null, group: null}, ['self', 'group'],
                arguments, {group: 0}, null, null)
    var group = BMO.group(self, $.group)
    if(group === _b_.None){
        return -1
    }else if($.group == 0){
        return self.mo.start
    }else{
        return self.mo.$groups[$.group].start
    }
}

BMO.string = {
    __get__: function(self){
        return self.mo.string.to_str()
    }
}

$B.set_func_names(BMO, 're')

function test_after_min_repeat_one(items, pattern, string, pos,
                            endpos, no_zero_width, groups){

}

function log(){
    if(_debug.value){
        console.log.apply(null, arguments)
    }
}

function match(pattern, string, pos, endpos, no_zero_width, groups){
    // Follow the pattern tree structure
    log('match pattern', pattern.text, 'pos', pos, string.substring(pos))
    var string1 = string
    if(endpos !== undefined){
        if(endpos < pos){
            return false
        }else if(endpos < string.length){
            string1 = new StringObj('')
            string1.codepoints = string.codepoints.slice(0, endpos)
            string1.length = endpos
        }
    }
    if(pattern.node instanceof Node){
        show(pattern.node)
    }
    if(groups === undefined){
        groups = {$last:[]}
    }
    if(pattern.text === undefined){
        console.log('pas de texte', pattern)
    }
    var node = pattern.node,
        mo
    if(node.items){
        // node is either a Choice between several items, or a sequence of
        // items
        if(node instanceof Choice){
            mo = false
            for(var _case of node.items){
                mo = match({node: _case, text: _case.text}, string, pos,
                    endpos, no_zero_width, groups)
                if(mo){
                    return mo
                }
            }
            return false
        }else{
            // sequence of items
            node.repeat = node.repeat === undefined ? {min: 1, max: 1} :
                node.repeat
            var start = pos,
                nb_repeat = 0,
                nb_zerolength_repeat = 0,
                matches = [],
                mos,
                match_start,
                empty_matches = {}
            // loop until we get enough repetitions
            while(true){
                if(empty_matches[pos]){
                    // no use trying again
                    return matches.length == 0 ? false :
                       new GroupMO(node, start, matches, string, groups,
                           endpos)
                }
                var initial_groups = Object.keys(groups)
                mos = []
                match_start = pos
                log("pattern", pattern.text, "loop in group match, match start", match_start)
                var i = 0
                while(i < node.items.length){
                    var item = node.items[i]
                    log('item', i, '/', node.items.length - 1,
                        'of pattern', pattern.text)
                    var mo = match({node: item, text: item + ''}, string, pos,
                        endpos, no_zero_width, groups)
                    if(mo){
                        if(item instanceof Group &&
                                item.type == "lookahead_assertion"){
                            log("lookahead assertion", item, "succeeds")
                        }else{
                            mos.push(mo)
                            log('item ' + item, 'succeeds, mo', mo, mos, 'groups', groups)
                            pos = mo.end
                        }
                        i++
                    }else if(false && item instanceof Group &&
                            item.type == "negative_lookahead_assertion"){
                        log("negative lookahead assertion", item, "fails : ok !")
                        i++
                    }else{
                        log('item ' + item, 'of group fails, nb_repeat',
                            nb_repeat, 'node repeat', node.repeat)
                        var backtrack = false
                        while(mos.length > 0){
                            var mo = mos.pop()
                            if(mo.backtrack === undefined){
                                log('pas de backtrack pour', mo)
                            }
                            log('try backtrack on mo', mo)
                            if(mo.backtrack(string, groups)){
                                log('can backtrack, mo', mo)
                                mos.push(mo)
                                i = mos.length
                                log('mos', mos, 'restart at item', i)
                                pos = mo.end
                                backtrack = true
                                break
                            }
                        }
                        if(backtrack){
                            log('backtrack ok')
                            continue
                        }else{
                            if(node.type == "negative_lookahead_assertion"){
                                // If a negative lookahead assertion fails,
                                // return a match
                                return new GroupMO(node, start, matches,
                                    string, groups, endpos)
                            }
                            if(nb_repeat == 0){
                                // remove the groups introduced before
                                // reaching this point
                                for(var key in groups){
                                    if(initial_groups.indexOf(key) == -1){
                                        delete groups[key]
                                    }
                                }
                            }
                            if(nb_repeat >= node.repeat.min){
                                log("enough repetitions for node", node)
                                if(node.type == "negative_lookahead_assertion"){
                                    return false
                                }
                                return new GroupMO(node, start, matches, string,
                                    groups, endpos)
                            }
                            return false
                        }
                    }
                }
                if(node.type == "negative_lookahead_assertion"){
                    // If a negative lookahead succeeds, return false
                    return false
                }
                nb_repeat++
                if(pos > match_start){
                    nb_zerolength_repeat = 0
                }else{
                    nb_zerolength_repeat++
                    empty_matches[pos] = true
                }
                matches.push({start: match_start, end: pos, mos})
                if(node.num !== undefined){
                    groups[node.num] = $last(matches)
                    if(node.name !== undefined){
                        groups[node.name] = groups[node.num]
                    }
                    if(node.num != $last(groups.$last)){
                        var ix = groups.$last.indexOf(node.num)
                        if(ix > -1){
                            groups.$last.splice(ix, 1)
                        }
                        groups.$last.push(node.num)
                    }
                }
                if(nb_repeat >= node.repeat.max){
                    var res = new GroupMO(node, start, matches, string,
                        groups, endpos)
                    if(res.start == res.end && no_zero_width){
                        // no_zero_width is set when previous match in
                        // iterator() had length 0; avoids infinite loops
                        return false
                    }
                    return res
                }
                log('loop on group', pattern.text, 'nb repeats', nb_repeat,
                    'nb zero length', nb_zerolength_repeat)
                if(nb_zerolength_repeat == 65535){
                    return matches.length == 0 ? false :
                       new GroupMO(node, start, matches, string, groups,
                           endpos)
                }
            }
        }
    }else{
        if(node.match === undefined){
            console.log('pas de match', node)
        }
        var mo = node.match(string1, pos, groups)
        log(node, "mo", mo)
        if(mo){
            var len = mo.group_len === undefined ? 1 : mo.group_len,
                ix = node.non_greedy ? mo.nb_min : mo.nb_max,
                end = pos + len * ix
            return new MO(node, pos, mo, len)
        }else{
            return false
        }
    }
}

var $module = {
    cache: cache,
    compile: function(){
        var $ = $B.args("compile", 2, {pattern: null, flags: null},
                    ['pattern', 'flags'], arguments, {flags: no_flag},
                    null, null)
        if($.pattern && $.pattern.__class__ === BPattern){
            if($.flags !== no_flag){
                throw _b_.ValueError.$factory(
                    "cannot process flags argument with a compiled pattern")
            }
            return $.pattern
        }
        $.pattern = check_pattern_flags($.pattern, $.flags)
        var data = prepare({pattern: $.pattern})
        if(typeof $.flags == "number"){
            $.flags = Flag.$factory($.flags)
        }
        var jspat = compile(data.pattern, $.flags)
        return BPattern.$factory(jspat)
    },
    error: error,
    escape: function(){
        var $ = $B.args("escape", 1, {pattern: null}, ['pattern'], arguments,
                    {}, null, null),
            data = prepare({pattern: $.pattern}),
            pattern = data.pattern,
            res = []
        for(var cp of pattern.codepoints){
            if(escaped.indexOf(cp) > -1){
                res.push(ord('\\'))
            }
            res.push(cp)
        }
        res = from_codepoint_list(res, data.type)
        if(data.type == "bytes"){
            res = _b_.str.encode(res, 'latin1')
        }
        return res
    },
    findall: function(){
        /* Return all non-overlapping matches of pattern in string, as a list
           of strings. The string is scanned left-to-right, and matches are
           returned in the order found. If one or more groups are present in
           the pattern, return a list of groups; this will be a list of tuples
           if the pattern has more than one group. Empty matches are included
           in the result.
        */
        var $ = $B.args("findall", 3,
                    {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments,
                    {flags: no_flag}, null, null),
                pattern = $.pattern,
                string = $.string,
                flags = $.flags,
                data
        pattern = check_pattern_flags(pattern, flags)
        if(pattern.__class__ === BPattern){
            data = prepare({string})
        }else{
            data = prepare({string, pattern})
            pattern = BPattern.$factory(compile(data.pattern, flags))
        }
        if(data.type === "str"){
            function conv(s){
                return s === EmptyString ? '' : s
            }
        }else{
            function conv(s){
                return string2bytes(s)
            }
        }

        var iter = $module.finditer.apply(null, arguments).js_gen,
            res = []
        while(true){
            var next = iter.next()
            if(next.done){
                return res
            }
            var bmo = next.value,
                mo = bmo.mo,
                groups = BMO.groups(bmo)

            // replace None by the empty string
            for(var i = 0, len = groups.length; i < len; i++){
                groups[i] = groups[i] === _b_.None ? "" : groups[i]
            }
            if(groups.length > 0){
                if(groups.length == 1){
                    res.push(groups[0])
                }else{
                    res.push($B.fast_tuple(groups))
                }
            }else{
                res.push(mo.string.substring(mo.start, mo.end))
            }
        }
        console.log("end findall")
    },
    finditer: function(){
        var $ = $B.args("finditer", 3,
                    {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments,
                    {flags: no_flag}, null, null),
                pattern = $.pattern,
                string = $.string,
                flags = $.flags
        if(_b_.isinstance(string, [_b_.bytearray, _b_.memoryview])){
            string.in_iteration = true
        }
        var original_string = string,
            data
        pattern = check_pattern_flags(pattern, flags)
        if(pattern.__class__ === BPattern){
            data = prepare({string})
            flags = pattern.flags
        }else{
            data = prepare({string, pattern})
            pattern = BPattern.$factory(compile(data.pattern, flags))
        }
        if(pattern.__class__ !== BPattern){
            throw Error("pattern not a Python object")
        }
        return $B.generator.$factory(iterator)(pattern.$pattern, data.string,
            flags, original_string)
    },
    fullmatch: function(){
        var bmo = $module.match.apply(null, arguments)
        if(bmo !== _b_.None){
            if(bmo.mo.string.codepoints.length != bmo.mo.end - bmo.mo.start){
                return _b_.None
            }else{
                return bmo
            }
        }
        return _b_.None
    },
    Match: BMO,
    match: function(){
        var $ = $B.args("match", 3, {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments,
                    {flags: no_flag}, null, null),
                pattern = $.pattern,
                string = $.string,
                flags = $.flags
        pattern = check_pattern_flags(pattern, flags)
        var data
        if(pattern.__class__ === BPattern){
            data = prepare({string})
            pattern = pattern.$pattern
        }else{
            data = prepare({pattern, string})
            pattern = compile(data.pattern, flags)
        }
        var res = match(pattern, data.string, 0)
        return res === false ? _b_.None : BMO.$factory(res)
    },
    Pattern: BPattern,
    purge: function(){
        var $ = $B.args("purge", 0, {}, [], arguments, {}, null, null)
        cache.clear()
        return _b_.None
    },
    search: function(){
        var $ = $B.args("search", 3, {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments,
                    {flags: no_flag}, null, null),
                pattern = $.pattern,
                string = $.string,
                flags = $.flags,
                data
        pattern = check_pattern_flags(pattern, flags)
        if(pattern.__class__ === BPattern){
            data = prepare({string})
        }else{
            data = prepare({string, pattern})
            pattern = BPattern.$factory(compile(data.pattern, flags))
        }
        data.pattern = pattern
        // optimization
        if(pattern.$pattern.fixed_length !== false &&
                isFinite(pattern.$pattern.fixed_length) &&
                pattern.pattern.endsWith('$') &&
                ! (pattern.flags.value & MULTILINE.value)){
            var mo = match(data.pattern.$pattern, data.string,
                data.string.length - pattern.$pattern.fixed_length)
            if(mo){
                return BMO.$factory(mo)
            }
            return _b_.None
        }
        var pos = 0
        while(pos < data.string.codepoints.length){
            var mo = match(data.pattern.$pattern, data.string, pos)
            if(mo){
                return BMO.$factory(mo)
            }else{
                pos++
            }
        }
        return _b_.None
    },
    set_debug: function(){
        _debug.value = true
    },
    split: function(){
        var $ = $B.args("split", 4,
                    {pattern: null, string: null, maxsplit: null, flags: null},
                    ['pattern', 'string', 'maxsplit', 'flags'],
                    arguments, {maxsplit: 0, flags: no_flag}, null, null)
        var res = [],
            pattern = $.pattern,
            string = $.string,
            flags = $.flags,
            pos = 0,
            nb_split = 0,
            data
        if(pattern.__class__ !== BPattern){
            data = prepare({pattern, string})
            pattern = BPattern.$factory(compile(data.pattern, flags))
        }else{
            data = {pattern, string}
        }
        for(var bmo of $module.finditer(pattern, $.string).js_gen){
            var mo = bmo.mo, // finditer returns instances of BMO
                groupobj = mo.$groups
            res.push(data.string.substring(pos, mo.start))
            for(var key in mo.node.$groups){
                if(isFinite(key)){
                    if(groupobj[key] !== undefined){
                        res.push(data.string.substring(groupobj[key].start,
                            groupobj[key].end))
                    }else{
                        res.push(_b_.None)
                    }
                }
            }
            nb_split++
            pos = mo.end
            if(pos >= $.string.length){
                break
            }
            if($.maxsplit != 0 && nb_split >= $.maxsplit){
                break
            }
        }
        res.push(data.string.substring(pos))
        if(data.type === "bytes"){
            res = res.map(function(x){return _b_.str.encode(x, "latin-1")})
        }
        return res
    },
    sub: function(){
        var $ = $B.args("sub", 5,
                {pattern: null, repl: null, string: null, count: null, flags: null},
                ['pattern', 'repl', 'string', 'count', 'flags'],
                arguments, {count: 0, flags: no_flag}, null, null),
            pattern = $.pattern,
            repl = $.repl,
            string = $.string,
            count = $.count,
            flags = $.flags,
            data
        check_pattern_flags(pattern, flags)
        if(typeof repl != "function"){
            if(pattern.__class__ != BPattern){
                data = prepare({pattern, string, repl})
                pattern = compile(data.pattern, flags)
            }else{
                data = prepare({string, repl})
                flags = pattern.flags
                pattern = pattern.$pattern
            }
            data = transform_repl(data, pattern)
        }else{
            if(pattern.__class__ != BPattern){
                data = prepare({pattern, string})
                pattern = compile(data.pattern, flags)
            }else{
                data = prepare({string})
                flags = pattern.flags
                pattern = pattern.$pattern
            }
            data.repl = repl
        }
        return subn(pattern, data.repl, data.string, count, flags)[0]
    },
    subn: function(){
        var $ = $B.args("sub", 5,
                {pattern: null, repl: null, string: null, count: null, flags: null},
                ['pattern', 'repl', 'string', 'count', 'flags'],
                arguments, {count: 0, flags: no_flag}, null, null),
            pattern = $.pattern,
            repl = $.repl,
            string = $.string,
            count = $.count,
            flags = $.flags,
            data
        if(pattern.__class__ != BPattern){
            data = prepare({pattern, repl, string})
        }else{
            data = prepare({repl, string})
            data.pattern = pattern.$pattern
        }
        return $B.fast_tuple(subn(data.pattern, data.repl, data.string, count,
            flags))
    }

}

var ASCII = $module.A = $module.ASCII = Flag.$factory(256)
var IGNORECASE = $module.I = $module.IGNORECASE = Flag.$factory(2)
var LOCALE = $module.L = $module.LOCALE = Flag.$factory(4)
var MULTILINE = $module.M = $module.MULTILINE = Flag.$factory(8)
var DOTALL = $module.S = $module.DOTALL = Flag.$factory(16)
var U = $module.U = $module.UNICODE = Flag.$factory(32)
var VERBOSE = $module.X = $module.VERBOSE = Flag.$factory(64)
$module.cache = cache

var inline_flags = {
    i: IGNORECASE,
    L: LOCALE,
    m: MULTILINE,
    s: DOTALL,
    u: U,
    x: VERBOSE,
    a: ASCII
}

var flag_names = {
    i: 'IGNORECASE',
    L: 'LOCALE',
    m: 'MULTILINE',
    s: 'DOTALL',
    u: 'U',
    x: 'VERBOSE',
    a: 'ASCII'
}
