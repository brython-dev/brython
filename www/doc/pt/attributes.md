Atributos e métodos de elementos
--------------------------------

Os elementos em uma página têm atributos e métodos que dependem do
tipo de elemento; eles podem ser encontrados em muitos sites da
Internet.

Como seus nomes podem variar dependendo do navegador, Brython define
atributos adicionais que funcionam em todos os casos:

<table border=1 cellpadding=3>
<tr>
<th>Nome</th><th>Tipo</th><th>Descrição</th><th>L = somente leitura<br>L/E = leitura + escrita</th>
</tr>
<tr>
<td>*text*</td><td>cadeia</td><td>o texto dentro do elemento</td><td>L/E</td>
</tr>
<tr>
<td>*html*</td><td>cadeia</td><td>o código html dentro do elemento</td><td>L/E</td>
</tr>
<tr>
<td>*left, top*</td><td>inteiros</td><td>a posição do elemento relativamente ao canto superior esquerdo da página</td><td>L</td>
</tr>
<tr>
<td>*children*</td><td>lista</td><td>os filhos do elemento na árvore do documento</td><td>L</td>
</tr>
<tr>
<td>*parent*</td><td>instância de `DOMNode`</td><td>o pai do elemento (`None` para `doc`)</td><td>L</td>
</tr>
<tr>
<td>*class_name*</td><td>cadeia</td><td>o nome da classe do elemento (atributo *class* da etiqueta)</td><td>L/E</td>
</tr>
<tr>
<td>*clear*</td><td>função</td><td><code>`elt.clear()`</code> remove todos os descendentes do elemento</td><td>L</td>
</tr>
<tr>
<td>*remove*</td><td>função</td><td><code>remove(_filho_)</code> remove *filho* da lista de filhos do elemento</td><td>L</td>
</tr>
</table>

Para adicionar um filho a um elemento, use o operador `<=` (pense nele
como uma seta para a esquerda para designação):

>    from browser import doc, html
>    doc['zone'] <= html.INPUT(Id="data")

Iteração sobre os filhos de um elemento pode ser feita usando a
sintaxe usual de Python:

>    for child in element:
>        (...)

Para destruir um elemento, use a palavra-chave `del`:

>    zone = doc['zone']
>    del zone

A coleção `options` associada com um objeto SELECT tem uma interface
de lista de Python:

- acesso a uma opção por seus índices: `option = elt.options[índice]`
- inserção de uma opção na posição _índice_ : `elt.options.insert(índice,opção)`
- inserção de uma opção ao final de uma lista : `elt.options.append(opção)`
- excluindo uma opção : `del elt.options[índice]`

