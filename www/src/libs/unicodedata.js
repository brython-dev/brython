// Implementation of unicodedata
(function($B) {

    var _b_ = $B.builtins

    // Load unicode table if not already loaded
    if ($B.unicodedb === undefined) {
        var xhr = new XMLHttpRequest
        xhr.open("GET",
            $B.brython_path + "unicode.txt", false)
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    $B.unicodedb = this.responseText
                } else {
                    console.log("Warning - could not " +
                        "load unicode.txt")
                }
            }
        }
        xhr.send()
    }

    function _info(chr) {
        var ord = _b_.ord(chr),
            hex = ord.toString(16).toUpperCase()
        while (hex.length < 4) {hex = "0" + hex}
        var re = new RegExp("^" + hex +";(.+?);(.*?);(.*?);(.*?);(.*?);(.*);(.*);(.*)$",
                "m"),
            search = re.exec($B.unicodedb)
        if (search === null) {
            return null
        } else {
            return {
                name: search[1],
                category: search[2],
                combining: search[3],
                bidirectional: search[4],
                decomposition: search[5],
                decimal: search[6],
                digit: search[7],
                numeric: search[8]
            }
        }
    }

    // East Asian Width (Unicode 16.0.0 EastAsianWidth.txt), non-N ranges
    // only; unlisted code points are "N"
    var _eaw_data = "20:7e:Na|a1:a1:A|a2:a3:Na|a4:a4:A|a5:a6:Na|a7:a8:A|aa:aa:A|ac:ac:Na|ad:ae:A|af:af:Na|b0:b4:A|b6:ba:A|bc:bf:A|c6:c6:A|d0:d0:A|d7:d8:A|de:e1:A|e6:e6:A|e8:ea:A|ec:ed:A|f0:f0:A|f2:f3:A|f7:fa:A|fc:fc:A|fe:fe:A|101:101:A|111:111:A|113:113:A|11b:11b:A|126:127:A|12b:12b:A|131:133:A|138:138:A|13f:142:A|144:144:A|148:14b:A|14d:14d:A|152:153:A|166:167:A|16b:16b:A|1ce:1ce:A|1d0:1d0:A|1d2:1d2:A|1d4:1d4:A|1d6:1d6:A|1d8:1d8:A|1da:1da:A|1dc:1dc:A|251:251:A|261:261:A|2c4:2c4:A|2c7:2c7:A|2c9:2cb:A|2cd:2cd:A|2d0:2d0:A|2d8:2db:A|2dd:2dd:A|2df:2df:A|300:36f:A|391:3a1:A|3a3:3a9:A|3b1:3c1:A|3c3:3c9:A|401:401:A|410:44f:A|451:451:A|1100:115f:W|2010:2010:A|2013:2016:A|2018:2019:A|201c:201d:A|2020:2022:A|2024:2027:A|2030:2030:A|2032:2033:A|2035:2035:A|203b:203b:A|203e:203e:A|2074:2074:A|207f:207f:A|2081:2084:A|20a9:20a9:H|20ac:20ac:A|2103:2103:A|2105:2105:A|2109:2109:A|2113:2113:A|2116:2116:A|2121:2122:A|2126:2126:A|212b:212b:A|2153:2154:A|215b:215e:A|2160:216b:A|2170:2179:A|2189:2189:A|2190:2199:A|21b8:21b9:A|21d2:21d2:A|21d4:21d4:A|21e7:21e7:A|2200:2200:A|2202:2203:A|2207:2208:A|220b:220b:A|220f:220f:A|2211:2211:A|2215:2215:A|221a:221a:A|221d:2220:A|2223:2223:A|2225:2225:A|2227:222c:A|222e:222e:A|2234:2237:A|223c:223d:A|2248:2248:A|224c:224c:A|2252:2252:A|2260:2261:A|2264:2267:A|226a:226b:A|226e:226f:A|2282:2283:A|2286:2287:A|2295:2295:A|2299:2299:A|22a5:22a5:A|22bf:22bf:A|2312:2312:A|231a:231b:W|2329:232a:W|23e9:23ec:W|23f0:23f0:W|23f3:23f3:W|2460:24e9:A|24eb:254b:A|2550:2573:A|2580:258f:A|2592:2595:A|25a0:25a1:A|25a3:25a9:A|25b2:25b3:A|25b6:25b7:A|25bc:25bd:A|25c0:25c1:A|25c6:25c8:A|25cb:25cb:A|25ce:25d1:A|25e2:25e5:A|25ef:25ef:A|25fd:25fe:W|2605:2606:A|2609:2609:A|260e:260f:A|2614:2615:W|261c:261c:A|261e:261e:A|2630:2637:W|2640:2640:A|2642:2642:A|2648:2653:W|2660:2661:A|2663:2665:A|2667:266a:A|266c:266d:A|266f:266f:A|267f:267f:W|268a:268f:W|2693:2693:W|269e:269f:A|26a1:26a1:W|26aa:26ab:W|26bd:26be:W|26bf:26bf:A|26c4:26c5:W|26c6:26cd:A|26ce:26ce:W|26cf:26d3:A|26d4:26d4:W|26d5:26e1:A|26e3:26e3:A|26e8:26e9:A|26ea:26ea:W|26eb:26f1:A|26f2:26f3:W|26f4:26f4:A|26f5:26f5:W|26f6:26f9:A|26fa:26fa:W|26fb:26fc:A|26fd:26fd:W|26fe:26ff:A|2705:2705:W|270a:270b:W|2728:2728:W|273d:273d:A|274c:274c:W|274e:274e:W|2753:2755:W|2757:2757:W|2776:277f:A|2795:2797:W|27b0:27b0:W|27bf:27bf:W|27e6:27ed:Na|2985:2986:Na|2b1b:2b1c:W|2b50:2b50:W|2b55:2b55:W|2b56:2b59:A|2e80:2e99:W|2e9b:2ef3:W|2f00:2fd5:W|2ff0:2fff:W|3000:3000:F|3001:303e:W|3041:3096:W|3099:30ff:W|3105:312f:W|3131:318e:W|3190:31e5:W|31ef:321e:W|3220:3247:W|3248:324f:A|3250:a48c:W|a490:a4c6:W|a960:a97c:W|ac00:d7a3:W|e000:f8ff:A|f900:faff:W|fe00:fe0f:A|fe10:fe19:W|fe30:fe52:W|fe54:fe66:W|fe68:fe6b:W|ff01:ff60:F|ff61:ffbe:H|ffc2:ffc7:H|ffca:ffcf:H|ffd2:ffd7:H|ffda:ffdc:H|ffe0:ffe6:F|ffe8:ffee:H|fffd:fffd:A|16fe0:16fe4:W|16ff0:16ff1:W|17000:187f7:W|18800:18cd5:W|18cff:18d08:W|1aff0:1aff3:W|1aff5:1affb:W|1affd:1affe:W|1b000:1b122:W|1b132:1b132:W|1b150:1b152:W|1b155:1b155:W|1b164:1b167:W|1b170:1b2fb:W|1d300:1d356:W|1d360:1d376:W|1f004:1f004:W|1f0cf:1f0cf:W|1f100:1f10a:A|1f110:1f12d:A|1f130:1f169:A|1f170:1f18d:A|1f18e:1f18e:W|1f18f:1f190:A|1f191:1f19a:W|1f19b:1f1ac:A|1f200:1f202:W|1f210:1f23b:W|1f240:1f248:W|1f250:1f251:W|1f260:1f265:W|1f300:1f320:W|1f32d:1f335:W|1f337:1f37c:W|1f37e:1f393:W|1f3a0:1f3ca:W|1f3cf:1f3d3:W|1f3e0:1f3f0:W|1f3f4:1f3f4:W|1f3f8:1f43e:W|1f440:1f440:W|1f442:1f4fc:W|1f4ff:1f53d:W|1f54b:1f54e:W|1f550:1f567:W|1f57a:1f57a:W|1f595:1f596:W|1f5a4:1f5a4:W|1f5fb:1f64f:W|1f680:1f6c5:W|1f6cc:1f6cc:W|1f6d0:1f6d2:W|1f6d5:1f6d7:W|1f6dc:1f6df:W|1f6eb:1f6ec:W|1f6f4:1f6fc:W|1f7e0:1f7eb:W|1f7f0:1f7f0:W|1f90c:1f93a:W|1f93c:1f945:W|1f947:1f9ff:W|1fa70:1fa7c:W|1fa80:1fa89:W|1fa8f:1fac6:W|1face:1fadc:W|1fadf:1fae9:W|1faf0:1faf8:W|20000:2fffd:W|30000:3fffd:W|e0100:e01ef:A|f0000:ffffd:A|100000:10fffd:A",
        _eaw_ranges = []
    for (var _item of _eaw_data.split('|')) {
        var _p = _item.split(':')
        _eaw_ranges.push([parseInt(_p[0], 16), parseInt(_p[1], 16), _p[2]])
    }

    function east_asian_width(unistr) {
        // Returns the east asian width assigned to the character unistr as
        // string.
        if (! $B.$isinstance(unistr, _b_.str) ||
                Array.from(unistr).length != 1) {
            $B.RAISE(_b_.TypeError,
                "east_asian_width() argument must be a unicode character")
        }
        var cp = unistr.codePointAt(0),
            lo = 0,
            hi = _eaw_ranges.length - 1
        while (lo <= hi) {
            var mid = (lo + hi) >> 1,
                r = _eaw_ranges[mid]
            if (cp < r[0]) {
                hi = mid - 1
            } else if (cp > r[1]) {
                lo = mid + 1
            } else {
                return r[2]
            }
        }
        return "N"
    }

    function bidirectional(chr) {
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr, hex)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.bidirectional
    }

    function category(chr) {
        // Returns the general category assigned to the character chr as
        // string.
        if (/\p{Cn}/u.test(chr.charAt(0))) {
            return "Cn"
        }
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.category
    }

    function combining(chr) {
        // Returns the general category assigned to the character chr as
        // string.
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.combining)
    }

    function decimal(chr, _default) {
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.decimal)
    }

    function decomposition(chr, _default) {
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.decomposition
    }

    function digit(chr, _default) {
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if (search === null) {
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.digit)
    }

    function lookup(name) {
        // Look up character by name. If a character with the given name is
        // found, return the corresponding character. If not found, KeyError
        // is raised.
        var re = new RegExp("^([0-9A-F]+);" +
            name + ";(.*)$", "m")
        search = re.exec($B.unicodedb)
        if (search === null) {
            $B.RAISE(_b_.KeyError, "undefined character name '" +
                name + "'")
        }
        var res = parseInt(search[1], 16)
        return _b_.chr(res)
    }

    function name(chr, _default) {
        // Returns the name assigned to the character chr as a string. If no
        // name is defined, default is returned, or, if not given, ValueError
        // is raised.
        var search = _info(chr)
        if (search === null) {
            if (_default) {return _default}
            $B.RAISE(_b_.KeyError, "undefined character name '" +
                chr + "'")
        }
        return search.name
    }

    function normalize(form, unistr) {
        if (! ["NFC", "NFD", "NFKC", "NFKD"].includes(form)) {
            $B.RAISE(_b_.ValueError, 'invalid normalization form')
        }
        return unistr.normalize(form)
    }

    function numeric(chr, _default) {
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if (search === null) {
            if (_default) {return _default}
            $B.RAISE(_b_.KeyError, chr)
        }
        var parts = search.numeric.split('/'),
            value
        if (parts.length == 1) {
            value = parseFloat(search.numeric)
        } else {
            value = parseInt(parts[0]) / parseInt(parts[1])
        }
        return $B.fast_float(value)
    }

    var module = {
        bidirectional: bidirectional,
        category: category,
        east_asian_width: east_asian_width,
        combining: combining,
        decimal: decimal,
        decomposition: decomposition,
        digit: digit,
        lookup: lookup,
        name: name,
        normalize: normalize,
        numeric: numeric,
        unidata_version: "11.0.0"
    }
    module.ucd_3_2_0 = {}
    for (var key in module) {
        if (key == "unidata_version") {
            module.ucd_3_2_0[key] = '3.2.0'
        } else {
            module.ucd_3_2_0[key] = module[key] // approximation...
        }
    }
    $B.addToImported('unicodedata', module)

})(__BRYTHON__)