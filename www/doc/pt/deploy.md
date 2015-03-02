Implantando uma aplicação Brython em um servidor
------------------------------------------------

Para implantação em um servidor web acessível aos usuários de sua
aplicação, você não precisa instalar todo o ambiente de
desenvolvimento.

Na
[pagina de downloads](https://github.com/brython-dev/brython/releases),
escolha um dos arquivos (zip, gz ou bz2) chamados
_Brython-YYYMMDD-HHMMSS_. Descompacte seu conteúdo para o diretório
onde você quer intalar sua aplicação Brython.

Estes pacotes contém apenas a distribuição : __brython.js__ e as
bibliotecas inntegradas nos diretórios __libs__ e __Lib__.

Implantando sem instalar
------------------------

Uma solução ainda mais direta é não instalar nada no servidor, mas
chamar todo o ambiente Python do site brython.info:

    <script src="http://brython.info/src/brython_dist.js"></script>

Um dado a ser levado em conta neste método é o tamanho considerável da
distribuição, que inclúi a biblioteca padrão.