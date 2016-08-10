/**
 * Token based authentication and access control.
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @property {String} id Generated token ID.
 * @property {Number} ttl Time to live in seconds, 2 weeks by default.
 * @property {Date} created When the token was created.
 * @property {Object} settings Extends the `Model.settings` object.
 * @property {Number} settings.accessTokenIdLength Length of the base64-encoded string access token.
 * Default value is 64.
 * Increase the length for a more secure access token.
 *
 * @class AccessToken
 * @inherits AccessToken (loopback built-in model)
 */

/**
 * Access Token
 * @param {String} AccessToken Object
 * @returns {void}
 */
module.exports = function(AccessToken) { // eslint-disable-line func-names

};
