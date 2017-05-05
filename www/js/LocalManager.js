/**
 * Created by gaelph on 05/05/2017.
 */

/**
 * Classe d'accès à la base de données Locale uniquement
 * @param {Function}    modelClass  Le constructeur de la classe associée
 * @constructor
 * @implements Manager
 */
function LocalManager (modelClass) {
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
     * Récupère tous les éléments d'une table
     * @returns {Promise.<Collection>} Une promise dont le résultat est la collection
     */
    this.all = function () {
        return new Promise (function (resolve, reject) {
            resolve(_instance.db[_instance._modelSlug].toCollection());
        });
    };

    /**
     * Réucpère l'élément associé à la clé primaire key
     * @param {number|string}  key La clé primaire
     * @returns {Promise.<Model>} Une Promise dont le résultat est l'élément quérit
     */
    this.get = function (key) {
        return _instance.db[this._modelSlug].get(key);
    };

    /**
     * Enregistre ou met à jour un objet dans la base de donnée locale
     * @param {Model} object    L'objet à ajouter ou mettre à jour
     * @returns {Promise.<Model>} L'objet ajouté ou mis à jour
     */
    this.save = function (object) {
        return _instance.db[this._modelSlug].put(object);
    };

    /**
     * Supprime un élément de la base de données locale
     * @param {number|string} key   La clé primaire de l'élément à supprimer
     * @returns {Promise.<number|string>}   La clé primaire de l'élément supprimé
     */
    this.delete = function (key) {
        return _instance.db[this._modelSlug].delete(key);
    };
}