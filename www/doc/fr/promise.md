# Promises en Javascript

```
var p = new Promise(function(resolve, reject){})
```

Le constructeur `Promise` prend comme paramètre une fonction qui prend deux
paramètres, _resolve_ et _reject_.

Quand on crée l'objet, le corps de la fonction est exécutée:

```javascript
var p = new Promise(function(resolve, reject){
    console.log("promise créée")
})

-> promesse créée
```

Le corps de la fonction peut comporter des appels de _resolve_ ou _reject_;
ces appels ne font rien quand la promesse est créée:

```javascript
var p = new Promise(function(resolve, reject){
        console.log("promesse créée")
        resolve()
        console.log("deuxième ligne")
    })

-> promesse créée
-> deuxième ligne
```

La fonction _resolve_ est appelée si on utilise la méthode `then()` de
l'objet Promise. `p.then(success)` déclenche l'exécution de `resolve`, qui 
prend pour valeur la fonction _success_:

```javascript
var p = new Promise(function(resolve, reject){
        resolve()
    })

function success(){
    console.log("tout fonctionne")
}

p.then(success)

-> tout fonctionne
```

Si la fonction possède _resolve_ et _reject_, c'est la première fonction
rencontrée qui est exécutée, l'autre est ignorée.

```javascript
// Promise qui appelle toujours resolve (le 1er argument de p.then())
var p = new Promise(function(resolve, reject){
        resolve()
        reject()
    })

function success(){
    console.log("tout fonctionne")
}

function failure(){
    console.log("ça plante")
}

p.then(success, failure)

-> tout fonctionne
```

```javascript
// Promise qui appelle toujours reject (le 2ème argument de p.then())
var p = new Promise(function(resolve, reject){
        reject()
        resolve()
    })

function success(){
    console.log("tout fonctionne")
}

function failure(){
    console.log("ça plante")
}

p.then(success, failure)

-> ça plante
```

C'est la fonction passée au constructeur `Promise` qui permet d'appeler
_resolve_ ou _reject_ selon certaines conditions.

```javascript
var p = new Promise(function(resolve, reject){
    if(window.navigator.geolocation){
        resolve()
    }else{
        reject()
    }
})

function success(){
    console.log("geoloc supportée")
}

function failure(){
    console.log("geoloc indisponible")
}

p.then(success, failure)
```

On peut aussi utiliser la même fonction pour succès et échec et lui passer
des paramètres différents dans _resolve_ ou _reject_.

```javascript
var p = new Promise(function(resolve, reject){
    if(window.navigator.geolocation){
        resolve("geoloc supportée")
    }else{
        reject("geoloc indisponible")
    }
})

function callback(msg){
    console.log(msg)
}

p.then(callback, callback)
```

Si la fonction passée à `Promise` comporte du code asynchrone, _resolve_ et
_reject_ peuvent être associés à des fonctions de rappel.

```javascript
var p = new Promise(function(resolve, reject){
    var req = new XMLHttpRequest()
    req.open("GET", "test.html", true)
    req.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){
                resolve(this)
            }else{
                reject(this)
            }
        }
    }
    req.send()
})

function success(req){
    console.log(req.responseURL, "found", req.responseText.length)
}

function failure(req){
    console.log(req.responseURL, "not found")
}

p.then(success, failure)
```

Pour généraliser, on peut définir une fonction `get(url)` qui renvoie une
`Promise`.

```javascript
function get(url){
    return new Promise(function(resolve, reject){
        var req = new XMLHttpRequest()
        req.open("GET", url, true)
        req.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    resolve(this)
                }else{
                    reject(this)
                }
            }
        }
        req.send()
    })
}

function success(req){
    console.log(req.responseURL, "found", req.responseText.length)
}

function failure(req){
    console.log(req.responseURL, "not found")
}

get("test.html").then(success, failure)
```

## async / await

Au lieu d'utiliser `then()` pour donner des valeurs à _resolve_ et _reject_,
on peut utiliser une fonction asynchrone, définie par `async function`.

Dans cette fonction, une instruction `await p` où `p` est une `Promise`
suspend l'exécution tant que `p` n'appelle pas _resolve(args)_ ou
_reject(args)_:

- si c'est _resolve(args)_, `await p` prend la valeur _args_
- si c'est _reject(args)_, `await p` déclenche une exception dont la valeur
  est _args_

```javascript
var p = new Promise(function(resolve, reject){
    resolve("ok")
})

function callback(msg){
    console.log(msg)
}

async function main(){
    callback(await p)
}

main()

-> ok
```

Avec une erreur:
```javascript
var p = new Promise(function(resolve, reject){
    reject("error")
})

function callback(msg){
    console.log(msg)
}

async function main(){
    try{
        callback(await p)
    }catch(err){
        callback(err)
    }
}

main()

-> error
```


