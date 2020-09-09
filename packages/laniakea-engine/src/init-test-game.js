const rethinkdb = require('rethinkdb');

// TODO: remove this once we have game setup GUI in place
module.exports = async (connection) => {
  const gameDb = rethinkdb.db('test_game');

  // Create the test player
  const playersTable = gameDb.table('players');

  const defaultPlayer = {
    username: 'default_player',
    password: null,
  };

  const {generated_keys: playerKeys} = await playersTable
    .insert(defaultPlayer)
    .run(connection);

  const playerKey = playerKeys[0];

  // Create the test galaxy
  const galaxiesTable = gameDb.table('galaxies');

  const defaultGalaxy = {
    name: 'Milky Way',
  };

  const {generated_keys: galaxyKeys} = await galaxiesTable
    .insert(defaultGalaxy)
    .run(connection);

  const galaxyKey = galaxyKeys[0];

  // Create the test planetary system
  const planetarySystemsTable = gameDb.table('planetary_systems');

  const defaultPlanetarySystem = {
    name: 'Sol System',
    galaxy_id: galaxyKey,
  };

  const {generated_keys: planetarySystemKeys} = await planetarySystemsTable
    .insert(defaultPlanetarySystem)
    .run(connection);

  const planetarySystemKey = planetarySystemKeys[0];

  // Create the test system
  const systemsTable = gameDb.table('systems');

  const defaultSystem = {
    name: 'Earth System',
    planetary_system_id: planetarySystemKey,
  };

  const {generated_keys: systemKeys} = await systemsTable
    .insert(defaultSystem)
    .run(connection);

  const systemKey = systemKeys[0];
};
