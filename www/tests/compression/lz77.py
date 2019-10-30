class LZ77:

    def compress(self, text, size, min_len=3):

        pos = 0
        while pos < len(text):
            sequence = text[pos:pos + min_len]
            if len(sequence) < 3:
                for char in text[pos:]:
                    yield char
                break
            buf = text[max(0, pos - size):pos]
            buf_pos = buf.rfind(sequence)
            if buf_pos > -1:
                length = 1
                while length < 259 \
                        and buf_pos + length < len(buf) \
                        and pos + length < len(text) \
                        and text[pos + length] == buf[buf_pos + length]:
                    length += 1
                match = text[pos : pos + length]
                # "lazy matching": search longer match starting at next
                # position
                longer_match = False
                if pos + length < len(text) - 2:
                    match2 = text[pos + 1 : pos + length + 2]
                    longer_buf_pos = buf.rfind(match2)
                    if longer_buf_pos > -1:
                        # found longer match : emit current byte as literal
                        # and move 1 byte forward
                        longer_match = True
                        char = text[pos]
                        yield char
                        pos += 1
                if not longer_match:
                    distance = len(buf) - buf_pos
                    yield (length, distance)
                    if pos + length == len(text):
                        break
                    else:
                        pos += length
                        yield text[pos]
                        pos += 1
            else:
                char = text[pos]
                yield char
                pos += 1

    def decompress(self, data):
        res = bytearray()
        for item in data:
            if isinstance(item, int):
                res.append(item)
            else:
                length, distance = item
                end = -distance + length
                if end < 0:
                    match = res[-distance:-distance + length]
                else:
                    match = res[-distance:]
                res += match

        return res

