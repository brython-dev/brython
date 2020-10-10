Esse tutorial explica como desenvolver uma aplicação que roda no browser usando a linguagem Python. No exemplo abaixo vamos escrever uma calculadora.  

Precisaremos de um editor de texto e um browser com acesso à Internet.

O conteúdo a seguir presume que você tenha conhecimentos básicos de HTML (como estrutura geral da página e tags mais usuais), de stylesheets (CSS) e da linguagem Python.

Em um editor de texto, crie um arquivo HTML com o seguinte conteúdo:

```xml
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython.min.js">
    </script>
</head>

<body onload="brython()">

<script type="text/python">
    from browser import document

    document <= "Hello !"
</script>

</body>

</html>
```

Em um diretório vazio salve o arquivo como __`index.html`__. Para abri-lo, você tem duas opções:

- usar o menu File/Open do navegador: é a solução mais simples. Tem [certas limitações](/static_doc/pt-br/file_or_http.html) para um uso avançado, mas funciona perfeitamente para este tutorial.
- iniciar um servidor web: por exemplo, se o interpretador Python baixado do python.org estiver instalado em seu computador, rode `python -m http.server` no diretório criado, após acesse _localhost:8000/index.html_ no seu navegador.

Quando você abrir a página, deverá ver a mensagem "Hello !" exibida na janela do navegador.

Estrutra da página
==================
Vamos dar uma olhada no conteúdo da página. Na seção HTML `<head>`, nós carregamos o script __`brython.js`__, que é biblioteca Brython que encontrará e executará os scripts Python incluídos na página. Neste exemplo nós usamos o script armazenado no CDN, desta forma não precisamos instalar nada localmente. A versão (`brython@{implementation}`) pode ser atualizada para cada nova versão do Brython.

A tag `<body>` tem um atributo `onload="brython()"`. Isso significa que quando a página tiver carregado todo conteúdo, o browser chamará a função `brython()`, que está definido na biblioteca Brython já carregada na página. Essa função busca por todas as tags `<script>` que contêm o atributo `type="text/python"` e executa o código contido nelas.

Nossa página __`index.html`__ contem esse script:

```python
from browser import document

document <= "Hello !"
```

É um programa Python padrão, sendo importado pelo módulo __`browser`__ (neste caso, o módulo está contido na biblioteca Brython __`brython.js`__). O módulo tem um atributo `document` que referencia o conteúdo exibido na janela do navegador

Para adicionar um texto ao documento - especificamente, para exibir um texto no browser - a sintaxe usada pelo Brython é:

```python
document <= "Hello !"
```

Você pode ver o operador `<=` como uma seta apontando para esquerda: o document "recebe" um novo elemento, neste caso recebe a string "Hello !". Você verá a seguir que sempre é possível usar a forma padrão da sintaxe DOM para interagir com a página, 

Para este exemplo, você também pode usar o método `attach` ao invés do operador `<=`:

```python
document.attach("Hello !")
```

Formatando textos com tags HTML
===============================
Tags HTML permitem a formatação de texto, por exemplo, para escrevê-lo em negrito `<B>`, em itálico `<I>`, etc.

Usando o Brython, essas tags são acessível como as funções definidas no módulo __`html`__ do pacote __`browser`__. Segue exemplo de como usá-las:

```python
from browser import document, html

document <= html.B("Hello !")
```

As tags podem ser aninhadas:

```python
document <= html.B(html.I("Hello !"))
```

As tags também podem ser adicionadas umas às outras, bem como strings:

```python
document <= html.B("Hello, ") + "world !"
```

O primeiro argumento de uma função tag pode ser uma string, um número, outra tag. Também pode ser um "iterável" Python (list, comprehension, generator): neste caso, todos os elementos produzidos na iteração são adicionados à tag:

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Os atributos da tag são passados ​​como keyword arguments para a função:

```python
html.A("Brython", href="http://brython.info")
```

Desenhando a calculadora
========================
Podemos desenhar nossa calculadora como uma table HTML.

A primeira linha é feita da zona de resultado, seguida por um botão de reset. As próximas 3 linhas contêm os dígitos e operadores matemáticos.

```python
from browser import document, html

calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C", id="clear"))
lines = ["789/",
         "456*",
         "123-",
         "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc
```

Observe o uso de Python generators para reduzir a quantidade de código, mantendo-o legível.

Vamos adicionar estilo às tags `<TD>` em uma stylesheet para que a calculadora tenha uma aparência melhor:

```xml
<style>
*{
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.1em;
}
td{
    background-color: #ccc;
    padding: 10px 30px 10px 30px;
    border-radius: 0.2em;
    text-align: center;
    cursor: default;
}
#result{
    border-color: #000;
    border-width: 1px;
    border-style: solid;
    padding: 10px 30px 10px 30px;
    text-align: right;
}
</style>
```

Tratamento de eventos
=====================
A próxima etapa é disparar uma ação quando o usuário pressiona a calculadora:

- para digitos e operações :  imprima o dígito ou operação na zona de resultado
- para o sinal = : execute a operação e imprima o resultado, ou uma mensagem de erro se a entrada for inválida
- para a letra C: redefina a zona de resultado

Para lidar com os elementos exibidos na página, o programa precisa primeiro obter uma referência a eles. Os botões foram criados como tags `<TD>`; para obter uma referência a todas essas tags, a sintaxe é

```python
document.select("td")
```

O argumento passado para o método `select()` é um seletor CSS. Os mais usuais são: um nome de tag ("td"), o atributo `id` do elemento ("#result") ou seu atributo "class" (".classname"). O resultado do `select()` é sempre uma lista de elementos.

Os eventos que podem ocorrer nos elementos de uma página têm um nome normalizado: quando o usuário clica em um botão, o evento denominado "click" é acionado. No programa, este evento provoca a execução de uma função. A associação entre elemento, evento e função é definida pela sintaxe

```python
element.bind("click", action)
```

Para a calculadora, podemos associar a mesma função ao evento "click" em todos os botões:

```python
for button in document.select("td"):
    button.bind("click", action)
```

Para ser compatível com a sintaxe Python, a função `action()` precisa ter sido definida em algum lugar antes no programa. Essas funções "callback" (retorno de chamada) usam um único parâmetro, um objeto que representa o evento.

Programa Completo
=================
Aqui está o código que gerencia uma versão mínima da calculadora. A parte mais importante está na ação da função `action(event)`.

```python
from browser import document, html

# construção da calculadora
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

result = document["result"]  # acesso direto a um elemento por seu id

def action(event):
    """Lida com o evento "click" em um botão da calculadora."""
    # O elemento em que o usuário clicou é o atributo "target" (alvo)
    # do objeto de evento
    element = event.target
    # O texto impresso no botão é o atributo "text" do elemento
    value = element.text
    if value not in "=C":
        # atualizando a zona de resultado
        if result.text in ["0", "error"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # redefinindo
        result.text = "0"
    elif value == "=":
        # execute a fórmula na zona de resultado
        try:
            result.text = eval(result.text)
        except:
            result.text = "error"

# Associe a função action() ao evento "click" em todos os botões
for button in document.select("td"):
    button.bind("click", action)
```

Resultado
=========
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>
