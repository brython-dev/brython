Cadeia de consulta
------------------

**browser.doc** suporta o atributo `query` que retorna a cadeia de
consulta como um objeto com os seguintes métodos:

- <code>doc.query[<i>key</i>]</code> : retorna o valor associado com a
  chave _`key`_. Se uma chave possui mais de um valor (o que pode ser
  o caso para etiquetas SELECT com o atributo MULTIPLE assinalado, ou
  para etiquetas `<INPUT type="checkbox">`), retorna uma lista de
  valores. Levanta `KeyError` se não houver valor para a chave.

- <code>doc.query.getfirst(<i>key[,default]</i>)</code> : retorna o
  primeiro valor para a chave _`key`_. Se nenhum valor estiver
  associado com a chave, retorna _`default`_ se fornecido, caso
  contrário retorna `None`.

- <code>doc.query.getlist(<i>key</i>)</code> : retorna a lista de
  valores associados com a chave _`key`_ (a lista vazia se não houver
  nenhum valor para a chave).

- <code>doc.query.getvalue(<i>key[,default]</i>)</code> : o mesmo que
  `doc.query[key]`, mas retorna _`default`_ ou `None` se não houver
  nenhum valor para a chave.
