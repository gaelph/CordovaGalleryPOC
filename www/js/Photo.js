/**
 * Created by gaelph on 28/04/2017.
 */

/**
 * Classe Model pour les photos
 * @param photoObject
 * @constructor
 * @implements Model
 */
function Photo (photoObject) {
    /**
     * Une clé unique, un timestamp par défaut
     * @type {number}
     */
    this.key = photoObject.key || Date.now();
    /**
     * La chaîne encodée en base64 représentant l'image
     * @type {string}
     */
    this.value = photoObject.value || "";
}

/**
 * Une instance de Manager qui gère la connexion à la base de donnée
 * @type {RemoteManager}
 */
Photo.objects = new RemoteManager(Photo, "http://localhost:3000/");

/**
 * Enregistre les données dans la base distante et locale
 * @returns {Promise}
 */
Photo.prototype.save = function () {
    return Photo.objects.save(this);
};

/**
 * Supprime cet enregistrement de la base distante et locale
 * @returns {Promise}
 */
Photo.prototype.delete = function () {
    return Photo.objects.delete(this.key);
};