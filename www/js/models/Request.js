/**
 * Created by gaelph on 05/05/2017.
 */

/**
 * Objet repéresentant une requête en attente
 * @param {('get'|'post'|'put'|'delete'|'GET'|'POST'|'PUT'|'DELETE')} method    Méthode HTTP
 * @param {string} url  URL de la requète
 * @param {object} [body=null]    Corps de la requète (pour PUT et POST)
 * @constructor
 * @implements Model
 * @requires LocalManager
 */
function Request (method, url, body) {
    this.method = method.toLowerCase(); // On ne garde que le bas de casse pour appeler les fonctions de REST
    this.url = url;

    // On affiche un warning dans la console si on crée une requête POST ou PUT sans body
    if ((method === 'post' || method === 'put') && typeof body === 'undefined') {
        console.warn("Declaring a " + method.toUpperCase() + " request without a body");
    }

    this.body = body || null;
}

/**
 * Mananger pour la communication avec la base de données locale
 * @type {LocalManager}
 * @const
 * @static
 */
Request.objects = new LocalManager(Request);

/**
 * Enregistre une requête dans la base de données locale
 */
Request.prototype.save = function () {
    return Request.objects.save(this);
};

/**
 * Supprime un requête de la base de données locale
 */
Request.prototype.delete = function () {
    return Request.objects.delete(this);
};