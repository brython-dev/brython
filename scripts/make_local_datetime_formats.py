import locale
import datetime
import json

d_am = datetime.datetime(2000, 11, 24, 10, 30, 50)
d_pm = datetime.datetime(2000, 11, 24, 20, 30, 50)

langs = ["C"]

with open("iso639-1.txt", encoding="utf-8") as f:
    for line in f:
        langs.append(line.split()[-1])
print(langs)
am_formats = {}
pm_formats = {}
am_pm_formats = {}

am = {}
pm = {}

c_format = {}
x_format = {}
X_format = {}

def guess_fmt(lit, hour):
    if not "00" in lit:
        print("other calendar", lang, lit)
        return None
    tests = [
            ["2000", "%Y"], ["00", "%y"],
            ["11", "%m"], ["24", "%d"],
            [hour, "%H"], ["30", "%M"], ["50", "%S"]
        ]
    if hour == "20":
        tests += [["08", "%H"], ["8", "%H"]]
    for literal, spec in tests:
        lit = lit.replace(literal, spec)
    return lit

for lang in langs:
    locale.setlocale(locale.LC_ALL, lang)
    c = d_pm.strftime("%c") # full date time
    p = d_pm.strftime("%p") # AM/PM
    x = d_pm.strftime("%x") # date
    d = d_pm.strftime("%d")
    m = d_pm.strftime("%m")
    Y = d_pm.strftime("%Y")
    y = d_pm.strftime("%y")
    b = d_pm.strftime("%b")
    X = d_pm.strftime("%X") # time
    H = d_pm.strftime("%H")
    I = d_pm.strftime("%I")
    M = d_pm.strftime("%M")
    S = d_pm.strftime("%S")
    if not x in c:
        print(lang, c, x)
    else:
        c = c.replace(x, "%x")
    if not X in c:
        print(lang, c, x)
    else:
        c = c.replace(X, "%X")
    if p and p in c:
        c = c.replace(p, "%p")
    c_format[lang] = c

    if I in X:
        X = X.replace(I, "%I")
    elif I.lstrip("0") in X:
        X = X.replace(I.lstrip("0"), "%i")
    elif H in X:
        X = X.replace(H, "%H")

    for t, fmt in [[M, "%M"], [S, "%S"]]:
        if not t in X:
            print(t, X)
            input()
        else:
            X = X.replace(t, fmt)

    if p and p in X:
        X = X.replace(p, "%p")

    if X in X_format:
        X_format[X].append(lang)
    else:
        X_format[X] = [lang]

    if not d in x:
        print(lang, d, x)
    else:
        x = x.replace(d, "%d")

    if m in x:
        x = x.replace(m, "%m")
    elif b in x:
        x = x.replace(b, "%b")
    else:
        print("other month format", lang, x)

    if Y in x:
        x = x.replace(Y, "%Y")
    elif y in x:
        x = x.replace(y, "%y")
    else:
        print("other calendar", lang)
        x = None

    if x in x_format:
        x_format[x].append(lang)
    else:
        x_format[x] = [lang]

    lit_am = guess_fmt(d_am.strftime("%c"), "10")
    lit_pm = guess_fmt(d_pm.strftime("%c"), "20")
    if lit_pm == lit_am:
        if lit_am is not None:
            if lit_am in am_pm_formats:
                am_pm_formats[lit_am].append(lang)
            else:
                am_pm_formats[lit_am] = [lang]
    else:
        for lit, table in zip([lit_am, lit_pm], [am_formats, pm_formats]):
            if lit in table:
                table[lit].append(lang)
            else:
                table[lit] = [lang]

    # value for AM / PM
    am_value, pm_value = (d_am.strftime("%p"), d_pm.strftime("%p"))
    am[lang] = am_value
    pm[lang] = pm_value

info = {
    "am_pm": am_pm_formats,
    "am": am_formats,
    "pm": pm_formats
}
with open("date_local_format.txt", "w", encoding="utf-8") as out:
    out.write("\nvar am = " + json.dumps(am, indent=4))
    out.write("\nvar pm = " + json.dumps(pm, indent=4))
    out.write("\nvar X_format = " + json.dumps(X_format, indent=4))
    out.write("\nvar x_format = " + json.dumps(x_format, indent=4))
