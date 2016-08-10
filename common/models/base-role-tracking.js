const Promise = require('bluebird');
/**
 * Base Role Tracking.
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @property {String} id Generated ID.
 * @property {String} roleId The account role.
 * @property {String} baseRoleId A base role that the account role was created from.
 *
 * @class BaseRoleTracking
 * @inherits {PersistedModel}
 */

/**
 * BaseRoleTracking
 * @param {String} BaseRoleTracking Object
 * @returns {void}
 */
module.exports = function(BaseRoleTracking) { // eslint-disable-line func-names

  /**
   * Saves from which base roles an account role is created from.
   * @param {String} baseRoles Represents the base roles that the account role is created from.
   * @param {String} roleId Represents the account role.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  BaseRoleTracking.findOrCreateBaseRoleTracking = (baseRoles, roleId) => {
    const baseRoleMap = baseRoles.map(baseRole => {
      BaseRoleTracking.findOrCreate({
        where: {
          baseRoleId: baseRole.id,
          roleId: roleId
        }
      }, {
        baseRoleId: baseRole.id,
        roleId: roleId
      });
    });
    return Promise.all(baseRoleMap);
  };
};
