require('./util/loadenv');
const io = require('socket.io')(process.env.PORT || 4000);
const cookie = require('cookie');
const getIn = require('get-in');
const redisAdapter = require('socket.io-redis');
const Redis = require('ioredis');

const knex = require('./util/knex');
const { sessionDecoder } = require('./util/session');

const port = (process.env.REDIS_PORT && process.env.REDIS_PORT.includes(':') ?
  Number(process.env.REDIS_PORT.split(':').pop()) : // for Docker
  process.env.REDIS_PORT) || 6379;
const host = (process.env.REDIS_NAME && process.env.REDIS_NAME.split('/').pop()) || // for Docker
  process.env.REDIS_HOST || 'localhost';

const redisOption = {
  port,
  host,
};

const redis = new Redis(redisOption);

io.adapter(redisAdapter(redisOption));

async function getUserData(socket) {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    const session = await sessionDecoder(cookies);
    const userId = getIn(session, ['warden.user.user.key', 0, 0], 0);
    if (!userId) {
      return null;
    }

    const [user] = await knex.select(['id', 'screen_name', 'name', 'icon_url']).from('users').where('id', userId);
    return user;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getRoomData(socket) {
  try {
    const roomId = socket.handshake.query.room;
    if (!roomId) {
      return null;
    }

    const [room] = await knex.select().from('rooms').where('id', roomId);
    return room;
  } catch (e) {
    console.log(e);
    return null;
  }
}

function parseUsers(users) {
  return users.reduce((obj, userData) => {
    const user = JSON.parse(userData);
    return Object.assign({ [user.id]: user }, obj);
  }, {});
}

const chat = io.of('/chat');
chat.on('connection', async (socket) => {
  const room = await getRoomData(socket);

  if (!room) {
    socket.disconnect();
    return;
  }

  const user = await getUserData(socket);

  socket.on('join', async (data) => {
    if (!user) {
      socket.emit('join', {
        status: 'failed',
        message: 'ログインしてください'
      });
      return;
    }

    const { pass } = data;
    if (room.pass !== pass) {
      socket.emit('join', {
        status: 'failed',
        message: '合言葉が合っていません'
      });
      return;
    }

    socket.emit('join', { status: 'success' });

    await redis.hset(`rooms:${room.id}:users`, socket.id, JSON.stringify(user));
    const users = parseUsers(await redis.hvals(`rooms:${room.id}:users`));
    chat.to(room.id).emit('users', { users });
  });

  socket.on('log', async (data) => {
    if (!user || !(await redis.hexists(`rooms:${room.id}:users`, socket.id))) {
      return;
    }

    const { message } = data;
    const id = await redis.incr('count:sum');
    const time = parseInt(new Date() / 1000, 10);
    const log = { id, message, userId: user.id, time };
    redis.hset(`rooms:${room.id}:logs`, id, JSON.stringify(log));
    chat.to(room.id).emit('log', { log });
  });

  socket.on('disconnect', async () => {
    await redis.hdel(`rooms:${room.id}:users`, socket.id);
    const users = parseUsers(await redis.hvals(`rooms:${room.id}:users`));
    chat.to(room.id).emit('users', { users });
  });

  if (!room.hidden) {
    socket.join(room.id);
    const logs = (await redis.hvals(`rooms:${room.id}:logs`)).map((log) => JSON.parse(log));
    const users = parseUsers(await redis.hvals(`rooms:${room.id}:users`));
    socket.emit('init', {
      logs,
      users
    });
  }
});
