const app = require('../../server/server');
const Promise = require('bluebird');
/**
 * Account.
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @property {String} id Generated ID.
 * @property {String} name Name of the account.
 * @property {String} createdByUserId User that created the account.
 * @property {String} createdByAccountId Account that created the account.
 *
 * @class Account
 * @inherits {PersistedModel}
 */

/**
 * Account
 * @param {String} Account Object
 * @returns {void}
 */
module.exports = function(Account) { // eslint-disable-line func-names

  Account.observe('after save', doAfterSave);

  /**
   * Operation hook: do after save.
   * When account is created, also create default account roles.
   * @param {String} ctx The context object.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function doAfterSave(ctx) {
    // on create only, create account roles.
    if (ctx.isNewInstance === true) {
      return app.models.role.createDefaultAccountRoles(ctx.instance.id);
    }
    return Promise.resolve();
  }
};
