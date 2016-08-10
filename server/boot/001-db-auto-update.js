const path = require('path');
const models = require(path.resolve(__dirname, '../model-config.json'));
const datasources = require(path.resolve(__dirname, '../datasources.json'));

// database auto-migrate script which runs on every boot
module.exports = function(server) { // eslint-disable-line func-names

  const userModel = server.models.user;
  const roleModel = server.models.role;
  const roleMappingModel = server.models.roleMapping;
  const accountModel = server.models.account;
  const accountUserModel = server.models.accountUser;

  const newUser = {
    id: '1',
    email: 'user@gmail.com',
    password: 'password'
  };
  const newAccount = {
    id: '1',
    name: 'My Account'
  };

  /**
   * Updates database schema.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function autoUpdateAll() { // eslint-disable-line no-unused-vars
    const autoupdateModels = Object.keys(models).map(key => {
        if (typeof models[key].dataSource !== 'undefined') {
      if (typeof datasources[models[key].dataSource] !== 'undefined') {
        return server.dataSources[models[key].dataSource].autoupdate(key);
      }
    }
    return Promise.resolve();
  });

    return Promise.all(autoupdateModels)
        .catch(err => {
        if (err) {
          throw err;
        }
        console.log('Failed auto updating.', err);
  });
  }

  /**
   * Recreates database schema. Tables are dropped and created.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function autoMigrateAll() { // eslint-disable-line no-unused-vars

    const automigrateModels = Object.keys(models).map(key => {
        if (typeof models[key].dataSource !== 'undefined') {
      if (typeof datasources[models[key].dataSource] !== 'undefined') {
        return server.dataSources[models[key].dataSource].automigrate(key);
      }
    }
    return Promise.resolve();
  });

    return Promise.all(automigrateModels)
        .then(() => initializeData())
  .catch(err => {
      if (err) {
        throw err;
      }
      console.log('Failed auto migrating.', err);
  });
  }

  /**
   * Adds initial data to the database for the portal application.
   * Runs only on automigrate, not autoupdate.
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function initializeData() {

    return roleModel.initializeBaseRoles()
      .then(() => accountModel.findOrCreate(newAccount))
      .then(() => userModel.findOrCreate(newUser))
      .then(() => accountUserModel.findOrCreate({
          userId: newUser.id,
          accountId: newAccount.id
        }))
      .then(() => addUserToSuperAdminRole())
      .then(() => {
          console.log('Successfully initialized data.');
      })
      .catch(err => {
          if (err) {
            throw err;
          }
          console.log('Failed initializing data.', err);
      });
  }

  /**
   * Add user to super admin role
   * @returns {Promise} Resolves when successful. Rejects when any operation failed.
   */
  function addUserToSuperAdminRole() {

    return roleModel.findOne({
        where: {
          displayName: roleModel.SUPER_ADMIN,
          accountId: newAccount.id
        }
      })
        .then(value => {
        const roleMapping = {
          principalType: 'USER',
          principalId: newUser.id,
          roleId: value.id
        };
    return roleMappingModel.findOrCreate({
      where: roleMapping
    }, roleMapping);
  });
  }

  // TODO: change to autoUpdateAll when ready for CI deployment to production
  autoMigrateAll();
  //autoUpdateAll();

};

