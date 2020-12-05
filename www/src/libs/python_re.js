// Regular expression

var $B = __BRYTHON__,
    _b_ = $B.builtins

var MAXGROUPS = 2147483647

function Pattern(text, node){
    this.text = text
    this.node = node
}

var BPattern = $B.make_class("Pattern",
    function(pattern){
        return {
            __class__: BPattern,
            pattern
        }
    }
)

BPattern.match = function(self, string){
    var mo = match(self.pattern, string)
    if(mo === false){
        return _b_.None
    }
    return BMatchObject.$factory(mo)
}

$B.set_func_names(BPattern, "re")

var BackReference = function(type, value){
        // for "\number"
        this.type = type // "name" or "num"
        this.value = value
    },
    Char = function(char, groups){
        this.char = char
        this.str = ''
        this.nb_success = 0
        this.groups = []
        if(groups){
            for(var group of groups){
                this.groups.push(group)
            }
        }
        this.match = function(s, pos){
            var char = s[pos]
            if(this.repeat){
                if(this.repeat.op == "?" && this.str.length == 1){
                    return false
                }else if(this.repeat.op.start){
                    console.log(this.repeat.op)
                }
            }
            var test = false
            if(char === undefined && this.char !== EmptyString){
                // end of string matches $
                // if true, don't return the empty string (it would be tested
                // like false) but as an object coerced to ''
                return this.char == "$" ? EmptyString : false
            }
            if(this.char == "^"){
                return pos == 0 ? EmptyString : false
            }
            if(this.char.character_class){
                test = char.match(new RegExp(this.char + ''))
            }else if(this.char == '.'){
                test = this.char == char
            }else if(this.char.items){
                test = this.char.items.indexOf(char) > -1
                if(this.char.neg){
                    test = ! test
                }
            }else if(this.char === EmptyString){
                test = true
                char = EmptyString
            }else{
                test = this.char === char
            }
            if(test){
                if(this.repeat){
                    this.nb_success++
                    if(! this.test_repeat_success()){
                        return false
                    }
                }
                for(var group of this.groups){
                    if(group.num !== undefined){
                        group.str += char
                        group.nb_success++
                    }
                }
                this.str += char
                return char
            }
            return false
        }
    },
    Choice = function(){
        this.type = "choice"
        this.items = []
        this.add = function(option){
            this.items.push(option)
            option.parent = this
        }
    },
    ConditionalBackref = function(group_ref){
        this.type = "conditional backref"
        this.group_ref = group_ref
        this.str = ''
        this.nb_success = 0
        this.re_if_exists = new Node()
        this.re_if_not_exists = new Node()
        this.nb_options = 1
    },
    EmptyString = {
        toString: function(){
            return ''
        },
        length: 0
    },
    Flags = function(flags){
        this.flags = flags
    },
    GroupEnd = {},
    Group = function(extension){
        this.type = "group"
        this.items = []
        this.str = ''
        this.nb_success = 0
        this.extension = extension
        if(extension && extension.type == "test_value"){
            this.re_if_exists = new Node()
            this.re_if_exists.info = "test if exists"
            this.re_if_not_exists = new Node()
            this.nb_options = 1
        }
    },
    Or = {},
    Repeater = function(op, greedy){
        this.op = op
        this.greedy = greedy !== undefined
    }

ConditionalBackref.prototype.add = function(item){
    if(this.nb_options == 1){
        this.re_if_exists.add(item)
    }else if(this.nb_options == 2){
        this.re_if_not_exists.add(item)
    }
    item.parent = this
}

ConditionalBackref.prototype.match = function(s, pos){
    var group_ref = this.group_ref
    var re = this.parent
    while(re.parent){
        re = re.parent
    }
    var test
    if(re.groups[group_ref] && re.groups[group_ref].item.nb_success != 0){
        test = match(this.re_if_exists, s, pos)
    }else{
        test = match(this.re_if_not_exists, s, pos)
    }
    return test
}

Group.prototype.add = function(item){
    if(this.extension && this.extension.type == "test_value"){
        if(this.nb_options == 1){
            this.re_if_exists.add(item)
        }else if(this.nb_options == 2){
            this.re_if_not_exists.add(item)
        }
    }else{
        this.items.push(item)
    }
    item.parent = this
}

