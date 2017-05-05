/**
 * Cette classe permet la relation simple avec un serveur fournissant une API REST JSON
 * @todo Implémenter l'ajout de paramètre d'authentification
 * @param [apiUrl]        L'url de l'API
 * @constructor
 */
function REST(apiUrl) {
    // Properties
    /**
     * L'url de l'API
     * @type {string}
     * @default ""
     */
    this.apiUrl = apiUrl || "";
}

/**
 * Méthode fournissant une instance de XMLHttpRequest
 * @returns {XMLHttpRequest}
 * @private
 */
REST.prototype._newXHR = function () {
    var xhr = null;

    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                console.log('error');
            }
        }
    }

    return xhr;
};

/**
 * Envoi une requète GET au serveur
 * La réponse JSON est parsée
 * @param {string} query    Le chemin des ressources auxquelles on souhaite accéder
 * @returns {Promise}
 */
REST.prototype.get = function (query) {
    var xhr = this._newXHR(); // L'objet XHR
    var _instance = this; // Un référence à cette instance dans la Promise

    return new Promise(function (resolve, reject) {
        // Overture de la connextion AJAX
        xhr.open('GET', _instance.apiUrl + query, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) { // Succès de la requête
                try {
                    console.log("GET request successful");
                    var object = JSON.parse(xhr.responseText); // Parsage de la réponse
                    resolve(object); // then()
                } catch (error) { // Erreur au parsage
                    reject(xhr, error); // catch()
                }

            } else if (xhr.readyState === 4 && xhr.status !== 200) { // Échec de la réponse
                reject(xhr, null); /// catch()
            }
        };

        // Envoie de la requète
        xhr.send(null);
    });
};

/**
 * Envoie une méthode PUT au serveur
 * @param {string} query    Le chemin vers les resources auxquelles on souhaite ajouter quelque chose
 * @param {object} object   La resource à ajouter
 * @returns {Promise}
 */
REST.prototype.put = function (query, object) {
    var xhr = this._newXHR(); // L'objet XHR
    var _instance = this; // Un référence à l'instance dans la Promise

    return new Promise(function (resolve, reject) {
        xhr.open('PUT', _instance.apiUrl + query, true); // Ouverture de la requète
        xhr.setRequestHeader('Content-Type', 'application/json'); // On signale qu'on envoie du JSON

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) { // Cas de succès
                try {
                    console.log("PUT request successful");
                    var object = JSON.parse(xhr.responseText); // On parse la réponse
                    resolve(object); // then()
                } catch (error) { // Erreur de parsage
                    reject(xhr, error); // catch()
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) { // Échec de la requète
                reject(xhr, null); // catch()
            }
        };

        // Envoi de la requète
        xhr.send(JSON.stringify(object));
    });
};

/**
 * Envoie une rquête POST au serveur
 * @param {string} query    Le chemin vers la resource à mettre à jour
 * @param {object} object   La ressource à mettre à jour
 * @returns {Promise}
 */
REST.prototype.post = function (query, object) {
    var xhr = this._newXHR(); // L'objet XHR
    var _instance = this; // Un référence à l'instance dans la Promise

    return new Promise(function (resolve, reject) {
        xhr.open('POST', _instance.apiUrl + query, true); // Overture de la requete
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) { // Cas de suucès de la requête
                try {
                    console.log("POST request successful");
                    var object = JSON.parse(xhr.responseText); // Parsage de la réponse
                    resolve(object); // then()
                } catch (error) { // Parse error
                    reject(xhr, error); // catch()
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) { // Echec de la requête
                reject(xhr, null); // catch()
            }
        };

        // Envoi de la requète
        xhr.send(JSON.stringify(object));
    });
};

/**
 * Envoi une requête DELETE au serveur
 * @param {string} query Le chemin vers la resource à supprimer
 * @returns {Promise}
 */
REST.prototype.delete = function (query) {
    var xhr = this._newXHR(); // l'objet XHR
    var _instance = this; // Une référence à l'instance pour la Promise

    return new Promise(function (resolve, reject) {
        xhr.open('DELETE', _instance.apiUrl + query, true); // Ouverture de la requête

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) { // Succès de la requête
                try {
                    console.log("DELETE request successful");
                    var object = JSON.parse(xhr.responseText); // parsage de la réponse
                    resolve(object); // then()
                } catch (error) { // Erreur de parsage
                    reject(xhr, error); // catch()
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) { // Échec de la requète
                reject(xhr); // catch()
            }
        };

        xhr.send(null); // Envoi de la requête
    });
};