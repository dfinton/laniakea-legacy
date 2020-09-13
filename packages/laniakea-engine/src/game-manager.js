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
  await rethinkdb.table('games').indexCreate('db').run(connection);

  // All done
  return true;
};

const initGame = async (connection, options) => {
  const {
    gameName,
    gameDbName,
  } = options;

  // See if three is a game record for the new game already in place
  const games = await rethinkdb.table('games').getAll(gameDbName, {index: 'db'}).coerceTo('array').run(connection);

  if (games.length > 0) {
    console.warn(`Game already exist for game name ${gameDbName} in game records`);

    return false;
  }

  // If the game database already exists we assume the init has already run
  const dbs = await rethinkdb.dbList().run(connection);

  if (dbs.includes(gameDbName)) {
    console.warn(`Game already exist for game name ${gameDbName} in database`);

    return false;
  }

  // Add the record for the game we're creating and initialize the database
  const game = {
    name: gameName,
    db: gameDbName,
  };

  await Promise.all([
    rethinkdb.table('games').insert(game).run(connection),
    rethinkdb.dbCreate(gameDbName).run(connection),
  ]);

  const gameDb = rethinkdb.db(gameDbName);

  // Create game table skeletons
  await Promise.all([
    gameDb.tableCreate('players').run(connection),
    gameDb.tableCreate('galaxies').run(connection),
    gameDb.tableCreate('planetary_systems').run(connection),
    gameDb.tableCreate('stars').run(connection),
    gameDb.tableCreate('systems').run(connection),
    gameDb.tableCreate('bodies').run(connection),
    gameDb.tableCreate('biomes').run(connection),
    gameDb.tableCreate('populations').run(connection),
  ]);

  // Set up foriegn keys indeces
  await Promise.all([
    gameDb.table('populations').indexCreate('biome_id').run(connection),
    gameDb.table('populations').indexCreate('player_id').run(connection),
    gameDb.table('biomes').indexCreate('body_id').run(connection),
    gameDb.table('bodies').indexCreate('system_id').run(connection),
    gameDb.table('systems').indexCreate('planetary_system_id').run(connection),
    gameDb.table('stars').indexCreate('planetary_system_id').run(connection),
    gameDb.table('planetary_systems').indexCreate('galaxy_id').run(connection),
  ]);

  // All done
  return true;
};

const dropGame = async (connection, options) => {
  const {
    gameDbName,
  } = options;

  // Remove all references to the game database from the game_info table
  const {deleted} = await rethinkdb.table('games').getAll(gameDbName, {index: 'db'}).delete().run(connection);

  if (deleted === 0) {
    console.warn(`No game records exist for database "${gameDbName}"`);

    return false;
  }

  // Drop the entire database after verifying the game records was successfully deleted
  try {
    await rethinkdb.dbDrop(gameDbName).run(connection);
  } catch(err) {
    console.warn(err.message);

    return false;
  }

  // All done
  return true;
};

const runGame = async (connection, options) => {

};

exports.initGameInfo = initGameInfo;
exports.initGame = initGame;
exports.dropGame = dropGame;
exports.runGame = runGame;