Group.prototype.match = function(s, pos){
    var group_match = match(this, s, pos)
    if(group_match){
        if(this.repeat){
            // test if repeat condition is still ok
            if(! this.test_repeat_success()){
                return false
            }
        }
    }
    return group_match
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
        if(special.match(/[a-zA-Z]/)){
            throw Error("invalid escape " + special)
        }else{
            return special
        }
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

function Node(parent){
    this.parent = parent
    this.items = []
    this.add = function(item){
        this.items.push(item)
        item.parent = this
    }
}

function compile(pattern){
    var group_num = 0,
        group_stack = [],
        groups = {},
        node = new Node()
    for(var item of tokenize(pattern)){
        if(item instanceof Group){
            group_stack.push(item)
            node.add(item)
            item.state = "open"
            item.num = group_num
            node = item // next items will be stored as group's items
            if(item.extension){
                if(item.extension.non_capturing){
                    delete item.num
                }else if(item.extension.type == "name_def"){
                    group_num++
                    var value = item.extension.value
                    validate(value)
                    if(groups[value] !== undefined){
                        throw Error(`redefinition of group name '${value}' as group` +
                            ` ${group_num}; was group ${groups[value].num}`)
                    }
                    groups[value] = groups[group_num] = {num: group_num, item}
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
                }else{
                    group_num++
                    groups[group_num] = {num: group_num, item}
                }
            }else{
                group_num++
                groups[group_num] = {num: group_num, item}
            }
        }else if(item === GroupEnd){
            if(group_stack.length == 0){
                throw Error("unbalanced parenthesis")
            }
            var item = group_stack.pop()
            if(item instanceof Group && item.items.length == 0){
                item.add(new Char(EmptyString, group_stack.concat([item])))
            }else if(item instanceof ConditionalBackref){
                if(item.re_if_exists.items.length == 0){
                    item.re_if_exists.add(new Char(EmptyString, group_stack))
                }else if(item.re_if_not_exists.items.length == 0){
                    item.re_if_not_exists.add(new Char(EmptyString, group_stack))
                }
            }
            item.state = 'closed'
            node = node.parent
        }else if(item instanceof ConditionalBackref){
            var group_ref = item.group_ref
            if(typeof group_ref == "number"){
                if(group_ref == 0){
                    throw Error(`bad group number`)
                }
                if(group_ref > group_num || group_ref >= MAXGROUPS){
                    throw Error(`invalid group reference ${group_ref}`)
                }
            }else if(groups[group_ref] !== undefined){
                if(groups[group_ref].item.state == "open"){
                    throw Error("cannot refer to an open group")
                }
            }else{
                throw Error(`unknown group name '${group_ref}'`)
            }
            group_stack.push(item)
            node.add(item)
            item.state = "open"
            item.num = group_num
            node = item // next items will be stored as group's items
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
            node.add(item)
        }else if(item instanceof Char){
            item.groups = []
            for(var group of group_stack){
                item.groups.push(group)
            }
            node.add(item)
        }else if(item instanceof Repeater){
            if(node.items.length == 0){
                throw Error("nothing to repeat")
            }
            var previous = node.items[node.items.length - 1]
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
            if(node instanceof ConditionalBackref){
                // case '(?(num)a|'
                if(node.nb_options == 1){
                    node.nb_options++
                }else{
                    throw Error('conditional backref with more than ' +
                       'two branches')
                }
            }else if(node.items.length == 0){
                throw Error("unexpected |")
            }else{
                var previous = node.items[node.items.length - 1]
                if(previous instanceof Choice){
                    node = previous
                }else{
                    var choice = new Choice()
                    var first = node.items.pop()
                    node.add(choice)
                    choice.add(first)
                    node = choice
                }
            }
        }else{
            throw Error("unknown item type " + item)
        }
    }
    if(group_stack.length > 0){
        throw Error("missing ), unterminated subpattern")
    }
    while(node.parent){
        node = node.parent
    }
    node.groups = groups
    node.text = pattern
    node.nb_groups = group_num
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
                    var ref = '',
                        i = pos + 3
                    while(i < pattern.length){
                        if(pattern[i] == ')'){
                            break
                        }
                        ref += pattern[i]
                        i++
                    }
                    if(ref.match(/^\d+$/)){
                        ref = parseInt(ref)
                    }else{
                        validate(ref)
                    }
                    if(i == pattern.length){
                        throw Error("missing ), unterminated name")
                    }
                    yield new ConditionalBackref(ref)
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
            }else if(typeof escape == "string"){
                // eg "\."
                yield new Char(escape)
                pos += 2
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

    function* PatternReader(pattern){
        if(pattern instanceof Char){
            pattern.str = ''
            pattern.nb_success = 0
            yield pattern
        }else{
            var pos = 0,
                len = pattern.items.length
            while(pos < len){
                var item = pattern.items[pos]
                if(item instanceof Char || item instanceof Group){
                    item.str = ''
                    item.nb_success = 0
                    if(item.repeat){
                        item.nb_success = 0
                    }
                }
                yield item
                pos++
            }
        }
    }

    var pos = pos || 0,
        start = pos
    if(typeof pattern == "string"){
        pattern = compile(pattern)
    }
    var pattern_reader = PatternReader(pattern)
    var model = pattern_reader.next().value,
        char,
        match_string = ''
    while(true){
        char = s[pos]
        // console.log("match char", char, "against model", model)
        if(model === undefined){
            // Nothing more in pattern: match is successful
            return new MatchObject(s, match_string, pattern, start)
        }
        if(char === undefined){
            // end of string before end of pattern
            // if the next models accept an empty match, continue
            if(model.repeat && model.test_repeat_fail()){
                model = pattern_reader.next().value
                if(model === undefined){
                    return new MatchObject(s, match_string, pattern,
                            start)
                }
                continue
            }
        }
        if(model instanceof Group ||
                model instanceof Char ||
                model instanceof ConditionalBackref){
            var group_match = model.match(s, pos)
            if(group_match){
                var ms = (group_match instanceof MatchObject) ?
                         group_match.match_string : group_match
                match_string += ms
                pos += ms.length
                if(! model.repeat){
                    model = pattern_reader.next().value
                }
            }else{
                if(model.repeat){
                    // test if repeat condition is ok
                    if(! model.test_repeat_fail()){
                        return false
                    }
                    model = pattern_reader.next().value
                }else{
                    return false
                }
            }
        }else if(model instanceof Choice){
            var found = false
            for(var option of model.items){
                option.str = ''
                option.nb_success = 0
            }
            for(var option of model.items){
                var mo = match(option, s, pos)
                if(mo){
                    found = true
                    match_string += mo.match_string
                    pos += mo.match_string.length
                    break
                }
            }
            if(found){
                model = pattern_reader.next().value
            }else{
                return false
            }
        }
    }
    return new MatchObject(s, match_string, pattern, start)
}

function MatchObject(string, match_string, re, start){
    this.string = string
    this.match_string = match_string
    this.start = start
    this.end = start + match_string.length
    this.re = re
}

MatchObject.prototype.group = function(group_num){
    if(group_num == 0){
        return this.match_string
    }else if(this.re.groups[group_num] !== undefined){
        var item = this.re.groups[group_num].item
        if(item.nb_success == 0){
            return _b_.None
        }
        return item.str
    }else if(_b_.isinstance(group_num, _b_.str)){
        throw _b_.IndexError.$factory("no such group")
    }else{
        throw _b_.IndexError.$factory(group_num)
    }
}

MatchObject.prototype.groups = function(_default){
    var result = []
    for(var i = 0, len = this.re._groups.length; i < len; i++){
        var group_num = this.re._groups[i].num
        if(this.re._groups[group_num] === undefined){
            result.push(_default)
        }else{
            result.push(this.re._groups[group_num])
        }
    }
    return result
}

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

BMatchObject.__setitem__ = function(){
    throw _b_.TypeError.$factory("'re.Match' object does not " +
        "support item assignment")
}

BMatchObject.__str__ = function(self){
    var mo = self.mo
    return `<re.Match object; span=(${mo.start}, ${mo.end}), ` +
        `match='${mo.match_string}'>`
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
    for(var i = 1; i <= self.mo.re.nb_groups; i++){
        var group = self.mo.re.groups[i],
            s = group.item.str
        if(group.item.nb_success == 0){
            s = _default
        }else if(self.mo.data_type === _b_.bytes){
            s = string2bytes(s)
        }
        result.push(s)
    }
    return $B.fast_tuple(result)
}

BMatchObject.$group = function(self, args){
    var res = [],
        groups = self.mo.re.groups || []
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
                        self.mo.re.nb_groups)){
                throw _b_.IndexError.$factory("no such group")
            }
        }
        var item = self.mo.group.call(self.mo, group_num)
        if(self.mo.data_type === _b_.bytes){
            item = string2bytes(item)
        }
        res.push(item)
    }
    return len == 1 ? res[0] : _b_.tuple.$factory(res)
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
        console.log(self.mo.re.groups[group])
        return $B.fast_tuple([-1, -1])
    }
}

