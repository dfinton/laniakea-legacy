const bcryptjs = require('bcryptjs');
const rethinkdb = require('rethinkdb');

initGameInfo = async (connection, options) => {
  const {
    adminUsername,
    adminPassword,
    serverInfoDb,
    saltGenRounds,
  } = options;

  // If the game_info database already exists we assume the init has already run
  const dbs = await rethinkdb.dbList().run(connection);

  if (dbs.includes(serverInfoDb)) {
    connection.use(serverInfoDb);
    return false;
  }

  // Create our game_info database
  await rethinkdb.dbCreate(serverInfoDb).run(connection);
  connection.use(serverInfoDb);

  // Create the initial administration user defined during project setup
  await rethinkdb.tableCreate('users').run(connection);

  const salt = await bcryptjs.genSalt(saltGenRounds);
  const hash = await bcryptjs.hash(adminPassword, salt);

  const adminUser = {
    username: adminUsername,
    password: hash,
  }

  await rethinkdb.table('users').insert(adminUser).run(connection);

  // Create the game metadata table for tracking which databases belong to the game
  await rethinkdb.tableCreate('games').run(connection);

  // All done
  return true;
};

const initGame = async (connection, options) => {
  const {
    gameName,
    gameDbName,
  } = options;

  // If the game database already exists we assume the init has already run
  const dbs = await rethinkdb.dbList().run(connection);

  if (dbs.includes(gameDbName)) {
    return false;
  }

  // Create the game database first
  await rethinkdb.dbCreate(gameDbName).run(connection);

  const gameDb = rethinkdb.db(gameDbName);

  const game = {
    name: gameName,
    db: gameDbName,
  };

  await rethinkdb.table('games').insert(game).run(connection);

  // Create game table skeletons
  await Promise.all([
    gameDb.tableCreate('players').run(connection),
    gameDb.tableCreate('galaxies').run(connection),
    gameDb.tableCreate('planetary_systems').run(connection),
    gameDb.tableCreate('systems').run(connection),
  ]);

  await Promise.all([
    gameDb.table('systems').indexCreate('planetary_system_id').run(connection),
    gameDb.table('planetary_systems').indexCreate('galaxy_id').run(connection),
  ]);
};

const dropGame = async (connection, options) => {
  const {
    gameDbName,
  } = options;

  const dbs = await rethinkdb.dbList().run(connection);

  if (!dbs.includes(gameDbName)) {
    return false;
  }

  await rethinkdb.dbDrop(gameDbName).run(connection);

  return true;
};

exports.initGameInfo = initGameInfo;
exports.initGame = initGame;
exports.dropGame = dropGame;
