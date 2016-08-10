const app = require('../../server/server');
const Promise = require('bluebird');
/**
 * AccountUser contains which users are tied to which accounts.
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @property {String} id Generated ID.
 * @property {String} userId User.
 * @property {String} accountId Account.
 *
 * @class AccountUser
 * @inherits {PersistedModel}
 */

/**
 * Account User
 * @param {String} AccountUser Object
 * @returns {void}
 */
module.exports = function(AccountUser) { // eslint-disable-line func-names

  AccountUser.observe('before delete', doBeforeDelete);

  /**
   * Operation hook: before delete.
   * When user gets removed from account, also removes user from all roles for this account.
   * Before delete we can access the to-be-deleted data, but after delete we cannot.
   * @param {String} ctx The context object.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function doBeforeDelete(ctx) {
    return AccountUser.find({
      where: ctx.where
    })
    .then(deletedAccountUsers => {
      const deletedAccountUsersMap = deletedAccountUsers.map(removeRoleMappings);
      return Promise.all[deletedAccountUsersMap];
    });
  }

  /**
   * Removes roles for a given account user.
   * @param {String} accountUser The account user.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function removeRoleMappings(accountUser) {
    // find all roles a user is mapped to
    return app.models.roleMapping.find({
      where: {
        principalType: 'USER',
        principalId: accountUser.userId
      }
    })
    .then(foundRoleMappings => {
      // remove user from role if role is for account
      const foundRoleMappingsMap = foundRoleMappings.map(item =>
        removeForAccount(item, accountUser.accountId));
      return Promise.all[foundRoleMappingsMap];
    });
  }

  /**
   * Removes role if role is for a given account.
   * @param {String} roleMapping The roleMapping to check.
   * @param {String} accountId The account to check for.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function removeForAccount(roleMapping, accountId) {
    return app.models.role.findById(roleMapping.roleId)
      .then(value => {
        if (value.accountId === accountId) {
          return app.models.roleMapping.deleteById(roleMapping.id);
        }
        return Promise.resolve();
      });
  }
};
