__BRYTHON__.loadBrythonPackage({"$timestamp": 1757632247016, "print_py": [".py", "def print_python_from_module(message):\n print(message)\n", []], "printJS": [".js", "printJavaScriptFromModule = function(message){\n\tconsole.log(message)\n\t}\n", []]})
printJS = __BRYTHON__.importModule("printJS")
print_py = __BRYTHON__.importModule("print_py")

// JavaScript code
console.log("Brython package 1: console.log")
printJS.printJavaScriptFromModule("Brython package 2: printJavaScriptFromModule")

// Python code
__BRYTHON__.runPythonSource("print('Brython package 3: print')")
print_py.print_python_from_module("Brython package 4: print_python_from_module")
