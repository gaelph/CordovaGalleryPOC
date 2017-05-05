/**
 * Created by gaelph on 27/04/2017.
 */

/**
 * Événement déclanché quand une photo est prise
 * @event CameraSelector#photo-taken
 * @property {string} srcString     La chaîne base64 décrivant l'image
 */

/**
 * Classe pour choisir soit une photo de la gallery, soit un prendre une photo
 * @constructor
 */
function CameraSelector () {
    /**
     * Le bouton pour choisir une image dans la gallerie
     * @type {Element}
     */
    this.selectImageBtn = document.getElementById('select-image-btn');
    /**
     * Le bouton pour prendre une photo avec l'appareil photo
     * @type {Element}
     */
    this.takeImageBtn = document.getElementById('take-image-btn');
    /**
     * Élément qui affiche les erreurs
     * @type {Element}
     */
    this.cameraError = document.getElementById('camera-error');

    // L'instance en cours
    var _instance = this;

    /**
     * Les options pour le plugin camera de Cordova
     * @type {{mediaType: number, destinationType: number}}
     */
    this.options = {
        mediaType:       Camera.MediaType.PICTURE,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType:    Camera.EncodingType.JPEG,
        quality:         50
    };

    // Action effectuée au clic pour sélectionner une image existante
    this.selectImageBtn.addEventListener('click', function (event) {
        event.preventDefault();

        // On efface le message d'erreur s'il en est un
        _instance.cameraError.innerHTML = "";
        // On indique qu'on souhaite prendre une photo de la biliothèqye de l'utilisateur
        _instance.options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        // On lance la séléection d'image
        navigator.camera.getPicture(_instance.gotImage, _instance.gotError, _instance.options);

        if (device.platform === "browser") {
            // Pour le browser, on doit attendre la création de l'input type file et simuler son clic
            var inputFile = document.querySelector('.cordova-camera-select');

            // Tant qu'on ne trouve pas, on continue de chercher
            while (typeof inputFile === 'undefined') {
                inputFile = document.querySelector('.corodova-camera-select');
            }

            // Pour gérer l'annulation par l'utilisateur on ajoute un écouteur
            // Pour la prise de focus du body
            // On supprime alors le input type file
            document.body.onfocus = function UserCancel () {
                setTimeout(function () {
                    if (document.querySelector('.cordova-camera-select')) {
                        inputFile.parentNode.removeChild(inputFile);
                        document.body.onfocus = null;
                    }
                }, 500);
            };

            // Simulation du clic
            inputFile.click();
        }
    });

    // Action effectuée au clic pour prendre une photo
    this.takeImageBtn.addEventListener('click', function (event) {
        event.preventDefault();

        // On efface le message d'erreur s'il en est un
        _instance.cameraError.innerHTML = "";
        // On indique la source CAMERA
        _instance.options.sourceType = Camera.PictureSourceType.CAMERA;
        // On lance la prise de vue
        navigator.camera.getPicture(_instance.gotImage, _instance.gotError, _instance.options);

        // Pour le navigateur, Cordova ne gère pas le cas où l'utilisateur annule la prise de vue
        // On l'implémente ici
        if (device.platform === "browser") {
            var video = document.querySelector('video');
            var captureButton = document.querySelector(".cordova-camera-capture");

            setTimeout(function () {
                while ((video === null) || (captureButton === null)) {
                    video = document.querySelector('video');
                    captureButton = document.querySelector(".cordova-camera-capture");
                }

                // On souhaite ajouter un bouton pour annuler la prise de vue.
                var cancelButton = document.createElement('button');
                cancelButton.innerHTML = "Annuler";
                captureButton.appendChild(cancelButton);

                // Quand on clique sur le bouton annuler
                // On recharge la page, seul moyen de couper le flux de la webcam
                cancelButton.addEventListener('click', function (event) {
                    event.preventDefault();

                    window.location.reload();
                });
            }, 100);
        }
    });

    /**
     * Appelé après la sélection ou la prise de vue
     * @param {string} b64ImageString   Les données de l'image sous forme de chaîne encodée base64
     * @fires CameraSelector#photo-taken
     */
    this.gotImage = function (b64ImageString) {
        // On supprime le gestionnaire d'événement au focus du body, par sécurité
        document.body.onfocus = null;

        // La chaîne à utiliser comme attribut src d'une balise img
        var srcString = "data:image/jpeg;base64," + b64ImageString;
        // On nettoie la caméra
        navigator.camera.cleanup(function () {
        }, function () {
        });

        // Émission d'un événement "photo-taken"
        var event = document.createEvent('Event');
        event.initEvent('photo-taken', true, true);
        event.detail = srcString;

        document.dispatchEvent(event);
    };

    /**
     * Appelée en cas d'erreur
     */
    this.gotError = function () {
        // On supprime le gestionnaire d'événement au focus du body, par sécurité
        document.body.onfocus = null;
        // On afiche une erreur
        _instance.cameraError.innerHTML = "Erreur Getting Image";
        console.log('Error Getting Image');
        navigator.camera.cleanup(function () {
        }, function () {
        });
    };
}