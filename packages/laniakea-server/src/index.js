const rethinkdb = require('rethinkdb');

const runServer = async () => {
  let connection;

  try {
    connection = await rethinkdb.connect({
      host: 'localhost',
      port: 28015,
      db: 'laniakea',
    });
  } catch(err) {
    console.log(err);
  }
};

runServer();
