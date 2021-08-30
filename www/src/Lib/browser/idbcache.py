# Generates a widget to show the Brython indexedDB cache

from datetime import datetime

from browser.widgets import dialog

from browser import bind, window, document
from browser.html import *

idb_name = "brython-cache"
idb_cx = window.indexedDB.open(idb_name)

infos = {"nb_modules": 0, "size": 0}

@bind(idb_cx, "success")
def open_success(evt):
    db = evt.target.result
    if not db.objectStoreNames.contains("modules"):
        dialog.InfoDialog('indexedDB cache', 'db has no store "modules"')
        return

    table = TABLE(border=1)
    table <= TR(TH(col) for col in
                  ['Name', 'Package', 'Size', 'Brython timestamp',
                   'Stdlib timestamp'])
    tx = db.transaction("modules", "readwrite")
    store = tx.objectStore("modules")
    outdated = []

    openCursor = store.openCursor()

    @bind(openCursor, "error")
    def cursor_error(evt):
        print("open cursor error", evt)

    @bind(openCursor, "success")
    def cursor_success(evt):
        infos['nb_modules'] += 1
        cursor = evt.target.result
        if cursor:
            record = cursor.value
            timestamp = datetime.fromtimestamp(record.timestamp / 1000)
            source_ts = datetime.fromtimestamp(record.source_ts / 1000)
            table <= TR(TD(record.name) +
                        TD(bool(record.is_package)) +
                        TD(len(record.content), align="right") +
                        TD(timestamp.strftime('%Y-%m-%d %H:%M')) +
                        TD(source_ts.strftime('%Y-%m-%d %H:%M'))
                       )
            infos['size'] += len(record.content)
            getattr(cursor, "continue")()
        else:
            panel = dialog.Dialog('indexedDB cache', top=0, left=0).panel
            panel <= H1("Brython indexedDB cache")
            size = '{:,d}'.format(infos['size'])
            panel <= H3(f"{infos['nb_modules']} modules, size {size} bytes")
            panel <= table