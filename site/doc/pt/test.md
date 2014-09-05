Teste e depuração
-----------------

### Teste interativo

O site de Brython, ou sua cópia disponível para download, inclúi um
console onde você pode testar códigos Python.

Note que o espaço de nomes (namespace) não é atualizado quando você
clica em "run", você deve recarregar a página para isso.

Para depuração e teste em Brython, alguns scripts de teste estão
agrupados no diretório `tests`; você pode acessá-los clicando no link
"Test pages" no console, e então selecionar os diferentes testes e
executá-los.

### Depurando scripts

Qualquer que seja o nível de depuração, erros de sintaxe são
reportados no console do navegador (ou no local definido por
`sys.stderr`).

Por exemplo, o código:

>    x = $a

gera a mensagem:

>    SyntaxError: unknown token [$]
>    module '__main__' line 1
>    x = $a
>        ^

Ajustando a depuração para nível 1 na chamada da função
<code>brython(_debug\_mode_)</code>, as excessões levantadas em tempo
de execução e não apanhadas por uma `except` também produzem uma
mensagem de erro, o mais próximo possível das geradas por Python 3.

Este código:

>    x = [1,2]
>    x[3]

gera:

>    IndexError: list index out of range
>    module '__main__' line 2
>    x[3]
