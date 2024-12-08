

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
    this.bits = (v << this.position) | this.bits
    //console.log('xxx after writeBit', v, 'this.bits', this.bits, this.bits.toString(2))
    this.position++
    if(this.position >= 8){
        this.flush()
    }
}

_BitWriter.prototype.flush = function(){
    this.position = 0
    this.current.push(this.bits)
    //console.log('xxx flush, this.bits', this.bits, 'position', this.position)
    this.bits = 0
}

_BitWriter.prototype.writeInt = function(v, nb, order){
    order = order ?? 'lsf'
    // console.log('xxx write', v, 'on', nb, 'bits', order)
    switch(order){
        case 'msf':
            var coef = 1 << (nb - 1)
            //console.log('xxx write', v, 'on', nb, 'bits', order)
            var n = 0
            while(coef > v){
                //console.log('coef', coef, '>', v, 'write 0')
                this.writeBit(0)
                coef >>= 1
                n++
            }
            //console.log('wrote', n, 'zeroes')
            while(coef > 0){
                this.writeBit(v & coef ? 1 : 0)
                //console.log('write', v & coef ? 1 : 0)
                coef >>= 1
            }
            //console.log('this.bits', this.bits)
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

function BitIO(bytestream){
    this.bytestream = []
    this.bytenum = 0
    this.bitnum = 0
    this.revbits = 0
    this.bitrank = 0
}

BitIO.prototype.pos = function(){
    //@property
    //def pos(self):
    return this.bytenum * 8 + this.bitnum
}

BitIO.prototype.read = function(nb, order="lsf"){
    var result = 0
    var coef = order == "lsf" ? 1 : 2 ** (nb - 1)
    for(var i = 0; i < nb; i++){
        if(this.bitnum == 8){
            if(this.bytenum == self.bytestream.length - 1){
                return null
            }
            this.bytenum += 1
            this.bitnum = 0
        }
        var mask = 2 ** this.bitnum
        if(mask & this.bytestream[this.bytenum]){
            result += coef
        }
        this.bitnum += 1
        if(order == "lsf"){
            coef *= 2
        }else{
            coef //= 2
        }
    }
    return result
}

BitIO.prototype.write = function(...bits){
    for(let bit of bits){
        this.write_bit(bit)
    }
}

BitIO.prototype.write_int = function(value, nb, order="lsf"){
    // Write integer on nb bits
    if(value >= 2 ** nb){
        throw _b_.ValueError.$factory(`can't write value ${value} on ${nb} bits`)
    }
    var b = value.toString(2)
    var nb_pad = nb - b.length
    if(order == 'lsf'){
        b = b.split('').reverse().join('')
        for(let car of b){
            this.write_bit(car == '0' ? 0 : 1)
        }
        for(let i = 0; i < nb_pad; i++){
            this.write_bit(0)
        }
    }else{
        for(let i = 0; i < nb_pad; i++){
            this.write_bit(0)
        }
        for(let car of b){
            this.write_bit(car == '0' ? 0 : 1)
        }
    }
}

BitIO.prototype.write_bit = function(v){
    if(v == 1){
        this.revbits += v << this.bitrank
    }
    this.bitrank += 1
    if(this.bitrank == 8){
        this.flush()
    }
}

BitIO.prototype.pad_last = function(){
    if(this.bitrank != 1){
        this.flush()
    }
}

BitIO.prototype.flush = function(){
    this.bytestream.push(this.revbits)
    this.bitrank = 0
    this.revbits = 0
}

function Text(bytes){
    this.bytes = bytes
    this.length = bytes.length
    this.hash = {} // this.hash[pos] is the hash of the 3-elt sequence at pos
    this.hash_pos = {} // maps hashes to list of positions in bytes
    this.hash_start = -1
    this.hashed = []
    this.hashes = {}
}

Text.prototype.at = function(pos){
    return this.bytes[pos]
}

$B.nb_dup = 0

function make_hash(bytes, pos){
    var res = bytes[pos] + (bytes[pos + 1] << 8) +
           (bytes[pos + 2] << 16)
    return res
}

Text.prototype.make_hash = function(pos, nb){
    var res = this.at(pos),
        coeff = 8
    for(var i = 1; i < nb; i++){
        res += (this.at(pos + i) << coeff)
        coeff *= 2
    }
    if(this.hashed[pos] !== undefined){
        $B.nb_dup++
        return res
    }
    this.hashed[pos] = res
    if(this.hashes[res]){
        var item = {pos, previous: this.hashes[res]}
        if(item.previous.pos > item.pos){
            console.log(pos, res, item)
            throw Error('wrong order')
        }
        this.hashes[res] = item
    }else{
        this.hashes[res] = {pos, previous: null}
    }
    return res
}

function to_str(bytes){
    return bytes.map(x => String.fromCodePoint(x)).join('')
}

function restore(items){
    var s = ''
    for(var item of items){
      if(typeof item == "number"){
          s += String.fromCodePoint(item)
      }else{
          var len = item[0],
              distance = item[1]
          s += s.substr(s.length - distance, len)
      }
    }
    return s
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

$B.count_matches = 0
$B.count_matches1 = 0

var mod = {
    BitWriter,
    crc32: function(bytes, crc) {
        var crc = crc ^ (-1)

        for (var byte of bytes.source) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xFF]
        }

        return (crc ^ (-1)) >>> 0
    },
    lz_generator: function(text, size, min_len){
        /*
        Returns a list of items based on the LZ algorithm, using the
        specified window size and a minimum match length.
        The items are a tuple (length, distance) if a match has been
        found, and a byte otherwise.
        'text' is an instance of Python 'bytes' class, the actual bytes are in
        text.source
        */
        var window_mask = 2 ** Math.log2(size) - 1 //size - 1
        var window_size = size
        var bytes = text.source
        var text_length = bytes.length
        //text = new Text(text.source)
        if(min_len === undefined){
            min_len = 3
        }
        var pos = 0, // position in text
            items = [], // returned items
            start,
            h,
            hashes = {}
        var t0 = globalThis.performance.now()
        while(pos < text_length){
            if(pos > text_length - min_len){
                for(var i = pos; i < text_length; i++){
                    items.push($B.fast_tuple([0, bytes[i]]))
                }
                break
            }
            // Search the sequence in the 'size' previous bytes
            start = Math.max(0, pos - size)
            h = bytes[pos] + (bytes[pos + 1] << 8) + (bytes[pos + 2] << 16)
            if((! hashes[h]) || hashes[h].pos < start){
                hashes[h] = {pos, previous: null}
                items.push($B.fast_tuple([0, bytes[pos]]))
                pos += 1
            }else{
                var match = hashes[h]
                var nb_matches = 0,
                    best_match_length = min_len,
                    best_match = match
                while(match && nb_matches < 8){
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
                hashes[h] = {pos, previous: hashes[h]}
                var distance = pos - best_match.pos
                items.push($B.fast_tuple([best_match_length, pos - best_match.pos]))
                pos += best_match_length
            }
        }
        return $B.$list(items)
    }
}

$B.addToImported('_zlib_utils', mod)

})(__BRYTHON__)
