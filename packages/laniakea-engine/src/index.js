const dbConnection = require('./db-connection');
const {initGameInfo, initGame, dropGame} = require('./game-manager');
const initTestGame = require('./init-test-game');

const runEngine = async () => {
  const connection = await dbConnection.init({
    host: 'localhost',
    port: 28015,
  });

  await initGameInfo(connection, {
    serverInfoDb: 'game_info',
    adminUsername: 'admin',
    adminPassword: 'admin',
    saltGenRounds: 10,
  });

  await dropGame(connection, {
    gameDbName: 'test_game',
  });

  await initGame(connection, {
    gameName: 'Test Game',
    gameDbName: 'test_game',
  });

  await initTestGame(connection);
};

runEngine();
