

(function($B){

var _b_ = $B.builtins

function clone(obj){
    var res = {}
    for(var key in obj){
        res[key] = obj[key]
    }
    return res
}

function BitWriter(){
    return new _BitWriter()
}

function _BitWriter(){
    this.current = []
    this.bits = 0
    this.position = 0
}

_BitWriter.prototype.writeBit = function(v){
    this.bits |= (v << this.position)
    this.position++
    if(this.position >= 8){
        this.flush()
    }
}

_BitWriter.prototype.flush = function(){
    this.position = 0
    this.current.push(this.bits)
    this.bits = 0
}

_BitWriter.prototype.writeInt = function(v, nb, order){
    order = order ?? 'lsf'
    switch(order){
        case 'msf':
            var coef = 1 << (nb - 1)
            var n = 0
            while(coef > v){
                this.writeBit(0)
                coef >>= 1
                n++
            }
            while(coef > 0){
                this.writeBit(v & coef ? 1 : 0)
                coef >>= 1
            }
            break
        case 'lsf':
            var coef = 1
            var b = 0
            var n = 0
            while(coef <= v){
                this.writeBit(v & coef ? 1 : 0)
                coef <<= 1
                n++
            }
            while(n < nb){
                this.writeBit(0)
                coef <<= 1
                n++
            }
            if(n != nb){
                console.log('n', n, 'nb', nb)
                throw Error()
            }
    }
}

_BitWriter.prototype.padLast = function(){
    if(this.position != 0){
        this.flush()
    }
}

function BitReader(bytes){
    return new _BitReader(bytes)
}

function _BitReader(bytes){
    this.bytes = bytes.source
    this.index = 0
    this.position = 0
    this.byte = this.bytes[0]
}

_BitReader.prototype.readBit = function(){
    if(this.position == 8){
        this.byte = this.bytes[++this.index]
        if(this.byte === undefined){
            throw Error('end of steam')
        }
        this.position = 0
    }
    var res = this.byte & 1
    this.byte >>= 1
    this.position++
    return res
}

_BitReader.prototype.read = function(nb, order){
    // read nb bits, convert to int
    order = order ?? 'lsf'
    var result = 0
    switch(order){
        case 'lsf':
            var coef = 0
            for(var i = 0; i < nb; i++){
                var bit = this.readBit()
                result += bit << coef
                coef += 1
            }
            break
        case 'msf':
            var coef = nb - 1
            for(var i = 0; i < nb; i++){
                result += this.readBit() << coef
                coef -= 1
            }
            break
    }
    return result
}

var c
var crcTable = []
for(var n = 0; n < 256; n++){
    c = n
    for(var k = 0; k < 8; k++){
        c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1))
    }
    crcTable[n] = c
}

function best_match(bytes, match, pos, start, min_len){
    var nb_matches = 0,
        best_match_length = min_len,
        best_match = match,
        text_length = bytes.length
    while(match && nb_matches < 512){
        var mpos = match.pos + min_len,
            npos = pos + min_len,
            match_len = min_len
        while(++match_len < 258 && npos < text_length &&
                bytes[mpos] == bytes[npos]){
            mpos++
            npos++
        }
        if(npos - pos > best_match_length){
            best_match_length = npos - pos
            best_match = match
        }
        if(match.previous && match.previous.pos < start){
            match.previous = null
        }
        match = match.previous
        nb_matches++
    }
    return {match: best_match, length: best_match_length}
}

function divmod(x, y){
    return [Math.floor(x / y), x % y]
}

function length_to_code(length){
    var a, b
    if(length < 11){
        return [254 + length, 0, 0]
    }else if(length < 19){
        [a, b] = divmod(length - 11, 2)
        return [265 + a, b, 1]
    }else if(length < 35){
        [a, b] = divmod(length - 19, 4)
        return [269 + a, b, 2]
    }else if(length < 67){
        [a, b] = divmod(length - 35, 8)
        return [273 + a, b, 3]
    }else if(length < 131){
        [a, b] = divmod(length - 67, 16)
        return [277 + a, b, 4]
    }else if(length < 258){
        [a, b] = divmod(length - 131, 32)
        return [281 + a, b, 5]
    }else if(length == 258){
        return [285, 0, 0]
    }
}

