## Query string

**browser**.`document` supports the attribute `query`, that returns the query
string of the HTML page URL as an object with the following attributes and 
methods:

- <code>document.query[<i>key</i>]</code> : returns the value associated with
_`key`_. If a key has more than one value (for instance with an url such as
_http://localhost?foo=bar&foo=rab_), returns a list of the values. Raises
`KeyError` if there is no value for the key

- <code>document.query.getfirst(<i>key[,default]</i>)</code> : returns the
first value for _`key`_. If no value is associated with the key, returns
_`default`_ if provided, else returns `None`

- <code>document.query.getlist(<i>key</i>)</code> : returns the list of values
associated with _`key`_ (the empty list if there is no value for the key)

- <code>document.query.getvalue(<i>key[,default]</i>)</code> : same as
`document.query[key]`, but returns _`default`_ or `None` if there is no value
for the key
