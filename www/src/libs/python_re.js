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

function fail(message, pos){
    var err = error.$factory(message)
    err.pos = pos
    throw err
}

function warn(klass, message, pos){
    var warning = klass.$factory(message)
    warning.pos = pos
    // module _warning is in builtin_modules.js
    $B.imported._warnings.warn(warning)
}

var Flag = $B.make_class("Flag",
    function(name, value){
        return {
            __class__: Flag,
            name,
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
    return Flag.$factory(`${self.name} ${other.name}`,
        self.value | other.value)
}

Flag.__str__ = function(self){
    if(self.value == 0){
        return "re.none"
    }
    var t = []
    for(var flag of 'iLmsuxa'){
        if(self.value & inline_flags[flag].value){
            t.push(inline_flags[flag].name)
        }
    }
    return 're.' + t.join(' ')
}

$B.set_func_names(Flag, "re")

var no_flag = {}

var BPattern = $B.make_class("Pattern",
    function(pattern){
        pattern.__class__ = BPattern
        return pattern
    }
)

BPattern.findall = function(self){
    return $module.findall.apply(null, arguments)
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
    var mo = match($.self, data.string, $.pos, no_flag, $.endpos)
    if(mo === false){
        return _b_.None
    }
    return BMatchObject.$factory(mo)
}

BPattern.sub = function(){
    return $module.sub.apply(null, arguments)
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

BackReference.prototype.match = function(string, pos){
    var group = this.get_group()
    if(group){
        // compare string codepoints starting at pos with the group codepoints
        var group_cps = group.item.match_codepoints
        if(group_cps.length == 0){
            return false
        }
        for(var i = 0, len = group_cps.length; i < len; i++){
            if(group_cps[i] != string.codepoints[pos + i]){
                return false
            }
        }
        var cps = group_cps.slice()
        for(var group of this.groups){
            group.match_codepoints = group.match_codepoints.concat(cps)
            group.nb_success++
        }
        return cps
    }
    return false
}

BackReference.prototype.search = function(string){
    var group = this.get_group()
    if(group){
        if(group.item.match_codepoints.length == 0){
            return -1
        }
        return group.item.search(string)
    }
    return -1
}

var Case = function(){
    this.name = "Case"
    this.items = []
}

Case.prototype.add = Node.prototype.add

var Choice = function(){
    this.type = "choice"
    this.items = []
    this.groups = []
}

Case.prototype.fixed_length = function(){
    // Return sum of items lengths if they are fixed, else undefined
    var len = 0
    for(var item of this.items){
        var sublen = item.fixed_length()
        if(sublen === undefined){
            return undefined
        }
        len += sublen
    }
    return len
}

Choice.prototype.add = Node.prototype.add

Choice.prototype.fixed_length = function(){
    // Return a length if all options have the same fixed_length, otherwise
    // return undefined
    var len
    for(var _case of this.items){
        var sublen = _case.fixed_length()
        if(sublen === undefined){
            return undefined
        }
        if(len === undefined){
            len = sublen
        }else if(sublen != len){
            return undefined
        }
    }
    return len
}

var EmptyString = {
        toString: function(){
            return ''
        },
        length: 0
    },
    Flags = function(flags){
        this.flags = flags
    },
    GroupEnd = function(pos){
        this.name = "GroupEnd",
        this.pos = pos
    },
    Or = function(pos){
        this.name = "Or"
        this.pos = pos
    },
    Repeater = function(pos, op, greedy){
        this.name = "Repeater"
        this.pos = pos
        this.op = op
        this.greedy = greedy !== undefined
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
    this.match_codepoints = []
    this.nb_success = 0
    this.groups = []
    if(groups){
        for(var group of groups){
            this.groups.push(group)
            group.chars.push(this)
        }
    }
}

Char.prototype.accepts_backtracking = function(){
    // Called when a repeated model succeeded.
    if(! this.repeat){
        return false
    }
    // Return true if the string currently matching the model is
    // compatible with the repeat option
    if(this.repeat.op == '+' && this.nb_success == 1){
        // group with the '+' repeat and no string matched
        return false
    }else if(Array.isArray(this.repeat.op)){
        // test fails if there are too many repeats
        if(this.repeat.op.length == 1 &&
                this.nb_success == this.repeat.op[0]){
            return false
        }else if(this.nb_success == this.repeat.op[1]){
            return false
        }
    }else if(this.repeat.op == "?" && this.nb_success == 0){
        return false
    }
    return true
}

Char.prototype.fixed_length = function(){
    if(this.repeat){
        return undefined
    }
    return this.char === EmptyString ? 0 : 1
}

Char.prototype.search = function(string){
    // Return the first position where Char matches in string
    if(this.cp === EmptyString){
        return 0
    }
    var match = false,
        pos = 0,
        cp

    while(pos < string.codepoints.length){
        cp = string.codepoints[pos]
        if(this.flags && this.flags.value & IGNORECASE.value){
            var char = chr(cp)
            if(char.toUpperCase() == this.char.toUpperCase() ||
                    char.toLowerCase() == this.char.toLowerCase()){
                return pos
            }
        }else if(this.cp == cp){
            return pos
        }
        pos++
    }
    return -1
}

Char.prototype.match = function(string, pos){

    if(this.repeat){
        // minimum and maximum number of repeats allowed
        var n1,
            n2,
            len = string.codepoints.length
        if(Array.isArray(this.repeat.op)){
            n1 = this.repeat.op[0],
            n2 = this.repeat.op[1]
        }else if(this.repeat.op == "?"){
            n1 = 0
            n2 = 1
        }else if('+*'.indexOf(this.repeat.op) > -1){
            n1 = 1 // case 0 for * is handled in accept_failure()
            n2 = len
        }
        var i = pos,
            n = n2 === undefined ? n1 : n2

        // browse string codepoints until they don't match, or the number of
        // matches is above the maximum allowed
        if(this.flags && (this.flags.value & IGNORECASE.value)){
            // flag IGNORECASE set
            var char_upper = this.char.toUpperCase(),
                char_lower = this.char.toLowerCase()
            while(i - pos < n && i < len){
                var char = chr(string.codepoints[i])
                if(char.toUpperCase() != char_upper &&
                        char.toLowerCase() != char_lower){
                   break
                }
                i++
            }
        }else{
            while(string.codepoints[i] == this.cp && i - pos < n){
                i++
            }
        }
        var nb = i - pos
        if((n2 === undefined && nb == n) ||
                (n2 !== undefined && nb >= n1 && nb <= n2)){
            // Number of repeats ok
            this.nb_success += nb
            var match = string.codepoints.slice(pos, i)
            this.update_groups(match)
            this.match_codepoints = this.match_codepoints.concat(match)
            return match
        }else{
            return false
        }
    }

    // No repeat: only check the codepoint at specified position
    var match = false,
        cp = string.codepoints[pos]

    if(cp === undefined && this.cp !== EmptyString){
        // end of string
        return false
    }else if(this.cp === EmptyString){
        test = true
        cp = EmptyString
        match = []
    }else{
        if(this.flags && this.flags.value & IGNORECASE.value){
            var char = chr(cp)
            if(char.toUpperCase() == this.char.toUpperCase() ||
                    char.toLowerCase() == this.char.toLowerCase()){
                match = [cp]
            }
        }else if(this.cp == cp){
            match = [cp]
        }
    }

    if(match){
        if(this.repeat){
            this.nb_success++
            if(! this.accepts_success()){
                return false
            }
        }
        this.update_groups(match)
        this.match_codepoints = this.match_codepoints.concat(match)
        return match
    }
    return false
}

Char.prototype.update_groups = function(match){
    var top = get_top(this)
    for(var group of this.groups){
        if(group.num !== undefined){
            top.group_match_indices.splice(0, 0, group.num + 1) // used for lastindex
            group.match_codepoints = group.match_codepoints.concat(match)
            group.nb_success++
        }
    }
}

function CharacterClass(pos, cp, length, groups){
    this.cp = cp
    this.value = chr(cp)
    this.length = length
    this.pos = pos

    this.match_codepoints = []
    this.nb_success = 0
    this.groups = []
    if(groups){
        for(var group of groups){
            this.groups.push(group)
            group.chars.push(this)
        }
    }
}

CharacterClass.prototype.accepts_backtracking = Char.prototype.accepts_backtracking

CharacterClass.prototype.match = function(string, pos){
    var flags = this.flags,
        cp = string.codepoints[pos],
        match = false

    if(this.repeat){
        // minimum and maximum number of repeats allowed
        var n1,
            n2,
            len = string.codepoints.length
        if(Array.isArray(this.repeat.op)){
            n1 = this.repeat.op[0],
            n2 = this.repeat.op[1]
        }else if(this.repeat.op == "?"){
            n1 = 0
            n2 = 1
        }else if('+*'.indexOf(this.repeat.op) > -1){
            n1 = 1 // case 0 for * is handled in accept_failure()
            n2 = len
        }
    }
    if(pos >= string.codepoints.length){
        cp = EmptyString
    }
    switch(this.value){
        case 'A':
            if(pos == 0){
                match = []
            }
            break
        case 's':
            if($B.unicode_tables.Zs[cp] !== undefined ||
                    $B.unicode_bidi_whitespace.indexOf(cp) > -1){
                match = [cp]
            }
            break
        case 'S':
            if($B.unicode_tables.Zs[cp] === undefined &&
                    $B.unicode_bidi_whitespace.indexOf(cp) == -1){
                match = [cp]
            }
            break
        case '.':
            if(this.repeat){
                var i = pos
                if(flags && flags.value & DOTALL.value){
                    match = string.codepoints.slice(pos, pos + n2)
                }else{
                    while(i < n2 && string.codepoints[i] != 10){
                        i++
                    }
                    if(i < n1){
                        return false
                    }
                    match = string.codepoints.slice(pos, i)
                }
            }else{
                if(cp != 10 || (flags && flags.value & DOTALL.value)){
                    match = [cp]
                }
            }
            break
        case 'd':
            if($B.unicode_tables.numeric[cp] !== undefined){
                match = [cp]
            }
            break
        case 'D':
            if($B.unicode_tables.numeric[cp] === undefined){
                match = [cp]
            }
            break
        case 'b':
            if((pos == 0 && is_word[cp]) ||
                   (pos == string.codepoints.length &&
                       is_word[string.codepoints[pos - 1]]) ||
                    is_word[cp] != is_word[string.codepoints[pos - 1]]){
                match = []
            }
            break
        case 'B':
            var test = (pos == 0 && is_word[cp]) ||
                   (pos == string.codepoints.length &&
                       is_word[string.codepoints[pos - 1]]) ||
                    is_word[cp] != is_word[string.codepoints[pos - 1]]
            if(! test){
                match = []
            }
            break
        case 'w':
            if(is_word[cp]){
                match = [cp]
            }
            break
        case 'W':
            if(! is_word[cp]){
                match = [cp]
            }
            break
        case 'Z':
            if(pos >= string.codepoints.length){
                match = []
            }
            break
    }
    if(match){
        if(this.repeat){
            this.nb_success++
            if(! this.accepts_success()){
                return false
            }
        }
        for(var group of this.groups){
            if(group.num !== undefined){
                group.match_codepoints = group.match_codepoints.concat(match)
                group.nb_success++
            }
        }
        this.match_codepoints = this.match_codepoints.concat(match)
        return match
    }
    return false
}

CharacterClass.prototype.toString = function(){
    return '\\' + this.value
}

var CharacterSet = function(pos, set, groups){
    // character set
    this.pos = pos
    this.items = set.items
    this.neg = set.neg

    this.match_codepoints = []
    this.nb_success = 0
    this.groups = []
    if(groups){
        for(var group of groups){
            this.groups.push(group)
            group.chars.push(this)
        }
    }
}

CharacterSet.prototype.accepts_backtracking = Char.prototype.accepts_backtracking

CharacterSet.prototype.match = function(string, pos){
    var flags = this.flags,
        test,
        cp = string.codepoints[pos],
        match = false

    if(pos >= string.codepoints.length){
        cp = EmptyString
    }

    var char = $B.codepoint2jsstring(cp),
        ignore_case = this.flags && (this.flags.value & IGNORECASE.value),
        cps = cased_cps(cp, ignore_case, this.flags.value & ASCII.value),
        char_is_cased = cps.length > 1

    for(var cp1 of cps){
        for(var item of this.items){
            if(Array.isArray(item.ord)){
                if(cp1 >= item.ord[0] &&
                        cp1 <= item.ord[1]){
                    match = [cp]
                    break
                }else if(ignore_case && char_is_cased){
                    var start1 = chr(item.ord[0]).toUpperCase(),
                        end1 = chr(item.ord[1]).toUpperCase(),
                        char1 = char.toUpperCase()
                    if(char1 >= start1 && char1 <= end1){
                        match = [cp]
                    }
                    var start1 = chr(item.ord[0]).toLowerCase(),
                        end1 = chr(item.ord[1]).toLowerCase(),
                        char1 = char.toLowerCase()
                    if(char1 >= start1 && char1 <= end1){
                        match = [cp]
                    }
                }
            }else if(item instanceof CharacterClass){
                match = item.match(string, pos)
            }else{
                if(item.ord == cp1){
                    match = [cp]
                    break
                }
                if(ignore_case && char_is_cased &&
                        (char.toUpperCase() == chr(item.ord).toUpperCase() ||
                        char.toLowerCase() == chr(item.ord).toLowerCase())){
                    match = [cp]
                    break
                }
            }
        }
    }
    if(this.neg){
        match = match ? false : [cp]
    }
    if(match){
        if(this.repeat){
            this.nb_success++
            if(! this.accepts_success()){
                return false
            }
        }
        for(var group of this.groups){
            if(group.num !== undefined){
                group.match_codepoints = group.match_codepoints.concat(match)
                group.nb_success++
            }
        }
        this.match_codepoints = this.match_codepoints.concat(match)
    }
    return match
}


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
    var fl1 = this.re_if_exists.fixed_length(),
        fl2 = this.re_if_not_exists.fixed_length()
    if(fl1 === undefined || fl2 === undefined ||
            fl1 != fl2){
        return undefined
    }
    return fl1
}

ConditionalBackref.prototype.match = function(s, pos){
    var group_ref = this.group_ref
    var re = this.parent
    while(re.parent){
        re = re.parent
    }
    var test
    if(re.$groups[group_ref] && re.$groups[group_ref].item.nb_success != 0){
        test = match(this.re_if_exists, s, pos)
        this.re = this.re_if_exists
    }else{
        test = match(this.re_if_not_exists, s, pos)
        this.re = this.re_if_not_exists
    }
    return test.match_codepoints
}

ConditionalBackref.prototype.search = function(string){
    if(this.re.search === undefined){
        console.log("re has no search", this.re)
        throw _b_.AttributeError.$factory("search")
    }
    return this.re.search(string)
}

var Group = function(pos, extension){
    this.type = "group"
    this.pos = pos
    this.items = []
    this.chars = []
    this.groups = []
    this.match_codepoints = []
    this.nb_success = 0
    this.extension = extension
    if(extension && extension.type){
        if(extension.type.indexOf('lookahead') > -1){
            this.is_lookahead = true
        }else if(extension.type.indexOf('lookbehind') > -1){
            this.is_lookbehind = true
        }
    }
}

Group.prototype.add = Node.prototype.add

Group.prototype.search = function(string){
    var save = {
        nb_success: this.nb_success,
        match_codepoints: this.match_codepoints.slice()
    }
    var res = -1
    for(var i = 0, len = string.codepoints.length; i < len; i++){
        this.nb_success = 0
        this.match_codepoints = []
        if(this.match(string, i)){
            res = i
            break
        }
    }
    this.nb_success = save.nb_success
    this.match_codepoints = save.match_codepoints
    return res
}

Group.prototype.match = function(s, pos){
    var group_match
    if(this.is_lookahead){
        var save_cps
        if(this.parent.match_codepoints !== undefined){
            save_cps = this.parent.match_codepoints.slice()
        }
        group_match = match1(this, s, pos)
        if(save_cps !== undefined){
            // restore parents matches
            var nb_cps = this.parent.match_codepoints.length - save_cps.length,
                parent = this.parent
            while(parent.parent !== undefined){
                for(var i = 0; i < nb_cps; i++){
                    parent.match_codepoints.pop()
                }
                parent = parent.parent
            }
        }
        if(this.extension.type == "lookahead_assertion"){
            return group_match ? [] : false
        }else{
            return group_match ? false : []
        }
    }else if(this.is_lookbehind){
        // pos is the position after the item that must not be preceded
        // by this
        var start = pos - this.length,
            s1 = new StringObj(s.substring(start, pos)),
            group_match = match1(this, s1, 0)
        console.log("substring", s1, "group match", group_match)
        if(group_match && group_match.length == pos - start){
            return []
        }
        return false
    }else{
        group_match = match1(this, s, pos)
        console.log("group", this, "group_match", group_match)
        if(group_match){
            this.match_start = group_match.start
            this.match_end = group_match.end
        }
    }
    if(group_match){
        if(this.repeat){
            // test if repeat condition is still ok
            if(! this.accepts_success()){
                console.log("group match mais pas accept success")
                return false
            }
        }
    }
    return group_match.codepoints
}

Group.prototype.match_string = function(){
    return from_codepoint_list(this.match_codepoints)
}

Group.prototype.accepts_success = function(){
    // Called when a repeated model succeeded.
    // Return true if the string currently matching the model is
    // compatible with the repeat option
    if(this.repeat.op == '?' && this.nb_success > 1){
        return false
    }else if(this.repeat.op == '+' && this.nb_success == 0){
        // group with the '+' repeat and no string matched
        return false
    }else if(Array.isArray(this.repeat.op)){
        // test fails if there are too many repeats
        if(this.repeat.op.length == 1 &&
                this.nb_success > this.repeat.op[0]){
            return false
        }else if(this.nb_success > this.repeat.op[1]){
            return false
        }
    }
    return true
}

Group.prototype.accepts_failure = function(){
    // Called when a repeated model failed.
    // Return true if the string currently matching the model is
    // compatible with the repeat option
    if(this.repeat.op == '?' && this.nb_success > 1){
        return false
    }if(this.repeat.op == '+' && this.nb_success == 0){
        // group with the '+' repeat and no string matched
        return false
    }else if(Array.isArray(this.repeat.op)){
        // test fails if the number of repeats is not correct
        if(this.repeat.op.length == 1 &&
                this.nb_success != this.repeat.op[0]){
            return false
        }else if(this.nb_success < this.repeat.op[0] ||
                this.nb_success > this.repeat.op[1]){
            return false
        }
    }
    return true
}

Group.prototype.done = function(){
    // Return true if a repeated model that succeeded does not allow any
    // additional character.
    if(this.repeat.op == '?' && this.nb_success == 1){
        return true
    }else if(Array.isArray(this.repeat.op)){
        // test fails if the number of repeats is not correct
        if(this.repeat.op.length == 1 &&
                this.nb_success == this.repeat.op[0]){
            return true
        }else if(this.nb_success == this.repeat.op[1]){
            return true
        }
    }
    return false
}

Group.prototype.min_repeat = function(){
    // For repeated characters, return the minimum number of repeats
    var n1
    if(Array.isArray(this.repeat.op)){
        return this.repeat.op[0]
    }else if(this.repeat.op == "?"){
        return 0
    }else if(this.repeat.op == '+'){
        return 1
    }else if(this.repeat.op == '*'){
        return 0
    }
}

Group.prototype.accepts_backtracking = Char.prototype.accepts_backtracking
Group.prototype.fixed_length = Node.prototype.fixed_length

function GroupRef(group_num, item){
    this.num = group_num
    this.item = item
}

GroupRef.prototype.fixed_length = function(){
    return this.item.fixed_length()
}

for(klass of [BackReference, Char, CharacterClass, CharacterSet]){
    klass.prototype.accepts_failure = Group.prototype.accepts_failure
    klass.prototype.accepts_success = Group.prototype.accepts_success
    klass.prototype.done = Group.prototype.done
    klass.prototype.min_repeat = Group.prototype.min_repeat
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
    var top = get_top(this)
    if(top.flags.value && MULTILINE.value){
        return (pos == 0 || string.string[pos - 1] == '\n') ? [] : false
    }
    return pos == 0 ? [] : false
}

StringStart.prototype.fixed_length = function(){
    return 0
}

function StringEnd(pos){
    this.pos = pos
}

StringEnd.prototype.search = function(string, full_string){
    // Used for backtracking. Since StringEnd is always found in a string:
    // - if flag MULTILINE is set and \n is found in string, return its
    //   position
    // - otherwise, if full_string has the same length as string, return
    //   string length
    // - else return false
    if(this.flag && this.flag.value & MULTILINE.value){
        var res = string.codepoints.indexOf(10)
        if(res > -1){
            return res
        }
    }
    if(string.codepoints.length == full_string.codepoints.length){
        return string.codepoints.length
    }
    return -1
}

StringEnd.prototype.match = function(string, pos){
    var top = get_top(this)
    if(top.flags.value & MULTILINE.value){
        return (pos > string.codepoints.length - 1 ||
            string.string[pos] == '\n') ? [] : false
    }
    return pos > string.codepoints.length - 1 ? [] :
           (pos == string.codepoints.length - 1 &&
               string.codepoints[pos] == 10) ? [] : false
}

StringEnd.prototype.fixed_length = function(){
    return 0
}

function read(name, pos){
    var code = name.charCodeAt(pos),
        len = 1
    if(code >= 0xd800 && code <= 0xdbff){
        // surrogate pair
        code = 0x10000
        code += (name.charCodeAt(pos) & 0x03FF) << 10
        code += (name.charCodeAt(pos + 1) & 0x03FF)
        len = 2
    }
    return [code, len]
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
            console.log("bad character", pos, name, name.charCodeAt(pos))
            fail(`bad character in group name '${sname}'`)
        }
    }else{
        fail(`bad character in group name '${sname}'`)
    }
}