function distance_to_code(distance){
    if(distance < 5){
        return [distance - 1, 0, 0]
    }else{
        let d = distance
        let coef = 2
        let p = 2
        while(2 ** (p + 1) < d){
            p += 1
        }
        let d0 = 2 ** p + 1
        let a, b
        [a, b] = divmod(d - d0, 2 ** (p - 1))
        return [2 * p + a, b, p - 1]
    }
}

function normalized(codelengths){
    let [car, codelength] = codelengths[0]
    let v = 0
    let codes = {}
    codes[car] = [0, codelength]

    for(let [newcar, nbits] of codelengths.slice(1)){
        v += 1
        if(nbits > codelength){
            v <<= nbits - codelength
            codelength = nbits
        }
        codes[newcar] = [v, codelength]
    }
    return codes
}

function Node(char=null, weight=0, level=0){
    this.char = char
    this.is_leaf = char !== null
    this.level = level
    this.weight = weight
}

Node.prototype.add = function(children){
    this.children = children
    for(let child of children){
        child.parent = this
        child.level = this.level + 1
    }
}

Node.prototype.toString = function(){
    return `<Node char=${this.char} level=${this.level} weight=${this.weight}>`
}

$B.counter = 0

function make_tree(node, codes){
    $B.counter++
    if(! node.hasOwnProperty("parent")){
        node.code = ''
    }
    let children = []
    let child
    for(let bit of '01'){
        let next_code = node.code + bit
        if(codes.hasOwnProperty(next_code)){
            child = new Node(codes[next_code])
        }else{
            child = new Node()
        }
        child.code = next_code
        children.push(child)
    }
    node.add(children)
    for(child of children){
        if(! child.is_leaf){
            make_tree(child, codes)
        }
    }
}

function _read_literal_or_length(reader, root){
    let node = root

    while(true){
        let code = reader.read(1)
        let child = node.children[code]
        let length
        if(child.is_leaf){
            if(child.char < 256){
                // literal
                return ["literal", child.char]
            }else if(child.char == 256){
                return ["eob", _b_.None]
            }else{
                // length (number of bytes to copy from a previous location)
                if(child.char < 265){
                    length = child.char - 254
                }else if(child.char < 269){
                    length = 11 + 2 * (child.char - 265) + reader.read(1)
                }else if(child.char < 273){
                    length = 19 + 4 * (child.char - 269) + reader.read(2)
                }else if(child.char < 277){
                    length = 35 + 8 * (child.char - 273) + reader.read(3)
                }else if(child.char < 281){
                    length = 67 + 16 * (child.char - 277) + reader.read(4)
                }else if(child.char < 285){
                    length = 131 + 32 * (child.char - 281) + reader.read(5)
                }else if(child.char == 285){
                    length = 258
                }
                return ["length", length]
            }
        }else{
            node = child
        }
    }
}

function read_codelengths(reader, root, num){
    /*
    Read the num codelengths from the bits in reader, using the Huffman
    tree specified by root.
    */
    let node = root
    let lengths = []
    let nb = 0
    var t = []
    function pr(){
        t.append(...arguments)
    }
    while(lengths.length < num){
        let code = reader.read(1)
        let child = node.children[code]
        if(child.is_leaf){
            if(child.char < 16){
                lengths.push(child.char)
            }else if(child.char == 16){
                repeat = 3 + reader.read(2)
                let last = lengths[lengths.length - 1]
                lengths = lengths.concat(Array(repeat).fill(last, 0, repeat))
            }else if(child.char == 17){
                repeat = 3 + reader.read(3)
                lengths = lengths.concat(Array(repeat).fill(0, 0, repeat))
            }else if(child.char == 18){
                repeat = 11 + reader.read(7)
                lengths = lengths.concat(Array(repeat).fill(0, 0, repeat))
            }
            node = root
        }else{
            node = child
        }
    }
    return lengths
}

