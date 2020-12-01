// Regular expression

var MAXGROUPS = 2147483647

function Pattern(text, items, groups){
    this.text = text
    this.items = items
    this.groups = groups
}

var BackReference = function(type, value){
        // for "\number"
        this.type = type // "name" or "num"
        this.value = value
    },
    Char = function(char){
        this.char = char
        this.str = ''
        this.nb_success = 0
        this.match = function(s, pos){
            var char = s[pos]
            if(this.repeat){
                if(this.repeat.op == "?" && this.str.length == 1){
                    return false
                }else if(this.repeat.op.start){
                    console.log(this.repeat.op)
                }
            }
            if(this.char == char){
                if(this.repeat){
                    this.nb_success++
                    if(! this.test_repeat_success()){
                        return false
                    }
                }
                for(var group of this.groups){
                    group.str += char
                }
                this.str += char
                return char
            }
            return false
        }
    },
    Flags = function(flags){
        this.flags = flags
    },
    GroupEnd = {},
    Group = function(extension){
        this.items = []
        this.str = ''
        this.extension = extension
        this.nb_success = 0
        this.match = function(s, pos){
            var group_match = match(this, s, pos)
            if(group_match){
                this.nb_success++
                if(this.repeat){
                    // test if repeat condition is still ok
                    if(! this.test_repeat_success()){
                        return false
                    }
                }
            }
            return group_match
        }
    },
    Or = {},
    Repeater = function(op, greedy){
        this.op = op
        this.greedy = greedy !== undefined
    }

