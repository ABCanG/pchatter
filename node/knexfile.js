// Update with your config settings.

const commonConnection = {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  charset: 'utf8mb4_bin',
  typeCast(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return (field.string() === '1'); // 1 = true, 0 = false
    }
    return next();
  }
};

module.exports = {
  development: {
    client: 'mysql',
    connection: Object.assign({
      host: '127.0.0.1',
      port: 3306,
    }, commonConnection),
    pool: {
      min: 2,
      max: 10
    }
  },

  production: {
    client: 'mysql',
    connection: Object.assign({
      socketPath: process.env.DB_SOCKET
    }, commonConnection),
    pool: {
      min: 2,
      max: 10
    }
  }

};
