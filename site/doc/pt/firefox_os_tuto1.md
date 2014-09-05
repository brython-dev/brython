Construindo sua própria webapp: desenho
=======================================

Para começar, o mais fácil é copiar a aplicação Memos em um outro
diretório.

Vamos usar o exemplo de uma calculadora cuja lógica estará em um
script Python chamado *calculator.py*. A tela da aplicação vai mostrar
uma linha para os valores de entrada e resultado, e botões para
digitos e operadores. Algo assim:

    ---------------------
    |                   |
    ---------------------
    | 7 | 8 | 9 | / | C |
    ---------------------
    | 4 | 5 | 6 | x | < |
    ---------------------
    | 1 | 2 | 3 | - |√¯ |
    ---------------------
    | . | 2 | = | + |1/x|
    ---------------------
    
A primeira coisa é iniciar o servidor que vem com a aplicação e
apontar o navegador para `http://localhost:8003`: ele mostra a
aplicação Memos.

Edite *manifest.webapp* para mudar o nome e descrição da aplicação.
Crie um ícone para a aplicação para substituir o fornecido para a
aplicação Memos (*/icons/brython-memo.png*), e ponha o caminho para
este novo ícone na seção _icons_ de *manifest.webapp*.

Edite *index.html* para remover a linha:

>    <script type="text/python" src="memos.py"></script>

Para desenvolver a aplicação, você vai precisar se familiarizar com a
interface do usuário do Firefox OS. Para começar, baixe a última
versão do Firefox OS
[Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks)
e abra o arquivo *app.html* em seu navegador. Isso irá mostrar o
código HTML usado para gerar elementos comuns da interface do usuário:
cabeçalho, listas, campos, barra de ferramentas, etc.O código fonte de
*app.html* é muito útil para entender as etiquetas usadas para
construir a página e os atributos que devem ser designados para cada
etiqueta.

Dentre todos os elementos apresentados em *app.html*, o que mais se
parece com nossa calculadora é a página "Filters". No código fonte de
*app.html*, copie o código na seção para Filter, identifique a parte
incluída em:

    <section id="filters" data-position="right">

e cole-a no corpo de *index.html*. Apontando o navegador para
`localhost:8003` agora vai te mostrar a mesma página que "Filters" em
*app.html*.

Edite o código em *index.html* para obter o desenho da sua
calculadora. Para obter as linhas com os números, você terá algo como:

      <section id="filters" data-position="right">
         <section role="region">
    
            <!-- keypad -->
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">7</a></li>
              <li role="tab"><a href="#">8</a></li>
              <li role="tab"><a href="#">9</a></li>
              <li role="tab"><a href="#">/</a></li>
              <li role="tab"><a href="#">C</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">4</a></li>
              <li role="tab"><a href="#">5</a></li>
              <li role="tab"><a href="#">6</a></li>
              <li role="tab"><a href="#">*</a></li>
              <li role="tab"><a href="#"><</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">1</a></li>
              <li role="tab"><a href="#">2</a></li>
              <li role="tab"><a href="#">3</a></li>
              <li role="tab"><a href="#">-</a></li>
              <li role="tab"><a href="#">√¯</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">.</a></li>
              <li role="tab"><a href="#">0</a></li>
              <li role="tab"><a href="#">=</a></li>
              <li role="tab"><a href="#">+</a></li>
              <li role="tab"><a href="#">1/x</a></li>
            </ul>
        </section>
      </section>

Para a zona no topo da tela, onde você vê o que foi digitado e onde o
resultado de uma operação aparece quando você aperta "=", você precisa
de algo mais como na seção "Input areas" em *app.html*. De novo, copie
e cole a parte interessante da seção "Input areas" no código fonte de
*app.html* e adapte-a em *index.html*. Você tem agora o arranjo básico
de sua aplicação:

    <section id="filters" data-position="right">
     <section role="region">

        <!-- entry field for feedback and result -->
        <form class="paddings">
          <p>
            <input type="text" placeholder="" value="" id="entry" required >
            <button type="reset">Clear</button>
          </p>
        </form>

        <!-- keypad -->
        (... same as above ...)

     </section>
    </section>

Com esse conteúdo de *index.html*, a página inicial da aplicação agora
se parece com a calculadora que desenhamos. Mas quando você clica nos
botões, nada acontece. Para isso, você deve agora escrever um programa
que resolva os eventos na página.
