Eventos de arrasto
------------------

<script type="text/python">
from browser import doc, alert
</script>

Os eventos de arrasto são:

<table cellpadding=3 border=1>
<tr>
<td>*drag*</td>
<td>um elemento ou seleção de texto está sendo arrastado
</td>
</tr>

<tr>
<td>*dragend*</td><td>uma operação de arrasto está sendo finalizada (ao soltar o botão do mouse ou apertar a tecla ESC)</td>
</tr>

<tr>
<td>*dragenter*</td><td>um elemento ou seleção de texto arrastado entra num alvo válido de soltura</td>
</tr>

<tr>
<td>*dragleave*</td><td>um elemento ou seleção de texto arrastado sai de um alvo válido de soltura</td>
</tr>

<tr>
<td>*dragover*</td><td>um elemento ou seleção de texto está sendo arrastado sobre um alvo válido de soltura</td>
</tr>

<tr>
<td>*dragstart*</td><td>o usuário inicia o arrasto de um elemento ou seleção de texto</td>
</tr>

<tr>
<td>*drop*</td><td>um elemento é solto em um alvo válido de soltura</td>
</tr>

</table>

Atributo do objeto `DOMEvent`
-----------------------------

`dataTransfer`

> Um "armazemanento de dados" usado para carregar informação durante o
> processo de arrastar e soltar.

Atributos e métodos do armazenamento de dados
---------------------------------------------

O "armazenamento de dados" tem os seguintes atributos e métodos:

`dropEffect`

> Uma cadeia representando o efeito que será usado, e deveria ser
> sempre um dos valores possíveis de `effectAllowed`.

> Para os eventos *dragenter* e *dragover*, o efeito de `dropEffect`
> será inicializado com base em qual ação o usuário está
> requisitando. Como isso é determinado é específico de cada
> plataforma, mas tipicamente o usuário pode pressionar teclas
> modificadoras para ajustar qual ação é desejada. Em um manipulador
> para os eventos *dragenter* e *dragover*, o efeito de `dropEffect`
> deveria ser modificado se a ação que o usuário está efetivamente
> requisitando não for a que ele deseja.

> Para os eventos *dragstart*, *drag*, e *dragleave*, o efeito de
> `dropEffect` é inicializado para "none". Qualquer valor designado
> para o efeito de `dropEffect` será atribuído, mas o valor não é
> usado para nada.

> Para os eventos *drop* e *dragend*, o efeito de `dropEffect` será
> inicializado para a ação que foi desejada, a qual será o valor que o
> efeito de `dropEffect` tinha após o último evento *dragenter* ou
> *dragover*.

> Valores possíveis:

> -    "copy" : Uma cópia do item de original é feita na nova localozação.
> -    "move" : O item é movido para a nova localozação.
> -    "link" : Um atalho é estabelecido do item de origem para a nova localização.
> -    "none" : O item não pode ser solto.

> Atribuir qualquer outro valor não tem efeito e retém o valor
> anterior.


`effectAllowed`

> Uma cadeia de caractéres que especifica os efeitos que são
> permitidos para este arrasto. Você pode atribuí-la no evento
> *dragstart* para designar os efeitos desejados para a origem, e nos
> eventos *dragenter* e *dragover* para designar os efeitos desejados
> para o alvo. O valor não é usado para outros eventos.

> Valores possíveis:

> - "copy" : Uma cópia do item de origem pode ser feita na nova localização.
> - "move" : Um item pode ser movido para a nova localização.
> - "link" : Um atalho pode ser estabelecido para a origem na nova localização.
> - "copyLink" : Operações de cópia ou link são permitidas.
> - "copyMove" : Operações de cópia ou movimento são permitidas.
> - "linkMove" : Operações de movimento ou link são permitidas.
> - "all" : Todas as operações são permitidas.
> - "none" : este item não pode ser solto.
> - "uninitialized" : o valor padrão quando o efeito ainda não foi atribuído, equivalente a "all".

> Atribuir qualquer outro valor não tem efeito e retém o valor
> anterior.

`files`

> Contém uma lista de todos os arquivos locais disponíveis na
> teansferência de dados. Se a operação de arrasto não envolver
> arquivos, esta propriedade é uma lista vazia. Um acesso com índice
> inválido à lista de arquivos especificada por esta propriedade irá
> retornar `None`.

<code>getData(_type_)</code>

> Retorna os dados para um tipo _type_, ou a cadeia vazia se os dados
> para o tipo não existirem ou a transferência não contiver nenhum
> dado.

<code>setData(_type_, _value_)</code>

> Atribui os dados para um tipo _type_. Se os dados para o tipo não
> existirem, eles serão acrescentados ao final, de modo que o último
> item na lista de tipos será o novo formato. Se os dados para o tipo
> já existirem, os dados existentes serão substituídos na mesma
> posição. Isto é, a ordem da lista de tipos não muda quando os dados
> para um mesmo tipo são substituídos.


`types`

> Contém uma lista dos tipos de formatos dos dados que são armazenados
> para o primeiro item, na mesma ordem em que os dados foram
> adicionados. Uma lista vazia será retornada se nenhum dado foi
> adicionado.


#### Exemplo

Veja a receita sobre arrastar e soltar no menu do Livro de Receitas.
