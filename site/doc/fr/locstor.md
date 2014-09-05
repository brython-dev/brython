Local storage
-------------

Le stockage local défini par HTML5 est accessible à travers le module intégré `local_storage`. L'objet `storage` défini dans ce module est utilisé comme un dictionnaire Python classique

### Exemple

>    from local_storage import storage
>    storage['foo']='bar'
>    log(storage['foo'])
>    del storage['foo']
>    log(storage['foo']) # déclenche KeyError
