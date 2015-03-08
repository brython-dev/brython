Deploying a Brython application on a server
-------------------------------------------

For deployment on a web server accessible to users of your application, you don't have to install all the development environment

In the [downloads page](https://github.com/brython-dev/brython/releases), choose one of the archives (zip, gz or bz2) called _Brython-YYYYMMDD-HHMMSS_ ; unpack it and upload its content to the directory where you want to install your Brython application

This packages only holds the Brython distribution : __brython.js__ and the built-in libraries in directories __libs__ and __Lib__

Deploying without installing
----------------------------

An even more straightforward solution is to install nothing on the server, but to call all the Python environment from the site brython.info :

    <script src="http://brython.info/src/brython_dist.js"></script>

The drawback of this method is the relatively important size of the distribution, which includes the standard library
