

(function($B){

function clone(obj){
    var res = {}
    for(var key in obj){
        res[key] = obj[key]
    }
    return res
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

Text.prototype.make_hashes = function(start, end){
    // for all 3-elt sequences from start to end, store the position of the
    // hash
    for(var pos = start; pos < end; pos++){
        if(this.hash.hasOwnProperty(pos)){
            continue
        }
        var hash = this.hash[pos] = this.make_hash(pos)
        if(pos == 27){
            console.log('hash for pos', pos)
            console.log(this.hash_pos[hash])
            alert()
        }
        if(this.hash_pos.hasOwnProperty(hash)){
            var item = this.hash_pos[hash]
            while(item.next !== null){
                item = item.next
            }
            item.next = {pos, next: null}
        }else{
            this.hash_pos[hash] = {pos, next: null}
        }
    }
    if(end == 28){
        console.log('start', start, 'end', end)
        console.log(this.hash_pos)
        alert()
    }
}

Text.prototype.make_hash = function(pos, nb){
    var res = this.at(pos),
        coeff = 8
    for(var i = 1; i < nb; i++){
        res += (this.at(pos + i) << coeff)
        coeff *= 2
    }
    if(this.hashed[pos] !== undefined){
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

function rfind3(text, start, pos, min_len){
    //text.make_hashes(start, pos)
    var h = text.make_hash(pos, min_len) // sets text.hashes[hash] to {pos, previous}
    var item = text.hashes[h],
        found
    //console.log('at pos', pos, 'h', h, 'item', item, 'start', start)
    if(item === undefined){
        console.log('no text.hashes for pos', pos)
    }
    if(item.previous === null){
        // no previous sequence with the same hash
        return -1
    }else{
        item = item.previous
        if(item.pos >= start){
            found = item
            // discard items before start
            while(item.previous !== null){
                var previous = item.previous
                if(previous.pos < start){
                    item.previous = null
                    break
                }else{
                    if(previous.pos == item.pos - 1){
                        // repetition of the same byte
                        found = previous
                    }
                    item = previous
                }
            }
        }
        if(found){
            return found.pos
        }
    }
    return -1
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

var mod = {
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
        in text.source
        */
        window_mask = 2 ** Math.log2(size) - 1 //size - 1
        window_size = size
        ht = []
        chain = []
        text = new Text(text.source)
        if(min_len === undefined){
            min_len = 3
        }
        var pos = 0, // position in text
            items = [], // returned items
            start
        var t0 = globalThis.performance.now()
        var nb = 1000,
            delta = 1000
        while(pos < text.length){
            //findMatch(text.bytes, text.length, pos)
            //insert(text.bytes, pos)
            if(pos > text.length - min_len){
                for(var i = pos; i < text.length; i++){
                    items.push(text.at(i))
                }
                break
            }
            // Search the sequence in the 'size' previous bytes
            start = Math.max(0, pos - size)
            buf_pos = rfind3(text, start, pos, min_len)
            if(buf_pos > -1){
                // console.log('found at buf_pos', buf_pos, 'pos - min-len', pos - min_len)
            }
            if(buf_pos > -1 && buf_pos < pos - min_len){
                // Match of length min_len found; search a longer one
                var len = 1
                // console.log('match found at pos', pos, 'length', len, 'buf_pos', buf_pos)
                text.make_hash(pos + len, min_len)
                while(len < 258 &&
                        // buf_pos + len < pos &&
                        pos + len < text.length &&
                        text.at(pos + len) == text.at(buf_pos + len)){
                    len += 1
                    text.make_hash(pos + len, min_len)
                }
                // "Lazy matching": search longer match starting at next
                // position
                longer_match = false
                if(len < 258 && pos + len < text.length - 2){
                    var start1 = pos + 1,
                        end = pos + len + 2
                    longer_buf_pos = rfind3(text, start1, end, min_len)
                    if(longer_buf_pos > -1){
                        // found longer match : emit current byte as
                        // literal and move 1 byte forward
                        longer_match = true
                        char = text.at(pos)
                        items.push(char)
                        pos += 1
                        text.make_hash(pos)
                    }
                }
                if(! longer_match){
                    // position of match start in text is buf_pos
                    // distance is pos - buf_pos
                    var distance = pos - buf_pos
                    items.push($B.fast_tuple([len, distance]))
                    if(pos + len == text.length){
                        break
                    }else{
                        pos += len
                    }
                }
            }else{
                char = text.bytes[pos]
                items.push(char)
                pos += 1
            }
        }
        return $B.$list(items)
    }


}

$B.addToImported('_zlib_utils', mod)

})(__BRYTHON__)
