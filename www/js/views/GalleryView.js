/**
 * Created by gaelph on 05/05/2017.
 */

/**
 * Événement lancé quand un utilisateur a cliqué sur le bouton supprimer la photo
 * @event GalleryView#remove-photo-clicked
 * @property {number} detail key de la photo
 */

/**
 * Gère la vue de la Galerie
 * @constructor
 * @fires GalleryView#remove-photo-clicked
 */
function GalleryView () {
    var _instance = this;
    /**
     * La div contenant la galerie
     * @type {Element}
     */
    this.container = document.querySelector("#picture-gallery");

    document.addEventListener('photo-added', function (event) {
        _instance._makeView(event.detail);
    });

    document.addEventListener('photo-removed', function (event) {
        _instance._removeView(event.detail);
    });

    /**
     * Crée une vue pour une image
     * @param {Photo} photo
     * @private
     */
    this._makeView = function (photo) {
        // Le conteneur d'une seule image
        var pictureContainer = document.createElement('div');
        pictureContainer.className = "picture-container";
        pictureContainer.id = photo.key + "-picture";

        // La balise image
        var pictureImg = document.createElement('img');
        if (photo.value.match(/\.jpg$/g)) {
            photo.value = 'http://localhost:3000/' + photo.value;
        }
        pictureImg.src = photo.value;
        pictureImg.onload = function () {
            pictureImg.style.marginLeft = "-128px";
        };

        // Le bouton de suppression
        var deleteImageA = document.createElement('a');
        deleteImageA.innerHTML = "X";
        deleteImageA.id = photo.key + '-delete';
        deleteImageA.classList.add("delete-image");

        deleteImageA.addEventListener('click', GalleryView.onRemovePhotoClicked);

        // Insertion dans le DOM
        pictureContainer.appendChild(pictureImg);
        pictureContainer.appendChild(deleteImageA);
        _instance.container.appendChild(pictureContainer);
    };

    /**
     * Supprime une vue pour une photo
     * @param {Photo} photo
     * @private
     */
    this._removeView = function (photo) {
        _instance.container.removeChild(document.getElementById(photo.key + '-picture'));
    };
}

/**
 * Appelée quand un bouton supprimer a été cliqué
 * @param {Event} evt
 * @fires GalleryView#remove-photo-clicked
 */
GalleryView.onRemovePhotoClicked = function (evt) {
    evt.preventDefault();

    var event = document.createEvent('Event');
    event.initEvent('remove-photo-clicked', true, true);

    event.detail = this.id.replace('-delete', '');

    document.dispatchEvent(event);
};