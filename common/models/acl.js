/**
 * A Model for access control meta data.
 * Extends Built-in ACL model.
 *
 * System grants permissions to principals (users/applications, can be grouped
 * into roles).
 *
 * Protected resource: the model data and operations
 * (model/property/method/relation/…)
 *
 * For a given principal, such as client application and/or user, is it allowed
 * to access (read/write/execute)
 * the protected resource?
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @header ACL
 * @property {String} model Name of the model.
 * @property {String} property Name of the property, method, scope, or relation.
 * @property {String} accessType Type of access being granted: one of READ, WRITE, or EXECUTE.
 * @property {String} permission Type of permission granted. One of:
 *
 *  - ALARM: Generate an alarm, in a system-dependent way, the access specified in the permissions
 *  component of the ACL entry.
 *  - ALLOW: Explicitly grants access to the resource.
 *  - AUDIT: Log, in a system-dependent way, the access specified in the permissions component
 *  of the ACL entry.
 *  - DENY: Explicitly denies access to the resource.
 * @property {String} principalType Type of the principal; one of: Application, Use, Role.
 * @property {String} principalId ID of the principal - such as appId, userId or roleId.
 * @property {Object} settings Extends the `Model.settings` object.
 * @property {String} settings.defaultPermission Default permission setting: ALLOW, DENY, ALARM,
 * or AUDIT. Default is ALLOW.
 * Set to DENY to prohibit all API access by default.
 *
 * @class ACL
 * @inherits ACL (loopback built-in model)
 */

/**
 * Acl
 * @param {String} Acl Object
 * @returns {void}
 */
module.exports = function(Acl) { // eslint-disable-line func-names

};
