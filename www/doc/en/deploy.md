Deploying a Brython application
-------------------------------

The application can be deployed by uploading the whole directory content on
the server.

Since version 3.4.0 it is also possible to deploy a Brython application using
the same tool as for CPython packages, ie `pip`.

For that, install the CPython Brython package (`pip install brython`),
open a console window and in the application directory run:

    python -m brython --make_dist

On first execution, the user is asked to enter required information for a
package : its name, version number, etc. This information is stored in a file
__brython_setup.json__ that can be edited later.

The command creates a subdirectory __\_\_dist\_\___ ; it includes the script
__setup.py__ that is used to create a package for the application, and to
deploy it on the Python Package Index.

Users can then install the CPython package by the usual command:

    pip install <nom_application>

and install the Brython application in a directory by:

    python -m <nom_application> --install

