Deploying a Brython application
-------------------------------

The application can be deployed by uploading the whole directory content on
the server.

You can also generate a file __brython_modules.js__ by following the
indications on the page [import](import.html), and only deploy :

- the application HTML page
- the files __brython.js__ and __brython_modules.js__
- if any, the Python scripts included in the page by

    <script type="text/python" src="..."></script>

- the other files used by the application (images, sounds, text files, 
  stylesheets...) if any

