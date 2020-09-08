const bcryptjs = require('bcryptjs');
const rethinkdb = require('rethinkdb');

module.exports = async (connection, options) => {
  const {
    adminUsername,
    adminPassword,
    serverInfoDb,
    saltGenRounds,
  } = options;

  // If the game_info database already exists we assume the init has already run
  const dbs = await rethinkdb.dbList().run(connection);

  if (dbs.includes(serverInfoDb)) {
    return;
  }

  // Create our game_info database and required tables
  await rethinkdb.dbCreate(serverInfoDb).run(connection);
  connection.use(serverInfoDb);
  await rethinkdb.tableCreate('users').run(connection);

  // Create the initial administration user defined during project setup
  const salt = await bcryptjs.genSalt(saltGenRounds);
  const hash = await bcryptjs.hash(adminPassword, salt);

  const adminUser = {
    username: adminUsername,
    password: hash,
  }

  await rethinkdb.table('users').insert(adminUser).run(connection);

  return;
}
