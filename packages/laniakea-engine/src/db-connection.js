const rethinkdb = require('rethinkdb');

let connection;

const initConnection = async (options) => {
  connection = await rethinkdb.connect(options);

  return connection;
}

const getConnection = () => {
  return connection;
}

exports.get = getConnection;
exports.init = initConnection;
