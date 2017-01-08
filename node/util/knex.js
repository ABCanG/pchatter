const config = require('../knexfile');
const knex = require('knex');

module.exports = knex(config[process.env.NODE_ENV || 'development']);
