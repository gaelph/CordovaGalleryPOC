# Preuve de concept CORDOVA & ONLINE/OFFLINE
Ce projet se concentre sur trois fonctionnalités:

1. L'aquisition d'images dans Cordova,
2. La communication avec un serveur (API REST),
3. la gestion de perte de connexion.

[Documentation](http://gael-philippe.fr/cordova-camera-poc/docs/index.html)

## Acquisition d'images

### La classe CameraSelector
Cette classe permet de récupérer des images depuis un appareil (navigateur, téléphone).
Elle attend deux éléments dans le DOM :
- `#select-image-btn`: un bouton qui, quand il est cliqué, permet à l'utilisateur de choisir une image déjà prise
- `#tak-image-btn`: un bouton qui, quand il est cliqué, déclanche une prise de vue (appareil photo ou webcam)

Quand une image est prise, l'événement `photo-taken` est lancé.
La propriété `detail` de cet événement est les données de l'image encodées en Base64.

## Communication avec une API REST

### Architecture
Ce système s'articule autour de trois types de classes :

1. **Les classes modèles** : Implémentent l'interface `Model`.
Chaque instance représente un enregistrement.
2. **Les classes manager** : Implémentent l'interface `Manager`.
À chaque instance de `Model` est associée une instance `Manager`(propriété `objects`).
Elles implémentent les méthodes CRUD (Create, Read, Update, Delete).
3. **La classe `REST`** : Elle est responsable de la communication avec le serveur.

### L'interface `Model`
Elle requiert l'implémentation de deux méthodes, `save()` et `delete()` et d'une propriété statique `objects`.

>Le nom choisi pour la classe qui implémente cette interface est **très important**.
Il est utilisé par le `Manager` pour déterminer l'URL à laquelle envoyer les requêtes, et le nom de table de la base de données locale.

>`var nomdelatable = NomDeLaTable.toLowerCase() + "s";`

> exemple : La classe `Photo` est associées à la table `photos`, et à l'url http://www.exemple.com/api/photos/ de l'API REST.

`Model::objects`: L'instance de `Manager` associée au `Model`.

`Model::save()`: Quand cette méthode est appelée, le `Manager` tente de persister les données. Soit par ajout, soit par mise à jour.
On essaie d'abord via l'API REST, puis la base de données locale.

`Model::delete()`: Quand cette méthode est appelée, le `Manager` tente de supprimer l'enregistrement.
On essaie d'abord via l'API REST, puis la base de données locale.

#### Utilistation par un Controller
Pour récupérer tous les enregistrements de la table :
```javascript
Photo.objects.all()
    .then(function (photos) {
        // Faire quelque choses avec les instances de Photo
    })
    .catch(function (erreur) {
        // Gérer l'erreur
    });
```

Pour récupérer un enregistrement particulier de la table :
```javascript
Photo.objects.get(2)
    .then(function (photo) {
        // Faire quelque chose avec l'instance de Photo
    })
    .catch(function (erreur) {
        // Gérer l'erreur
    });
```

Pour persister un élément :
```javascript
var photo = new Photo(id, data);
photo.save();
```

Pour supprimer l'enregistrement :
```javascript
photo.delete();
```

### Les Managers
Il existe deux types de base héritables:

1. `RemoteManager` : Qui permet de communiquer avec l'API REST, ou la base de données locale quand on n'a pas de connexion,
2. `LocalManager`: Qui ne permet de communiquer qu'avec la base de données locale.

Tous deux implémentent les mêmes méthodes `all()`, `get(key)`, `save(object)`, `delete(key)`. De ce fait, le type *Remote* ou *Local* est transparent.

Tous deux prennent le constructeur de la classe `Model` qui leur est associée comme premier argument de leur constructeur.

Tous deux requièrent que `Dexie` (la biliothèque qui facilite le dialogue avec la base de données locale) soit instanciée dans la variable globale `window.DB`.

#### `RemoteManager`
Utilise à la fois l'API REST et la base de données locale. L'URL de base de l'API est le second argument de son constructeur.

```javascript
 Photo.objects = new RemoteManager(Photo, 'http://www.example.com:3000/');
 ```

Si on a une connexion au réseau, les données sont envoyées au serveur, en cas de succès, elles sont persistées localement.
Dans le cas contraire, la requète est mise en file d'attente (persistée dans la table `requests`).

#### `LocalManager`
N'utilise que la base de données locale. Ne prends que le constructeur de la classe `Model` qui lui est associée.
```javascript
Request.objects = new LocalManager(Request);
```

### La classe `REST`
C'est elle qui dialogue avec le serveur. Elle implémente quatres méthodes :
- `get(query)` : Envoie une requête `GET`, pour la lecture des données,
- `put(query, object)` : Envoie une requête `PUT`, pour mettre à jour des données,
- `post(query, object)` : Envoie une requête `POST`, pour créer des données,
- `delete(query)` : Envoie une requête `DELETE`, pour supprimer des données.

>La classe attends que le serveur réponde avec du JSON. Les réponses sont parsées automatiquement à la réception.

>Les objets envoyés sont des chaînes JSON avec le header `Content-Type: application/json`.

#### Exemples
Récupération de tous les éléments `Photo` :
```javascript
var rest = new REST('http://www.example.com:3000/api/');

rest.get('photos/')
    .then(function (photos) {
        // faire quelque chose avec le tableau d'objets retourné
    })
    .catch(function (xhr, error) {
        // Gérer l'erreur
        // error est nul s'il s'agit d'une erreur réseau
        // s'il n'est pas nul, il s'agit d'un problème de parsage JSON
    });
```

Envoi d'une photo :
```javascript
var photo = new Photo(id, data);
var rest = new REST('http://www.example.com:3000/api/');

rest.post('photos/', photo)
    .then(function (photo) {
        // faire quelque chose avec l'objet retourné
    })
    .catch(function (xhr, error) {
        // Gérer l'erreur
        // error est nul s'il s'agit d'une erreur réseau
        // s'il n'est pas nul, il s'agit d'un problème de parsage JSON
    });
```

### La base de données locale
La base de données locale est la base IndexedDB intégrée aux navigateurs modernes.
La bibliothèque [Dexie](http://dexie.org/) est utilisée pour faciliter la communication avec elle.

## Gestion de perte de connexion

### La classe `RequestQueue`
Elle est responsable de la gestion des requêtes en attente.
>`RequestQueue` implémente le patron de conception *Singleton* pour garanttir l'unicité de la file.
On l'utilisera donc comme suit : `RequestQueue.getInstance()`, ou `new RequestQueue()`.

Les requêtes prennent la forme d'instances de la classe `Request`, qui a trois propriétés :
- `method`: la méthode HTTP : `GET`, `PUT`, `POST` ou `DELETE`,
- `url`: l'URL complète de la requête,
- `body` : le corps de la requête pour `PUT` ou `POST`, `null` sinon.

Pour mettre une requête en attente, on utilise la méthode `put(request)`:
```javascript
var request = new Request('GET', 'http://www.example.com:3000/api/photos/');
RequestQueue.getInstance().put(request);
```

`RequestQueue` écoute l'événement `ononline`. Ainsi, quand on retrouvera la connexion, toutes les requêtes en attente seront envoyées.

> Les requêtes seront supprimées de la base de données locale que celles-ci aient réussi ou non !

#### Pistes de réflexion :
- Déplacer la responsabilité de la mise en file d'attente de la classe `RemoteManager`à la classe `REST`.
- Stocker les requêtes en attente dans une base de données séparée de la base de l'application, voire dans `localStorage`.

## To Do :
- Ajouter un système de Timestamp pour dater les requètes en attentes
- Gérer la perte de connexion alors qu'une requête est déjà partie, ou sur le point de partir
- Ajouter un système de d'authentification au sein du client REST
- Ajouter une fonction de mise à jour des données en cas de migration de la base de données.
- Gérer le rafraîchissement de la page