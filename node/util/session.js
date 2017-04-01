const railsSessionDecoder = require('rails-session-decoder');
const cookieParser = require('cookie');
const getIn = require('get-in');

function decodeCookieAsync(secret, cookie) {
  return new Promise((resolve, reject) => {
    const decoder = railsSessionDecoder(secret);
    decoder.decodeCookie(cookie, (err, sessionData) => {
      if (err) {
        return reject(err);
      }

      resolve(sessionData);
    });
  });
}

async function sessionDecoder(cookies) {
  const {SECRET_KEY_BASE, SESSION_NAME} = process.env;
  const sessionData = await decodeCookieAsync(SECRET_KEY_BASE, cookies[SESSION_NAME]);
  return JSON.parse(sessionData);
}

async function getUserIdFromCookie(cookie) {
  try {
    const cookies = cookieParser.parse(cookie);
    const session = await sessionDecoder(cookies);
    return getIn(session, ['warden.user.user.key', 0, 0], 0);
  } catch (e) {
    return null;
  }
}

module.exports = {
  getUserIdFromCookie,
};
