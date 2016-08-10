const app = require('../../server/server');
const Promise = require('bluebird');
/**
 * Extends Built-in Role model.
 *
 * **Default ACLs**
 *
 *  - DENY EVERYONE `*`
 *
 * @property {String} id Generated ID.
 * @property {String} name Name of the role. This must be unique because
 * @property {String} displayName Name of the role displayed to users.
 * @property {String} description Text description.
 * @property {Boolean} isUserCreated A role that is created by a user.
 *  Roles like "Super Admin" are system-defined.
 * @property {Boolean} isBaseRole A role that is not tied to any account,
 *  from which other account roles derive from.
 * @property {Date} created
 * @property {Date} modified
 * @property {String} accountId Account that the role belongs to.
 *
 * @class Role
 * @inherits Role (loopback built-in model)
 */

/**
 * Role
 * @param {String} Role Object
 * @returns {void}
 */
module.exports = function(Role) { // eslint-disable-line func-names

  Role.SUPER_ADMIN = 'Super Admin';
  Role.BASE_USER_MANAGEMENT = 'User Management';
  Role.BASE_ACCOUNT_MANAGEMENT = 'Account Management';
  Role.BASE_PREFIX = 'Base';

  const baseRoleUserManagement = {
    id: '1',
    name: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    displayName: `${Role.BASE_USER_MANAGEMENT}`,
    description: 'Permission to manage users, groups, and roles.',
    isUserCreated: false,
    isBaseRole: true
  };
  const baseRoleAccountManagement = {
    id: '2',
    name: `${Role.BASE_PREFIX}:${Role.BASE_ACCOUNT_MANAGEMENT}`,
    displayName: `${Role.BASE_ACCOUNT_MANAGEMENT}`,
    description: 'Permission to manage accounts.',
    isUserCreated: false,
    isBaseRole: true
  };
  const baseAclsUserManagement = [{
    model: 'user',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'READ'
  }, {
    model: 'user',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'WRITE'
  }, {
    model: 'user',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'EXECUTE'
  }, {
    model: 'role',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'READ'
  }, {
    model: 'role',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'WRITE'
  }, {
    model: 'role',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_USER_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'EXECUTE'
  }];

  const baseAclsAccountManagement = [{
    model: 'account',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_ACCOUNT_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'READ'
  }, {
    model: 'account',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_ACCOUNT_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'WRITE'
  }, {
    model: 'account',
    principalType: 'ROLE',
    principalId: `${Role.BASE_PREFIX}:${Role.BASE_ACCOUNT_MANAGEMENT}`,
    permission: 'ALLOW',
    property: '*',
    accessType: 'EXECUTE'
  }];

  Role.remoteMethod(
    'createDefaultAccountRoles', {
      http: {
        path: '/accountDefaults',
        verb: 'put'
      },
      accepts: {
        arg: 'accountId',
        type: 'string',
        required: true
      },
      returns: {
        arg: 'roles',
        type: 'array'
      }
    }
  );

  /**
   * Creates the default account roles for an account.
   * @param {String} accountId The account to create the Super Admin role for.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  // TODO - figure out what account base roles should be
  Role.createDefaultAccountRoles = accountId =>
    Role.find({
      where: {
        isBaseRole: true
      }
    })
      .then(baseRoles => createSuperAdminRole(accountId, baseRoles));

  /**
   * Creates the Super Admin role for an account.
   * @param {String} accountId The account to create the Super Admin role for.
   * @param {String} baseRoles The base roles that the Super Admin role is created from,
   *  which may be different from account to account.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function createSuperAdminRole(accountId, baseRoles) {

    const roleSuperAdmin = {
      name: `${accountId}:${Role.SUPER_ADMIN}`,
      displayName: Role.SUPER_ADMIN,
      isUserCreated: false,
      isBaseRole: false,
      accountId: accountId
    };

    const baseRolesMap = baseRoles.map(baseRole =>
      app.models.acl.find({
        where: {
          principalType: Role.ROLE,
          principalId: baseRole.name
        }
      })
        .then(baseRoleAcls => prepareBaseRoleAcls(baseRoleAcls, accountId, Role.SUPER_ADMIN)));

    return Promise.all(baseRolesMap)
      .then(value => {
        let allAcls = [];
        for (let i = 0; i < value.length; i++) {
          allAcls = allAcls.concat(value[i]);
        }
        return findOrCreateRoleAndAcls(roleSuperAdmin, allAcls);
      })
      .then(value => {
        const createdRoleId = value[0][0].id;
        return app.models.baseRoleTracking.findOrCreateBaseRoleTracking(baseRoles, createdRoleId);
      });
  }

  /**
   * Takes a set of base role ACLs and prepares them for created the new account role
   * by stripping id and creating the new principalId.
   * @param {String} baseRoleAcls The original base role acls
   * @param {String} accountId The account to create the new acls for.
   * @param {String} roleNameSuffix The name of the role, used to create the principal id
   * @returns {Array} New acls with the right principleId inserted and the original id removed
   */
  function prepareBaseRoleAcls(baseRoleAcls, accountId, roleNameSuffix) {
    const newAcls = baseRoleAcls.map(baseRoleAcl => {
      const newAcl = baseRoleAcl.toObject();
      Reflect.set(newAcl, 'principalId', `${accountId}:${roleNameSuffix}`);
      Reflect.deleteProperty(newAcl, 'id');
      return newAcl;
    });
    return newAcls;
  }

  /**
   * Creates the base roles for the portal.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  Role.initializeBaseRoles = () => Promise.join(
    findOrCreateRoleAndAcls(baseRoleUserManagement, baseAclsUserManagement),
    findOrCreateRoleAndAcls(baseRoleAccountManagement, baseAclsAccountManagement)
  );

  /**
   * Updates or inserts a set of role acls.
   * @param {String} role The role to create.
   * @param {String} acls The acls for the role.
   * @returns {Promise} Resolves with Array where first object is the role followed by acls
   */
  function findOrCreateRoleAndAcls(role, acls) {

    const aclMap = acls.map(acl =>
      app.models.acl.findOrCreate({
        where: acl
      }, acl));
    aclMap.unshift(app.models.role.findOrCreate(role));

    return Promise.all(aclMap);
  }
};
