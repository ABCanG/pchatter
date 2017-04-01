const config = require('../knexfile');
const knex = require('knex')(config[process.env.NODE_ENV || 'development']);
const { decamelize, camelizeKeys } = require('humps');


// スネークケースをキャメルケースに変換
const formatterPrototype = knex.client.formatter().constructor.prototype;
// eslint-disable-next-line no-underscore-dangle
const originalWrapString = formatterPrototype._wrapString;
// eslint-disable-next-line no-underscore-dangle
formatterPrototype._wrapString = function _wrapString(value) {
  return decamelize(Reflect.apply(originalWrapString, this, [value]));
};

const originQuery = knex.client.query;
knex.client.query = function query(connection, obj) {
  const promise = Reflect.apply(originQuery, this, [connection, obj]);
  promise.then((res) => {
    res.response[0] = camelizeKeys(res.response[0]);
    return res;
  });
  return promise;
};

async function getUserData(id) {
  if (!id) {
    return null;
  }

  try {
    const [user] = await knex('users').select(['id', 'screenName', 'name', 'iconUrl']).where({ id });
    return user;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getRoomData(id) {
  if (!id) {
    return null;
  }

  try {
    const [room] = await knex('rooms').select().where({ id });
    return room;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getPathCount(roomId) {
  try {
    return await knex('paths').count('num as count');
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getPathData(roomId, startNum) {
  try {
    return await knex('paths').select().where({ roomId }).andWhere('num', '>=', startNum).orderBy('num');
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function savePathData(roomId, paths) {
  try {
    return await knex('paths').insert(paths.map((path) => {
      return Object.assign({}, path, {
        roomId,
        style: JSON.stringify(path.style),
        data: JSON.stringify(path.data),
      });
    }));
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  knex,
  getUserData,
  getRoomData,
  getPathCount,
  getPathData,
  savePathData,
};
