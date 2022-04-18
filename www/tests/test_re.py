import re

m = re.search('world', 'hello world')
assert m is not None
assert m.string == 'hello world'
assert m.groups() == ()

m = re.match('world', 'hello world')
assert m is None

m = re.match('hello', 'hello world')
assert m is not None
assert m.string == 'hello world'
assert m.groups() == ()

# Samples code in Python 3 doc MatchObject.groups (indices only)

m = re.match(r"(\d+)\.(\d+)", "24.1632")
assert m.groups() == ('24', '1632')

m = re.match(r"(\d+)\.?(\d+)?", "24")
assert m.groups() == ('24', None)
assert m.groups('0') == ('24', '0')

m = re.match(r"(\d+)\.?(\d+)? (--)", "24 --")
assert m.groups() == ('24', None, '--')
assert m.groups('0') == ('24', '0', '--')

# Samples code in Python 3 doc MatchObject.group (indices only)

m = re.match(r"(\w+) (\w+)", "Isaac Newton, physicist")
assert m.group(0) == 'Isaac Newton'
assert m.group(1) == 'Isaac'
assert m.group(2) == 'Newton'
assert m.group(1, 2) == ('Isaac', 'Newton')

m = re.match(r"(..)+", "a1b2c3")
assert m.group(0) == 'a1b2c3'
assert m.group(1) == 'c3'

_parser = re.compile(r"""        # A numeric string consists of:
    \s*
    (?P<sign>[-+])?              # an optional sign, followed by either...
    (
        (?=\d|\.\d)              # ...a number (with at least one digit)
        (?P<int>\d*)             # having a (possibly empty) integer part
        (\.(?P<frac>\d*))?       # followed by an optional fractional part
        (E(?P<exp>[-+]?\d+))?    # followed by an optional exponent, or...
    |
        Inf(inity)?              # ...an infinity, or...
    |
        (?P<signal>s)?           # ...an (optionally signaling)
        NaN                      # NaN
        (?P<diag>\d*)            # with (possibly empty) diagnostic info.
    )
    \s*
    \Z
""", re.VERBOSE | re.IGNORECASE).match

_m = _parser("3.0")
assert _m.group('int') == '3'

_m = _parser("NaN")
assert _m.group('diag') is not None

_m = _parser("Inf")
assert _m.group('diag') is None and _m.group('sign') is None

_m = _parser("-Inf")
assert _m.group('diag') is None and _m.group('sign') == '-'

# issue 1257
regex = re.compile('(a|b)')
assert regex.match("a").group(0) =="a"
assert regex.match("a")[0] == "a"

# issue 1278
_whitespace = '\t\n\x0b\x0c\r '
s = re.escape(_whitespace)
assert len(s) == 12

# issue 1365
pattern = re.compile(
    r"[\w·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ܑۭܰ-݊ަ-ް߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛࣓-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣঁ-ঃ়া-ৄেৈো-্ৗৢৣ৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑੰੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣஂா-ூெ-ைொ-்ௗఀ-ఄా-ౄె-ైొ-్ౕౖౢౣಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣංඃ්ා-ුූෘ-ෟෲෳัิ-ฺ็-๎ັິ-ຼ່-ໍ༹༘༙༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏႚ-ႝ፝-፟ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝᠋-᠍ᢅᢆᢩᤠ-ᤫᤰ-᤻ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼᪰-᪽ᬀ-ᬄ᬴-᭄᭫-᭳ᮀ-ᮂᮡ-ᮭ᯦-᯳ᰤ-᰷᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷹᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰℘℮⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣠-꣱ꣿꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀ꧥꨩ-ꨶꩃꩌꩍꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭ﬞ︀-️︠-︯︳︴﹍-﹏＿𐇽𐋠𐍶-𐍺𐨁-𐨃𐨅𐨆𐨌-𐨏𐨸-𐨿𐨺𐫦𐫥𐴤-𐽆𐴧-𐽐𑀀-𑀂𑀸-𑁆𑁿-𑂂𑂰-𑂺𑄀-𑄂𑄧-𑄴𑅅𑅆𑅳𑆀-𑆂𑆳-𑇀𑇉-𑇌𑈬-𑈷𑈾𑋟-𑋪𑌀-𑌃𑌻𑌼𑌾-𑍄𑍇𑍈𑍋-𑍍𑍗𑍢𑍣𑍦-𑍬𑍰-𑍴𑐵-𑑆𑑞𑒰-𑓃𑖯-𑖵𑖸-𑗀𑗜𑗝𑘰-𑙀𑚫-𑚷𑜝-𑜫𑠬-𑠺𑧑-𑧗𑧚-𑧠𑧤𑨁-𑨊𑨳-𑨹𑨻-𑨾𑩇𑩑-𑩛𑪊-𑪙𑰯-𑰶𑰸-𑰿𑲒-𑲧𑲩-𑲶𑴱-𑴶𑴺𑴼𑴽𑴿-𑵅𑵇𑶊-𑶎𑶐𑶑𑶓-𑶗𑻳-𑻶𖫰-𖫴𖬰-𖬶𖽏𖽑-𖾇𖾏-𖾒𛲝𛲞𝅥-𝅩𝅭-𝅲𝅻-𝆂𝆅-𝆋𝆪-𝆭𝉂-𝉄𝨀-𝨶𝨻-𝩬𝩵𝪄𝪛-𝪟𝪡-𝪯𞀀-𞀆𞀈-𞀘𞀛-𞀡𞀣𞀤𞀦-𞀪𞄰-𞄶𞋬-𞣐𞋯-𞣖𞥄-𞥊󠄀-󠇯]+"  # noqa: B950
)

# issue 1952
assert re.search('^abc (.*)$', 'abc DEF')

print('all tests ok..')