Group.prototype.test_repeat_success = function(){
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

Group.prototype.test_repeat_fail = function(){
    // Called when a repeated model failed.
    // Return true if the string currently matching the model is
    // compatible with the repeat option
    if(this.repeat.op == '+' && this.nb_success == 0){
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

Char.prototype.test_repeat_fail = Group.prototype.test_repeat_fail
Char.prototype.test_repeat_success = Group.prototype.test_repeat_success

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
    if(name == ''){
        throw Error("missing group name")
    }else if(name[0].match(/\d/) || name.match(/\./)){
        throw Error(`bad character in group name '${name}'`)
    }

    var $B = window.__BRYTHON__,
        [code, len] = read(name, 0)
    if($B.unicode_tables.XID_Start[code]){
        var pos = len
        while(pos < name.length){
            [code, len] = read(name, pos)
            if($B.unicode_tables.XID_Continue[code]){
                pos += len
            }else{
                break
            }
        }
        if(pos != name.length){
            console.log("bad character", pos, name, name.charCodeAt(pos))
            throw Error(`bad character in group name '${name}'`)
        }
    }else{
        throw Error(`bad character in group name '${name}'`)
    }
}

function escaped_char(text, pos){
    var special = text[pos + 1]
    if(special === undefined){
        throw Error('bad escape (end of pattern)')
    }
    if('AbBdDsSwWZ'.indexOf(special) > -1){
        return {
            value: special,
            length: 2,
            character_class: true,
            toString: function(){return '\\' + special}
        }
    }else if(special == 'N'){
        if(text[pos + 2] != '{'){
            throw Error('missing {')
        }
        var i = pos + 3,
            description = ''
        while(i < text.length){
            if(text[i] == '}'){
                break
            }
            description += text[i]
            i++
        }
        if(description == ''){
            throw Error("missing character name")
        }
        if(i == text.length){
            throw Error("missing }, unterminated name")
        }
        return {
            type: 'N',
            value: validate_named_char(description),
            length: i - pos
        }
    }else if(special == 'x'){
        // \xhh = character with hex value hh
        var mo = /^[0-9a-fA-F]{0,2}/.exec(text.substr(pos + 2)),
            hh = mo ? mo[0] : ''
        if(mo && mo[0].length == 2){
            return {
                type: 'x',
                value: String.fromCharCode(parseInt(mo[0], 16)),
                length: mo[0].length
            }
        }
        throw Error('incomplete escape \\x' + hh)
    }else if(special == 'u'){
        // \uxxxx = character with 16-bit hex value xxxx
        var mo = /^[0-9a-fA-F]{0,4}/.exec(text.substr(pos + 2)),
            xx = mo ? mo[0] : ''
        if(mo && mo[0].length == 4){
            return {
                type: 'u',
                value: String.fromCharCode(parseInt(mo[0], 16)),
                length: mo[0].length
            }
        }
        throw Error('incomplete escape \\u' + xx)
    }else if(special == 'U'){
        // \Uxxxxxxxx = character with 32-bit hex value xxxxxxxx
        var mo = /^[0-9a-fA-F]{0,8}/.exec(text.substr(pos + 2)),
            xx = mo ? mo[0] : ''
        if(mo && mo[0].length == 8){
            return {
                type: 'U',
                value: validate_code_point(mo[0]),
                length: mo[0].length
            }
        }
        throw Error('incomplete escape \\U' + xx)
    }else{
        // octal ?
        var mo = /^[0-7]{3}/.exec(text.substr(pos + 1))
        if(mo){
            var octal_value = eval('0o' + mo[0])
            if(octal_value > 0o377){
                throw Error(`octal escape value \\` +
                    `${mo[0]} outside of range 0-0o377`)
            }
            return {
                type: 'o',
                value: String.fromCharCode(octal_value),
                length: mo[0].length
            }
        }
        var mo = /^\d+/.exec(text.substr(pos + 1))
        if(mo){
            return {
                type: 'num',
                value: parseInt(mo[0]),
                length: mo[0].length
            }
        }
        throw Error("invalid escaped char " + special)
    }
}

function check_character_range(t){
    // Check if last 2 items in t are a valid character range
    var start = t[t.length - 2],
        end = t[t.length - 1]
    if(start.character_class || end.character_class){
        throw Error(`bad character range ${start}-${end}`)
    }else if(end < start){
        throw Error(`bad character range ${start}-${end}`)
    }
    t.splice(t.length - 2, 2, {
        type: 'character_range',
        start: start,
        end: end
    })
}

function parse_character_set(text, pos){
    // Parse character set starting at position "pos" in "text"
    var result = {items: []}
    if(text[pos] == '^'){
        result.neg = true
        pos++
    }else if(text[pos] == ']'){
        // a leading ] is the character "]", not the set end
        result.items.push(']')
        pos++
    }
    var range = false
    while(pos < text.length){
        var char = text[pos]
        if(char == ']'){
            return [result, pos]
        }
        if(char == '\\'){
            var escape = escaped_char(text, pos)
            if(escape.type == "num"){
                // [\9] is invalid
                throw Error("bad escape \\" + escape.value.toString()[0])
            }
            result.items.push(escape)
            if(range){
                check_character_range(result.items)
            }
            pos += escape.length
        }else if(char == '-'){
            // Character range
            if(result.items.length == 0){
                throw Error("bad character range")
            }else{
                range = true
                pos++
            }
        }else{
            result.items.push(char)
            if(range){
                check_character_range(result.items)
            }
            range = false
            pos++
        }
    }
    throw Error("unterminated character set")
}

function open_unicode_db(){
    if($B.unicodedb === undefined){
        var xhr = new XMLHttpRequest
        xhr.open("GET",
            $B.brython_path + "unicode.txt", false)
        xhr.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    $B.unicodedb = this.responseText
                }else{
                    console.log("Warning - could not " +
                        "load unicode.txt")
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
        throw Error("missing character name")
    }
    open_unicode_db()
    if($B.unicodedb !== undefined){
        var re = new RegExp("^([0-9A-F]+);" +
            description + ";.*$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            throw Error(`undefined character name '${description}'`)
        }
        var cp = "0x" + search[1], // code point
            result = String.fromCodePoint(eval(cp))
        return result
    }else{
        throw Error("could not load unicode.txt")
    }
}

function validate_code_point(cp){
    // validate that the 8-hex digit cp is in the Unicode db
    // Load unicode table if not already loaded
    open_unicode_db()
    var stripped = cp
    while(stripped.startsWith('0')){
        stripped = stripped.substr(1)
    }
    if($B.unicodedb !== undefined){
        var re = new RegExp("^" + stripped +";")
        search = re.exec($B.unicodedb)
        if(search === null){
            throw Error(`bad escape \\U${cp}`)
        }
        return String.fromCodePoint(eval(parseInt(cp, 16)))
    }else{
        throw Error("could not load unicode.txt")
    }
}

function compile(pattern){
    var group_num = 0,
        group_stack = [],
        items = [],
        groups = {}
    for(var item of tokenize(pattern)){
        if(item instanceof Group){
            group_stack.push(item)
            items.push(item)
            group_num++
            item.state = "open"
            item.num = group_num
            item.parent_items = items // save to restore at group end
            items = item.items // next items will be stored as group's items
            if(item.extension){
                if(item.extension.type == "name_def"){
                    var value = item.extension.value
                    validate(value)
                    if(groups[value] !== undefined){
                        throw Error(`redefinition of group name '${value}' as group` +
                            ` ${group_num}; was group ${groups[value].num}`)
                    }
                    groups[value] = {num: group_num, item}
                }else if(item.extension.type == "test_value"){
                    var value = item.extension.value
                    if(typeof value == "number"){
                        if(value == 0){
                            throw Error(`bad group number`)
                        }
                        if(value > group_num || value >= MAXGROUPS){
                            throw Error(`invalid group reference ${value}`)
                        }
                    }else if(groups[value] !== undefined){
                        if(groups[value].item.state == "open"){
                            throw Error("cannot refer to an open group")
                        }
                    }else{
                        throw Error(`unknown group name '${value}'`)
                    }
                }
            }else{
                groups[group_num] = {num: group_num, item}
            }
        }else if(item === GroupEnd){
            if(group_stack.length == 0){
                throw Error("unbalanced parenthesis")
            }
            var item = group_stack.pop()
            item.state = 'closed'
            items = item.parent_items
        }else if(item instanceof BackReference){
            if(item.type == "num" && item.value > 99){
                var head = item.value.toString().substr(0, 2)
                throw Error(`invalid group reference ${head}`)
            }
            if(groups[item.value] !== undefined){
                if(groups[item.value].item.state == "open"){
                    throw Error("cannot refer to an open group")
                }
            }else if(item.type == "name"){
                throw Error(`unknown group name '${item.value}'`)
            }else if(item.type == "num"){
                throw Error(`invalid group reference ${item.value}`)
            }
            items.push(item)
        }else if(item instanceof Char){
            item.groups = []
            for(var group of group_stack){
                item.groups.push(group)
            }
            items.push(item)
        }else if(item instanceof Repeater){
            if(items.length == 0){
                throw Error("nothing to repeat")
            }
            var previous = items[items.length - 1]
            if(previous instanceof Char ||
                    previous instanceof Group){
                if(previous.repeat){
                    throw Error("multiple repeat")
                }
                previous.repeat = item
            }else{
                throw Error("nothing to repeat")
            }
        }else if(item === Or){
            items.push(item)
        }else{
            throw Error("unknown item type " + item)
        }
    }
    if(group_stack.length > 0){
        throw Error("missing ), unterminated subpattern")
    }
    return new Pattern(pattern, items, groups)
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
    throw Error(pattern + " should have raised Error")
}

function* tokenize(pattern){
    var pos = 0
    while(pos < pattern.length){
        var char = pattern[pos]
        if(char == '('){
            if(pattern[pos + 1] == '?'){
                if(pattern[pos + 2] == 'P'){
                    if(pattern[pos + 3] == '<'){
                        var name = '',
                            i = pos + 4
                        while(i < pattern.length){
                            if(pattern[i] == '>'){
                                break
                            }else if(pattern[i] == ')'){
                                throw Error("missing >, unterminated name")
                            }
                            name += pattern[i]
                            i++
                        }
                        validate(name)
                        if(i == pattern.length){
                            throw Error("missing >, unterminated name")
                        }
                        yield new Group({type: 'name_def', value: name})
                        pos = i + 1
                        continue
                    }else if(pattern[pos + 3] == '='){
                        var name = '',
                            i = pos + 4
                        while(i < pattern.length){
                            if(pattern[i] == ')'){
                                break
                            }
                            name += pattern[i]
                            i++
                        }
                        validate(name)
                        if(i == pattern.length){
                            throw Error("missing ), unterminated name")
                        }
                        yield new BackReference('name', name)
                        pos = i + 1
                        continue
                    }else if(pattern[pos + 3] === undefined){
                        throw Error("unexpected end of pattern")
                    }else{
                        throw Error("unknown extension ?P" + pattern[pos + 3])
                    }
                }else if(pattern[pos + 2] == '('){
                    var name = '',
                        i = pos + 3
                    while(i < pattern.length){
                        if(pattern[i] == ')'){
                            break
                        }
                        name += pattern[i]
                        i++
                    }
                    if(name.match(/^\d+$/)){
                        name = parseInt(name)
                    }else{
                        validate(name)
                    }
                    if(i == pattern.length){
                        throw Error("missing ), unterminated name")
                    }
                    yield new Group({type: 'test_value', value: name})
                    pos = i + 1
                    continue
                }else if(pattern[pos + 2] == '='){
                    // (?=...) : lookahead assertion
                    yield new Group({type: 'lookahead_assertion'})
                    pos += 3
                    continue
                }else if(pattern[pos + 2] == '!'){
                    // (?!...) : negative lookahead assertion
                    yield new Group({type: 'negative_lookahead_assertion'})
                    pos += 3
                    continue
                }else if(pattern.substr(pos + 2, 2) == '<!'){
                    // (?<!...) : negative lookbehind
                    yield new Group({type: 'negative_lookbehind'})
                    pos += 4
                    continue
                }else if(pattern.substr(pos + 2, 2) == '<='){
                    // (?<=...) : positive lookbehind
                    yield new Group({type: 'positive_lookbehind'})
                    pos += 4
                    continue
                }else if(pattern[pos + 2] == '<'){
                    pos += 3
                    if(pos == pattern.length){
                        throw Error("unexpected end of pattern")
                    }
                    throw Error("unknown extension ?<" + pattern[pos])
                }else if(pattern[pos + 2] == ':'){
                    yield new Group({non_capturing: true})
                    pos += 3
                    continue
                }else if(pattern[pos + 2] === undefined){
                    throw Error("unexpected end of pattern")
                }

                var flags = 'aiLmsux'
                if(pattern[pos + 2] == '-' ||
                        flags.indexOf(pattern[pos + 2]) > -1){
                    if(pattern[pos + 2] == '-'){
                        var on_flags = '',
                        has_off = true,
                        off_flags = ''
                        pos += 3
                    }else{
                        var on_flags = pattern[pos + 2],
                            has_off = false,
                            off_flags = '',
                            auL = 'auL'.indexOf(pattern[pos + 2]) > -1 ? 1 : 0,
                            closed = false
                        pos += 3
                        while(pos < pattern.length){
                            if(flags.indexOf(pattern[pos]) > -1){
                                if('auL'.indexOf(pattern[pos]) > -1){
                                    auL++
                                    if(auL > 1){
                                        throw Error("bad inline flags: flags 'a', 'u'" +
                                            " and 'L' are incompatible")
                                    }
                                }
                                on_flags += pattern[pos]
                                pos++
                            }else if(pattern[pos] == '-'){
                                has_off = true
                                closed = true
                                pos++
                                break
                            }else if(pattern[pos].match(/[a-zA-Z]/)){
                                throw Error("unknown flag")
                            }else if(':)'.indexOf(pattern[pos]) > -1){
                                closed = true
                                break
                            }else{
                                throw Error("missing -, : or )")
                            }
                        }
                        if(! closed){
                            throw Error("missing -, : or )")
                        }
                    }
                    if(has_off){
                        while(pos < pattern.length){
                            if(flags.indexOf(pattern[pos]) > -1){
                                if('auL'.indexOf(pattern[pos]) > -1){
                                    throw Error("bad inline flags: cannot turn off " +
                                        "flags 'a', 'u' and 'L'")
                                }
                                if(on_flags.indexOf(pattern[pos]) > -1){
                                    throw Error("bad inline flags: flag turned on and off")
                                }
                                off_flags += pattern[pos]
                                pos++
                            }else if(pattern[pos] == ':'){
                                break
                            }else if(pattern[pos].match(/[a-zA-Z]/)){
                                throw Error("unknown flag")
                            }else if(off_flags == ''){
                                throw Error("missing flag")
                            }else{
                                throw Error("missing :")
                            }
                        }
                        if(off_flags == ''){
                            throw Error("missing flag")
                        }
                    }
                    if(has_off && pattern[pos] != ':'){
                        throw Error("missing :")
                    }
                    if(on_flags == '' && off_flags == ''){
                        throw Error("missing flag")
                    }
                }else if(pattern[pos + 2] == '#'){
                    pos += 3
                    while(pos < pattern.length){
                        if(pattern[pos] == ')'){
                            break
                        }
                        pos++
                    }
                    if(pos == pattern.length){
                        throw Error("missing ), unterminated comment")
                    }
                    pos++
                    continue
                }else{
                    throw Error("unknown extension ?" + pattern[pos + 2])
                }
                yield new Group({type: 'flags', on_flags, off_flags})
                pos++
            }else{
                yield new Group()
                pos++
            }
        }else if(char == ')'){
            yield GroupEnd
            pos++
        }else if(char == '\\'){
            var escape = escaped_char(pattern, pos)
            if(typeof escape.value == "number"){
                yield new BackReference("num", escape.value)
                pos += escape.length
            }else{
                yield new Char(escape)
                pos += escape.length
            }
        }else if(char == '['){
            // Set of characters
            var set,
                end_pos
            [set, end_pos] = parse_character_set(pattern, pos + 1)
             yield new Char(set)
             pos = end_pos + 1
        }else if('+?*'.indexOf(char) > -1){
            if(pattern[pos + 1] == '?'){
                yield new Repeater(char, true)
                pos += 2
            }else{
                yield new Repeater(char)
                pos++
            }
        }else if(char == '{'){
            var reps = /\{(\d+)((,)(\d+))?\}/.exec(pattern.substr(pos))
            if(reps){
                var limits = [parseInt(reps[1])]
                if(reps[4] !== undefined){
                    var max = parseInt(reps[4])
                    if(max < limits[0]){
                        throw Error('min repeat greater than max repeat')
                    }
                    limits.push(max)
                }
                pos += reps[0].length
                if(pattern[pos + 1] == '?'){
                    yield new Repeater(limits, true)
                    pos++
                }else{
                    yield new Repeater(limits)
                }
            }else{
                throw Error('{ not terminated')
            }
       }else if(char == '|'){
           yield Or
           pos++
       }else{
            yield new Char(char)
            pos++
        }
    }
}

function match(pattern, s, pos){

    function* PatternReader(items){
        var pos = 0,
            len = items.length
        while(pos < len){
            var item = items[pos]
            if((item instanceof Char || item instanceof Group)
                    && item.repeat){
                item.str = ''
                item.nb_success = 0
            }
            yield item
            pos++
        }
    }

    var pos = pos || 0,
        items
    if(typeof pattern == "string"){
        items = compile(pattern)
    }else{
        items = pattern // instance of Pattern
    }
    var pattern_reader = PatternReader(items.items)
    var model = pattern_reader.next().value,
        char,
        match_string = ''
    while(true){
        char = s[pos]
        //console.log("match char", char, "against model", model)
        if(char === undefined){
            // end of string before end of pattern
            return false
        }
        if(model instanceof Group || model instanceof Char){
            var group_match = model.match(s, pos)
            if(group_match){
                match_string += group_match
                pos += group_match.length
                if(! model.repeat){
                    model = pattern_reader.next().value
                    if(model === undefined){
                        return match_string
                    }
                }
                if(pos == s.length){
                    return false
                }
            }else{
                if(model.repeat){
                    // test if repeat condition is ok
                    if(! model.test_repeat_fail()){
                        return false
                    }
                    model = pattern_reader.next().value
                }else{
                    if(pos < s.length - 1){
                        // start again at next position in string
                        return match(pattern, s, pos + 1)
                    }
                    return false
                }
            }
        }
    }
    return match_string
}

function MatchObject(string, re, start, end, groups){
    this.string = string
    this.start = start
    this.end = end
    this.re = re
    this._groups = groups
}

MatchObject.prototype.groups = function(_default){
    var result = []
    for(var i = 0, len = this.re.groups.length; i < len; i++){
        var group_num = this.re.groups[i].num
        if(this._groups[group_num] === undefined){
            result.push(_default)
        }else{
            result.push(this._groups[group_num])
        }
    }
    return result
}


var $module = {
    compile: compile,
    match: match
}
