const dbConnection = require('./db-connection');
const initGameInfo = require('./init-game-info');

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
};

runEngine();
