import zlib
import gzip

text = b'Original text'

zc = zlib.compress(text)
assert list(zc) == [120, 156, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73,
                    173, 40, 1, 0, 35, 68, 5, 27]

gc = gzip.compress(text)
assert list(gc[:4]) == [31, 139, 8, 0]
assert list(gc[8:-8]) == [2, 255, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0]
assert list(gc[-8:]) == [26, 240, 2, 249, 13, 0, 0, 0]

[31, 139, 8, 0, 9, 1, 247, 97, 2, 255, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0, 26, 240, 2, 249, 13, 0, 0, 0]


cobj = zlib.compressobj(9,
                       zlib.DEFLATED,
                       -zlib.MAX_WBITS,
                       zlib.DEF_MEM_LEVEL,
                       0)
assert list(cobj.compress(text)) == []
assert list(cobj.flush()) == [243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0]

assert zlib.decompress(zc) == text

compressed = gzip.compress(text)

assert gzip.decompress(compressed) == text

# issue 1914
dbytes = bytes([203, 72, 205, 201, 201, 7, 0])
assert zlib.decompress(dbytes, wbits=-zlib.MAX_WBITS) == b'hello'

# issue 2516

s = """(["Clinician","",69,[{"name":"drugera1","code":"B05BA03","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":10269,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera1')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"},{"name":"drugera2","code":"N05AG02","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":6998,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera2')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"},{"name":"drugera3","code":"C01DA02","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":29808,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera3')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"},{"name":"drugera4","code":"C01AA05","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":4253,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera4')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"},{"name":"drugera5","code":"C03XA01","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":32737,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera5')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"},{"name":"drugera6","code":"L04AB01","source":"Saisie manuelle","poso":"À l'occasion","theriaque_code":21444,"automedication":false,"has_for_indication_label":"Indication ? <span onclick=\"add_indic_problem('drugera6')\" class=\"button2 minibutton\" title=\"Ajouter le problème\">Aj. problème</span>"}],[{"name":"conditionera1","code":"I64","source":"Saisie manuelle"},{"name":"conditionera2","code":"C71.2","source":"Saisie manuelle"},{"name":"conditionera3","code":"W92","source":"Saisie manuelle"},{"name":"conditionera4","code":"Z32.1","source":"Saisie manuelle"},{"name":"conditionera5","code":"E73.1","source":"Saisie manuelle"},{"name":"conditionera6","code":"R63.4","source":"Saisie manuelle"}],[],[],[],[],"","","","","","","",[],[]],["","","","","","",""])"""

comp = zlib.compress(s.encode("utf8"))
assert zlib.decompress(comp).decode('utf-8') == s

s = "x" * 1000
comp = zlib.compress(s.encode("utf8"))
print(len(s), len(comp))

assert zlib.decompress(comp).decode('utf-8') == s


print('all tests passed...')