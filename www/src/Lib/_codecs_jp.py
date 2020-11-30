from encoding_cp932 import encoding_table, decoding_table # JS module in libs

### Codec APIs

class Codec:

    def encode(self, input, errors='strict'):
        b = []
        for pos, car in enumerate(input):
            cp = ord(car)
            try:
                code = encoding_table[cp]
                high = ((code >> 8) & 0xff)
                low = code & 0xff
                if high:
                  b.append(high)
                b.append(low)
            except IndexError:
                raise UnicodeEncodeError(pos)
        return [bytes(b), len(input)]

    def decode(self, input, errors='strict'):
        i = 0
        string = ''
        while i < len(input):
            dec = decoding_table[input[i]]
            if dec == -1:
                b = 256 * input[i] + input[i + 1]
                try:
                    dec = decoding_table[b]
                    string += chr(dec)
                    i += 1
                except IndexError:
                    raise UnicodeDecodeError(i)
            else:
                string += chr(dec)
            i += 1
        return [string, len(input)]

def getcodec(*args,**kw):
    return Codec
