require('./util/loadenv');
const io = require('socket.io')(process.env.PORT || 4000);
const cookie = require('cookie');
const getIn = require('get-in');
const redisAdapter = require('socket.io-redis');
const Redis = require('ioredis');

const knex = require('./util/knex');
const { sessionDecoder } = require('./util/session');
const { makeThumbnail } = require('./util/canvas');

const redisOption = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
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

async function sendInitData(socket, room) {
  const logs = (await redis.hvals(`room:${room.id}:logs`)).map((log) => JSON.parse(log));
  const paths = (await redis.hvals(`room:${room.id}:paths`)).map((path) => JSON.parse(path));
  const users = parseUsers(await redis.hvals(`room:${room.id}:users`));
  socket.emit('init', {
    logs,
    paths,
    users,
  });
}

const chat = io.of('/chat');
chat.on('connection', async (socket) => {
  const room = await getRoomData(socket);

  if (!room) {
    socket.disconnect();
    return;
  }

  const user = await getUserData(socket);

  // 入室処理
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
        message: '合言葉が違います'
      });
      return;
    }

    if (await redis.hlen(`room:${room.id}:users`) === 0) {
      // start setInterval
      const intervalId = setInterval(async () => {
        const paths = (await redis.hvals(`room:${room.id}:paths`)).map((path) => JSON.parse(path));
        makeThumbnail(paths, `${room.id}.png`);
        // 人がいなくなったら解除
        if (await redis.hlen(`room:${room.id}:users`) === 0) {
          clearInterval(intervalId);
        }
      }, 6000);
    }

    if (room.hidden) {
      socket.join(room.id);
      await sendInitData(socket, room);
    }
    socket.emit('join', { status: 'success' });

    await redis.hset(`room:${room.id}:users`, socket.id, JSON.stringify(user));
    const users = parseUsers(await redis.hvals(`room:${room.id}:users`));
    chat.to(room.id).emit('users', { users });
  });

  // チャットログ送信処理
  socket.on('log', async (data) => {
    if (!user || !(await redis.hexists(`room:${room.id}:users`, socket.id))) {
      return;
    }

    const { message } = data;
    const id = await redis.incr(`room:${room.id}:logs:count`);
    const time = parseInt(new Date() / 1000, 10);
    const log = { id, message, userId: user.id, userName: user.name, time };
    redis.hset(`room:${room.id}:logs`, id, JSON.stringify(log));
    chat.to(room.id).emit('log', { log });
  });

  // 線情報送信処理
  socket.on('path', async (data) => {
    if (!user || !(await redis.hexists(`room:${room.id}:users`, socket.id))) {
      return;
    }

    const { path } = data;
    const id = await redis.incr(`room:${room.id}:paths:count`);
    const time = parseInt(new Date() / 1000, 10);
    Object.assign(path, { id, userId: user.id, time });
    redis.hset(`room:${room.id}:paths`, id, JSON.stringify(path));
    chat.to(room.id).emit('path', { path });
  });

  // 切断処理
  socket.on('disconnect', async () => {
    await redis.hdel(`room:${room.id}:users`, socket.id);
    const users = parseUsers(await redis.hvals(`room:${room.id}:users`));
    chat.to(room.id).emit('users', { users });
  });

  // 閲覧のみを禁止していない場合はすぐに初期データを配信
  if (!room.hidden) {
    socket.join(room.id);
    sendInitData(socket, room);
  }
});
