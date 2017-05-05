/**
 * Created by gaelph on 05/05/2017.
 */
/**
 * @interface Model
 * @type Function
 */

/**
 * @property {Manager} Model#objects
 * @static
 */

/**
 * @method
 * @name Model#save
 * @returns {Promise}
 */

/**
 * @method
 * @name Model#delete
 * @returns {Promise}
 */

/**
 * @interface Manager
 * @type Function
 * @requires Model
 * @requires Dexie
 * @property {Dexie} db
 * @property {Model} modelClass
 */

/**
 * @method
 * @name Manager#all
 * @returns {Promise.<Array|Collection>}
 */

/**
 * @method
 * @name Manager#get
 * @param {number|string}  key
 * @returns {Promise.<Model>}
 */

/**
 * @method
 * @name Manager#save
 * @param {Model}  object
 * @returns {Promise.<Model>}
 */

/**
 * @method
 * @name Manager#delete
 * @param {number|string}   key
 * @returns {Promise.<number|string>}
 */