function _read_distance(reader, root){
    // Read distance value.
    let node = root

    while(true){
        let code = reader.read(1)
        let child = node.children[code]
        if(child.is_leaf){
            let dist_code = child.char
            let distance
            if(dist_code < 3){
                distance = dist_code + 1
            }else{
                let nb = Math.floor(dist_code / 2) - 1
                let extra = reader.read(nb);
                let [half, delta] = divmod(dist_code, 2)
                distance = 1 + (2 ** half) + delta * (2 ** (half - 1)) + extra
            }
            return distance
        }else{
            node = child
        }
    }
}

function _decomp_dynamic(reader, result){
    let [lit_len_tree, distance_tree] = _dynamic_trees(reader)
    var start_index = reader.index
    var start_position = reader.position
    var len = 0
    while(true){
        // read a literal or length
        let [_type, value] = _read_literal_or_length(reader, lit_len_tree)
        if(_type == 'eob'){
            break
        }else if(_type == 'literal'){
            result.push(value)
            len++
        }else if(_type == 'length'){
            // read a distance
            let length = value
            let distance = _read_distance(reader, distance_tree)
            for(var i = 0; i < length; i++){
                result.push(result[result.length - distance])
            }
            len += length
        }
    }
    if(0){
        console.log('bits read', 8 * (reader.index - start_index) + reader.position - start_position)
        console.log('decoded length', len)
    }
    return $B.$list(result)
}

function pprint(x){
    if(Array.isArray(x)){
        var t = []
        for(var item of x){
            t.push(pprint(item))
        }
        return `[${t.join(', ')}]`
    }else{
        return x
    }
}

function _decompresser(codelengths){
    let lengths = []
    if($B.$isinstance(codelengths, _b_.dict)){
        for(var entry of _b_.dict.$iter_items(codelengths)){
            lengths.push([entry.key, entry.value])
        }
    }else{
        for(var [key, value] of Object.entries(codelengths)){
            lengths.push([parseInt(key), value])
        }
    }
    // remove items with value = 0
    lengths = lengths.filter(x => x[1] > 0)
    // sort by second item, then first item
    lengths.sort(function(a, b){
        if(a[1] < b[1]){
            return -1
        }else if(a[1] == b[1]){
            return a[0] < b[0] ? -1 :
                   a[0] == b[0] ? 0 : 1
        }else{
            return 1
        }
    })
    let codes1 = normalized(lengths)
    let codes2 = {}
    for(var key in codes1){
        let [value, length] = codes1[key]
        let b = value.toString(2)
        codes2["0".repeat(length - b.length) + b] = parseInt(key)
    }
    let root = new Node()
    make_tree(root, codes2)
    return {root, codes: codes2}
}

function tree_from_codelengths(codelengths){
    return _decompresser(codelengths)["root"]
}

function* range(start, stop){
    if(stop === undefined){
        stop = start
        start = 0
    }
    for(var i = start; i < stop; i++){
        yield i
    }
}

let fixed_codelengths = {}
for(let car of range(144)){
    fixed_codelengths[car] = 8
}
for(let car of range(144, 256)){
    fixed_codelengths[car] = 9
}
for(let car of range(256, 280)){
    fixed_codelengths[car] = 7
}
for(let car of range(280, 288)){
    fixed_codelengths[car] = 8
}

let fixed_decomp = _decompresser(fixed_codelengths)
var fixed_lit_len_tree = fixed_decomp["root"]

function _decomp_fixed(reader){
    let root = fixed_lit_len_tree
    let result = []

    while(true){
        // read a literal or length
        let [_type, value] = _read_literal_or_length(reader, root)
        if(_type == 'eob'){
            break
        }else if(_type == 'literal'){
            result.push(value)
        }else if(_type == 'length'){
            let length = value
            // next five bits are the distance code
            let dist_code = reader.read(5, "msf"),
                distance
            if(dist_code < 3){
                distance = dist_code + 1
            }else{
                let nb = Math.floor(dist_code / 2) - 1
                let extra = reader.read(nb)
                let [half, delta] = divmod(dist_code, 2)
                distance = (1 + (2 ** half) +
                    delta * (2 ** (half - 1)) + extra)
            }
            for(var i = 0; i < length; i++){
                result.push(result[result.length - distance])
            }
            node = root
        }else{
            node = child
        }
    }
    return result
}

