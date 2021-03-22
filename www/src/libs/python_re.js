// Regular expression

var $B = __BRYTHON__,
    _b_ = $B.builtins

var MAXGROUPS = 2147483647

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

var $error_2 = {
    $name: "error",
    $qualname: "error",
    $is_class: true,
    __module__: "re"
}

var error = $B.$class_constructor("error", $error_2,
    _b_.tuple.$factory([_b_.Exception]),["_b_.Exception"],[])
error.__doc__ = _b_.None
error.$factory = $B.$instance_creator(error)
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

function warn(klass, message, pos){
    var warning = klass.$factory(message)
    warning.pos = pos
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

Flag.__index__ = function(self){
    return self.value
}

Flag.__eq__ = function(self, other){
    return self.value == other.value
}

Flag.__or__ = function(self, other){
    return Flag.$factory(self.value | other.value)
}

Flag.__ror__ = function(self, other){
    if(typeof other == "number" || _b_.isinstance(other, int)){
        if(other == 0){
            return Flag.$factory(self.value)
        }
        return Flag.$factory(self.value | other)
    }
    return _b_.NotImplemented
}

Flag.__str__ = function(self){
    if(self.value == 0){
        return "re.none"
    }
    var t = []
    for(var flag in inline_flags){
        if(self.value & inline_flags[flag].value){
            t.push(flag_names[flag])
        }
    }
    return 're.' + t.join(' ')
}

Flag.__xor__ = function(self, other){
    return Flag.$factory(self.value ^ other.value)
}

$B.set_func_names(Flag, "re")

var no_flag = {}

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
            path: pattern.path,
            pattern: pattern.text,
            groups: nb_groups,
            flags: pattern.flags,
            $groups: pattern.groups,
            $pattern: pattern
        }
    }
)

BPattern.__eq__ = function(self, other){
    if(self.$pattern.type != other.$pattern.$type){
        warn(_b_.BytesWarning, "cannot compare str and bytes pattern", 1)
    }
    return self.pattern == other.pattern &&
        self.flags.value == other.flags.value
}

BPattern.__hash__ = function(self){
    // best effort ;-)
    return _b_.hash(self.pattern) + self.flags.value
}

BPattern.__str__ = function(self){
    var res = `re.compile(${_b_.repr(self.pattern)}`
    if(self.flags.value != 0){
        res += `, ${_b_.str.$factory(self.flags)}`
    }
    return res + ')'
}