function ord_to_char(ord){
    char = _b_.chr(ord)
    if(char.__class__ === _b_.str.$surrogate){
        char = char.items[0]
    }
    return char
}

var chr = ord_to_char

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
                char: ord_to_char(octal_value),
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

function compile(data, flags){
    // data has attributes "pattern" (instance of StringObj)
    // and "type" ("str" or "bytes")
    pattern = data.pattern.codepoints
    type = data.type
    var is_bytes = type !== "str"
    if(is_bytes){
        flags = Flag.$factory('', flags.value | ASCII.value)
    }
    var group_num = 0,
        group_stack = [],
        groups = {},
        subitems = [],
        pos,
        lookbehind,
        node = new Node()
    node.$groups = groups
    if(flags === no_flag){
        flags = Flag.$factory("", 32) // default is Unicode
    }
    if(pattern.__class__ === _b_.str.$surrogate){
        pattern = pattern.items
        pattern.substring = function(start, stop){
            return this.slice(start, stop).join('')
        }
    }
    var tokenized = []
    for(var item of tokenize(pattern, type)){
        if(lookbehind){
            item.lookbehind = lookbehind
            lookbehind.parent = item
            lookbehind = false
        }
        if(item instanceof Group){
            group_stack.push(item)
            node.add(item)
            item.state = "open"
            item.num = group_num
            node = item // next items will be stored as group's items
            pos = item.pos
            if(item.extension){
                if(item.extension.non_capturing){
                    delete item.num
                }else if(item.extension.type == "name_def"){
                    subitems.push(item)
                    group_num++
                    var value = item.extension.value
                    validate(value)
                    if(groups[value.string] !== undefined){
                        fail(`redefinition of group name` +
                            ` '${value.string}' as group ${group_num}; was group` +
                            ` ${groups[value.string].num}`, pos)
                    }
                    groups[value.string] = groups[group_num] =
                        new GroupRef(group_num, item)
                }else if(item.is_lookahead){
                    // a lookahead assertion is relative to the previous regexp
                    while(node.items.length > 0){
                        item.add(node.items.shift())
                    }
                    node = item
                    subitems.push(item)
                }else if(item.is_lookbehind){
                    // a lookbehind assertion is relative to the next regexp
                    node.parent.items.pop() // remove from node items
                    // temporarily create a group
                    group_num++
                    groups[group_num] = new GroupRef(group_num, item)
                }else{
                    subitems.push(item)
                    group_num++
                    groups[group_num] = new GroupRef(group_num, item)
                }
            }else{
                subitems.push(item)
                group_num++
                groups[group_num] = new GroupRef(group_num, item)
            }
        }else if(item instanceof GroupEnd){
            end_pos = item.pos
            if(group_stack.length == 0){
                console.log("pattern", from_codepoint_list(pattern))
                fail("unbalanced parenthesis", pos)
            }
            var item = group_stack.pop()
            item.end_pos = end_pos
            try{
                item.text = from_codepoint_list(
                    pattern.slice(item.pos + 1, end_pos))
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
            item.num = group_num
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
            var previous = node.items[node.items.length - 1]
            if(previous instanceof Char ||
                    previous instanceof CharacterClass ||
                    previous instanceof CharacterSet ||
                    previous instanceof Group ||
                    previous instanceof BackReference){
                if(previous.repeat){
                    if(previous.repeat.op != "?" && ! previous.repeat.greedy){
                        previous.repeat.greedy = true
                    }else{
                        fail("multiple repeat", pos)
                    }
                }else{
                    previous.repeat = item
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
                var choice = new Choice(),
                    case1 = new Case()
                case1.add(new Char(pos, EmptyString))
                choice.add(case1)
                node.add(choice)
                var case2 = new Case()
                choice.add(case2)
                node = case2
            }else if(node instanceof Case){
                var new_case = new Case()
                node.parent.add(new_case)
                node = new_case
            }else{
                var previous = node.items[node.items.length - 1]
                if(previous instanceof Case){
                    var new_case = new Case()
                    previous.add(new_case)
                    node = new_case
                }else{
                    var choice = new Choice(),
                        case1 = new Case()
                    while(node.items.length > 0){
                        case1.add(node.items.shift())
                    }
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
            if(item.items.length == 0){
                if(item.pos != 0){
                    fail("Flags not at the start of the expression '" +
                        `${pattern}`)
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
    node.flags = flags
    if(lookbehind){
        console.log("remaining lookbehind")
        var es = new Char(pos, EmptyString)
        es.lookbehind = lookbehind
        lookbehind.parent = es
        node.add(es)
    }
    return node
}

function checkPatternError(pattern, msg){
    try{
        compile(pattern)
    }catch(err){
        if(err.message !== msg){
            console.log("pattern:  ", pattern,
                "\nerror:    ", err.message, "\nexpected: ", msg)
        }
        return
    }
    fail(pattern + " should have raised Error")
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
                yield new Char(pos, escape)
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
            if(pattern[pos + 1] == ord('?')){
                yield new Repeater(pos, char, true)
                pos += 2
            }else{
                yield new Repeater(pos, char)
                pos++
            }
        }else if(cp == ord('{')){
            var reps = /\{(\d+)((,)(\d+))?\}/.exec(
                    from_codepoint_list(pattern.slice(pos)))
            if(reps){
                var limits = [parseInt(reps[1])]
                if(reps[4] !== undefined){
                    var max = parseInt(reps[4])
                    if(max < limits[0]){
                        fail('min repeat greater than max repeat', pos)
                    }
                    limits.push(max)
                }
                pos += reps[0].length
                if(pattern[pos + 1] == ord('?')){
                    yield new Repeater(pos, limits, true)
                    pos++
                }else{
                    yield new Repeater(pos, limits)
                }
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

function CodePoints(s){
    this.codepoints = s
    this.length = s.length
}

CodePoints.prototype.substring = function(start, end){
    // returns the string from start to end
    if(end === undefined){
        return from_codepoint_list(this.codepoints.slice(start))
    }else{
        try{
            return from_codepoint_list(this.codepoints.slice(start, end))
        }catch(err){
            console.log("error for", this)
            throw err
        }
    }
}

CodePoints.prototype.to_str = function(){
    return from_codepoint_list(this.codepoints)
}

function match(pattern, string, pos, flags, endpos){
    if(! string instanceof CodePoints){
        console.log('string should be codepoints', string)
        throw Error('string is not a codepoints')
    }
    if(! pattern instanceof Node){
        console.log('pattern not compiled', pattern)
        throw Error('pattern not compiled')
    }
    function* PatternReader(pattern){
        if(pattern instanceof Char ||
                pattern instanceof ConditionalBackref){
            yield pattern
        }else if(pattern.surrogate){
            var pos = 0,
                len = pattern.length
            while(pos < len){
                yield pattern[pos]
                pos++
            }
        }else{
            var pos = 0,
                len = pattern.items.length
            while(pos < len){
                yield pattern.items[pos]
                pos++
            }
        }
    }

    var pos = pos || 0,
        start = pos,
        original_string = string

    var debug = false
    if(debug){
        console.log("enter match loop, pattern", pattern)
    }

    endpos = endpos === undefined ? string.codepoints.length : endpos
    codepoints = string.codepoints.slice(0, endpos)

    if(pattern.subitems){
        for(var subitem of pattern.subitems){
            if(debug){
                console.log("reset subitem", subitem)
            }
            subitem.match_codepoints = []
            subitem.nb_success = 0
        }
    }
    pattern.group_match_indices = []
    var pattern_reader = PatternReader(pattern)
    var model = pattern_reader.next().value,
        cp,
        match_codepoints = []
    while(true){
        cp = codepoints[pos]
        if(debug){
            console.log("pattern", pattern, "\nstring", string,
                "\nmatch char", cp, "against model", model, "pos", pos)
        }
        if(model === undefined){
            // Nothing more in pattern: match is successful
            return new MatchObject(original_string, match_codepoints, pattern,
                                   start, endpos)
        }
        if(cp === undefined){
            // end of string before end of pattern
            // if the next models accept an empty match, continue
            if(model.repeat && model.accepts_failure()){
                model = pattern_reader.next().value
                if(model === undefined){
                    return new MatchObject(original_string, match_codepoints,
                                           pattern, start, endpos)
                }
                continue
            }
        }
        if(model instanceof Group ||
                model instanceof Char ||
                model instanceof CharacterClass ||
                model instanceof CharacterSet ||
                model instanceof ConditionalBackref ||
                model instanceof BackReference ||
                model instanceof StringStart ||
                model instanceof StringEnd){
            if(model.lookbehind){
                // check if the previous part of the string matches the
                // lookbehind regexp
                var negative = model.lookbehind.extension.type == "negative_lookbehind",
                    start1 = pos - model.lookbehind.length,
                    s1 = new StringObj(string.substring(start1, pos)),
                    group_match1 = match(model.lookbehind, s1, 0)
                if((negative && group_match1 &&
                        group_match1.length == pos - start1) ||
                        (! negative && (! group_match1 ||
                            group_match1.length != pos - start1))){
                    return false
                }else if(group_match1){
                    var nb = group_match1.match_codepoints.length
                    for(var i = 0; i < nb; i++){
                        match_codepoints.pop()
                    }
                }
            }
            var cps = model.match(string, pos)
            if(cps){
                if(debug){
                    console.log("match with model", model, "succeeds, cps", cps,
                        "model done ?", (! model.repeat) || model.done() )
                }
                match_codepoints = match_codepoints.concat(cps)
                pos += cps.length
                if((! model.repeat) || model.done()){
                    model = pattern_reader.next().value
                    if(debug){
                        console.log("next model", model)
                    }
                }
            }else if(model.repeat && model.accepts_failure()){
                if(debug){
                    console.log("match with model failed but model accepts failure")
                }
                model = pattern_reader.next().value
            }else{
                // If the previous model is repeated, test if a part of the
                // match would also match this model (backtracking)
                var previous,
                    backtracking = false
                if(model.parent !== undefined &&
                        model.parent.items !== undefined){
                    for(var m of model.parent.items){
                        if(m === model){
                            break
                        }
                        previous = m
                    }
                }
                if(previous){
                    if(debug){
                        console.log("found previous", previous)
                    }
                    if((! previous.repeat) && previous.chars && previous.chars.length > 0){
                        previous = previous.chars[previous.chars.length - 1]
                    }
                    if(debug){
                        console.log("previous", previous, "accepts backtracking ?",
                            previous.accepts_backtracking())
                    }
                    if(pos > 0 &&
                            previous.repeat &&
                            previous.match_codepoints &&
                            previous.match_codepoints.length > 0){
                        if(debug){
                            console.log("try backtracking on previous model",
                                previous, "model", model)
                        }
                        if(model.search === undefined){
                            console.log("pas de search", model)
                            throw _b_.AttributeError.$factory('search')
                        }
                        var min_repeat = previous.min_repeat(),
                            prev_string = new StringObj(
                                previous.match_codepoints.slice(min_repeat)),
                            pos_in_previous = model.search(prev_string,
                                string)
                        if(pos_in_previous > -1){
                            if(debug){
                                console.log("model", model,
                                    "was found at pos", pos_in_previous,
                                    "of previous codepoints", prev_string)
                            }
                            backtracking = true
                            // current model matches in position pos_in_previous
                            // in the substring of previous match starting at
                            // min_repeat
                            // Keep (min_repeat + pos_in_previous) codepoints
                            // in previous
                            var nb_keep = min_repeat + pos_in_previous,
                                nb_remove = previous.match_codepoints.length - nb_keep
                            previous.match_codepoints = previous.match_codepoints.slice(0,
                                nb_keep)
                            previous.nb_success = previous.match_codepoints.length
                            if(previous instanceof Group &&
                                    previous.nb_success == 0){
                                if(debug){
                                    console.log("previous doesn't contribute to match")
                                }
                                // if previous doesn't anymore, remove it from
                                // group_match_indices
                                var top = get_top(previous)
                                if(top.group_match_indices[0] === previous.num + 1){
                                    top.group_match_indices.shift()
                                }
                            }
                            for(var group of previous.groups){
                                group.match_codepoints = group.match_codepoints.slice(0,
                                    group.match_codepoints.length - nb_remove)
                            }
                        }
                    }
                }
                if(! backtracking){
                    if(model.repeat && model.accepts_failure()){
                        if(debug){
                            console.log("no backtracking but accepts failure")
                        }
                        model = pattern_reader.next().value
                    }else{
                        if(debug){
                            console.log("no backtracking, fail")
                        }
                        return false
                    }
                }else{
                    if((! model.repeat) || model.done()){
                        if(debug){
                            console.log("try next model")
                        }
                        model = pattern_reader.next().value
                    }
                }
            }
        }else if(model instanceof Choice){
            // save groups, they may be modified by unsuccessful matches
            // among the options
            var save_groups = []
            for(var group of model.groups){
                save_groups.push([group,
                               group.match_codepoints.slice(),
                               group.nb_success])
            }
            var found = false
            for(var option of model.items){
                var mo = match(option, string, pos, flags)
                if(mo){
                    found = true
                    match_codepoints = match_codepoints.concat(
                        mo.match_codepoints)
                    pos += mo.match_codepoints.length
                    break
                }
                // restore groups
                for(var i = 0, len = save_groups.length; i < len; i++){
                    save_groups[i][0].match_codepoints = save_groups[i][1]
                    save_groups[i][0].nb_success = save_groups[i][2]
                }
            }
            if(found){
                model = pattern_reader.next().value
            }else{
                return false
            }
        }else{
            console.log(model)
            throw Error("unknown model")
        }
    }
    return new MatchObject(original_string, match_string, pattern, start,
                           endpos)
}

function match1(pattern, string, pos, flags, endpos){
    if(! string instanceof CodePoints){
        console.log('string should be codepoints', string)
        throw Error('string is not a codepoints')
    }
    if(! pattern instanceof Node){
        console.log('pattern not compiled', pattern)
        throw Error('pattern not compiled')
    }
    function* PatternReader(pattern){
        if(pattern instanceof Char ||
                pattern instanceof ConditionalBackref){
            yield pattern
        }else if(pattern.surrogate){
            var pos = 0,
                len = pattern.length
            while(pos < len){
                yield pattern[pos]
                pos++
            }
        }else{
            var pos = 0,
                len = pattern.items.length
            while(pos < len){
                yield pattern.items[pos]
                pos++
            }
        }
    }

    var pos = pos || 0,
        start = pos,
        original_string = string

    var debug = false
    if(debug){
        console.log("enter match1 loop, pattern", pattern)
    }

    endpos = endpos === undefined ? string.codepoints.length : endpos
    codepoints = string.codepoints.slice(0, endpos)

    if(pattern.subitems){
        for(var subitem of pattern.subitems){
            if(debug){
                console.log("reset subitem", subitem)
            }
            subitem.match_codepoints = []
            subitem.nb_success = 0
        }
    }
    pattern.group_match_indices = []
    var pattern_reader = PatternReader(pattern)
    var models = []
    for(var model of pattern_reader){
        models.push(model)
        model.rank = models.length - 1
    }
    var model = models[0],
        cp,
        match_codepoints = [],
        states = [[pos, model]],
        mo,
        new_states = [],
        nb = 0,
        state,
        string,
        pos
    while(true){
        /* Loop on the list of current states
           A state is a tuple (position in string, model)
           If the model matches at the given position:
           - if there is no next model, return the match object
           - if it is not repeated, add (pos + 1, next_model) to new states
             for the next loop
           - if it is repeated, the match object has the interval [n1, n2]
             such that the model matches all the substrings between
             pos + n1 and pos + n2. Each of these positions is a candidate
             for a match with the next model. So add (pos + n, next_model)
             with n1 <= n <= n2 to new states
           If the model doesn't match, do nothing
         */
        new_states = []
        for(state of states){
            //console.log("match with model", model, "at pos", pos)
            [pos, model] = state
            mo = model.match(string, pos)
            if(mo){
                var next_model = models[model.rank + 1]
                if(next_model == undefined){
                    return BMatchObject1.$factory(string, pattern, state, mo)
                }
                if(model.repeat && model.accepts_success()){
                    for(var i = 1; i <= mo.length; i++){
                        var new_state = [pos + i, next_model]
                        new_state.previous = state
                        new_states.push(new_state)
                    }
                }else{
                    var new_state = [pos + mo.length, next_model]
                    new_state.previous = state
                    new_states.push(new_state)
                }
            }
        }
        //console.log("new states", new_states)
        nb++
        if(! new_states){
            console.log("match")
            return "ok"
        }
        if(new_states.length == 0){
            return _b_.None
        }
        if(nb > 10){
            console.log("overflow")
            break
        }
        states = new_states
    }
    return "ok"
}

function to_codepoint_list(s){
    var items = []
    if(s.__class__ === _b_.str.$surrogate){
        for(const item of s.items){
            items.push(_b_.ord(item))
        }
        items.type = "unicode"
    }else if(typeof s == "string" || _b_.isinstance(s, _b_.str)){
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

function from_codepoint_list(codepoints){
    // Return a string, or an instance of str.$surrogate
    var chars = [],
        has_surrogate
    for(const cp of codepoints){
        var char = _b_.chr(cp)
        if(char.__class__ === _b_.str.$surrogate){
            has_surrogate = true
            chars.push(char.items[0])
        }else{
            chars.push(char)
        }
    }
    if(has_surrogate){
        var res = _b_.str.$surrogate.$factory('')
        res.items = chars
        return res
    }
    return chars.join('')
}

function MatchObject(string, match_codepoints, re, start, endpos){
    // string is a CodePoints instance
    this.string = from_codepoint_list(string.codepoints)
    this.pos = start
    this.endpos = endpos
    this.match_codepoints = match_codepoints
    this.start = start
    this.end = start + match_codepoints.length
    this.re = re
}

MatchObject.prototype.group = function(group_num){
    if(group_num == 0){
        return this.match_string()
    }else if(this.re.$groups[group_num] !== undefined){
        var item = this.re.$groups[group_num].item
        if(item.nb_success == 0){
            return _b_.None
        }
        if(item.repeat){
            return this.string.substring(item.match_start,
                item.match_end)
        }
        return from_codepoint_list(item.match_codepoints)
    }else if(_b_.isinstance(group_num, _b_.str)){
        throw _b_.IndexError.$factory("no such group")
    }else{
        throw _b_.IndexError.$factory(group_num)
    }
}

MatchObject.prototype.groups = function(_default){
    var result = []
    console.log("MO groups", this.re.$groups, this.re.$groups.length)
    for(var key in this.re.$groups){
        var group_num = this.re.$groups[key].num
        if(this.re.$groups[group_num] === undefined){
            result.push(_default)
        }else{
            result.push(this.re.$groups[group_num].item.match_string())
        }
    }
    return result
}

Object.defineProperty(MatchObject.prototype, 'length', {
    get() {
        // The length of the match object is that of its match_string, except
        // if it has surrogate pairs
        var len = 0
        for(const char of this.match_codepoints){
            len++
        }
        return len
    },
    set() {
        }
})

MatchObject.prototype.match_string = function(){
    return from_codepoint_list(this.match_codepoints)
}

var BMatchObject1 = $B.make_class("MatchObject",
    function(string, pattern, state, mo){
        var items = [],
            item
        console.log(state, mo)
        item = state[1]
        item.start = state[0]
        var end = item.end = item.start + mo.length,
            last_end = end
        state = state.previous
        items = [item]
        while(state){
            item = state[1]
            item.start = state[0]
            item.end = end
            end = item.start
            items.splice(0, 0, item)
            state = state.previous
        }
        console.log("items", items)
        return {
            __class__: BMatchObject1,
            items,
            string,
            pattern,
            start: item.start,
            end: last_end,
            codepoints: string.codepoints.slice(item.start, last_end)
        }
    }
)

BMatchObject1.__repr__ = function(self){
    var s = BMatchObject1.match_string(self).substr(0, 50)
    return `<re.Match object; span=(${self.start}, ${self.end}), ` +
        `match=${_b_.repr(s)}>`
}

BMatchObject1.group = function(){
    var $ = $B.args("group", 1, {self: null}, ['self'],
                arguments, {group: 0}, 'groups', null),
        self = $.self,
        groups = $.groups,
        res = []
    if(groups.length == 0){
        groups = [0]
    }
    for(var group of groups){
        if(group == 0){
            res.push(from_codepoint_list(self.codepoints.slice(self.start, self.end)))
        }
        for(var item of self.items){
            if(item.type == "group" && item.num == group){
                res.push(from_codepoint_list(self.string.codepoints.slice(
                    item.start, item.end)))
            }
        }
    }
    if(res.length == 0){
        return _b_.None
    }else if(groups.length == 1){
        return groups[0]
    }else{
        return $B.fast_tuple(res)
    }
}

BMatchObject1.groups = function(self){
    var groups = []
    for(var item of self.items){
        console.log("item", item)
        if(item.type == "group"){
            groups.push(from_codepoint_list(self.string.codepoints.slice(
                item.start, item.end)))
        }
    }
    return $B.fast_tuple(groups)
}

BMatchObject1.match_string = function(self){
    console.log("match string", self)
    var start = self.items[0].start,
        end = self.items[self.items.length - 1].end
    return from_codepoint_list(self.string.codepoints.slice(start, end))
}


$B.set_func_names(BMatchObject1, "re")

var BMatchObject = $B.make_class("MatchObject",
    function(mo){
        return {
            __class__: BMatchObject,
            mo
        }
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
    return BMatchObject.$group(self, [key])
}

BMatchObject.__repr__ = function(self){
    var mo = self.mo,
        s = mo.match_string().substr(0, 50)
    return `<re.Match object; span=(${mo.start}, ${mo.end}), ` +
        `match=${_b_.repr(s)}>`
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
        return $.self.mo.end - 1
    }else{
        return $.self.mo.$groups[$.group].end - 1
    }
    return group.start
}

BMatchObject.endpos = {
    __get__: function(self){
        return self.mo.endpos
    }
}

BMatchObject.expand = function(){
    var $ = $B.args("expand", 2, {self: null, template: null},
                ['self', 'template'], arguments, {}, null, null)
    var data = {
        repl: new StringObj($.template),
    }
    data = transform_repl(data, $.self.mo.re)
    if(typeof data.repl == "function"){
        return $B.$call(data.repl)(BMatchObject.$factory($.self.mo))
    }else{
        return data.repl1
    }
}

BMatchObject.group = function(self, group_num){
    var $ = $B.args("group", 1, {self: null}, ['self'], arguments,
                {}, 'args', null),
            self = $.self,
            args = $.args
    if(args.length == 0){
        args[0] = 0
    }
    return BMatchObject.$group(self, args)
}

var GroupDict = $B.make_class("GroupDict",
    function(self, _default){
        var res = $B.empty_dict()
        res.__class__ = GroupDict
        for(var key in self.$groups){
            if(isNaN(parseInt(key))){
                var item = self.$groups[key].item,
                    match = item === false ? _default : item.match_string()

                res.$string_dict[key] = [match, res.$version++]
            }
        }
        return res
    }
)
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
                null, null)
    return GroupDict.$factory($.self.mo.re, $.default)
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
    for(var i = 1; i <= self.mo.re.groups; i++){
        var group = self.mo.re.$groups[i],
            s = group.item.match_string()
        if(group.item.nb_success == 0){
            s = _default
        }else if(self.mo.data_type === "bytes"){
            s = string2bytes(s)
        }
        result.push(s)
    }
    return $B.fast_tuple(result)
}

BMatchObject.$group = function(self, args){
    var res = []
    for(var i = 0, len = args.length; i < len; i++){
        var group_num = args[i]
        if(!_b_.isinstance(group_num, _b_.str)){
            try{
                group_num = $B.$GetInt(group_num)
            }catch(err){
                throw _b_.IndexError.$factory(group_num)
            }
            if($B.rich_comp('__lt__', group_num, 0) ||
                $B.rich_comp('__gt__', group_num,
                        self.mo.re.groups)){
                throw _b_.IndexError.$factory("no such group")
            }
        }
        var item = self.mo.group.call(self.mo, group_num)
        if(self.mo.data_type === "bytes"){
            item = string2bytes(item)
        }
        res.push(item)
    }
    return len == 1 ? res[0] : _b_.tuple.$factory(res)
}

BMatchObject.lastindex = {
    __get__: function(self){
        var res = self.mo.re.group_match_indices
        if(res.length == 0){
            return _b_.None
        }
        return res[res.length - 1]
    }
}

BMatchObject.lastgroup = {
    __get__: function(self){
        var li = BMatchObject.lastindex.__get__(self)
        if(li === _b_.None){
            return li
        }
        for(var key in self.mo.re.$groups){
            if(! isFinite(key) && self.mo.re.$groups[key].num == li){
                return key
            }
        }
        return _b_.None
    }
}

BMatchObject.pos = {
    __get__: function(self){
        return self.mo.start
    }
}

BMatchObject.re = {
    __get__: function(self){
        return self.mo.re.pattern
    }
}

BMatchObject.regs = {
    __get__: function(self){
        var res = [$B.fast_tuple([self.mo.start, self.mo.end])]
        for(var group_num in self.mo.re.$groups){
            if(! isNaN(parseInt(group_num))){
                var group = self.mo.re.$groups[group_num].item
                res.push($B.fast_tuple([group.pos,
                    group.pos + group.match_codepoints.length]))
            }
        }
        return $B.fast_tuple(res)
    }
}

BMatchObject.span = function(){
    var $ = $B.args("span", 2, {self: null, group: null},
                ['self', 'group'], arguments,
                {group: 0}, null, null),
            self = $.self,
            group = $.group
    if(group == 0){
        return $B.fast_tuple([self.mo.start, self.mo.end])
    }else{
        console.log(self.mo.re.$groups[group])
        return $B.fast_tuple([-1, -1])
    }
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

function str_or_bytes(string, pattern, repl){
    // Check that string and pattern are of the same type : (subclass of) str
    // or (subclass of) bytes
    // Return an object with attributes:
    // - type: str or bytes
    // - string and pattern : strings
    if(typeof string == "string" || _b_.isinstance(string, _b_.str)){
        if(typeof pattern == "string" || _b_.isinstance(pattern, _b_.str)){
            if(pattern.__class__ !== _b_.str.$surrogate){
                pattern = pattern + ''
            }
        }else if(! (pattern instanceof Node) &&
                ! (typeof pattern.text == "string")){
            throw _b_.TypeError.$factory(`cannot use a `+
                `${$B.class_name(pattern)} pattern on a string-like object`)
        }
        if(repl !== undefined){
            if(typeof repl == "string" || _b_.isinstance(repl, _b_.str)){
                if(repl.__class__ !== _b_.str.$surrogate){
                    repl = repl + ''
                }
            }else if(typeof repl !== "function"){
                throw _b_.TypeError.$factory(`cannot use a `+
                    `${$B.class_name(repl)} repl on a string-like object`)
            }
        }
        if(string.__class__ !== _b_.str.$surrogate){
            string += '' // for string subclasses
        }
        return {
            type: _b_.str,
            string: new CodePoints(string),
            pattern,
            repl
        }
    }else if(_b_.isinstance(string, bytes_like)){
        if(! _b_.isinstance(pattern, bytes_like) &&
                (! pattern instanceof Node)){
            throw _b_.TypeError.$factory(`cannot use a ${$B.class_name(pattern)}` +
                ' pattern on a bytes-like object')
        }
        if(repl &&
                ! _b_.isinstance(repl, bytes_like)){
            throw _b_.TypeError.$factory(`cannot use a ${$B.class_name(repl)}` +
                ' repl on a bytes-like object')
        }
        var res = {
            type: _b_.bytes,
            string: _b_.bytes.decode(_b_.bytes.$factory(string), 'latin1')
        }
        if(pattern instanceof Node){
            res.pattern = pattern.pattern
        }else{
            res.pattern = _b_.bytes.decode(_b_.bytes.$factory(pattern), 'latin1')
        }
        if(repl){
            res.repl = _b_.bytes.decode(_b_.bytes.$factory(repl), 'latin1')
        }
        return res
    }else{
        throw _b_.TypeError.$factory("invalid string type: " +
            $B.class_name(string))
    }
}

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
                    if(pattern.$groups[group_num] === undefined){
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
                        if(pattern.$groups[group_name] === undefined){
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
                        if(pattern.$groups[group_name] === undefined){
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
        data.repl = function(mo){
            var res = parts[0]
            for(var i = 1, len = parts.length; i < len; i += 2){
                if(mo.mo.re.$groups[parts[i]] === undefined){
                    pos++
                    var group_num = parts[i].toString().substr(0, 2)
                    fail(`invalid group reference ${group_num}`, pos)
                }
                res += mo.mo.re.$groups[parts[i]].item.match_string()
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
    this.codepoints = []
    this.type = "str"
    if(typeof obj == "string"){
        // Python object represented as a Javascript string
        this.string = obj
        for(var i = 0, len = obj.length; i < len; i++){
            this.codepoints.push(obj.codePointAt(i))
        }
    }else if(obj.__class__ === _b_.str.$surrogate){
        this.string = obj.items.join('')
        for(var i = 0, len = obj.items.length; i < len; i++){
            this.codepoints.push(_b_.ord(obj.items[i]))
        }
    }else if(_b_.isinstance(obj, _b_.str)){
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
    }else if(Array.isArray(obj)){
        // list of codepoints
        this.codepoints = obj
    }else{
        throw Error($B.class_name(obj) + ' cannot be interpreted as a string')
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
    for(var cp of codepoints){
        var char = _b_.chr(cp)
        if(char.__class__ === _b_.str.$surrogate){
            res += char.items[0]
        }else{
            res += char
        }
    }
    return res
}

StringObj.prototype.to_str = function(){
    return this.string
}

StringObj.from_codepoints = function(cps){
    var res = new StringObj('')
    res.codepoints = cps
    for(var cp of cps){
        var char = _b_.chr(cp)
        if(char.__class__ === _b_.str.$surrogate){
            res.string += char.items[0]
        }else{
            res.string += char
        }
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
            throw Error(`not the same type for ${first} and ${key}`)
        }
    }
    return res
}

function subn(data, count, flags){
    var string = data.string,
        pattern = data.pattern,
        repl = data.repl
    var res = '',
        pos = 0,
        nb_sub = 0
    if(! pattern instanceof Node){
        throw Error("pattern not compiled in subn")
    }
    pattern = BPattern.$factory(pattern)

    if(typeof repl != "function"){
        var data1 = transform_repl({repl}, pattern)
        repl1 = data1.repl1
    }
    pos = 0
    for(var bmo of $module.finditer(pattern, string.to_str())){
        var mo = bmo.mo // finditer returns instances of BMatchObject
        res += string.substring(pos, mo.start)
        if(typeof repl == "function"){
            res += $B.$call(data.repl)(BMatchObject.$factory(mo))
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
    res += string.substring(pos)
    if(data.type === "bytes"){
        res = _b_.str.encode(res, "latin-1")
    }
    return [res, nb_sub]
}

// escaped chars : '\t\n\x0b\x0c\r #$&()*+-.?[\\]^{|}~'
var escaped = [9, 10, 11, 12, 13, 32, 35, 36, 38, 40, 41, 42, 43, 45, 46, 63,
               91, 92, 93, 94, 123, 124, 125, 126]


var $module = {
    compile: function(){
        var $ = $B.args("compile", 2, {pattern: null, flags: null},
                    ['pattern', 'flags'], arguments, {flags: no_flag},
                    null, null)
        $.pattern = check_pattern_flags($.pattern, $.flags)
        var data = prepare({pattern: $.pattern})
        return BPattern.$factory(compile(data, $.flags))
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
        res = StringObj.from_codepoints(res).string
        if(data.type == "bytes"){
            res = _b_.str.encode(res, 'latin1')
        }
        return res
    },
    findall: function(){
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
            pattern = compile(data, flags)
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
                mo = bmo.mo
            if(mo.re.groups){
                if(mo.re.groups == 1){
                    res.push(conv(mo.re.$groups[1].item.match_string()))
                }else{
                    var groups = []
                    for(var i = 1, len = mo.re.groups; i <= len; i++){
                        groups.push(conv(mo.re.$groups[i].item.match_string()))
                    }
                    res.push($B.fast_tuple(groups))
                }
            }else{
                res.push(conv(mo.match_string()))
            }

        }
    },
    finditer: function (){
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
            pattern = compile(data, flags)
        }
        return $B.generator.$factory(function*(pattern, string, flags, original_string){
            var result = [],
                pos = 0
            while(pos <= string.length){
                var mo = match(pattern, string, pos, flags)
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
        })(pattern, data.string, flags, original_string)
    },
    fullmatch: function(){
        var bmo = $module.match.apply(null, arguments)
        if(bmo !== _b_.None){
            var mo = bmo.mo,
                string = new StringObj(mo.string)
            if(string.codepoints.length != mo.match_codepoints.length){
                return _b_.None
            }else{
                return BMatchObject.$factory(mo)
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
            pattern = compile(data, flags)
        }
        return match1(pattern, data.string, 0, flags)
    },
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
            pattern = compile(data, flags)
        }
        data.pattern = pattern
        var pos = 0
        while(pos < data.string.codepoints.length){
            var mo = match(data.pattern, data.string, pos, flags)
            mo.data_type = data.type
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
            pattern = BPattern.$factory(
                compile(data, flags))
        }
        for(var bmo of $module.finditer(pattern, $.string)){
            var mo = bmo.mo // finditer returns instances of BMatchObject
            res.push(data.string.substring(pos, mo.start))
            var s = '',
                groups = mo.re.$groups,
                cps,
                has_groups = false
            for(var key in groups){
                has_groups = true
                if(groups[key].num == key){
                    if(groups[key].item.nb_success == 0){
                        if(groups[key].item.repeat && groups[key].item.accepts_failure()){
                            res.push(_b_.None)
                        }else{
                            var m = _b_.None
                            for(var char of groups[key].item.chars){
                                if(char.repeat && char.accepts_failure()){
                                    m = ''
                                    break
                                }
                            }
                            res.push(m)
                        }
                    }else{
                        var item = groups[key].item
                        res.push(data.string.substring(item.match_start,
                            item.match_end))
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
        if(typeof repl != "function"){
            if(pattern.__class__ != BPattern){
                data = prepare({pattern, string, repl})
                pattern = compile(data, flags)
            }else{
                data = prepare({string, repl})
            }
            data = transform_repl(data, pattern)
        }else{
            if(pattern.__class__ != BPattern){
                data = prepare({pattern, string})
                pattern = compile(data, flags)
            }else{
                data = prepare({string})
            }
            data.repl = repl
        }
        data.pattern = pattern
        return subn(data, count, flags)[0]
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
            pattern = compile(data, flags)
        }else{
            data = prepare({repl, string})
        }
        data.pattern = pattern
        return $B.fast_tuple(subn(data, count, flags))
    }

}

var ASCII = $module.A = $module.ASCII = Flag.$factory("ASCII", 256)
var IGNORECASE = $module.I = $module.IGNORECASE = Flag.$factory("IGNORECASE", 2)
var LOCALE = $module.L = $module.LOCALE = Flag.$factory("LOCALE", 4)
var MULTILINE = $module.M = $module.MULTILINE = Flag.$factory("MULTILINE", 8)
var DOTALL = $module.S = $module.DOTALL = Flag.$factory("DOTALL", 16)
var U = $module.U = $module.UNICODE = Flag.$factory("U", 32)
var VERBOSE = $module.X = $module.VERBOSE = Flag.$factory("VERBOSE", 64)

var inline_flags = {
    i: IGNORECASE,
    L: LOCALE,
    m: MULTILINE,
    s: DOTALL,
    u: U,
    x: VERBOSE,
    a: ASCII
}
