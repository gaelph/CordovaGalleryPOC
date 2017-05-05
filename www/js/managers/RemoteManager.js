/**
 * Created by gaelph on 28/04/2017.
 */

/**
 * Classe d'accès à la base de données Distante. Stocke les changements localement et met les requète en file
 * d'attente en cas d'absence de réseau
 * @param {Function}    modelClass  Le constructeur de la classe associée
 * @param {string}      apiUrl      L'url de l'API REST
 * @constructor
 * @implements Manager
 */
function RemoteManager(modelClass, apiUrl) {
    /**
     * L'objet qui permet la communication avec le serveur
     * @type {REST}
     */
    this.rest = new REST(apiUrl);

    /**
     * Le constructeur de la classe Model à utiliser avec ce manager
     * @type {Model}
     */
    this.model = modelClass;
    this._modelSlug = modelClass.name.toLowerCase() + "s";

    /**
     * L'objet qui permet la communication avec la DB locale
     * @type {Dexie}
     */
    this.db = window.DB;
    this.db[this._modelSlug].mapToClass(modelClass);
    this.db.open();
    // Un variable pour accéder à l'instance en cours
    var _instance = this;

    /**
     * Récupère tous les enregistrements de la table
     * @returns {Promise.<Array>}   Une promise pour indiquer que faire en cas succès ou d'échèc
     * @example Photo.objects.all()
     *     .then(function(photos) {
     *         // Traitement des données récupérées
     *     })
     *     .catch(function(error) {
     *         // Traitement de l'erreur
     *     });
     */
    this.all = function () {
        return new Promise (function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.onLine) {
                // Envoi d'une reqûte GET
                _instance.rest.get(_instance._modelSlug + '/')
                    .then(function (objects) { // Cas de succès de la requète REST
                        // Tableau des instances de Model
                        var modelArray = [];

                        // Hydratation de toutes les instances
                        for (var i = 0; i < objects.length; i++) {
                            modelArray.push(new _instance.model(objects[i]));
                        }

                        // Insertion dans la base de toutes les réponses
                        _instance.db[_instance._modelSlug].clear();
                        _instance.db[_instance._modelSlug].bulkPut(modelArray)
                            .then(function (result) {
                                resolve(modelArray);
                            }) // Succès
                            .catch(reject);// Échec
                    })
                    .catch(reject); // Échec de la requète REST
            } else {
                // Si on n'a pas de réseau,
                // On lit les données dans la base locale
                console.log("No network reading locally");
                resolve(_instance.db[_instance._modelSlug].toArray());
            }
        });
    };

    /**
     * Récupère un élément dans la base de données
     * @param {number|string} key           La clé identifiant l'enregistrement
     * @returns {Promise}.<Model>   Une promise pour indiquer que faire en cas succès ou d'échèc
     * @example Photo.objects.get(2)
     *     .then(function(photo) {
     *         // Traitement de l'instance de Photo récupérée
     *     })
     *     .catch(function(error) {
     *         // Traitement de l'erreur
     *     });
     */
    this.get = function (key) {
        return new Promise(function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.onLine) {
                // Envoie d'une requète GET
                _instance.rest.get(_instance._modelSlug + "/" + key)
                    .then(function (response) { // Cas de succès de la requête REST
                        var model = new _instance.model(response); // On instancie le model

                        // On enregistre dans la base
                        _instance.db[_instance._modelSlug].put(model)
                            .then(function () {
                                resolve(model);
                            }) // Sucès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Échec de la requète REST
            } else {
                // Pas de réseau, on lit depuis la base locale
                console.log("No network reading locally");
                _instance.db[_instance._modelSlug].get(key)
                    .then(resolve)
                    .catch(reject);
            }
        });

    };

    /**
     * Persiste un enregistrement ou le met à jour
     * @param {Model} object        L'objet à enregistrer
     * @returns {Promise}.<Model>   Une promise pour indiquer que faire en cas succès ou d'échèc
     * @example Photo.objects.save(photo)
     *     .then(function(photo) {
     *         // Traitement de l'instance de photo enregistrée
     *     })
     *     .catch(function(error) {
     *         // Traitement de l'erreur
     *     });
     */
    this.save = function (object) {
        return new Promise (function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.onLine) {
                // On supprime les caractères spéciaux pour la rétro compatibilité IE
                //object.value = object.value.replace(/\s/g, '');

                // Envoie d'une requète POST
                _instance.rest.post(_instance._modelSlug + '/', object)
                    .then(function (object) { // Cas de succès de la requète REST
                        // On stocke dans la base locale
                        _instance.db[_instance._modelSlug].put(object)
                            .then(function (result) {
                                resolve(object);
                            }) // Succès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Cas d'échec de la requète REST
            } else {
                // Pas de réseau
                // On stocke la requète dans la base de données locale
                console.log('No network queuing POST REQUEST');
                var request = new Request('post', _instance.rest.apiUrl + _instance._modelSlug + '/', object);
                RequestQueue.getInstance().put(request);
                _instance.db[_instance._modelSlug].put(object)
                    .then(function (result) {
                        resolve(object);
                    }) // Succès
                    .catch(reject); // Échec
            }
        });

    };

    /**
     * Supprime un enregistrement de la DB
     * @param {number|string} key           La clé de l'enregistrement à supprimer
     * @returns {Promise.<number|string>}   Une promise pour indiquer que faire en cas succès ou d'échèc
     * @example Photo.objects.delete(key)
     *     .then(function(key) {
     *         // Traitement avec key
     *     })
     *     .catch(function(error) {
     *         // Traitement de l'erreur
     *     });
     */
    this.delete = function (key) {
        return new Promise(function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.onLine) {
                // Requête DELETE
                _instance.rest.delete(_instance._modelSlug + "/" + key)
                    .then(function (responseKey) { // Cas de succès de la requête AJAX
                        // Enregistrement dans la DB
                        _instance.db[_instance._modelSlug].delete(key)
                            .then(resolve) // Succès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Cas d'échec de la requête Ajax
            } else {
                // Pas de réseau
                // On stocke la requète dans la base de données locale
                console.log('No network queuing DELETE REQUEST');
                var request = new Request('delete', _instance.rest.apiUrl + _instance._modelSlug + "/" + key);
                RequestQueue.getInstance().put(request);
                _instance.db[_instance._modelSlug].delete(key)
                    .then(resolve) // Succès
                    .catch(reject); // Échec
            }
        });
    };
}