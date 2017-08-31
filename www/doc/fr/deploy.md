Déployer une application Brython
--------------------------------

Votre application peut être déployée en transférant l'ensemble du répertoire
sur un serveur.

Depuis la version 3.4.0 il est aussi possible de déployer une application
Brython en utilisant le même outil que pour les packages Python, à savoir `pip`.

Pour cela, il faut récupérer le package Brython (`pip install brython`),
ouvrir une console système et dans le répertoire de l'application faire :

    python -m brython --make_dist

Lors de la première exécution de la commande, l'utilisateur doit entrer les
informations essentielles pour l'application (nom, numéro de version, etc).
Ces données sont stockées dans un fichier __brython_setup.json__ qui peut
être édité ultérieurement.

La commande crée un sous-répertoire __\_\_dist\_\___ dans lequel se trouve un
script __setup.py__ qui permet de créer un package pour l'application, et de
le déployer sur le Python Package Index.

Les utilisateurs peuvent ensuite installer ce package CPython par la commande
habituelle:

    pip install <nom_application>

et installer l'application Brython dans un répertoire par:

    python -m <nom_application> --install
