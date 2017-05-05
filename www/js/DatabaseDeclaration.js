/**
 * Created by gaelph on 05/05/2017.
 */

/**
 * Un objet contenant les déclarations des bases de données
 * Utile pour les migrations en cours d'utilistation
 * @type {{}}
 * @global
 */
window.databaseDeclarations = {
    1: {
        "photos": "key, value",
    },
    2: {
        "photos": "key, value",
        "requests": "++, method, url, body"
    }
};

/**
 * Permet d'obtenir la dernière version de la base de données
 * Effectue la migration si besoin est
 * @todo implémenter une fonction de mise à jour des schémas
 * @global
 * @param {string} databaseName Le nom de la base de données
 * @returns {Dexie}
 */
window.getDexie = function (databaseName) {
    var db = new Dexie(databaseName);

    for (var version in databaseDeclarations) {
        if (databaseDeclarations.hasOwnProperty(version))
            db.version(version).stores(databaseDeclarations[version]);
    }

    console.log("Loaded db version " + version);

    return db;
};

window.DB = getDexie('photo_store');