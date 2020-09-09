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

  const {
    generated_keys: [
      playerKey,
    ],
  } = await playersTable.insert(defaultPlayer).run(connection);

  // Create the test galaxy
  const galaxiesTable = gameDb.table('galaxies');

  const defaultGalaxy = {
    name: 'Milky Way',
  };

  const {
    generated_keys: [
      galaxyKey,
    ],
  } = await galaxiesTable.insert(defaultGalaxy).run(connection);

  // Create the test planetary system
  const planetarySystemsTable = gameDb.table('planetary_systems');

  const defaultPlanetarySystem = {
    name: 'Sol System',
    galaxy_id: galaxyKey,
  };

  const {
    generated_keys: [
      planetarySystemKey,
    ],
  } = await planetarySystemsTable.insert(defaultPlanetarySystem).run(connection);

  // Create the test system
  const systemsTable = gameDb.table('systems');

  const defaultSystem = {
    name: 'Earth System',
    planetary_system_id: planetarySystemKey,
  };

  const {
    generated_keys: [
      systemKey,
    ],
  } = await systemsTable.insert(defaultSystem).run(connection);

  // Create the test star
  const starsTable = gameDb.table('stars');

  const defaultStar = {
    name: 'Sol',
    planetary_system_id: planetarySystemKey,
  };

  const {
    generated_keys: [
      starKey,
    ],
  } = await starsTable.insert(defaultStar).run(connection);

  // Create the test planet
  const bodiesTable = gameDb.table('bodies');

  const defaultBody = {
    name: 'Earth',
    system_id: systemKey,
  };

  const {
    generated_keys: [
      bodyKey,
    ],
  } = await bodiesTable.insert(defaultBody).run(connection);

  // Create the test biome
  const biomesTable = gameDb.table('biomes');

  const defaultBiome = {
    name: 'North America',
    body_id: bodyKey,
  };

  const {
    generated_keys: [
      biomeKey,
    ],
  } = await biomesTable.insert(defaultBiome).run(connection);
};
