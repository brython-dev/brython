#!/usr/bin/env python3

import cgi
import sqlite3
import json

print('Content-type: text/html')
print()

_form=cgi.FieldStorage()

_data=_form.getvalue('data')
_r=json.loads(_data)

_conn=sqlite3.connect("brython_speed_results.db")
_db=_conn.cursor()

try:
  _db.execute("select count('x') from info")
except:
  _db.execute("""create table info (userAgent text, brython_version text,
                                    timestamp datetime)""")

try:
  _db.execute("select count('x') from results")
except:
  _db.execute("""create table results (id int, test_name text,
                                       brython_ms int,
                                       cpython_ms int)""")



_db.execute("""insert into info values (?,?,datetime('now'))""", (_r['userAgent'],
                                                              _r['brython_version']))

_id=_db.lastrowid
for _test in _r['timings']:
    _t=_r['timings'][_test]
    _db.execute(""" insert into results values (?,?,?,?)""", (_id, _test,
                                                      _t['brython'], 
                                                      _t['cpython']))

_conn.commit()

_db.close()

print("OK")
