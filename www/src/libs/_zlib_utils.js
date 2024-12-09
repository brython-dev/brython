

(function($B){

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

var mod = {
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
        Returns the list of items based on the LZ algorithm, using the
        specified window size.
        The items are 2-item lists [length, distance] if a match has been
        found, and [0, byte] otherwise.
        'text' is an instance of Python 'bytes' class, the actual bytes are in
        text.source
        */
        var bytes = new Uint8Array(text.source)
        var text_length = bytes.length
        var min_len = 3
        var pos = 0, // position in text
            items = [], // returned items
            start,
            h,
            hashes = {}
        var t0 = globalThis.performance.now()
        while(pos < text_length){
            if(pos > text_length - min_len){
                for(var i = pos; i < text_length; i++){
                    items.push([0, bytes[i]])
                }
                break
            }
            // Search the sequence in the 'size' previous bytes
            start = Math.max(0, pos - size)
            h = bytes[pos] + (bytes[pos + 1] << 8) + (bytes[pos + 2] << 16)
            if((! hashes[h]) || hashes[h].pos < start){
                hashes[h] = {pos, previous: null}
                items.push([0, bytes[pos]])
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
                        // store current byte
                        items.push([0, bytes[pos]])
                        hashes[h] = {pos, previous: hashes[h]}
                        // use the match at pos + 1
                        pos += 1
                        best = next_best
                        h = next_h
                    }
                }
                var distance = pos - best.match.pos
                items.push([best.length, distance])
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
        return items
    }
}

$B.addToImported('_zlib_utils', mod)

})(__BRYTHON__)
