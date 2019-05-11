class LZ77:

    def compress(self, text, size, min_len=3):
        buf = bytearray()

        pos = 0
        while pos < len(text):
            sequence = text[pos:pos + min_len]
            buf_pos = buf.rfind(sequence)
            if buf_pos > -1:
                length = 1
                while length < 259 \
                        and buf_pos + length < len(buf) \
                        and pos + length < len(text) \
                        and text[pos + length] == buf[buf_pos + length]:
                    length += 1

                distance = len(buf) - buf_pos
                if distance == 66:
                    print("distance", distance, "copied",
                        buf[buf_pos : buf_pos + length],
                        len(buf[buf_pos : buf_pos + length]))
                buf += text[pos:pos + length + 1]
                yield (length, distance)
                if pos + length == len(text):
                    break
                else:
                    pos += length + 1
                    yield text[pos - 1]
            else:
                char = text[pos]
                yield char
                buf.append(char)
                pos += 1
            if len(buf) > size:
                buf = buf[len(buf) - size:]

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

