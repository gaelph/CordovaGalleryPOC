/**
 * Created by gaelph on 27/04/2017.
 */

/**
 * Évenement lancé quand une image est ajoutée à la collection
 * @event PictureGallery#photo-added
 * @property {Photo} photo
 */

/**
 * Événement lancé quadn un image est supprimée de la collection
 * @event PictureGallery#photo-removed
 * @property {Photo} photo
 */

/**
 * Controller de la galerie
 * @constructor
 * @listens CameraSelector#photo-taken
 * @listens GalleryView#remove-photo-clicked
 */
function PictureGallery () {
    // L'instance en cours
    var _instance = this;

    /**
     * Méthode d'initialisation
     * Récupère tous les éléments dans base de données
     * @private
     * @fires PictureGallery#photo-added
     */
    this._initialize = function () {
        // Récupère tous les éléments auprès de la base de données
        Photo.objects.all()
            .then(function (photos) { // Cas de succès
                photos.map(function (photo) {
                    var event = document.createEvent('Event');
                    event.initEvent('photo-added', true, true);

                    event.detail = photo;

                    document.dispatchEvent(event);
                })
            })
            .catch(function (error) { // Cas d'échec
                console.log('Erreur en récupérant tous les fichers : ' + error.message);
            });
    };

    /**
     * Ajoute une image à la galerie.
     * Insère dans la vue et dans la base de données
     * @param picture
     * @fires PictureGallery#photo-added
     */
    this.addPicture = function (picture) {
        // Création de l'instance de Photo
        var photo = new Photo({
            key:   Date.now(),
            value: picture
        });

        // enregistrement dans la base de données
        photo.save()
            .then(function (object) { // Cas de succès
                console.log('element added');
                var photo = new Photo(object);

                // Lancement de l'événement
                var event = document.createEvent('Event');
                event.initEvent('photo-added', true, true);

                event.detail = photo;

                document.dispatchEvent(event);
            })
            .catch(function (error) { // Cas d'échec
                var errorP = document.getElementById('camera-error');
                errorP.innerHTML = error.message;
            });
    };

    /**
     * Supprime une photo
     * @param {Photo} photo
     * @fires PictureGallery#photo-removed
     */
    this.removePicture = function (photo) {
        // On supprime la photo
        photo.delete()
            .then(function (object) { // Cas de succès
                console.log('element deleted');

                var event = document.createEvent('Event');
                event.initEvent('photo-removed', true, true);

                event.detail = photo;

                document.dispatchEvent(event);
            })
            .catch(function (error) {
                var errorP = document.getElementById('camera-error');
                errorP.innerHTML = error.message;
            });
    };

    // Écoute les événements du CameraSelector
    document.addEventListener('photo-taken', function (event) {
        var picture = event.detail;
        _instance.addPicture(picture);
    });

    document.addEventListener('remove-photo-clicked', function (event) {
        Photo.objects.get(parseInt(event.detail, 10))
            .then(function (photo) {
                _instance.removePicture(photo);
            });
    });

    _instance._initialize();
}