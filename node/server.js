require('./util/loadenv');
const io = require('socket.io')(process.env.PORT || 4000);
const redisAdapter = require('socket.io-redis');
const Redis = require('ioredis');
const moment = require('moment');

const { getUserIdFromCookie } = require('./util/session');
const db = require('./util/knex');
const { existsBaseImage, makeThumbnail, updateBaseImage } = require('./util/canvas');

const redisOption = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const redis = new Redis(redisOption);

io.adapter(redisAdapter(redisOption));

function parseUsers(users) {
  return users.reduce((obj, userData) => {
    const user = JSON.parse(userData);
    return Object.assign({ [user.id]: user }, obj);
  }, {});
}

async function isJoin(socket, roomId) {
  return redis.hexists(`room:${roomId}:users`, socket.id);
}

async function sendInitData(socket, roomId) {
  // TODO: redisになかったらDBから取ってくる
  // 入室者がいない場合は expireをつける
  const num = await redis.incr(`room:${roomId}:paths:count`);
  const logs = (await redis.hvals(`room:${roomId}:logs`)).map((log) => JSON.parse(log));
  const paths = (await redis.hvals(`room:${roomId}:paths`)).map((path) => JSON.parse(path));
  const users = parseUsers(await redis.hvals(`room:${roomId}:users`));
  socket.emit('init', {
    logs,
    paths,
    users,
    baseImageNum: await existsBaseImage(`${roomId}.png`) && Math.floor(num / 100),
  });
}

const chat = io.of('/chat');
chat.on('connection', async (socket) => {
  const roomId = socket.handshake.query.room;
  const room = await db.getRoomData(roomId);

  if (!room) {
    socket.disconnect();
    return;
  }

  const userId = await getUserIdFromCookie(socket.handshake.headers.cookie);
  const user = await db.getUserData(userId);

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

    if (await redis.hlen(`room:${roomId}:users`) === 0) {
      // start setInterval
      const intervalId = setInterval(async () => {
        const paths = (await redis.hvals(`room:${roomId}:paths`)).map((path) => JSON.parse(path)).sort((a, b) => a.num - b.num);
        const pathLimitCount = 100;
        const target = paths.slice(0, pathLimitCount);
        const rest = paths.slice(pathLimitCount);
        const filename = `${roomId}.png`;
        const isUpdateBaseImage = target.length === pathLimitCount;

        if (isUpdateBaseImage) {
          await updateBaseImage(target, filename);
          await db.savePathData(roomId, target);

          // redisから削除
          await target.reduce((multi, path) => {
            return multi.hdel(`room:${roomId}:paths`, path.num);
          }, redis.pipeline()).exec();
        }

        await makeThumbnail((isUpdateBaseImage ? rest : target), filename);

        // 人がいなくなったら解除
        if (await redis.hlen(`room:${roomId}:users`) === 0) {
          // TODO: redisのデータをDBに移動 & expireつける
          clearInterval(intervalId);
        }
      }, 60000);
    }

    if (room.hidden) {
      socket.join(roomId);
      await sendInitData(socket, roomId);
    }
    socket.emit('join', { status: 'success' });

    await redis.hset(`room:${roomId}:users`, socket.id, JSON.stringify(user));
    const users = parseUsers(await redis.hvals(`room:${roomId}:users`));
    chat.to(roomId).emit('users', { users });
  });

  // チャットログ送信処理
  socket.on('log', async (data) => {
    if (!isJoin(socket, roomId)) {
      return;
    }

    const { message } = data;
    const num = await redis.incr(`room:${roomId}:logs:count`);
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const log = { num, message, userId, userName: user.name, createdAt };
    redis.hset(`room:${roomId}:logs`, num, JSON.stringify(log));
    chat.to(roomId).emit('log', { log });
  });

  // 線情報送信処理
  socket.on('path', async (data) => {
    if (!isJoin(socket, roomId)) {
      return;
    }

    const { path } = data;
    const num = await redis.incr(`room:${roomId}:paths:count`);
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const updatedAt = createdAt;
    Object.assign(path, { num, userId, createdAt, updatedAt });
    redis.hset(`room:${roomId}:paths`, num, JSON.stringify(path));
    chat.to(roomId).emit('path', { path });
  });

  // 切断処理
  socket.on('disconnect', async () => {
    await redis.hdel(`room:${roomId}:users`, socket.id);
    const users = parseUsers(await redis.hvals(`room:${roomId}:users`));
    chat.to(roomId).emit('users', { users });
  });

  // 閲覧のみを禁止していない場合はすぐに初期データを配信
  if (!room.hidden) {
    socket.join(roomId);
    sendInitData(socket, roomId);
  }
});