function _dynamic_trees(reader){
    /*
    reader is at the beginning of the dynamic Huffman tree.
    We have to get the code length for values from 0 to 287 included.
    */
    let HLIT = reader.read(5)
    let HDIST = reader.read(5)
    let HCLEN = reader.read(4)
    // read codes for lengths
    let alphabet = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2,
                    14, 1, 15]
    let clen = {}
    let c = []
    for(var j = 0, len = HCLEN + 4; j < len; j++){
        let length = alphabet[j]
        c.push(reader.read(3))
        clen[length] = c[c.length - 1]
    }

    // tree used to decode code lengths
    let clen_root = tree_from_codelengths(clen)

    // code lengths for the literal / length alphabet
    let lit_len_array = read_codelengths(reader, clen_root, HLIT + 257)
    let lit_len = {}
    for(var i = 0, len = lit_len_array.length; i < len; i++){
        lit_len[i] = lit_len_array[i]
    }
    let lit_len_tree = tree_from_codelengths(lit_len)

    // code lengths for the distances alphabet
    let distances_array = read_codelengths(reader, clen_root, HDIST + 1)
    let distances = {}
    for(var i = 0, len = distances_array.length; i < len; i++){
        distances[i] = distances_array[i]
    }
    let distances_tree = tree_from_codelengths(distances)

    return [lit_len_tree, distances_tree]
}

function _write_items(writer, store, lit_len_dict, distance_dict){
    var lit_len_codes = {}
    for(var entry of _b_.dict.$iter_items(lit_len_dict)){
        lit_len_codes[entry.key] = entry.value
    }
    var distance_codes = {}
    for(var entry of _b_.dict.$iter_items(distance_dict)){
        distance_codes[entry.key] = entry.value
    }
    var value,
        nb,
        length, extra_length, distance, extra_distance,
        lit_len,
        dist
    for(let item of store){
        if(Array.isArray(item)){
            [length, extra_length, distance, extra_distance] = item
            // Length code
            lit_len = lit_len_codes[length]; // semicolon required !
                // otherwise the destructuring assignment below is
                // interpreted as a subscription...
            [value, nb] = lit_len
            writer.writeInt(value, nb, 'msf');
            // Extra bits for length
            [value, nb] = extra_length
            if(nb > 0){
                writer.writeInt(value, nb)
            };
            // Distance code
            [value, nb] = distance_codes[distance]
            writer.writeInt(value, nb, 'msf');
            // Extra bits for distance
            [value, nb] = extra_distance
            if(nb > 0){
                writer.writeInt(value, nb)
            }
        }else{
            [value, nb] = lit_len_codes[item]
            writer.writeInt(value, nb, 'msf')
        }
    }
}

function record(is_final, store, lit_len_count, distance_count, replaced, nb_tuples){
    // Transform JS results into Python structures used in zlib.py
    // mark block end
    store.push(256)

    // transform to Python structures for zlib.py
    let lit_len_dict = $B.empty_dict()
    for(let key in lit_len_count){
        _b_.dict.$setitem(lit_len_dict, parseInt(key), lit_len_count[key])
    }
    let distance_dict = $B.empty_dict()
    for(let key in distance_count){
        _b_.dict.$setitem(distance_dict, parseInt(key), distance_count[key])
    }

    return [is_final, $B.$list(store), lit_len_dict, distance_dict, replaced,
        nb_tuples]
}

