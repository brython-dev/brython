Writing a Webapp for Firefox OS in Python with Brython
======================================================

Applications for Firefox OS are written with standard web technologies : HTML5, CSS, and a programming language for web clients. With [Brython](http://brython.info) developers are no longer limited to Javascript : they can write mobile applications in Python

The initial step is to set up an environment to run Firefox OS applications. The most simple is to install the [Firefox OS simulator](https://developer.mozilla.org/en-US/docs/Tools/Firefox_OS_Simulator), a plugin for the Firefox browser. Choose the latest version of the OS (at time of writing it's version 1.3)

When the installation is done, you will manage the simulator in the Firefox browser by Tools > Web Developer > App Manager (see [Using the App Manager](https://developer.mozilla.org/en-US/Firefox_OS/Using_the_App_Manager#Using_a_Firefox_OS_Simulator_Add-on))

The Memos application
---------------------
To get a first taste of webapps developed with Brython, download and unpack the [brython-firefoxOS-memo](https://bitbucket.org/brython/brython-firefoxos-memos) application and follow the instructions on how to install it for the Firefox OS simulator

The components of the application include :

- *server.py* : the built-in web server used to install and run the hosted application

- *manifest.webapp* : this file is read by the application manager when the hosted app is added to the simulator. It is a text file with a JSON object, providing Firefox OS with important information about the application : its name and description, the launch_path (ie the url of the application first screen), the path of the icons installed on the simulator home screen for the application

- *index.html* : the home page of the application. It loads a number of stylesheets located in the root directory and in subdirectories *icons* and *style*. All these CSS files are provided by the Firefox OS development team ; they are taken from the [Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks) development site

>*index.html* also loads the Javascript program *brython/brython_dist.js*. This script allows developing scripts in Python instead of Javascript. It exposes a function called `brython` which is run on page load

>    <body role="application" onload="brython(1)">

>Thanks to Brython, the application logic is written in Python in the script *memos.py*, which is loaded in *index.html* by

>    <script type="text/python" src="memos.py"></script>

- *memos.py* is a regular Python script, parsed, translated to Javascript and executed by Brython. Most of the Python 3 syntax and many of the modules in the standard distribution are supported by Brython. For the interface with the DOM, it provides specific modules grouped in the package **browser**

>For information on how to use Brython for web development, see the [Documentation](http://brython.info)
