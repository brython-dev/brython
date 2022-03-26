Limitations of the "file" protocol
==================================
The HTML files stored in a computer can be loaded in the browser in two
different ways:

- by the File / Open browser menu: in this case the browser uses the "file"
  protocol (the address in the address bar starts with _file://_)
- by launching a local web server (for instance the one provided by Python
  standard distribution: `brython-cli server`) and entering the file
  address in the browser address bar (for instance _localhost:8000//app.html_).
  The protocol is "http" (or "https")

These options are mostly the same, but the "file" protocol comes with a few
limitations:

- external scripts cannot be loaded with the syntax
  `<script type="text/python" src="test.py"></script>`
- it is not possible to import modules or packages located in the same
  directory as the application
- files cannot be opened and read with `open()`

The reason is that these features rely on Ajax calls to get the modules /
packages source code, or the file contents; and browsers do not allow making
Ajax calls when the protocol is "file".

With this protocol, it is always possible to import the modules in the
standard library if the file __`brython_stdlib.js`__ is loaded in the page, as
well as [Brython packages](brython-packages.html), or the modules bundled in
file __`brython_modules.js`__ created by the command 
`brython-cli`&nbsp;`modules`
(cf. section [import implementation](import.html)).
