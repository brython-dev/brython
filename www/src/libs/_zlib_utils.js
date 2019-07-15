
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
        if(found){return i}
    }
    return -1
}

var $module = (function($B){

    return {
        lz_generator: function(text, size, min_len){
            /*
            Returns a list of items based on the LZ algorithm, using the
            specified window size and a minimum match length.
            The items are a tuple (length, distance) if a match has been
            found, and a byte otherwise.
            */
            // 'text' is an instance of Python 'bytes' class, the actual
            // bytes are in text.source
            text = text.source
            if(min_len === undefined){
                min_len = 3
            }
            var pos = 0, // position in text
                items = [] // returned items
            while(pos < text.length){
                sequence = text.slice(pos, pos + min_len)
                if(sequence.length < 3){
                    for(var i = pos; i < text.length; i++){
                        items.push(text[i])
                    }
                    break
                }
                // Search the sequence in the 'size' previous bytes
                buf = text.slice(pos - size, pos)
                buf_pos = rfind(buf, sequence)
                if(buf_pos > -1){
                    // Match of length 3 found; search a longer one
                    var len = 1
                    while(len < 259 &&
                            buf_pos + len < buf.length &&
                            pos + len < text.length &&
                            text[pos + len] == buf[buf_pos + len]){
                        len += 1
                    }
                    match = text.slice(pos, pos + len)
                    // "Lazy matching": search longer match starting at next
                    // position
                    longer_match = false
                    if(pos + len < text.length - 2){
                        match2 = text.slice(pos + 1, pos + len + 2)
                        longer_buf_pos = rfind(buf, match2)
                        if(longer_buf_pos > -1){
                            // found longer match : emit current byte as
                            // literal and move 1 byte forward
                            longer_match = true
                            char = text[pos]
                            items.push(char)
                            pos += 1
                        }
                    }
                    if(! longer_match){
                        distance = buf.length - buf_pos
                        items.push($B.fast_tuple([len, distance]))
                        if(pos + len == text.length){
                            break
                        }else{
                            pos += len
                            items.push(text[pos])
                            pos += 1
                        }
                    }
                }else{
                    char = text[pos]
                    items.push(char)
                    pos += 1
                }
            }
            return items
        }
    }
})(__BRYTHON__)