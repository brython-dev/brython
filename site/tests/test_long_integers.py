import sys
if sys.implementation.name == 'brython':
    from long_int import LongInt
else:
    LongInt = int

a = LongInt('999')
b = LongInt('15')

assert a+b==LongInt('1014')
assert a-b == LongInt('984')
assert b-a == LongInt('-984')

assert LongInt('-2')+LongInt('-55') == LongInt('-57')
assert LongInt('-2')+LongInt('-55') == LongInt('-57')

assert LongInt('2')+LongInt('55') == LongInt('57')
assert LongInt('2')+LongInt('55') == LongInt('57')
assert LongInt('1')+LongInt('-2') == LongInt('-1')
assert LongInt('10')+LongInt('-2') == LongInt('8')
assert LongInt('-1')+LongInt('3') == LongInt('2')
assert LongInt('-10')+LongInt('3') == LongInt('-7')

assert LongInt('10')-LongInt('2') == LongInt('8')
assert LongInt('10')-LongInt('20') == LongInt('-10')
assert LongInt('-10')-LongInt('2') == LongInt('-12')
assert LongInt('10')-LongInt('2') == LongInt('8')

assert LongInt('2')*LongInt('2') == LongInt('4')

assert LongInt('45972127121')*\
    LongInt('4798713213') == \
    LongInt('220607053845258349773')

assert LongInt('-45972027121')*\
    LongInt('4798713013') == \
    LongInt('-220606564779531625573')


assert LongInt('1')//LongInt('2')==LongInt('0')
assert LongInt('-1')//LongInt('2')==LongInt('-1')
assert LongInt('1')//LongInt('-2')==LongInt('-1')
assert LongInt('-1')//LongInt('-2')==LongInt('0')
assert LongInt('-2')//LongInt('-2')==LongInt('1')
assert LongInt('-2')//LongInt('2')==LongInt('-1')

#allow "other" operand to be an integer
assert LongInt('1')//2==LongInt('0')
assert LongInt('-1')//2==LongInt('-1')
assert LongInt('1')//-2==LongInt('-1')
assert LongInt('-1')//-2==LongInt('0')
assert LongInt('-2')//-2==LongInt('1')
assert LongInt('-2')//2==LongInt('-1')

assert LongInt('54545400516506505640987')**LongInt('54')==\
LongInt(
'60945169934084919927170582065543862134179152042825505205801736307414791885193407'+
'88843629287628151801401531280484190484808107809271896207848468766316369387868615'+
'94219570518660972563230154080265484108744781915366090891552308362322957669667814'+
'03048209002222529117698049326408919267492030645077439986791974249151907407604878'+
'39030635635524983269458329073226234934906817084587829534314798088951835646661008'+
'30624008312962465618536777106379024109111747453459002027407413635719764593506022'+
'12915482167562508077528716566400003979167939350663256783088752947635658712492946'+
'63947951463338441414225943925113720065959282539207445752286988465907078586737338'+
'77258408704652371059980450132958116554374898003011811721219862441098137245401169'+
'61641266822343249202697520280238565369500120157867702312584096002041085213585924'+
'01364755168512993999226284880314977761963287301136818231324076353404996749453313'+
'08611606964424266354862252263596154380598451083424175929866782377896436178277545'+
'33437094733155388201235729910735890422037095264639261269855076116022242637391260'+
'14633222508048003050310698628707258846954246136227525382040513707929524854001570'+
'42668373620556148605398274987789848110814548676046631696370917233693102690111432'+
'3426213180770145849112343689')

assert LongInt('100000000000000000000000000000000', 2) == LongInt('4294967296')
assert LongInt('102002022201221111211', 3) == LongInt('4294967296')
assert LongInt('10000000000000000', 4) == LongInt('4294967296')
assert LongInt('32244002423141', 5) == LongInt('4294967296')
assert LongInt('1550104015504', 6) == LongInt('4294967296')
assert LongInt('211301422354', 7) == LongInt('4294967296')
assert LongInt('40000000000', 8) == LongInt('4294967296')
assert LongInt('12068657454', 9) == LongInt('4294967296')
assert LongInt('4294967296', 10) == LongInt('4294967296')
assert LongInt('1904440554', 11) == LongInt('4294967296')
assert LongInt('9ba461594', 12) == LongInt('4294967296')
assert LongInt('535a79889', 13) == LongInt('4294967296')
assert LongInt('2ca5b7464', 14) == LongInt('4294967296')
assert LongInt('1a20dcd81', 15) == LongInt('4294967296')
assert LongInt('100000000', 16) == LongInt('4294967296')
assert LongInt('a7ffda91', 17) == LongInt('4294967296')
assert LongInt('704he7g4', 18) == LongInt('4294967296')
assert LongInt('4f5aff66', 19) == LongInt('4294967296')
assert LongInt('3723ai4g', 20) == LongInt('4294967296')
assert LongInt('281d55i4', 21) == LongInt('4294967296')
assert LongInt('1fj8b184', 22) == LongInt('4294967296')
assert LongInt('1606k7ic', 23) == LongInt('4294967296')
assert LongInt('mb994ag', 24) == LongInt('4294967296')
assert LongInt('hek2mgl', 25) == LongInt('4294967296')
assert LongInt('dnchbnm', 26) == LongInt('4294967296')
assert LongInt('b28jpdm', 27) == LongInt('4294967296')
assert LongInt('8pfgih4', 28) == LongInt('4294967296')
assert LongInt('76beigg', 29) == LongInt('4294967296')
assert LongInt('5qmcpqg', 30) == LongInt('4294967296')
assert LongInt('4q0jto4', 31) == LongInt('4294967296')
assert LongInt('4000000', 32) == LongInt('4294967296')
assert LongInt('3aokq94', 33) == LongInt('4294967296')
assert LongInt('2qhxjli', 34) == LongInt('4294967296')
assert LongInt('2br45qb', 35) == LongInt('4294967296')
assert LongInt('1z141z4', 36) == LongInt('4294967296')

assert LongInt('2') == 2

for _i in range(20):
    a=LongInt('2')
    i=LongInt(str(_i))
    assert a**i == 2**_i, "%s != %s" % (a**i, 2**_i)
    assert a**_i == 2**_i, "%s != %s" % (a**_i, 2**_i)
