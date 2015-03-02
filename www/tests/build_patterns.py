import keyword
out=open("_patterns.py","w")
out.write("keywords = "+str(keyword.kwlist)+"\n")
out.write("builtins = %s" %dir(__builtins__))
out.close()