print("A", doc.__class__, doc)
for i in doc:
     print("A", "-", i)

def show(c, l):
    print(c, l.__class__, l)
    for i in l:
        print(c, "-", i.__class__, i)

for i in doc:
   show("B", i)

print("C", doc.__class__, doc)
show("C", doc)


print(doc.__class__, doc)
show("C", doc)

x = doc.createTextNode('a')
doc.body.appendChild(x)
