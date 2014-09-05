Sintaxe
-------

Brython usa a mesma sintaxe que Python:

- espaços em branco são significativos e definem blocos
- listas são criadas com `[]` ou `list()`, tuplas com `()` ou
  `tuple()`, dicionários com `{}` ou `dict()`, e conjuntos com `set()`
- criação de listas, dicionários e conjuntos por compreensão:
 - `[ expr for item in iterable if condition ]` 
 - ` dict((i,2*i) for i in range(5))` 
 - `set(x for x in 'abcdcga')`
- geradores (palavra-chave `yield`), expresões geradoras: `foo(x for x
  in bar if x>5)`
- operador ternário: `x = r1 if condition else r2`
- funções podem ser definidas com qualquer combinação de argumentos
  fixos, valores padrão, argumentos posicionais variáveis e argumentos
  de palavras-chave variáveis: `def foo(x, y=0, \*args, \*\*kw):`
- desempacotamento de listas ou dicionários de argumentos em chamadas
  de funções: `x = foor(\*args, \*\*kw)`
- classes com herança múltipla
- decoradores
- imports:
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`

## Palavras-chave e funções integradas

Brython suporta a maior parte das palavras-chave e funções de Python
3:

- palavras-chave: <code>as, assert, break, class, continue, def, del, elif,
  else, except, False, finally, for, from, global, if, import, is,
  lambda, None, pass, return, True, try, while, with, yield</code>
- funções integradas: <code>abs(), all(), any(), ascii(), bin(), bool(),
  bytes(), callable(), chr(), classmethod(), delattr(), dict(), dir(),
  divmod(), enumerate(), eval(), exec(), filter(), float(),
  frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(),
  input(), int(), isinstance(), iter(), len(), list(), locals(),
  map(), max(), min(), next(), object(), open(), ord(), pow(),
  print(), property(), range(), repr(), reversed(), round(), set(),
  setattr(), slice(), sorted(), str(), sum(), super(), tuple(),
  type(), zip(), \_\_import\_\_()</code>

Por padrão, `print()` será mostrado no console do navegador web, assim
como as mensagens de erro. `sys.stderr` e `sys.stdout` podem ser
designados a um objeto que tenha o método `write()`, permitindo o
redirecionamento das saídas para uma janela ou área de texto

`sys.stdin` ainda não está implementado até o momento, entretanto, há
uma função integrada `input()` que abre um diálogo de entrada
bloqueador (um 'prompt').

Para abrir um diálogo de impressão (para uma impressora), use
`win.print` (`win` é definido no módulo **browser**)

O seguinte ainda não está implementado na versão atual:

- palavras-chave `nonlocal`
- funções integradas <code>help(), memoryview(), 
vars()</code>