function* lz_generator(text, size){
    /*
    Apply the LZ algorithm to the text with the specified window size.

    'text' is an instance of Python 'bytes' class, the actual bytes are in
    text.source.

    Returns a list of:
    - store : the list of items produced by the LZ algorithm (bytes, or
      length / distance information), ended by byte 256
    - a dictionary mapping literal or length code to their number of
      occurrences
    - a dictionary mapping distance code to its number of occurrences
    - the sum of lengths of text parts replaced by a (length, distance)
    */
    var bytes = new Uint8Array(text.source)
    var text_length = bytes.length
    var min_len = 3
    var lit_len_count = {}
    var distance_count = {}
    var store = []
    var replaced = 0
    var nb_tuples = 0
    var pos = 0, // position in text
        start,
        h,
        hashes = {}
    var nb_blocks = 0
    var deflate_block_size = (1 << 14) - 1
    var deflate_block_limit = deflate_block_size
    var is_final

    function store_literal(lit){
        lit_len_count[lit] = (lit_len_count[lit] ?? 0) + 1
        store.push(lit)
    }

    function store_length_distance(length, distance){
        replaced += length
        nb_tuples += 1
        let lcode = length_to_code(length)
        let length_code = lcode[0]
        let extra_length = lcode.slice(1)
        lit_len_count[length_code] = (lit_len_count[length_code] ?? 0) + 1
        let dcode = distance_to_code(distance)
        let distance_code = dcode[0]
        let extra_dist = dcode.slice(1)
        // Increment distances counter
        distance_count[distance_code] =
            (distance_count[distance_code] ?? 0) + 1
        // Add to store for use in next steps
        store.push($B.fast_tuple([length_code, extra_length, distance_code,
                      extra_dist]))
    }

    var t0 = globalThis.performance.now()
    while(pos < text_length){
        if(pos > text_length - min_len){
            // Last items in text
            for(var i = pos; i < text_length; i++){
                store_literal(bytes[i])
            }
            break
        }
        // Search the sequence in the 'size' previous bytes
        start = Math.max(0, pos - size)
        h = bytes[pos] + (bytes[pos + 1] << 8) + (bytes[pos + 2] << 16)
        if((! hashes[h]) || hashes[h].pos < start){
            // Not found, or too far back : emit a byte
            hashes[h] = {pos, previous: null}
            store_literal(bytes[pos])
            pos += 1
        }else{
            var match = hashes[h]
            var best = best_match(bytes, match, pos, start, min_len)
            // Lazy matching: if there is a match at position pos + 1
            // and its length is at least 1 byte longer than the match at
            // pos, it is more efficient to emit the byte at pos and
            // emit [length, distance] for the match at pos + 1
            var next_h = bytes[pos + 1] + (bytes[pos + 2] << 8) +
                    (bytes[pos + 3] << 16)
            var next_match = hashes[next_h]
            if(next_match && next_match.pos > start + 1){
                var next_best = best_match(bytes, next_match, pos + 1,
                        start + 1, min_len)
                if(next_best.length > best.length + 1){
                    // emit current byte
                    store_literal(bytes[pos])
                    hashes[h] = {pos, previous: hashes[h]}
                    // use the match at pos + 1
                    pos += 1
                    best = next_best
                    h = next_h
                }
            }
            var distance = pos - best.match.pos
            store_length_distance(best.length, distance)
            // store hashes at positions between pos + 1 and next pos
            for(var i = 1; i < best.length; i++){
                var ih = bytes[pos + i] + (bytes[pos + i + 1] << 8) +
                         (bytes[pos + i + 2] << 16)
                if(hashes[ih] && hashes[ih].pos > start){
                    hashes[ih] = {pos: pos + i, previous: hashes[ih]}
                }else{
                    hashes[ih] =  {pos: pos + i, previous: null}
                }
            }
            hashes[h] = {pos, previous: hashes[h]}
            pos += best.length
        }
        if(store.length > deflate_block_limit){
            is_final = pos == text.length - 1
            yield record(is_final, store, lit_len_count, distance_count, replaced,
                nb_tuples)
            store = []
            lit_len_count = {}
            distance_count = {}
            replaced = 0
            nb_tuples = 0
            nb_blocks++
            deflate_block_limit = deflate_block_size * nb_blocks
        }
    }
    if(store.length > 0){
        is_final = 1
        yield record(is_final, store, lit_len_count, distance_count, replaced,
                nb_tuples)
    }
}

var mod = {
    adler32: function(bytes, a, b){
        var adler = {a: a ?? 1, b: b ?? 0}
        for(var b of bytes.source){
            adler.a += b
            adler.a %= 65521
            adler.b += adler.a
            adler.b %= 65521
        }
        return adler
    },
    BitReader,
    BitWriter,
    crc32: function(bytes, crc) {
        var crc = crc ^ (-1)

        for (var byte of bytes.source) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xFF]
        }

        return (crc ^ (-1)) >>> 0
    },
    lz_generator,
    _decomp_dynamic,
    _decomp_fixed,
    _decompresser,
    _dynamic_trees,
    _write_items
}

$B.addToImported('_zlib_utils', mod)

})(__BRYTHON__)
