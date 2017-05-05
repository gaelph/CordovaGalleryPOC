/**
 * Created by gaelph on 04/05/2017.
 */

/**
 * Classe permettant de gérer une file d'attente de requêtes
 * Implémente le pattern Singleton pour garantir l'unicité de la file d'attente
 * @constructor
 * @requires Request
 */
function RequestQueue () {

    // Pattern Singleton
    if (RequestQueue._instance) {
        return RequestQueue._instance;
    }
    RequestQueue._instance = this;

    /**
     * Une Collection (voir Dexie) contenant les requêtes en attente
     * @type {Collection}
     */
    this.queue = [];

    // On récupère toutes les requêtes en attente
    this._getAllRequestsFromDB = function () {
        Request.objects.all().then(function (result) {
            RequestQueue._instance.queue = result;
        });
    };
    this._getAllRequestsFromDB();

    /**
     * Ajoute une requête à la file d'attente
     * La requête est stockée dans la base, la liste est rechagée
     * @param {Request} request
     * @todo déterminer si maintenir un copie de la collection en permanance en mémoire est pertinent
     */
    this.put = function (request) {
        console.log('Queued request : ' + request.method + ' ' + request.url);
        request.save();
        this._getAllRequestsFromDB();
    };

    /**
     * Envoie toutes les requêtes en attente
     */
    this.sendAllPending = function () {
        // 2numération de la collection
        this.queue.each(function (request) {
            var rest = new REST(); // L'objet de connextion au serveur

            // Lancement de la requête
            console.log("Sending pending : " + request.method + ' ' + request.url);
            rest[request.method](request.url, request.body)
                .catch(function (xhr) { // Échec de la requête
                    // Affichage d'une erreur
                    document.getElementById('camera-error').innerHTML = xhr.responseText;
                });
        }).then(function () { // À la fin de l'énumération
            RequestQueue._instance.queue.delete() // On supprime toutes les requêtes, echec ou non
                .then(function () {
                    // On recharge la page pour refléter les cas de succès et d'échec
                    //window.location.reload();
                })
                .catch(function (error) {
                    // Erreur à la suppression
                    console.error(error.failures);
                    //window.location.reload();
                });
        })
    };

    // Écoute les événements liés à la connexion
    // FF, CHROME, OPERA
    window.addEventListener('online', function () {
        console.log('sending all pending requests');
        RequestQueue.getInstance().sendAllPending();
    });

    // IE
    document.body.addEventListener('online', function () {
        console.log('sending all pending requests');
        RequestQueue.getInstance().sendAllPending();
    });
}

/**
 * Méthode à utiliser pour obtenir l'instance de RequestQueue
 * @returns {RequestQueue}
 * @static
 */
RequestQueue.getInstance = function () {
    return RequestQueue._instance || new RequestQueue();
};