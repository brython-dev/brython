

(function($B){

function Text(bytes){
    this.bytes = bytes
    this.length = bytes.length
    this.hash = {} // this.hash[pos] is the hash of the 3-elt sequence at pos
    this.hash_pos = {} // maps hashes to list of positions in bytes
    this.hash_start = -1
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

Text.prototype.make_hash = function(pos){
    return this.at(pos) +
            (this.at(pos + 1) << 8) +
            (this.at(pos + 2) << 16)
}

function HashChain(value, pointer){
    // points to the first position in text where hash == value
    this.pointer = pointer
}

function rfind1(text, start, end, seq){
    // find seq in text starting at start
    var pos = start,
        len = seq.length,
        found
    while(pos < end - len){
        if(text[pos] == seq[0]){
            found = true
            for(var i = 1; i < len; i++){
                if(text[pos + i] != seq[i]){
                    found = false
                    break
                }
            }
            if(found){
                return pos
            }
        }
        pos++
    }
    return -1
}

function rfind2(text, start, pos){
    //text.make_hashes(start, pos)
    var h = text.make_hash(pos)
    if(! text.hash_pos.hasOwnProperty(h)){
        // hash was not found
        text.hash_pos[h] = {pos, next: null}
        return -1
    }else{
        var item = text.hash_pos[h]
        // discard items before start
        while(item.pos < start){
            if(item.next !== null){
                item = item.next
                text.hash_pos[h] = item
            }else{
                // no item found after start
                text.hash_pos[h] = {pos, next: null}
                return -1
            }
        }
        var found_at = item.pos
        while(item.next !== null){
            item = item.next
        }
        item.next = {pos, next: null}
        return found_at
    }
}

function rfind(buf, seq){
    var buflen = buf.length,
        len = seq.length
    for(var i = buflen - len; i >= 0; i--){
        var chunk = buf.slice(i, i + len),
            found = true
        for(var j = 0; j < len; j++){
            if(chunk[j] != seq[j]){
                found = false
                break
            }
        }
        if(found){
            return i
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

var c;
var crcTable = [];
for(var n =0; n < 256; n++){
    c = n;
    for(var k =0; k < 8; k++){
        c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
}

var mod = {
    crc32: function(bytes, crc) {
        var crc = crc ^ (-1);

        for (var byte of bytes.source) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xFF];
        }

        return (crc ^ (-1)) >>> 0;
    },

    lz_generator: function(text, size, min_len){
        /*
        Returns a list of items based on the LZ algorithm, using the
        specified window size and a minimum match length.
        The items are a tuple (length, distance) if a match has been
        found, and a byte otherwise.
        */
        // 'text' is an instance of Python 'bytes' class, the actual
        // bytes are in text.source
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
            if(pos > text.length - min_len){
                for(var i = pos; i < text.length; i++){
                    items.push(text.at(i))
                }
                break
            }
            // Search the sequence in the 'size' previous bytes
            start = Math.max(0, pos - size)
            buf_pos = rfind2(text, start, pos)
            if(buf_pos > -1 && buf_pos < pos - min_len){
                // Match of length 3 found; search a longer one
                var len = 1
                while(len < 258 &&
                        buf_pos + len < pos &&
                        pos + len < text.length &&
                        text.at(pos + len) == text.at(buf_pos + len)){
                    len += 1
                }
                // "Lazy matching": search longer match starting at next
                // position
                longer_match = false
                if(pos + len < text.length - 2){
                    // match2 = text.slice(pos + 1, pos + len + 2)
                    var start1 = pos + 1
                    end = pos + len + 2
                    longer_buf_pos = rfind2(text, start1, end)
                    if(longer_buf_pos > -1){
                        // found longer match : emit current byte as
                        // literal and move 1 byte forward
                        longer_match = true
                        char = text.at(pos)
                        items.push(char)
                        pos += 1
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
                        items.push(text.at(pos))
                        pos += 1
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