BPattern.findall = function(self){
    var iter = BPattern.finditer.apply(null, arguments),
        res = []

    while(true){
        var next = iter.next()
        if(next.done){
            return res
        }
        var bmo = next.value,
            mo = bmo.mo,
            groups = BMatchObject.groups(bmo)

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
    var mo = match($.self.$pattern, data.string, $.pos, $.self.flags,
        $.endpos)
    if(mo && mo.end - mo.start == $.endpos - $.pos){
        return BMatchObject.$factory(mo)
    }else{
        return _b_.None
    }
}
var gi = $B.make_class("GroupIndex",
    function(self, _default){
        var res = $B.empty_dict()
        res.__class__ = gi
        for(var key in self.$groups){
            if(isNaN(parseInt(key))){
                res.$string_dict[key] = [self.$groups[key].num,
                    res.$version++]
            }
        }
        return res
    }
)
gi.__mro__ = [_b_.dict, _b_.object]
gi.__setitem__ = function(){
    throw _b_.TypeError.$factory("read only")
}

BPattern.groupindex = {
    __get__: function(self){
        return gi.$factory(self)
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
    return BMatchObject.$factory(match($.self.$pattern, data.string, $.pos,
        $.self.flags, $.endpos))
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
        var mo = match(self.$pattern, data.string, pos, self.flags)
        if(mo){
            return BMatchObject.$factory(mo)
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
        return undefined
    }
    var len = 0
    for(var item of this.items){
        if(item.fixed_length === undefined){
            console.log("pas de fixed length", item)
            alert()
        }
        var sublen = item.fixed_length()
        if(sublen === undefined){
            return undefined
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
    return group === undefined ? undefined : group.fixed_length()
}

BackReference.prototype.get_group = function(){
    var top = get_top(this)
    return top.$groups[this.value]
}

BackReference.prototype.match = function(string, pos, group){
    this.repeat = this.repeat || {min: 1, max: 1}

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

var Case = function(){
    this.name = "Case"
    this.items = []
    this.groups = []
}

Case.prototype.add = Node.prototype.add

var Choice = function(){
    this.type = "choice"
    this.items = []
    this.groups = []
}

Choice.prototype.add = Node.prototype.add

var EmptyString = {
        toString: function(){
            return ''
        },
        match: function(string, pos, flags){
            return {nb_min: 0, nb_max: 0}
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
            cps.add(0x017f) // ‘ſ’ (Latin small letter long s)
        }
        if(cp == 0x017f){
            cps.add(ord('s'))
            cps.add(ord('S'))
        }
        if(char.toLowerCase() == 'i'){
            cps.add(0x0130) // ‘İ’ (Latin capital letter I with dot above)
            cps.add(0x0131) // ‘ı’ (Latin small letter dotless i)
        }
        if(cp == 0x0130 || cp == 0x0131){
            cps.add(ord('i'))
            cps.add(ord('I'))
        }
        return Array.from(cps) //var char_is_cased = cps.size > 1
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

Char.prototype.match = function(string, pos, flags){
    // Returns {pos1, pos2} such that "this" matches all the substrings
    // string[pos:i] with pos1 <= i < pos2, or false if no match
    this.repeat = this.repeat || {min: 1, max: 1}

    var len = string.codepoints.length,
        i = 0

    // browse string codepoints until they don't match, or the number of
    // matches is above the maximum allowed
    if(flags){
        if(flags.value & ASCII.value){
            if(! /[a-zA-Z]/.exec(this.char)){
                return false
            }
        }
        if(flags.value & IGNORECASE.value){
            // flag IGNORECASE set
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
    return '/' + this.text + '/'
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
                return $B.unicode_tables.Zs[cp] === undefined &&
                    $B.unicode_bidi_whitespace.indexOf(cp) == -1
            }
            break
        case '.':
            this.test_func = function(string, pos, flags){
                if(string.codepoints[pos] === undefined){
                    return false
                }
                if(flags && flags.value & DOTALL.value){
                    return true
                }else{
                    return string.codepoints[pos] != 10
                }
            }
            break
        case 'd':
            this.test_func = function(string, pos){
                var cp = string.codepoints[pos]
                return $B.unicode_tables.numeric[cp] !== undefined
            }
            break
        case 'D':
            this.test_func = function(string, pos){
                var cp = string.codepoints[pos]
                return $B.unicode_tables.numeric[cp] === undefined
            }
            break
        case 'b':
            this.test_func = function(string, pos, flags){
                var table = is_word
                if(flags && (flags.value & ASCII.value)){
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
            this.test_func = function(string, pos, flags){
                var table = is_word
                if(flags && (flags.value & ASCII.value)){
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
            this.test_func = function(string, pos, flags){
                var table = is_word
                if(flags && (flags.value & ASCII.value)){
                    table = is_ascii_word
                }
                return table[string.codepoints[pos]]
            }
            break
        case 'W':
            this.test_func = function(string, pos, flags){
                var table = is_word
                if(flags && flags.value & ASCII.value){
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

CharacterClass.prototype.match = function(string, pos, flags){
    // Returns {pos1, pos2} such that "this" matches all the substrings
    // string[pos:i] with pos1 <= i < pos2, or false if no match
    this.repeat = this.repeat || {min: 1, max: 1}
    var len = string.codepoints.length,
        i = 0

    // browse string codepoints until they don't match, or the number of
    // matches is above the maximum allowed
    while(pos + i <= len &&
            this.test_func(string, pos + i, flags) &&
            i < this.repeat.max){
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
    this.items = set.items
    this.neg = set.neg
}

CharacterSet.prototype.match = function(string, pos, flags){
    var ignore_case = flags && (flags.value & IGNORECASE.value),
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

        var char = $B.codepoint2jsstring(cp),
            cps = cased_cps(cp, ignore_case, flags.value & ASCII.value),
            char_is_cased = cps.length > 1

        for(var cp1 of cps){
            for(var item of this.items){
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
                    test = !! item.match(string, pos) // boolean
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

var ConditionalBackref = function(pos, group_ref){
    this.type = "conditional backref"
    this.pos = pos
    this.group_ref = group_ref
    this.chars = []
    this.match_codepoints = []
    this.nb_success = 0
    this.re_if_exists = new Group(pos)
    this.re_if_not_exists = new Group()
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
    return 0
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
    return '#' + this.num + ':' + this.pattern
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

StringStart.prototype.match = function(string, pos, flags){
    var ok = {nb_min:0, nb_max: 0}
    if(flags.value & MULTILINE.value){
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

StringEnd.prototype.match = function(string, pos, flags){
    var ok = {nb_min:0, nb_max: 0}
    if(flags.value & MULTILINE.value){
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
    return '$'
}

function validate(name){
    // name is a StringObj
    sname = name.string
    name = name.codepoints
    if(name.length == 0){
        fail("missing group name")
    }else if(chr(name[0]).match(/\d/) || name.indexOf(ord('.')) > - 1){
        fail(`bad character in group name '${sname}'`)
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
            fail(`bad character in group name '${sname}'`)
        }
    }else{
        fail(`bad character in group name '${sname}'`)
    }
}

var chr = _b_.chr

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
        var cp = validate_named_char(from_codepoint_list(description))
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
                fail(`bad escape \\U${mo[0]}`)
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
        warn(_b_.FutureWarning, "Possible nested set", pos)
    }
    var range = false
    while(pos < text.length){
        var cp = text[pos],
            char = chr(cp)
        if(char == ']'){
            return [result, pos]
        }
        if(char == '\\'){
            var escape = escaped_char({
                    codepoints: text,
                    pos,
                    in_charset: true,
                    is_bytes
                })
            if(typeof escape == "number"){
                escape = {
                    ord: escape,
                    length: 2,
                    toString: function(){
                        return chr(escape)
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
            pos += escape.length
        }else if(char == '-'){
            // Character range, or character "-"
            if(pos == start + 1 ||
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
                    warn(_b_.FutureWarning, "Possible set difference", pos)
                }
                pos++
                if(range){
                    check_character_range(result.items, positions)
                }
                range = false
            }else{
                range = true
                if(text[pos + 1] == cp){
                    warn(_b_.FutureWarning, "Possible set difference", pos)
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
                warn(_b_.FutureWarning, "Possible set intersection", pos)
            }else if(char == "|" && text[pos + 1] == cp){
                warn(_b_.FutureWarning, "Possible set union", pos)
            }else if(char == "~" && text[pos + 1] == cp){
                warn(_b_.FutureWarning, "Possible set symmetric difference",
                    pos)
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

function validate_named_char(description){
    // validate that \N{<description>} is in the Unicode db
    // Load unicode table if not already loaded
    if(description.length == 0){
        fail("missing character name")
    }
    open_unicode_db()
    if($B.unicodedb !== undefined){
        var re = new RegExp("^([0-9A-F]+);" +
            description.toUpperCase() + ";.*$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            fail(`undefined character name '${description}'`)
        }
        return eval("0x" + search[1])
    }else{
        fail("could not load unicode.txt")
    }
}

function compile(pattern, flags){
    // data has attributes "pattern" (instance of StringObj)
    // and "type" ("str" or "bytes")
    if(pattern.__class__ === BPattern){
        return pattern
    }
    var path = [],
        original_pattern = pattern,
        type = pattern.type
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
        flags = Flag.$factory(flags.value | ASCII.value)
    }
    var group_num = 0,
        group_stack = [],
        groups = {},
        subitems = [],
        pos,
        lookbehind,
        node = new Node(),
        accept_inline_flag = true,
        comment_in_verbose = false
    node.$groups = groups
    var tokenized = []
    for(var item of tokenize(pattern, type)){
        if(comment_in_verbose){
            if(item instanceof Char && item.cp == 10){
                comment_in_verbose = false
            }
            continue
        }
        if(item instanceof Char && flags.value & VERBOSE.value){
            if([9, 10, 11, 12, 13, 32].indexOf(item.cp) > -1 &&
                    ! item.escaped){
                // ignore whitespace in VERBOSE mode
                continue
            }else if(item.cp == ord("#") && ! item.escaped){
                // ignore until line end
                comment_in_verbose = true
                continue
            }
        }
        path.push(item)
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
            item.rank = path.length - 1
            node = item // next items will be stored as group's items
            pos = item.pos
            if(item.non_capturing){
                delete item.num
                group_num--
            }else if(item.type == "name_def"){
                subitems.push(item)
                var value = item.value
                validate(value)
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
                subitems.push(item)
            }else if(item.is_lookbehind){
                // a lookbehind assertion is relative to the next regexp
                node.parent.items.pop() // remove from node items
                // temporarily create a group
                groups[group_num] = new GroupRef(group_num, item)
            }else{
                subitems.push(item)
                groups[group_num] = new GroupRef(group_num, item)
            }
        }else if(item instanceof GroupEnd){
            end_pos = item.pos
            if(group_stack.length == 0){
                fail("unbalanced parenthesis", end_pos, original_pattern)
            }
            var item = group_stack.pop()
            // GroupEnd is in path. Associate it with group
            path[path.length - 1].group = item
            // Note the rank of group end in group start
            item.end_rank = path.length - 1
            item.end_pos = end_pos
            try{
                item.pattern = from_codepoint_list(
                    pattern.slice(item.pos, end_pos + 1))
            }catch(err){
                console.log("err avec pattern substring", pattern)
                throw err
            }
            if(item.is_lookbehind){
                // check that all elements have a fixed length
                delete groups[group_num]
                group_num--
                item.length = item.fixed_length()
                if(item.length === undefined){
                    fail("look-behind requires fixed-width pattern", pos)
                }
                item.non_capturing = true
                // store in variable "lookbehind", will be applied to next item
                lookbehind = item
            }
            if(item instanceof Group && item.items.length == 0){
                item.add(new Char(pos, EmptyString, group_stack.concat([item])))
            }else if(item instanceof ConditionalBackref){
                if(item.re_if_exists.items.length == 0){
                    item.re_if_exists.add(new Char(pos, EmptyString, group_stack))
                }else if(item.re_if_not_exists.items.length == 0){
                    item.re_if_not_exists.pos = pos
                    item.re_if_not_exists.add(new Char(pos, EmptyString, group_stack))
                }
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
            item.groups = []
            for(var group of group_stack){
                item.groups.push(group)
            }
            node.add(item)
        }else if(item instanceof Char ||
                item instanceof CharacterClass ||
                item instanceof CharacterSet){
            item.flags = flags
            subitems.push(item)
            item.groups = []
            for(var group of group_stack){
                if(group.extension && group.extension.type &&
                        group.extension.type.indexOf('lookbehind') > -1){
                    var parent = node
                    while(parent){
                        if(parent === group){
                            break
                        }
                        parent = parent.parent
                    }
                }
                item.groups.push(group)
                group.chars.push(item)
            }
            node.add(item)
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
            path.pop() // remove repeater from path
            var previous = path[path.length - 1]
            if(previous instanceof Char ||
                    previous instanceof CharacterClass ||
                    previous instanceof CharacterSet ||
                    previous instanceof GroupEnd ||
                    previous instanceof BackReference){
                if(previous instanceof GroupEnd){
                    // associate repeat with Group
                    previous = previous.group
                }
                if(previous.repeater){
                    if(item.op == '?' && ! previous.non_greedy){
                        previous.non_greedy = true
                    }else{
                        fail("multiple repeat", pos)
                    }
                }else{
                    // convert to minimum and maximum number of repeats
                    var min = 1,
                        max = 1
                    if(Array.isArray(item.op)){
                        min = item.op[0]
                        max = item.op[1] === undefined ? min : item.op[1]
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
            flags = Flag.$factory(flags.value)
            if(item.on_flags.indexOf('u') > -1){
                if(is_bytes){
                    fail("re.error: bad inline flags: cannot use 'u' flag " +
                        "with a bytes pattern", pos)
                }
                if(flags && flags.value & ASCII.value){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
                if(item.on_flags.indexOf('a') > -1){
                    fail("bad inline falgs", pos)
                }
                if(item.on_flags.indexOf('u') > -1 && is_bytes){
                    fail("bad inline flags: cannot use 'u' flag with a bytes " +
                        "pattern", pos)
                }
            }else if(item.on_flags.indexOf('a') > -1){
                if(flags && flags.value & U.value){
                    throw _b_.ValueError.$factory("ASCII and UNICODE flags " +
                        "are incompatible")
                }
            }
            if(flags.value === undefined){
                flags.value = 32
            }
            if(item.items.length == 0){
                if(! accept_inline_flag){
                    console.log("not at the start", pattern)
                    var s = from_codepoint_list(pattern)
                    warn(_b_.DeprecationWarning,
                        `Flags not at the start of the expression '${s}'`,
                        pos)
                }
                for(var on_flag of item.on_flags){
                    flags.value |= inline_flags[on_flag].value
                }
            }else{
                node.add(item)
            }
        }else{
            fail("unknown item type " + item, pos)
        }
        if(! (item instanceof SetFlags)){
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
    node.subitems = subitems
    node.pattern = from_codepoint_list(pattern)
    node.groups = group_num
    flags = flags === no_flag ? 32 : flags
    node.flags = flags
    if(lookbehind){
        var es = new Char(pos, EmptyString)
        es.lookbehind = lookbehind
        lookbehind.parent = es
        node.add(es)
    }
    if(path.length == 0){
        path = [EmptyString]
    }
    return {
        path,
        groups,
        flags,
        text: from_codepoint_list(pattern),
        type // "str" or "bytes"
    }
}

function ord(char){
    return char.charCodeAt(0)
}

function* tokenize(pattern, type){
    // pattern is a list of codepoints
    var is_bytes = type == "bytes"
    var pos = 0
    while(pos < pattern.length){
        var cp = pattern[pos],
            char = String.fromCharCode(cp)
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
                        validate(name)
                        if(i == pattern.length){
                            fail("missing >, unterminated name", pos)
                        }
                        yield new Group(pos, {type: 'name_def', value: name})
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
                        validate(name)
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
                        validate(sref)
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
                    pos += 3
                    continue
                }else if(pattern[pos + 2] == ord('!')){
                    // (?!...) : negative lookahead assertion
                    yield new Group(pos, {type: 'negative_lookahead_assertion'})
                    pos += 3
                    continue
                }else if(from_codepoint_list(pattern.slice(pos + 2, pos + 4)) == '<!'){
                    // (?<!...) : negative lookbehind
                    yield new Group(pos, {type: 'negative_lookbehind'})
                    pos += 4
                    continue
                }else if(from_codepoint_list(pattern.slice(pos + 2, pos + 4)) == '<='){
                    // (?<=...) : positive lookbehind
                    yield new Group(pos, {type: 'positive_lookbehind'})
                    pos += 4
                    continue
                }else if(pattern[pos + 2] == ord('<')){
                    pos += 3
                    if(pos == pattern.length){
                        fail("unexpected end of pattern", pos)
                    }
                    fail("unknown extension ?<" + pattern[pos], pos)
                }else if(pattern[pos + 2] == ord(':')){
                    yield new Group(pos, {non_capturing: true})
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
                    fail("unknown extension ?" + pattern[pos + 2], pos)
                }
            }else{
                yield new Group(pos)
                pos++
            }
        }else if(cp == ord(')')){
            yield new GroupEnd(pos)
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
                    var max = parseInt(reps[4])
                    if(max < limits[0]){
                        fail('min repeat greater than max repeat', pos)
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
                fail('{ not terminated', pos)
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
    return s
}

function MatchObject(pattern, string, stack, endpos){
    this.pattern = pattern
    this.string = string
    this.stack = stack
    if(stack.length > 0){
        var first = stack[0]
        if(first.type == "group"){
            if(first.matches.length > 0){
                this.start = first.matches[0].start
            }else{
                this.start = first.start
            }
        }else{
            this.start = first.start
        }
        var last = stack[stack.length - 1]
        if(last.type == "group"){
            if(last.matches.length == 0){
                this.end = last.start
            }else{
                this.end = last.matches[last.matches.length - 1].end
            }
        }else{
            this.end = last.start + last.ix
        }
    }else{
        this.start = this.end = stack.start
    }
    this.endpos = endpos
}

MatchObject.prototype.toString = function(){
    var stack = this.stack,
        start = this.start,
        end = this.end,
        cps = this.string.codepoints.slice(start, end),
        s = _b_.repr(from_codepoint_list(cps, this.string.type))
    return `<re.Match object, span=(${start}, ${end}), match=${s}>`
}

MatchObject.prototype.last_matched_group = function(){
    var last_pos = -1,
        group_end,
        group,
        named_group
    for(var state of this.stack){
        if(state.model instanceof Group){
            if(state.matches.length > 0){
                group_end = state.matches[state.matches.length - 1].end
                if(group_end > last_pos){
                    last_pos = group_end
                    group = state.model.num
                    named_group = state.model.name
                }
            }
        }
    }
    return {group, named_group}
}

MatchObject.prototype.spans = function(){
    var result = {}
    for(var state of this.stack){
        if(state.model.groups){
            for(var group of state.model.groups){
                result[group.num] = result[group.num] || {start: state.pos}
                result[group.num].end = state.pos + state.ix
            }
        }
    }
    result[0] = {start: this.start, end: this.end}
    // Set named attributes
    for(var key in this.pattern.$groups){
        if(! isFinite(key)){
            result[key] = result[this.pattern.$groups[key].num]
        }
    }
    return result
}

var BMatchObject = $B.make_class("MatchObject",
    function(mo){
        if(mo){
            var group_obj = {}
            for(var state of mo.stack){
                if(state.type == "group" && ! state.model.non_capturing){
                    var matches = state.matches
                    if(matches.length > 0){
                        group_obj[state.model.num] = matches[matches.length - 1]
                        if(state.model.name !== undefined){
                            group_obj[state.model.name] = group_obj[state.model.num]
                        }
                    }
                }
            }
            return {
                __class__: BMatchObject,
                mo,
                group_obj,
                endpos: mo.endpos,
                string: mo.string.substring(0)
            }
        }
        return _b_.None
    }
)

BMatchObject.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, key: null},
                ['self', 'key'], arguments, {}, null, null),
        self = $.self,
        key = $.key
    if(Array.isArray(key)){
        throw _b_.IndexError.$factory("no such group")
    }
    if(key == 0){
        return self.string.substring(self.mo.start, self.mo.end)
    }
    var match = self.group_obj[key]
    if(match !== undefined){
        return self.string.substring(match.start, match.end)
    }else if(self.mo.pattern.groups[key] !== undefined){
        return _b_.None
    }
    throw _b_.IndexError.$factory("no such group")
}

BMatchObject.__repr__ = function(self){
    return self.mo.toString()
}

BMatchObject.__setitem__ = function(){
    throw _b_.TypeError.$factory("'re.Match' object does not " +
        "support item assignment")
}

BMatchObject.__str__ = BMatchObject.__repr__

BMatchObject.end = function(){
    var $ = $B.args('end', 2, {self: null, group: null}, ['self', 'group'],
                arguments, {group: 0}, null, null)
    var group = BMatchObject.group($.self, $.group)
    if(group === _b_.None){
        return -1
    }else if($.group == 0){
        return $.self.mo.end
    }else{
        return $.self.mo.$groups[$.group].end
    }
    return group.start
}

BMatchObject.expand = function(){
    var $ = $B.args("expand", 2, {self: null, template: null},
                ['self', 'template'], arguments, {}, null, null)
    var data = {
        repl: new StringObj($.template),
    }
    data = transform_repl(data, $.self.mo.pattern)
    if(typeof data.repl == "function"){
        return $B.$call(data.repl)(BMatchObject.$factory($.self.mo))
    }else{
        return data.repl1
    }
}

BMatchObject.group = function(self){
    var $ = $B.args("group", 1, {self: null}, ['self'], arguments,
                {}, 'args', null),
            self = $.self,
            args = $.args
    if(args.length == 0){
        args[0] = 0
    }
    var groups = self.mo.pattern.groups,
        result = []
    for(var group_id of args){
        if(group_id == 0){
            result.push(self.mo.string.substring(self.mo.start, self.mo.end))
            continue
        }
        try{
            // Convert group_id to int if possible
            group_id = $B.PyNumber_Index(group_id) // in py_utils.js
        }catch(err){
            // group_id can be an identifier
        }
        if(self.mo.pattern.groups[group_id] === undefined){
            throw _b_.IndexError.$factory("no such group")
        }
        var group = self.group_obj[group_id] // found in match
        result.push(group === undefined ?
            _b_.None :
            self.mo.string.substring(group.start, group.end))
    }
    if(args.length == 1){
        return result[0]
    }
    return $B.fast_tuple(result)
}

var GroupDict = $B.make_class("GroupDict")
GroupDict.__mro__ = [_b_.dict, _b_.object]
GroupDict.__setitem__ = function(){
    throw _b_.TypeError.$factory("read only")
}

BMatchObject.groupdict = function(){
    /*
    Return a dictionary containing all the named subgroups of the match, keyed
    by the subgroup name. The default argument is used for groups that did not
    participate in the match; it defaults to None.
    */
    var $ = $B.args("groupdict", 2, {self: null, default: null},
                ['self', 'default'], arguments, {default: _b_.None},
                null, null),
        groups = $.self.group_obj,
        d = $B.empty_dict()
    for(var key in $.self.mo.pattern.groups){
        if(! isFinite(key)){
            var num = $.self.mo.pattern.groups[key].num,
                value = groups[num] === undefined ? $.default : groups[num]
            if(value !== $.default){
                value = $.self.string.substring(value.start, value.end)
            }
            _b_.dict.$setitem(d, key, value)
        }
    }
    d.__class__ = GroupDict
    return d
}

BMatchObject.groups = function(self){
    var $ = $B.args("group", 2, {self: null, default: null},
                ['self', 'default'], arguments,
                {default: _b_.None}, null, null),
            self = $.self,
            _default = $.default
    var result = []
    if(self.mo === false){
        throw _b_.AttributeError.$factory("no attr groups")
    }
    var groups = self.group_obj
    for(var num in self.mo.pattern.groups){
        if(isFinite(num)){
            if(groups[num] === undefined){
                result[num] = _default
            }else{
                result[num] = self.mo.string.substring(groups[num].start,
                    groups[num].end)
            }
        }
    }
    result.shift() // group numbers start with 1
    return $B.fast_tuple(result)
}

BMatchObject.lastindex = {
    /* The integer index of the last matched capturing group, or None if no
       group was matched at all.
    */
    __get__: function(self){
        var last = self.mo.last_matched_group()
        return last.group === undefined ? _b_.None : last.group
    }
}

BMatchObject.lastgroup = {
    /* The name of the last matched capturing group, or None if the group
       didn’t have a name, or if no group was matched at all.
    */
    __get__: function(self){
        var last = self.mo.last_matched_group()
        return last.named_group === undefined ? _b_.None : last.named_group
    }
}

BMatchObject.pos = {
    __get__: function(self){
        return self.mo.start
    }
}

BMatchObject.re = {
    __get__: function(self){
        return self.mo.pattern.text
    }
}

BMatchObject.regs = {
    __get__: function(self){
        var res = [$B.fast_tuple([self.mo.start, self.mo.end])]
        for(var group_num in self.mo.pattern.groups){
            if(isFinite(group_num)){
                var group = self.mo.pattern.groups[group_num].item
                // group.pattern includes the opening and closing brackets
                res.push($B.fast_tuple([group.pos,
                    group.pos + group.pattern.length - 2]))
            }
        }
        return $B.fast_tuple(res)
    }
}

BMatchObject.span = function(){
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
            group = $.group,
            span = self.mo.spans()[group]
    if(span === undefined){
        return $B.fast_tuple([-1, -1])
    }
    return $B.fast_tuple([span.start, span.end])
}

BMatchObject.start = function(){
    var $ = $B.args('start', 2, {self: null, group: null}, ['self', 'group'],
                arguments, {group: 0}, null, null)
    var group = BMatchObject.group($.self, $.group)
    if(group === _b_.None){
        return -1
    }
    return group.start
}

BMatchObject.string = {
    __get__: function(self){
        return self.mo.string
    }
}

$B.set_func_names(BMatchObject, "re")

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
    repl = repl.replace(/\\a/g, '\a')
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
                groups = bmo.group_obj,
                s = mo.string,
                group
            for(var i = 1, len = parts.length; i < len; i += 2){
                if(groups[parts[i]] === undefined){
                    if(mo.pattern.groups[parts[i]] !== undefined){
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
                    res += s.substring(group.start, group.end)
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
    if(typeof obj == "string"){
        // Python object represented as a Javascript string
        this.string = obj
        for(var i = 0, len = obj.length; i < len; i++){
            var cp = obj.codePointAt(i)
            this.codepoints.push(cp)
            if(cp >= 0x10000){
                i++
            }
        }
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
        try{
            this.codepoints = _b_.list.$factory(obj)
        }catch(err){
            throw _b_.TypeError.$factory($B.class_name(obj) +
                ' cannot be interpreted as a string')
        }
    }
    this.length = this.codepoints.length
}

StringObj.prototype.substring = function(start, end){
    // Returns a string
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
    return this.string
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
    for(var bmo of $module.finditer(BPattern.$factory(pattern), string.to_str())){
        // finditer yields instances of BMatchObject
        var mo = bmo.mo // instance of MatchObject
        res += from_codepoint_list(string.codepoints.slice(pos, mo.start),
            string.type)
        if(typeof repl == "function"){
            res += $B.$call(repl)(bmo)
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
    res += from_codepoint_list(string.codepoints.slice(pos),
        string.type)
    if(pattern.type === "bytes"){
        res = _b_.str.encode(res, "latin-1")
    }
    return [res, nb_sub]
}

// escaped chars : '\t\n\x0b\x0c\r #$&()*+-.?[\\]^{|}~'
var escaped = [9, 10, 11, 12, 13, 32, 35, 36, 38, 40, 41, 42, 43, 45, 46, 63,
               91, 92, 93, 94, 123, 124, 125, 126]

function backtrack(stack, debug){
    var pos
    while(true){
        if(stack.length == 0){
            return false
        }
        var state = stack.pop()
        if(debug){
            console.log("in backtrack, state", state)
        }
        if(state.type == "group"){
            if(state.matches.length > state.model.repeat.min){
                // remove last match
                state.matches.pop()
                // reset to position of last try
                pos = state.start
                // set rank to next RE after group
                rank = state.model.end_rank + 1
            }else if(state.matches.length == 0 && ! state.has_matched &&
                    state.model.repeat.min == 0){
                state.has_matched = true
                // reset to position of last try
                pos = state.start
                // set rank to next RE after group
                rank = state.model.end_rank + 1
            }else{
                continue
            }
        }else{
            if(state.model.non_greedy &&
                    state.ix < state.mo.nb_max){
                state.ix++
            }else if(! state.model.non_greedy &&
                    state.ix > state.mo.nb_min){
                state.ix--
            }else{
                // No alternative number of repeats
                continue
            }
            pos = state.start + state.ix
            // Set rank to the following model
            var rank = state.rank + 1
        }
        // Put state back on the stack
        stack.push(state)
        return {rank, pos}
    }
}

function in_choice(model){
    // If the model is inside a Choice (set of RE joined by "|"), return the
    // Case instance (the RE where the model belongs)
    var parent = model.parent
    while(parent){
        if(parent instanceof Case){
            return parent
        }
        parent = parent.parent
    }
    return false
}

function* iterator(pattern, string, flags, original_string, pos, endpos){
    var result = [],
        pos = pos | 0,
        last_mo
    while(pos <= string.length){
        var mo = match(pattern, string, pos, flags, endpos)
        if(mo){
            yield BMatchObject.$factory(mo)
            if(mo.end == pos){
                pos++ // at least 1, else infinite loop
            }else{
                pos = mo.end
            }
        }else{
            pos++
        }
    }
    delete original_string.in_iteration
}

function match(pattern, string, pos, flags, endpos){
    /* Main algorithm
    pattern is the result of compile(). It has the attributes
    - path: a list of model: characters, groups
    - groups: a JS object mapping group numbers and names to an object
      {num, item} where num is the group number and item the group model
    - flags: the flags passed as argument to re.compile()
    - text: the pattern string

    string is an instance of StringObj, a representation of Python strings as
    a sequence of Unicode code points. It is used instead of Javascript
    strings because of the code points > 0x10000, represented as a string of
    length 2 in Javascript.

    pos is the position in the string where the match starts.

    flags is the argument flags passed to re.match(), .search() etc.

    endpos is the position where the match ends, as if the string ended at
    this position.
    */

    if(pattern.__class__ === BPattern){
        throw Error('pattern is a Python instance')
    }

    var debug = false
    if(debug){
        console.log("enter match1 loop, pattern", pattern,
            "string", string, "pos", pos)
        document.write("Pattern <b>" + pattern.text+"</b> string <b>" +
            string.string +"</b>")
        var table = document.createElement('TABLE')
        document.body.appendChild(table)
        var row = document.createElement('TR'),
            line = []
        for(var title of ['stack', 'pos', 'char', 'model']){
            line.push('<th>' + title + '</th>')
        }
        row.innerHTML = line.join('')
        table.appendChild(row)
    }

    var path = pattern.path
    for(var i = 0, len = path.length; i < len; i++){
        path[i].rank = i
    }

    var start = pos,
        rank = 0,
        groups = {0: {start}},
        group,
        mo,
        state,
        stack = [],
        ix,
        lookahead = false,
        lookbehind = false
    pos = pos || 0
    endpos = endpos === undefined ? string.codepoints.length : endpos
    if(endpos < pos){
        return false
    }
    var string0 = string
    string = new StringObj('')
    string.codepoints = string0.codepoints.slice(0, endpos)
    while(true){
        model = path[rank]
        if(debug){
            console.log(pos,
                string.codepoints[pos] === undefined ? undefined :
                    chr(string.codepoints[pos]),
                model + '',
                stack, model)
            var row = document.createElement('TR'),
                cell = document.createElement('TD')
            table.appendChild(row)
            row.appendChild(cell)
            var s = []
            for(var state of stack){
                if(state.type == "group"){
                    s.push("Gr#" + state.model.num)
                }else{
                    s.push(state.model.toString())
                }
            }
            cell.innerText = '{' + s.join(', ') + '}'
            cell = document.createElement('TD')
            cell.innerText = pos
            row.appendChild(cell)
            cell = document.createElement('TD')
            cell.innerText = string.codepoints[pos] === undefined ? '∅' :
                    chr(string.codepoints[pos])
            row.appendChild(cell)
            cell = document.createElement('TD')
            cell.innerText = model + ''
            row.appendChild(cell)
            /*
            console.log("rank", rank, "pos", pos,
                "char", string.codepoints[pos],
                "model", model, "stack", stack)
            */
            alert()
        }
        if(model === undefined){
            // match succeeds
            if(debug){
                console.log("groups", groups)
            }
            if(stack.length == 0){
                stack.start = pos
            }
            return new MatchObject(pattern, string0, stack, endpos)
        }
        if(! model.repeat){
            model.repeat = {min: 1, max: 1}
        }
        if(model instanceof SetFlags){
            if(flags === no_flag){
                flags = Flag.$factory(0)
            }
            for(var id of model.on_flags){
                flags = Flag.__or__(flags, inline_flags[id])
            }
            for(var id of model.off_flags){
                flags = Flag.__xor__(flags, inline_flags[id])
            }
            rank++
        }else if(model instanceof Group){
            // If group is repeated, .start is the position of the last
            // tried match
            var group_in_stack = false
            for(var state of stack){
                if(state.model === model){
                    group_in_stack = state
                    break
                }
            }
            if(! group_in_stack){
                stack.push({
                    type: "group",
                    start: pos,
                    model,
                    rank,
                    matches: []
                })
            }else{
                group_in_stack.start = pos
            }
            if(model.is_lookahead){
                lookahead = {model, pos}
            }else if(model.is_lookbehind){
                // evaluate content of lookbehind RE
                var len = 0,
                    choices = []
                for(var item of path.slice(rank + 1, model.end_rank)){
                    if(item instanceof GroupEnd){
                        if(item.group === $last(choices)){
                            choices.pop()
                        }
                        continue
                    }
                    if(choices.length > 0){
                        continue
                    }
                    if(item instanceof BackReference){
                        // get codepoints matched by group
                        var br_state
                        for(var state of stack){
                            if(state.type == "group" &&
                                    (state.model.num == item.value ||
                                     state.model.name == item.value)){
                                 br_state = state
                                 break
                            }
                        }
                        if(br_state.matches.length > 0){
                            var start = br_state.matches[0].start,
                                end = br_state.matches[br_state.matches.length - 1].end
                            len += end - start
                        }
                    }else if(item instanceof Or){
                        // all options have the same length: ignore all items
                        // until group end
                        choices.push(item.group)
                    }else{
                        if(item.fixed_length === undefined){
                            console.log("no fixed length", item)
                        }
                        len += item.fixed_length()
                    }
                }
                lookbehind = {model, pos}
                pos -= len // go back by length of lookbehind RE
            }
            rank++
        }else if(model instanceof GroupEnd){
            var i = stack.length - 1
            while(stack[i].model !== model.group){
                if(stack[i].type != "group"){
                    if((state.model.non_greedy &&
                            state.ix >= state.model.repeat.max - 1) ||
                       (! stack[i].model.non_greedy &&
                            stack[i].ix == stack[i].model.repeat.min)){
                        stack.splice(i, 1)
                    }
                }
                i--
                if(i < 0){
                    console.log("pattern", pattern, "string", string,
                        "stack", stack, "model", model)
                    throw Error("group start not found")
                }
            }
            state = stack[i]
            if(debug){
                console.log("GroupEnd", state, "pos", pos, "mo", mo)
                alert()
            }
            if(state.model.type == "lookahead_assertion"){
                // lookahead doesn't consume the string: reset pos
                pos = state.start
                lookahead = false
                //stack.splice(i, 1)
                rank++
            }else if(state.model.type == "positive_lookbehind"){
                // lookbehind
                if(debug){
                    console.log("end of lookbehind, pos", pos)
                    alert()
                }
                lookbehind = false
                rank++
            }else if(state.model.type == "negative_lookbehind"){
                // negative lookbehind succeeds: backtrack
                if(debug){
                    console.log("negative lookbehind succeeds, backtrack")
                    alert()
                }
                var bt = backtrack(stack)
                if(bt){
                    rank = bt.rank
                    pos = bt.pos
                    continue
                }else{
                    return false
                }
            }else{
                // .last_match is the [start, end] of the last successful
                // match
                state.has_matched = true
                state.matches.push({start: state.start, end: pos})
                if(state.matches.length == 65535){
                    // Python issue 9669
                    return false
                }
                if(state.matches.length < state.model.repeat.max){
                    // group can be repeated at least once: go back to group
                    // start
                    state.start = pos
                    rank = state.model.rank + 1
                    continue
                }else{
                    rank++
                    if(debug){
                        console.log('group end', state,
                            'cannot repeat group, go to next rank', rank)
                    }
                    continue
                }
            }
        }else if(model instanceof Or){
            // If we reach a "|", one of the previous options succeeded
            // Skip the next options

            var or_group = model.group
            if(model.group){
                rank = model.group.end_rank
            }else{
                rank = path.length
            }
        }else if(model instanceof ConditionalBackref){
            stack.push({
                type: "group",
                start: pos,
                model,
                rank,
                matches: []
            })
            var cb_group = false
            for(state of stack){
                if(state.type == "group" &&
                        (state.model.num == model.group_ref ||
                         state.model.name == model.group_ref)){
                     cb_group = state
                     if(debug){
                         console.log("conditional backref group", cb_group)
                     }
                     break
                }
            }
            if(cb_group && cb_group.matches.length > 0){
                // use first option
                rank++
            }else{
                while(true){
                    rank++
                    if(path[rank] instanceof Or){
                        // ready to read RE if group doesn't exist
                        break
                    }else if(path[rank] instanceof GroupEnd &&
                            path[rank].group === model){
                        // no alternative
                        break
                    }
                }
                rank++
            }
        }else{
            if(model instanceof BackReference){
                var br_group = pattern.groups[model.value]
                if(br_group === undefined){
                    fail("unknown group " + model.value)
                }
                br_group = br_group.item
                var group_state = false
                for(var state of stack){
                    if(state.type == "group" && state.model == br_group){
                        group_state = state
                        break
                    }
                }
                if(! group_state){
                    mo = false
                }else if(group_state.matches.length == 0){
                    // The referenced group matched with 0 repetition.
                    // Add BackReference to stack and set mo to false.
                    stack.push({
                        type: "group",
                        start: pos,
                        model,
                        rank,
                        matches: []
                    })
                    mo = false
                }else{
                    group = $last(group_state.matches)
                    mo = model.match(string, pos, group)
                    if(debug){
                        console.log("backref", group, "mo", mo)
                        alert()
                    }
                }
            }else{
                if(model.match === undefined){
                    console.log("no match", model)
                    throw _b_.AttributeError.$factory('match')
                }
                mo = model.match(string, pos, flags)
            }
            // Method match() of models return a JS object with
            // {nb_min, nb_max}, or a list of such objects
            // If model is a group, mo has key `group_num`
            if(debug){
                if(mo){
                    console.log("match", mo.nb_min, mo.nb_max,
                        string.substring(pos, pos + mo.nb_max))
                    document.write(string.substring(pos, pos + mo.nb_max) +
                        '<br>')
                }else{
                    console.log("no match")
                    document.write("no match</br>")
                }
            }
            if(mo){
                // Create a state, based on the model, the current position in
                // the string, and all the match objects returned by
                // model.match(string, pos)
                // A state represents a part of the string that is matched by
                // one of the match objects.
                ix = model.non_greedy ? mo.nb_min : mo.nb_max
                state = {
                    model,
                    start: pos,
                    rank,
                    mo, // list of match objects, of the form {nb_min, nb_max}
                    ix, // the state represents the match of mo[num] with
                       // string[pos:pos + ix]
                    toString: function(){
                        return model + ' ' + pos + '-' + ix
                    }
                }
                stack.push(state)
                pos += ix
                if(groups[0].end === undefined | pos > groups[0].end){
                    groups[0].end = pos
                }
                rank++
            }else{
                if(debug){
                    console.log("model doesn't match", model,
                        "lookahead", lookahead,
                        "stack", stack)
                    alert()
                }
                // Is the current model an option in a "|" ?
                var is_option = false,
                    parent = model.parent

                while(parent){
                    if(parent instanceof Case){
                        // The model that failed was inside a choice.
                        // The choice is inside a group, or at the upper RE
                        // level
                        // If there is another choice, restore the stack
                        // and the position in string as they were
                        // when entering the group
                        is_option = true

                        var choice = parent.parent,
                            i = 0
                        // group of choice
                        var choice_group = 0,
                            choice_parent = choice.parent
                        while(choice_parent){
                            if(choice_parent instanceof Group){
                                choice_group = choice_parent
                                break
                            }
                            choice_parent = choice_parent.parent
                        }
                        if(choice_group == 0){
                            // choice is at global RE level
                            match_start = start
                        }else{
                            group = false
                            state = false
                            var choice_state
                            for(var state of stack){
                                if(state.model === choice_group){
                                    choice_state = state
                                    break
                                }
                            }
                            // XXX same as in GroupEnd
                            var i = stack.length - 1
                            while(stack[i].model !== choice_group){
                                if(stack[i].type != "group"){
                                    if((state.model.non_greedy &&
                                            state.ix >= state.model.repeat.max - 1) ||
                                       (! stack[i].model.non_greedy &&
                                            stack[i].ix == stack[i].model.repeat.min)){
                                        stack.splice(i, 1)
                                    }
                                }else{
                                    // remove group if choice_group didn't match
                                    if(! choice_state.has_matched){
                                        if(debug){
                                            console.log("choice_group", choice_group,
                                            "remove state", stack[i])
                                        }
                                        stack.splice(i, 1)
                                    }
                                }
                                i--
                                if(i < 0){
                                    console.log("pattern", pattern, "string", string,
                                        "satck", stack, "model", model)
                                    throw Error("group start not found")
                                }
                            }
                            state = stack[i]
                            var match_start = state.matches.length > 0 ?
                                    state.matches[state.matches.length - 1].end :
                                    state.start
                        }
                        // get option number inside choice
                        i = 0
                        while(true){
                            if(choice.items[i] === parent){
                                break
                            }
                            i++
                        }
                        if(i < choice.items.length - 1){
                            // reset position in string
                            pos = match_start
                            // try next choice
                            // set rank to next option start
                            var _case = choice.items[i + 1],
                                rank = _case.items[0].rank
                        }else{
                            // all options have been tried
                            if(debug){
                                console.log("no option left", choice_group, "fails")
                                console.log("stack", stack)
                                alert()
                            }
                            if(choice_group != 0 &&
                                    state.matches.length >= state.model.repeat.min &&
                                    state.matches.length < state.model.repeat.max){
                                // failure is accepted: skip to next RE
                                rank = state.model.end_rank + 1
                            }else{
                                is_option = false
                            }
                        }
                        break
                    }
                    parent = parent.parent
                }
                if(is_option){
                    // The model that failed was in a '|' with a remaining
                    // option
                    if(debug){
                        console.log("next option", path[rank])
                    }
                }else{
                    if(debug){
                        console.log("no more option", model)
                    }
                    if(lookahead){
                        if(lookahead.model.type == "negative_lookahead_assertion"){
                            // failure of a negative lookahead is ok: proceed to the
                            // item after lookahead RE
                            // reset pos to lookahead start
                            pos = lookahead.pos
                            // jump to rank after lookahead end
                            rank = lookahead.model.end_rank + 1
                            lookahead = false
                            continue
                        }else{
                            // positive lookahead fails
                            var bt = backtrack(stack)
                            if(bt){
                                rank = bt.rank
                                pos = bt.pos
                                continue
                            }else{
                                return false
                            }
                        }
                    }
                    if(lookbehind){
                        if(lookbehind.model.type == "negative_lookbehind"){
                            // failure of a negative lookbehind is ok: proceed to the
                            // item after lookahead RE
                            // reset pos to lookbehind start
                            pos = lookbehind.pos
                            // jump to rank after lookahead end
                            rank = lookbehind.model.end_rank + 1
                            lookbehind = false
                            continue
                        }else{
                            // positive lookbehind fails
                            var bt = backtrack(stack)
                            if(bt){
                                rank = bt.rank
                                pos = bt.pos
                                continue
                            }else{
                                return false
                            }
                        }
                    }
                    if(model.groups && model.groups.length > 0){
                        // The model that fails is in a group
                        // Get first enclosing group
                        group = model.groups[model.groups.length - 1]
                        for(var state of stack){
                            if(state.model === group){
                                break
                            }
                        }
                        if(debug){
                            console.log("failing model in group", group,
                                "state", state)
                            alert()
                        }
                        if(state.matches.length >= state.model.repeat.min &&
                                state.has_matched){
                            // If the model that fails is in a group that has
                            // already matched, and has the minimal number of
                            // repetitions, proceed to next RE after group
                            rank = state.model.end_rank + 1
                            pos = state.start
                            continue
                        }
                    }

                    // Backtracking: if one of the previous matches was
                    // repeated, try more or less repetitions
                    if(debug){
                        console.log("backtrack")
                    }
                    var bt = backtrack(stack, debug)
                    if(bt){
                        rank = bt.rank
                        pos = bt.pos
                    }else{
                        return false
                    }
                }
            }
        }
    }
}

var $module = {
    compile: function(){
        var $ = $B.args("compile", 2, {pattern: null, flags: null},
                    ['pattern', 'flags'], arguments, {flags: no_flag},
                    null, null)
        if($.pattern && $.pattern.__class__ === BPattern){
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

        var iter = $module.finditer.apply(null, arguments),
            res = []
        while(true){
            var next = iter.next()
            if(next.done){
                return res
            }
            var bmo = next.value,
                mo = bmo.mo,
                groups = BMatchObject.groups(bmo)

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
        }else{
            data = prepare({pattern, string})
            pattern = compile(data.pattern, flags)
        }
        return BMatchObject.$factory(match(pattern, data.string, 0, flags))
    },
    Pattern: BPattern,
    purge: function(){
        var $ = $B.args("purge", 0, {}, [], arguments, {}, null, null)
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
        var pos = 0
        while(pos < data.string.codepoints.length){
            var mo = match(data.pattern.$pattern, data.string, pos, flags)
            if(mo){
                return BMatchObject.$factory(mo)
            }else{
                pos++
            }
        }
        return _b_.None
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
        for(var bmo of $module.finditer(pattern, $.string)){
            var mo = bmo.mo // finditer returns instances of BMatchObject
            res.push(data.string.substring(pos, mo.start))
            for(var key in mo.pattern.groups){
                if(isFinite(key)){
                    if(bmo.group_obj[key] !== undefined){
                        res.push(data.string.substring(bmo.group_obj[key].start,
                            bmo.group_obj[key].end))
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
        console.log("subn pattern", pattern)
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

