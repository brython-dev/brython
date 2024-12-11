

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
    BitWriter,
    crc32: function(bytes, crc) {
        var crc = crc ^ (-1)

        for (var byte of bytes.source) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xFF]
        }

        return (crc ^ (-1)) >>> 0
    },
    lz_generator: function(text, size){
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
        var pos = 0, // position in text
            start,
            h,
            hashes = {}

        function store_literal(lit){
            lit_len_count[lit] = (lit_len_count[lit] ?? 0) + 1
            store.push(lit)
        }

        function store_length_distance(length, distance){
            replaced += length
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
                // Optimization: if there is a match at position pos + 1
                // and its length is at least 1 byte longer than the match at
                // pos, it is more efficient to store the byte at pos and
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
                for(var i = 1; i < best.length; i++){
                    // store hashes at positions between pos + 1 and next pos
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
        }
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
        return [$B.$list(store), lit_len_dict, distance_dict, replaced]
    }
}

$B.addToImported('_zlib_utils', mod)

})(__BRYTHON__)
