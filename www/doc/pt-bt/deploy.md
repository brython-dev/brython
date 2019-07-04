Deploy em uma aplicação em Brython
----------------------------------

O deploy pode ser feito na aplicação carregando todo conteúdo do diretório no servidor. 

Desde a versão 3.4.0 também é possivel ser feito deploy em Brython usando a mesma ferramenta dos pacotes CPython, ou seja `pip`.

Para isso, instale o pacote CPython Brython (`pip install brython`), abra uma aba do console e no diratório do aplicativo, execute:

    python -m brython --make_dist

Na primeira execução, o usuário é solicitado a inserir as informações necessárias para um pacote: seu nome, número da versão, etc. Esta informação é armazenada em um arquivo __brython_setup.json__ , ele pode ser editado depois.

O comando cria um subdiretório __\_\_dist\_\___ ;  isso inclui o script __setup.py__ que é usado para criar um pacote para aplicação, e implementalo no ídice de pacotes Python.

Os usuários podem instalar o pacote CPython pelo comando:

    pip install <nom_application>

e instalar a aplicação Brython em um diretório por:

    python -m <nom_application> --install


