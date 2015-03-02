Déployer une application Brython sur un serveur
-----------------------------------------------

Pour le déploiement sur un serveur web accessible aux utilisateurs de votre application, vous n'avez pas à installer tout l'environnement de développement

Dans la [page de téléchargement](https://github.com/brython-dev/brython/releases), choisissez une des archives  (zip, gz or bz2) appelées _BrythonX.Y.Z-YYYYMMDD-HHMMSS_ (X.Y.Z est le numéro de version) ; décompressez-la et téléchargez ses fichiers dans le répertoire dans lequel vous voulez installer votre application. Il ne contient que la distribution Brython : _brython.js_ et les librairies intégrées dans les répertoires _libs_ et _Lib_

Déployer sans installation
--------------------------

Une option encore plus simple est de ne rien installer sur le serveur, mais d'appeler tout l'environnement Python depuis le site brython.info :

    <script src="http://brython.info/src/brython_dist.js"></script>

L'inconvénient de cette méthode est la taille relativement importante de la distribution, qui inclut la bibliothèque standard