$B.set_func_names(BMatchObject, "re")

function str_or_bytes(string, pattern){
    // Check that string and pattern are of the same type : (subclass of) str
    // or (subclass of) bytes
    // Return an object with attributes:
    // - type: str or bytes
    // - string and pattern : strings
    if(typeof string == "string" || _b_.isinstance(string, _b_.str)){
        string = string + '' // for string subclasses
        if(typeof pattern == "string" || _b_.isinstance(pattern, _b_.str)){
            pattern = pattern + ''
        }else{
            throw _b_.TypeError.$factory(`cannot use a `+
                `${$B.class_name(pattern)} pattern on a string-like object`)
        }
        return {
            type: _b_.str,
            string,
            pattern
        }
    }else if(_b_.isinstance(string, [_b_.bytes, _b_.bytearray, _b_.memoryview])){
        if(! _b_.isinstance(pattern, [_b_.bytes, _b_.bytearray, _b_.memoryview])){
            throw _b_.TypeError(`cannot use a ${$B.class_name(pattern)}` +
                ' pattern on a bytes-like object')
        }
        return {
            type: _b_.bytes,
            string: _b_.bytes.decode(_b_.bytes.$factory(string), 'latin1'),
            pattern: _b_.bytes.decode(_b_.bytes.$factory(pattern), 'latin1')
        }
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

var $module = {
    compile: function(){
        var $ = $B.args("compile", 2, {pattern: null, flags: null},
                    ['pattern', 'flags'], arguments, {flags: 0},
                    null, null)
        return BPattern.$factory(compile($.pattern))
    },
    findall: function(){
        var $ = $B.args("findall", 3, {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments, {flags: 0},
                    null, null),
                pattern = $.pattern,
                string = $.string
        var result = [],
            pos = 0
        if(pattern.__class__ === BPattern){
            pattern = pattern.pattern
        }
        var data = str_or_bytes(string, pattern),
            pattern = data.pattern,
            string = data.string
        if(data.type === _b_.str){
            function conv(s){
                return s === EmptyString ? '' : s
            }
        }else{
            function conv(s){
                return string2bytes(s)
            }
        }
        while(pos < string.length){
            var mo = match(pattern, string, pos)
            if(mo){
                if(mo.re.nb_groups){
                    if(mo.re.nb_groups == 1){
                        result.push(conv(mo.re.groups[1].item.str))
                    }else{
                        var groups = []
                        for(var i = 1, len = mo.re.nb_groups; i <= len; i++){
                            groups.push(conv(mo.re.groups[i].item.str))
                        }
                        result.push($B.fast_tuple(groups))
                    }
                }else{
                    result.push(conv(mo.match_string))
                }
                pos += mo.match_string.length + 1
            }else{
                pos++
            }
        }
        return result
    },
    match: function(){
        var $ = $B.args("match", 3, {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments, {flags: 0},
                    null, null),
                pattern = $.pattern,
                string = $.string
        if(pattern.__class__ === BPattern){
            pattern = pattern.pattern
        }
        var data = str_or_bytes(string, pattern),
            string = data.string,
            pattern = data.pattern
        var mo = match(pattern, string)
        if(mo === false){
            return _b_.None
        }
        mo.data_type = data.type
        return BMatchObject.$factory(mo)
    },
    search: function(){
        var $ = $B.args("search", 3, {pattern: null, string: null, flags: null},
                    ['pattern', 'string', 'flags'], arguments, {flags: 0},
                    null, null),
                pattern = $.pattern,
                string = $.string
        if(pattern.__class__ === BPattern){
            pattern = pattern.pattern
        }
        var data = str_or_bytes(string, pattern),
            string = data.string,
            pattern = data.pattern
        var pos = 0
        while(pos < string.length){
            var mo = match(pattern, string, pos)
            mo.data_type = data.type
            if(mo){
                return BMatchObject.$factory(mo)
            }else{
                pos++
            }
        }
        return _b_.None
    }

}
